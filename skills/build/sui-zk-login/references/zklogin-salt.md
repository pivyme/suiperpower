# Salt management for zkLogin

Salt is what binds a JWT subject to a Sui address. Same JWT sub + same salt = same address. Different salt = different address.

How you handle salt determines: account recovery, privacy, lock-in. Pick deliberately.

## Option A: self-hosted salt service

You run a service that maps JWT sub to a salt. Lookup is gated by JWT verification.

Pros:

- You control the recovery story. If the user loses access to their original Google account, you can run a manual recovery process (KYC, support ticket).
- You can layer per-app salt versions (rotate without losing addresses).
- Privacy: the salt provider sees JWT sub, but no third party ever does.

Cons:

- You are now in the custody-adjacent business. Lose the salt DB, lose every user's address.
- The salt DB is a target. Encrypt at rest, restrict access, audit.
- Operational burden. Backups, monitoring, incident response.

For most consumer apps with a real backend, this is the right choice.

## Option B: Mysten Salt service

Mysten Labs runs a salt service that returns a deterministic salt for a JWT. Public, free.

Pros:

- Zero ops.
- The same salt across apps means the user has one Sui address regardless of which Mysten-Salt-using app they log into. Cross-app continuity.

Cons:

- You are dependent on Mysten's service uptime.
- If Mysten changes the salt model, every dependent app shifts.
- The trust footprint is wider; Mysten sees JWT sub for every login.

Reasonable for prototypes, demos, and apps that explicitly want cross-app address continuity.

## Option C: client-derived salt

Derive the salt deterministically from the JWT sub plus a constant or a user secret. No service.

Pros:

- No backend.
- Privacy: nothing leaves the device unless the user re-derives elsewhere.

Cons:

- If you lose the device or the user secret, recovery is hard.
- Cross-device continuity requires the user to reproduce the secret.
- Susceptible to client-side tampering.

Reasonable for hobby projects and single-device apps. Avoid for anything where users hold real value.

## Decision rules

- Real value at risk: Option A with redundant backups, or Option B if you accept the dependency.
- Cross-app address continuity matters: Option B.
- Single-app, low value, fast prototype: Option B (zero ops) or Option C.

## Salt rotation

If the salt changes, the user's Sui address changes. Their previous Objects do not move.

Implications:

- Avoid rotating salts in a deployed app without a migration plan.
- If you must rotate, the migration is "user signs a transaction from old address that transfers Objects to new address." This costs gas and requires the user to be live.

## Recovery scenarios

| Lost | Effect | Mitigation |
|---|---|---|
| Ephemeral keypair | Re-login via OAuth, new ephemeral key. Address unchanged. | None needed. |
| OAuth account access (Google) | User cannot prove identity to the prover. Address inaccessible. | Encourage users to enable provider's account recovery. |
| Salt (Option A) | All addresses derived from that salt are inaccessible. | Backups, redundancy, immutable storage. |
| Salt (Option C) | This user's address is inaccessible. | User secret backup. |

## Per-app vs cross-app

If your app uses Option A with a salt unique to your app, the user has a different Sui address in your app than in any other app. Their on-chain history in your app is separate from elsewhere.

If your app uses Option B, the user has the same Sui address everywhere. Their on-chain footprint is portable.

Pick based on whether your product benefits from address portability. A consumer app where users move between products (game ecosystem, marketplace network) wants Option B. A standalone app where the address should not leak across products wants Option A.

Last updated: 2026-05-10.
