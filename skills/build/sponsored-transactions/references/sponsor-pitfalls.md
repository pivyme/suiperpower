# Sponsored transaction pitfalls

A sponsor that signs without thinking is a free gas faucet for attackers. The sponsor server is a piece of security-critical infrastructure.

## Anyone can call your server

If your sponsor endpoint signs whatever it receives, an attacker writes a script that hammers it. The sponsor's SUI balance evaporates.

Mitigations:

- Allowlist sponsorable package ids and entry function names.
- Reject tx kinds that move funds to arbitrary addresses.
- Rate limit per IP, per session, per user.

## User identity is required for fair allocation

If you sponsor "first transaction free per user," you need a user identity. Anonymous IPs are easy to rotate. Options:

- Cookie + CAPTCHA.
- Authenticated session (zkLogin sub, OAuth identity).
- Phone or email verification.

Pick something with friction calibrated to the abuse cost. A free starter pack worth 0.01 SUI tolerates more friction than a free $50 onboarding bonus.

## Sponsor key custody

The sponsor private key signs anything that passes server-side validation. If it leaks, attackers drain the sponsor balance directly.

Custody options ordered by safety:

1. HSM or hardware-backed signer.
2. Cloud KMS with audit logs (AWS KMS, GCP KMS).
3. Encrypted env var with rotation.
4. Plain env var.

Mainnet sponsor keys deserve at least KMS. Plain env on production is a footgun.

## Sponsor-balance monitoring

The sponsor balance depletes. When it hits zero, all sponsored flows fail.

Monitor:

- Balance threshold alert (page someone at 25% of daily target).
- Daily burn rate report.
- Top-up automation that pulls from a treasury wallet on schedule.

For testnet, the faucet refills quickly. Production needs real ops.

## Replay protection

Sui transactions are bound to specific gas coin versions. Re-submitting a previously signed tx fails because the gas coin's version moved.

Implication: a successful sponsor signature is single-use. A leaked signature without the user signature is useless. A leaked signature plus the user signature is also single-use.

Do not implement extra replay protection at the application layer; the protocol handles it.

## Sponsor injecting malicious moves

If a sponsor server adds extra move calls to the user's tx ("we're sponsoring, but we also drain your treasury"), the user signature on the modified bytes does not match. Sui rejects.

Practically: the sponsor cannot insert moves the user did not sign for.

But the sponsor can:

- Refuse to sign (deny service).
- Inflate the gas budget (eat sponsor balance).
- Pick gas coins that are expected to be spent elsewhere (cause unrelated tx failures).

Mitigations:

- Set a sane max gas budget per allowlist entry.
- Reserve a dedicated sponsor coin pool.

## User griefing the sponsor

A user can submit nonsense move calls that pass the allowlist but always abort. The sponsor pays gas for the failed tx.

Mitigations:

- Per-user limit on failed-tx count.
- Reject entry functions known to revert based on stale state.
- For high-value sponsors, require a dry-run pass before signing.

## Cross-network sponsor

Testnet sponsor signing a mainnet tx (or vice versa) fails network-binding checks. Use environment variables; never hardcode the network.

## Failure modes during partial signature

If the sponsor signs but the user's signature is delayed or never arrives, no harm done; the tx never executes. The sponsor's gas coin remains usable for the next request.

But if the sponsor server retries a partial sign without idempotency, you can duplicate gas-coin pinning and produce two signed txs that compete. The protocol resolves this (only one wins) but it confuses your accounting.

Idempotency-key the sponsor API. Same key returns the same signature; new key picks a fresh gas coin.

Last updated: 2026-05-10.
