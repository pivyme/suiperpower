# OpenZeppelin Sui migration candidates

Hand-rolled patterns commonly seen in Move packages, and the OpenZeppelin Sui module that replaces them. Migrating saves audit hours and removes a category of "did you reinvent the wheel correctly" findings.

Source for the OZ catalog: `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`. Confirm the exact module names and revs there before recommending; OZ Sui evolves.

## Access control

Hand-rolled pattern: a custom `AdminCap` struct with manual checks scattered across functions. Each function does its own `assert!(is_admin(...))`.

Replace with: OZ access control module. Roles are first-class, addressable by name, and the module exposes role granting / revoking with audited semantics.

When NOT to migrate: if the project has exactly one cap (`AdminCap`) and one privileged action, the OZ module is overkill. Document the choice.

## Pausable

Hand-rolled pattern: a `paused: bool` field on a config Object, plus `assert!(!paused)` at the top of every function.

Replace with: OZ pausable module. Provides a `Paused` capability and a `whenNotPaused` modifier-equivalent.

When NOT to migrate: if there is no real need to pause (a fully-immutable airdrop coin, for example), do not add pausability just to use OZ.

## Multisig

Hand-rolled pattern: a struct that stores a list of signers and a threshold, and a function that walks the list verifying signatures.

Replace with: OZ multisig (or use the Sui native multisig at the wallet layer, then route the cap to that multisig address). The native option is usually preferable; it is enforced at the protocol level.

## Upgrade pattern

Hand-rolled pattern: a custom `UpgradeAuthority` struct that wraps the published `UpgradeCap` and gates calls.

Replace with: OZ upgrade pattern, which bundles capability custody, version tracking, and timelock support.

When NOT to migrate: if the package will never upgrade (rare, but valid for some immutable artifacts), burn the `UpgradeCap` and skip the OZ pattern entirely.

## Reentrancy guard

Hand-rolled pattern: a boolean lock on a shared Object that public functions toggle.

Replace with: OZ reentrancy guard. Note that Sui's PTB model and Object ownership reduce the surface vs EVM, but shared-Object mutation paths can still have reentrancy via inter-package calls.

## SafeMath equivalents

Hand-rolled pattern: explicit overflow checks with magic numbers.

Replace with: OZ math utilities, which provide checked add / sub / mul / div with named error codes.

When NOT to migrate: simple `u64` arithmetic where bounds are known statically. Move's default arithmetic aborts on overflow already; not all operations need OZ wrappers.

## ERC-20-style coin extensions

Hand-rolled pattern: a coin module with custom allowance, burn, or supply tracking grafted on.

Replace with: OZ coin extensions on top of the standard `sui::coin`. The standard module already handles supply tracking; OZ extensions add features in audited form.

## How to flag in the review

For each candidate, the review entry should look like:

```markdown
### OZ migration candidate, <module>::<function>
- pattern: <hand-rolled name>
- proposed swap: <OZ module name and rev>
- rationale: <one sentence on why migrating is worth the churn>
- risk of NOT migrating: <one sentence>
```

Do not recommend migrations that are not load-bearing. A swap for the sake of swapping introduces churn without value.
