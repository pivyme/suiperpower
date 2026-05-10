# Security Checklist

Sui Move specific findings, organized P0 to P3. Run through this before any deploy. Mainnet requires P0 clean and most of P1.

This checklist is the source for `review-move` and `ottersec-prep`. Both skills walk a project through these items with concrete commands.

## P0: Critical, fix before any deployment

### 1. Capability handling

- Public functions must not accept capabilities by value when they should be by reference.
- Capabilities must not be exposed via Display or other public read paths.
- A capability should never be returned from a public function unless the design intentionally transfers authority.

```bash
grep -rn 'public fun.*Cap' sources/
grep -rn 'public fun.*Capability' sources/
```

Cross-check by hand. The grep is a first pass, not a verdict.

### 2. Object ability mismatch

- `key` only on top-level objects (objects that live at the address layer).
- `store` only when nesting inside another object is intended.
- `drop` and `copy` should be rare for stateful resources. If you see `has drop` on a resource that holds value, justify it in code review.

### 3. Shared object versioning

- Mutations of shared objects respect the consensus contract. Review `&mut` usage on shared objects.
- Do not assume strong consistency between shared object reads and writes inside the same block.
- Race conditions surface when two PTBs touch the same shared object in the same checkpoint.

### 4. Capability leak via friend or public visibility

- `friend` should be used sparingly. Document the reason.
- `public(package)` (Move 2024) keeps caps inside a package; prefer it over plain `public` when possible.
- Audit every `public fun` that touches a capability for whether it really needs to be public.

### 5. Init function safety

- One-time witness must match the module name in caps and not be reused.
- `init` runs once at publish. Idempotency comes from Move, not from your code.
- Do not store state in `init` that depends on transaction context beyond the publisher.

### 6. Reinitialization defense

- Pattern check: any "create" function that does not enforce uniqueness via shared registry or capability burn is a candidate for reinit attacks.
- For coin or treasury patterns, ensure the witness pattern is intact and the `TreasuryCap` is created exactly once.

### 7. Arithmetic overflow and underflow

- Move's u64 overflow aborts the transaction. Usually safe.
- For u128 or multi-step math, use checked arithmetic or explicit bounds.
- Review any `as u64` cast for truncation risk. A u128 silently truncated to u64 has lost the high bits.

### 8. PTB-side trust assumptions

- When composing PTBs that the user signs, the user signs the entire block. Design APIs so partial-step abuses are impossible.
- Sponsored transaction flows: verify the sponsor cannot inject malicious moves into the user's PTB.
- For dapp-kit composed PTBs, double-check that intermediate object references cannot be swapped by the wallet.

## P1: High, fix before mainnet

### 9. Object access control

- Functions that mutate an Object require the right capability or witness.
- Avoid "anyone can call" mutating functions unless intentional.
- For NFT-like flows, transfer policies should be explicit.

### 10. Cross-package call safety

- When calling another package's function via `entry`, validate the caller is authorized.
- Pin dependency revs in `Move.toml` to avoid silent upstream changes.
- An upstream package upgrade that changes a public function's behavior breaks your invariants without warning.

### 11. Display and metadata correctness

- For NFT-like objects, Display fields must not leak internal state.
- Validate URL or image fields if user supplied. A malicious Display URL is a phishing vector for downstream consumers.

### 12. Event emission

- Critical state transitions emit events for off-chain indexing and monitoring.
- Audit absence of events on `mint`, `transfer`, `burn`, `revoke`, `upgrade`. A missing event is invisible to indexers, which is invisible to users.

## P2: Medium, fix before significant TVL or user count

### 13. Excessive privileges

- Treasury caps held by a single EOA: consider multisig before TVL grows.
- Upgrade cap retained or burned: document the reason. A retained cap with no governance is a centralization risk.

### 14. Error path quality

- Avoid `assert!(false, ...)` in production paths.
- Define error codes via `const E_*: u64 = ...;` for clarity in failures. A numeric error code with a name is debuggable; a bare `abort 1` is not.

### 15. Test coverage for public entry points

- Every public function has at least one happy-path test and one expected-failure test.
- Capability gated functions have at least one unauthorized-call test that asserts the abort.

```bash
sui move test
```

Test count alone is not coverage. Read the tests; confirm each public entry point has both shapes.

## P3: Best practices

### 16. Gas profile awareness

- For functions called frequently, run `sui client dry-run` and inspect gas.
- Avoid gas spikes from unbounded vector growth. A vector that grows with user count is a liability.

### 17. Documentation

- Public functions have docstrings (`/// ...`) explaining inputs, outputs, side effects.
- The package README documents the deploy command and the package id (per network).

### 18. Linting

- `sui move build` clean (no warnings) before publish.
- Follow Move 2024 idioms (`public(package)` over `friend` where it fits).

## Automated Tools

- `review-move` walks each P0 to P3 item with concrete commands and records findings in `build-context.md`.
- `ottersec-prep` packages findings into an audit-ready report.
- `openzeppelin-sui-libs` recommends migrations from hand-rolled patterns to OZ primitives.

## Scoring Guide

| Grade | Criteria |
|---|---|
| A | All P0 to P2 clean. Most P3 addressed. Tests for public entry points. |
| B | All P0 clean. Most P1 clean. Some P2 remaining. |
| C | P0 clean. P1 has issues. Needs work before mainnet. |
| D | P0 issues found. Do not deploy to mainnet. |
| F | Multiple P0 issues. Consider rewriting the affected modules. |

The grade goes into `build-context.md` under the Review section, alongside the timestamp and the reviewer (skill name or human).

## Skills that read this guide

`review-move`, `ottersec-prep`, `deploy-to-mainnet`, `submit-to-sui-overflow` (light reference at the gate).

*Last updated: 2026-05-10. Targets Sui Move 2024 idioms and current OpenZeppelin Sui libs.*
