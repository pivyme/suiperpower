# Walrus pitfalls

Mistakes that look right and break the integration.

## Lifetime expiry

A blob paid for N epochs is reclaimed after epoch N. Apps that "lose" a blob almost always let it expire by accident.

Mitigations:

- Default to a generous epoch count for production content.
- For user-uploaded content, surface the expiry to the user and let them extend.
- For canonical content (NFT media), use `deletable=false` to make the blob permanent.

## Encryption is your problem

Walrus stores bytes as-is. There is no built-in encryption.

If the blob is sensitive:

- Use Seal (`@mysten/seal`) for decentralized access-controlled encryption. Seal lets you define who can decrypt via Move access policies on Sui. See `references/seal-encryption.md`.
- Alternatively, encrypt client-side before upload (AES-GCM with a key derived from a user secret, or a wrapped key stored separately).
- Document the key management plan in `build-context.md`.
- Never put plaintext PII directly into a Walrus blob.

## Default is deletable (v1.33+)

Since Walrus v1.33+, blobs are deletable by default. Older code or docs that assume permanent-by-default will behave differently. If you need permanence, explicitly pass `deletable=false` when storing. Do not assume a blob will persist beyond its paid epoch count unless you made it permanent.

## Public endpoints are best-effort

The public publisher and aggregator are convenient for development. They are not SLA-backed. Public publishers also enforce a **10 MiB default blob size limit**.

For production:

- Run your own Walrus client.
- Use a paid Walrus service provider.
- Monitor failure rates and fall back gracefully if read latency spikes.

## Network mismatches

Testnet and mainnet have different publishers and aggregators. Cross-network reads silently return not-found.

Set the endpoints from environment variables, never hardcode. Add a startup check that pings the aggregator and refuses to start if it returns the wrong network.

## WAL balance

WAL is a separate token from SUI. Storage is paid in WAL; gas is paid in SUI. Apps that forget to fund the WAL balance see uploads fail with "insufficient balance" only after the user submits.

Mitigations:

- Fund the WAL balance before exposing upload to users.
- Surface a low-WAL warning in the admin dashboard.
- For sponsored uploads, the sponsor pays in WAL; document that.

## Content addressing means deduplication

Two identical files have the same `blobId`. Re-uploading the same content does not create a new blob; the publisher returns `alreadyCertified` with the existing id and may or may not extend the lifetime depending on the request.

This is usually a feature, occasionally a surprise:

- "Why does the second user's upload share an id with the first?" Because the bytes are identical.
- "Why did my retry not re-upload?" Because the content already exists.

If you need uniqueness per upload, salt the content with a per-upload nonce.

## Aggregator caching

Aggregators cache reads. If a blob's lifetime is extended on chain, the aggregator may still serve the old "not found" response for a window. Cache TTLs are short but real.

Last updated: 2026-05-11.
