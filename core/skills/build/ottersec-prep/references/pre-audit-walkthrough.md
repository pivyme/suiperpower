# OtterSec pre-audit walkthrough

The full checklist source lives in `skills/data/sui-knowledge/sponsor-docs/ottersec-checklist.md`. This reference is the operational guide for walking it on a real package.

## How to use this

For each item in the checklist:

1. Open the relevant Move file or run the relevant command.
2. Mark `[x]` if it passes, `[ ]` if not, write `n/a` with a one-line reason if not applicable.
3. For a fail, propose a fix; let the user decide to fix now or document as known.

Do not skip items because they "look right." Run the check.

## Capability handling

Look at every `*Cap` struct in the package.

```bash
rg -n "struct .*Cap " --type move
```

For each:

- Where is it created? (Look for `let cap = ... { id: object::new(ctx) }`.)
- Who receives it? (Follow `transfer::transfer(cap, ...)` or `transfer::public_transfer(cap, ...)`.)
- Is it taken by reference (`&Cap`) or by value (`Cap`) in functions that depend on it?
- Does it appear in any `display::add` call? (That would leak it to the world.)

Common fail: `AdminCap` taken by value in a function that should only check possession. Fix: change parameter to `&AdminCap`.

## Object ability mismatch

```bash
rg -n "struct .* has " --type move
```

For each struct, sanity-check abilities against intended use:

- Top-level Object: `key`, plus optional `store`.
- Nested resource: `store` only (no `key`).
- Stateful: avoid `copy` and `drop` unless you genuinely want silent burning or duplication.

Common fail: a struct with `key, store, copy, drop`. Fix: drop the abilities not needed.

## Visibility hygiene

```bash
rg -n "public " --type move | grep -v "public("
```

The grep filters for `public ` not followed by `(`, catching unrestricted public functions. For each, decide:

- Is this a true cross-package API? Keep `public`.
- Is this intra-package? Convert to `public(package)`.
- Is this a test helper? Mark `#[test_only]` or move to `tests/`.

```bash
rg -n "^friend " --type move
```

If any results, plan migration to `public(package)` per Sui Move evolution.

## Init function safety

```bash
rg -n "fun init" --type move
```

For each:

- Confirm the OTW: `struct MODULE_NAME has drop {}` (note the all-caps name matching the module's path component).
- Confirm init takes the OTW by value: `fun init(witness: MODULE_NAME, ctx: ...)`.
- Confirm any capabilities created in init are routed correctly (transferred, frozen, or shared per design).

Common fail: init creates a capability and just `transfer::transfer(cap, ctx.sender())` even though the spec says it should be transferred to a multisig. Fix: hardcode the multisig address or create a temporary holding pattern.

## Reinitialization defense

For shared Object creation paths (functions that produce a shared Object after init):

- Confirm a registry or capability prevents multiple instantiations if uniqueness matters.
- For coin-style flows, confirm the witness pattern keeps `create_currency` callable only once.

Common fail: a `create_market` entry function that anyone can call multiple times, producing duplicate "the" market. Fix: gate behind a capability or use a registry.

## Build cleanliness

```bash
sui move build
```

Confirm zero warnings. Warnings worth treating as fails:

- Unused imports (signal of dead code).
- Unused variables (often hiding bugs).
- Deprecated API (will break on next Sui release).

```bash
rg -n "assert!\(false\)|// assert!|debug::print" --type move
```

If any results in production paths, remove or convert to a real assertion.

## Test coverage

```bash
sui move test
```

For each public entry function:

- At least one happy-path test that exercises the function.
- At least one expected-failure test for capability-gated paths (`#[expected_failure(abort_code = E_NOT_AUTHORIZED, location = ...)]`).
- Edge cases: zero amounts, max amounts, empty vectors.

Common fail: a function with no tests. Fix: write the tests; refuse to ship without them.

## Dependency pin

```bash
cat Move.toml
```

Confirm:

- `[dependencies]` entries use `rev = "<commit-or-tag>"`, not `branch = "main"`.
- The pinned commit is current enough to compile against the target Sui CLI version.

Common fail: `rev` was set six months ago and the package no longer compiles against the latest Sui framework. Fix: bump to a current pinned commit.

## Outputs from this walkthrough

- A filled-in checklist with every item explicit.
- A list of fixes the user accepted (commit them now).
- A list of fixes the user deferred (record in `KNOWN_ISSUES.md` with rationale).

The auditor sees the resulting state, not the walkthrough trail. The walkthrough exists to make sure no item was silently skipped.

Last updated: 2026-05-10.
