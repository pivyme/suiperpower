# Seal: decentralized encryption for Walrus blobs

## What Seal is

Seal is a decentralized secrets management protocol on Sui. It lets you encrypt data client-side and control who can decrypt it through Move access policies deployed on chain. No centralized key server, no trusted third party holding keys.

- Package: `@mysten/seal`
- Docs: https://seal-docs.wal.app/
- Source and examples: https://github.com/MystenLabs/seal
- Status: live on mainnet

## How it works with Walrus

The pattern: encrypt data via Seal before uploading to Walrus. Store the ciphertext blob. Control decryption by defining who satisfies the on-chain access policy. Only authorized users can retrieve the decryption key shares from Seal's key server network.

Flow:

1. **Define access policy in Move.** A Move module that implements the Seal policy interface. The policy decides who can decrypt (e.g., NFT holder, token-gated, allowlist, DAO vote).
2. **Encrypt client-side.** Use the Seal SDK to encrypt the plaintext with the policy's object ID as the encryption target. This produces ciphertext that can only be decrypted by users who satisfy the policy.
3. **Store ciphertext on Walrus.** Upload the encrypted bytes via the publisher (HTTP API, CLI, or `@mysten/walrus` SDK). Capture the `blobId`.
4. **Retrieve and decrypt.** An authorized user fetches the ciphertext from Walrus, then calls the Seal SDK to obtain decryption key shares. The SDK reconstructs the key and decrypts locally.

## Minimal example

```bash
npm install @mysten/seal @mysten/walrus @mysten/sui
```

```ts
import { SealClient } from "@mysten/seal";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const suiClient = new SuiGrpcClient({ network: "testnet" });

const sealClient = new SealClient({
  suiClient,
  serverConfigs: [{
    objectId: "0xb012378c9f3799fb5b1a7083da74a4069e3c3f1c93de0b27212a5799ce1e1e98",
    weight: 1,
    aggregatorUrl: "https://seal-aggregator-testnet.mystenlabs.com",
  }],
  verifyKeyServers: false, // true in production
});

// 1. Build identity: policyObjectId + random nonce
const nonce = crypto.getRandomValues(new Uint8Array(5));
const policyId = "0x<your-policy-object-id>";
const id = toHex(new Uint8Array([...fromHex(policyId), ...nonce]));

// 2. Encrypt
const { encryptedObject } = await sealClient.encrypt({
  threshold: 1, packageId: "0x<your-package-id>", id,
  data: new TextEncoder().encode("secret data"),
});

// 3. Upload ciphertext to Walrus publisher
const resp = await fetch("https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5", {
  method: "PUT", body: encryptedObject.slice(),
});
const { newlyCreated } = await resp.json();
const blobId = newlyCreated.blobObject.blobId;

// 4. Later: fetch from Walrus aggregator and decrypt
// (caller must satisfy the Move seal_approve policy)
const cipherResp = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`);
const cipherBytes = new Uint8Array(await cipherResp.arrayBuffer());
// Build seal_approve PTB, create SessionKey, then:
const plaintext = await sealClient.decrypt({
  data: cipherBytes, sessionKey, txBytes,
});
```

The exact API shape may evolve. Check the `@mysten/seal` README and https://seal-docs.wal.app/ for current method signatures.

## When to use Seal vs plain AES

| Scenario | Approach |
|---|---|
| Access controlled by on-chain state (NFT gate, DAO, allowlist) | Seal |
| Single user encrypting their own private data | AES-GCM with a user-held key is simpler |
| Multi-party access without a shared secret | Seal |
| Data that must be readable by anyone | No encryption needed |

## Access policy examples

The Seal GitHub repo includes example Move policies for common patterns:

- Allowlist (owner adds/removes addresses)
- NFT-gated (must hold a specific NFT collection)
- Token-gated (must hold N tokens)
- Subscription (time-limited access)

Write your own policy module when none of the examples fit. The policy is a Move module that Seal's key servers call to verify access.

Last updated: 2026-05-11.
