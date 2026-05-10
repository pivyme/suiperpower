# zkLogin end-to-end flow

The user's path from "click Sign in with Google" to "transaction executed under their Sui address."

## Stage 1: ephemeral keypair

In the browser, before redirecting to the OAuth provider:

```ts
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { generateNonce, generateRandomness } from "@mysten/sui/zklogin";

const sui = new SuiClient({ url: getFullnodeUrl("testnet") });

const { epoch } = await sui.getLatestSuiSystemState();
const maxEpoch = Number(epoch) + 2; // valid for ~2 epochs

const ephemeralKeypair = new Ed25519Keypair();
const randomness = generateRandomness();
const nonce = generateNonce(
  ephemeralKeypair.getPublicKey(),
  maxEpoch,
  randomness,
);

// Persist to sessionStorage
sessionStorage.setItem("zklogin.ephemeralKey", ephemeralKeypair.export().privateKey);
sessionStorage.setItem("zklogin.maxEpoch", String(maxEpoch));
sessionStorage.setItem("zklogin.randomness", randomness);
sessionStorage.setItem("zklogin.nonce", nonce);
```

## Stage 2: OAuth redirect

```ts
const params = new URLSearchParams({
  client_id: GOOGLE_CLIENT_ID,
  response_type: "id_token",
  redirect_uri: REDIRECT_URI,
  scope: "openid",
  nonce, // critical: proves the JWT is bound to the ephemeral key
});

window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
```

Other providers (Apple, Facebook, Twitch) have analogous flows. Apple requires a server-side step for the JWT.

## Stage 3: capture the JWT

On the redirect_uri page, parse the JWT from the URL fragment:

```ts
const fragment = new URLSearchParams(window.location.hash.slice(1));
const idToken = fragment.get("id_token");
if (!idToken) throw new Error("no id_token in callback");
```

Verify the JWT signature against the provider's JWKS before trusting the payload. Do not just `JSON.parse` the middle segment.

## Stage 4: salt

Fetch or compute the user's salt. See `zklogin-salt.md` for options.

```ts
const userSalt = await fetchUserSalt(idToken);
```

Salt determines the user's Sui address. Same JWT subject + same salt = same address. Different salt = different address.

## Stage 5: derive the Sui address

```ts
import { jwtToAddress } from "@mysten/sui/zklogin";

const userAddress = jwtToAddress(idToken, userSalt);
console.log("Sui address:", userAddress);
```

## Stage 6: ZK proof

Send the JWT, salt, ephemeral public key, max epoch, and randomness to a prover service. The prover returns a ZK proof that the user owns the JWT-bound identity without revealing the JWT itself.

```ts
import { getExtendedEphemeralPublicKey } from "@mysten/sui/zklogin";

const extendedPubKey = getExtendedEphemeralPublicKey(ephemeralKeypair.getPublicKey());

const proverResp = await fetch(PROVER_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jwt: idToken,
    extendedEphemeralPublicKey: extendedPubKey,
    maxEpoch,
    jwtRandomness: randomness,
    salt: userSalt,
    keyClaimName: "sub",
  }),
});

const zkProof = await proverResp.json();
```

Cache the proof in `sessionStorage` keyed by JWT. Re-prove if the JWT changes or the proof is past max epoch.

## Stage 7: sign and execute

```ts
import { Transaction } from "@mysten/sui/transactions";
import { genAddressSeed, getZkLoginSignature } from "@mysten/sui/zklogin";
import { decodeJwt } from "jose";

const tx = new Transaction();
// ... build tx ...

const { bytes, signature: ephemeralSignature } = await tx.sign({
  client: sui,
  signer: ephemeralKeypair,
});

const decodedJwt = decodeJwt(idToken);
const addressSeed = genAddressSeed(
  BigInt(userSalt),
  "sub",
  decodedJwt.sub!,
  decodedJwt.aud as string,
).toString();

const zkLoginSignature = getZkLoginSignature({
  inputs: { ...zkProof, addressSeed },
  maxEpoch,
  userSignature: ephemeralSignature,
});

const result = await sui.executeTransactionBlock({
  transactionBlock: bytes,
  signature: zkLoginSignature,
});

console.log("digest:", result.digest);
```

## Recovery

If the ephemeral key expires or the user clears `sessionStorage`, the user must re-login through the OAuth provider. The Sui address remains the same as long as the salt is the same.

If the salt is lost (self-hosted, no backup), the address is unrecoverable. Salt management is the load-bearing decision.

Last updated: 2026-05-10.
