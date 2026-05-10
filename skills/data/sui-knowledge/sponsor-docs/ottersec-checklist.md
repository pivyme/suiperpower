# OtterSec on Sui (pre-audit checklist)

## What OtterSec is

OtterSec is a security firm that audits Sui Move packages, among other ecosystems. They are a Sui Overflow 2026 prize sponsor and a respected Sui auditor. Engaging them for an audit is a common path to mainnet for projects with meaningful TVL or user value at risk.

This doc is the pre-audit checklist: the things to clean up before submitting to any auditor (OtterSec or otherwise) so the audit time is spent on real findings, not on hygiene noise.

## When to use this

- You are about to submit a Move package for audit.
- You want to self-assess audit-readiness.
- You are preparing the `ottersec-prep` skill output for a Sui Overflow submission.

## What OtterSec looks for in a Sui Move package

Based on OtterSec's public reports and Sui-specific finding patterns:

### Capability handling

- Capabilities (`*Cap` structs) must not leak via public read paths or Display.
- Functions that require admin capabilities must take them by reference (`&Cap`) unless they intentionally consume.
- One-time witnesses must match the module name in uppercase exactly.
- `init` must not create or freely distribute capabilities the contract does not intend to give away.

### Object ability mismatch

- Top-level Objects: `key`. Nested: `store`. Stateful resources: rarely `copy` or `drop`.
- Mismatches usually compile but signal a design confusion.

### Shared Object versioning

- Mutations of shared Objects respect the consensus contract; review `&mut` paths.
- No assumption of strong consistency between shared Object reads and writes inside the same block (within a PTB, sequential ordering is guaranteed; across PTBs, only consensus ordering applies).

### Visibility hygiene

- Default to `public(package)` for intra-package; reserve `public` for true cross-package APIs.
- `friend` exists in older Move but is being phased out; prefer `public(package)`.
- Test helpers should be `#[test_only]`.

### Init function safety

- One-time witness pattern intact.
- Init does not perform mutable state operations beyond the necessary capability creation and transfer.
- Init does not assume any context that publish does not provide.

### Reinitialization defense

- Any "create" function for shared Objects enforces uniqueness, either via a registry or a capability that is consumed at first call.
- Coin / treasury patterns retain the witness pattern intact across the package.

### Arithmetic

- Move's u64 overflow aborts the transaction; this is usually safe for accounting paths.
- `as u64` casts have explicit bounds checks if the source could exceed u64.
- Multi-step math on u128 / large numbers uses checked arithmetic.

### PTB-side trust

- Functions intended to be called within a PTB sign-once flow do not assume the user inspected each step.
- Sponsored-tx flows verify that the sponsor cannot inject malicious moves into the user's PTB.

## Pre-audit checklist (the OtterSec submission gate)

Before submitting to OtterSec (or any auditor), every item below should be `[x]`:

- [ ] All P0 items from `skills/data/guides/security-checklist.md` are clean.
- [ ] `sui move build` produces zero warnings.
- [ ] `sui move test` passes; every public entry point has at least one happy-path and one expected-failure test.
- [ ] No `assert!(false)` left in production paths.
- [ ] No commented-out checks (`// assert!(...)`) left in production paths.
- [ ] No `std::debug::print` calls in production paths.
- [ ] All error codes are named constants (`const E_*: u64 = ...;`), not magic numbers.
- [ ] All public functions have docstrings (`/// ...`) explaining inputs, outputs, side-effects.
- [ ] `Move.toml` deps pinned to specific revs or tags; no `main` branches in production deps.
- [ ] Capabilities (especially `TreasuryCap`, `AdminCap`, `UpgradeCap`) have a documented holder strategy. EOA or multisig?
- [ ] Upgrade authority decision is documented: keep, transfer to multisig, or burn?
- [ ] Frontend env points at the correct network for the intended deploy.
- [ ] Repo has a clean commit log (no merged credentials, no force-pushes that erase audit trail).
- [ ] README documents: deploy command, package id (per network), upgrade policy, capability holder, license.

## What to send the auditor

A clean engagement package:

1. **Repo URL** with a stable commit hash or tag.
2. **Threat model document**: who is trusted, what are the assets, what are the known risks. One page is fine.
3. **Architecture diagram**: which modules talk to which, where capabilities flow.
4. **Test report**: `sui move test` output with full coverage.
5. **Pre-audit checklist** (this doc filled in) showing every item is `[x]`.
6. **Known issues**: what you have already found and decided to ship anyway. Save the auditor time on these.

## Common findings (auditor patterns)

These appear repeatedly in OtterSec Sui reports:

- Capability passed by value where reference would do
- Reinitialization possible because `init` mutable state was not gated
- Shared Object's mutate function does not check the caller's capability
- Coin operations that bypass the standard `coin::*` API (raw balance manipulation)
- Display fields that leak internal state of an admin-only struct
- Missing events on critical state transitions
- Hand-rolled patterns where OZ Sui has an audited replacement

## How to engage OtterSec

- Website: `https://osec.io/`
- Sui audit inquiry: through the website's contact form or via the Sui ecosystem channels.
- Lead time: weeks, plan in advance of mainnet dates.
- Prerequisites: a clean repo + the pre-audit checklist completed.

## Where to go deeper

- OtterSec Sui audit reports (public): browse the OtterSec publications page.
- Suiperpower skill: `skills/build/ottersec-prep/`
- Related skill: `skills/build/review-move/` for the in-house P0-P3 walk before audit.

Last updated: 2026-05-10.
