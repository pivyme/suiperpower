# Seal pitfalls

Mistakes that look right and break the integration.

Source: https://github.com/MystenLabs/seal, https://sdk.mystenlabs.com/seal

## 1. Policy functions that modify state

Seal key servers call `seal_approve` functions via `dry_run`. The transaction is simulated, never executed on chain. If your policy function writes to storage, the write is silently discarded and access control becomes unpredictable.

Fix: `seal_approve` functions must be read-only. No `&mut` on shared objects, no `transfer`, no table mutations. Only read state and abort or return.

## 2. SessionKey TTL expires silently

`SessionKey.create()` accepts a `ttlMin` parameter (default: 10 minutes). After TTL expires, decryption calls fail with a cryptic error, not a clear "session expired" message.

Fix: always set `ttlMin` explicitly. Check `sessionKey.isExpired()` before calling decrypt. For longer workflows, use `SessionKey.export()` and `SessionKey.import()` to persist across page reloads, but remember the TTL still ticks.

## 3. Personal message signature missing

Decryption requires the user to sign a personal message via their wallet before the SessionKey is usable. If you skip `setPersonalMessageSignature()`, the decrypt call fails.

Fix: always call `sessionKey.getPersonalMessage()`, prompt the wallet to sign, then `sessionKey.setPersonalMessageSignature(signature)` before any decrypt attempt.

## 4. verifyKeyServers set wrong for the environment

`verifyKeyServers: false` disables validation of key server certificates. Fine for local dev and testnet. In production, this means a malicious key server could serve bad shares.

Fix: always set `verifyKeyServers: true` in production. Only use `false` during development.

## 5. Threshold mismatch between encrypt and decrypt

The `threshold` parameter at encrypt time determines how many key server shares are needed. If the decrypt side uses a different threshold or the SealClient config does not have enough servers to meet the threshold, decryption fails.

Fix: use the same threshold at encrypt and decrypt. Ensure `serverConfigs` includes enough servers with sufficient total weight to meet the threshold.

## 6. fetchKeys batches in groups of 10

When decrypting multiple items, the Seal SDK fetches key shares in batches of 10. Large batch decryptions may hit rate limits or timeouts on the key servers.

Fix: for bulk decryption, process items in batches and add retry logic with backoff.

## 7. Identity collision from missing nonce

The encryption identity is built from `policyObjectId + nonce`. If you omit the nonce or reuse the same nonce, different encryptions for the same policy will produce the same identity, meaning they share the same decryption key.

Fix: always generate a random nonce per encryption:

```typescript
const nonce = crypto.getRandomValues(new Uint8Array(5));
const id = toHex(new Uint8Array([...fromHex(policyObjectId), ...nonce]));
```

Store the nonce alongside the ciphertext (it is not secret). Without it, you cannot reconstruct the identity for decryption.

## 8. Package upgrades break policy resolution

When a Move package is upgraded, the package ID changes. Seal uses `fetch_first_pkg_id()` to resolve the original package ID from an upgraded one. If your integration hardcodes a specific package version instead of using the Seal resolution chain, decryption may fail after an upgrade.

Fix: use the original (first published) package ID for encryption identity construction. If you upgrade the policy package, test that existing ciphertexts still decrypt against the new version. The Seal SDK handles the resolution chain internally, but your PTB construction must point to the correct package.

Last updated: 2026-05-11.
