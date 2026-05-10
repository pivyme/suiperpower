# zkLogin pitfalls

Mistakes that look right and break the login flow.

## Nonce mismatch

The provider's JWT contains the nonce you supplied at the redirect. If the nonce in the returned JWT does not match the one in `sessionStorage`, abort. A mismatch means either tampering or a stale session. Do not just shrug and proceed.

## Ephemeral key expiry

The ephemeral keypair is valid until `maxEpoch`. After that, transactions signed with it reject with an obscure error.

Mitigations:

- Track `maxEpoch` and refuse to sign past it.
- Trigger a re-login when the user attempts a transaction near expiry.
- For long-lived sessions (passive UI), proactively re-login in the background and refresh the ephemeral key.

## Redirect URI mismatch

OAuth providers reject any redirect URI not registered in the provider config. Common breakage:

- Local dev: forgot to register `http://localhost:3000/auth/callback`.
- Production: registered the wrong protocol (HTTP vs HTTPS).
- Trailing slashes: `https://app.example.com/cb` and `https://app.example.com/cb/` are different to providers.

Document the registered redirect URIs in the project README.

## JWT verification skipped

Decoding a JWT is not the same as verifying it. A naive `atob` of the middle segment gives the payload but does not check the signature. Always verify against the provider's JWKS:

```ts
import { jwtVerify, createRemoteJWKSet } from "jose";

const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
const { payload } = await jwtVerify(idToken, JWKS, {
  issuer: "https://accounts.google.com",
  audience: GOOGLE_CLIENT_ID,
});
```

Skipping verification is a real footgun: an attacker who can MITM the redirect can swap in a JWT with a different sub.

## Prover errors

The prover service can fail for several reasons:

- JWT expired between OAuth callback and prover call.
- Salt not registered (if using a salt service that requires registration).
- Network error.
- Service rate limit.

Treat prover errors as recoverable. Surface a "try again" path. Cache successful proofs in `sessionStorage` so subsequent transactions in the same session do not re-prove.

## Address derivation mismatches

The user's address is a function of `(JWT sub, salt, key claim name, audience)`. Changing any of these changes the address.

Common surprises:

- Using `email` as the key claim instead of `sub` produces a different address. Email can change for the same user; sub is stable. Use `sub`.
- Using a different `aud` (different OAuth client id) produces a different address. The user has a per-client address.
- Changing the salt strategy mid-development produces different addresses from previously derived ones.

## Funding the address

A freshly derived zkLogin address has zero SUI. The user cannot send transactions until it is funded.

Onboarding flows must either:

- Sponsor the first transaction (gas station pattern, see `sponsored-transactions`).
- Display a clear "fund this address" step before any transaction is required.

For consumer products targeting non-crypto users, sponsored gas is the difference between completion and bounce.

## Mainnet vs testnet differences

The prover service URL and provider audience are different per network. Hardcoding either causes silent breakage in the other environment.

Use environment variables. Add a startup check that confirms network alignment.

## Apple-specific quirks

Apple's OAuth flow returns the JWT once, on first sign-in. Subsequent logins by the same user return a stripped-down JWT without the email. The Sui address is unaffected (we use sub, not email), but if you stored the email anywhere downstream, plan for the missing field on subsequent logins.

Apple also requires a server-side step to verify; pure browser flows do not work cleanly for Apple Sign-in.

## Logout

Logout is local. There is no "log this user out of zkLogin" call to make on chain. The flow is:

1. Clear `sessionStorage`.
2. Optionally redirect to the provider's logout URL.
3. The Sui address still exists; the user just no longer holds the ephemeral key.

Re-login produces a new ephemeral key but the same Sui address (assuming the salt is the same).

Last updated: 2026-05-10.
