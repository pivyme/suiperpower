# OZ Sui pitfalls

Surprises that come from assuming OZ Sui matches OZ EVM, or from skipping version discipline.

## API parity is not one-to-one with OZ EVM

A function called `transferOwnership` in OZ Solidity might be `transfer_ownership` (snake_case) and have different argument order or capability semantics in OZ Sui.

Do not assume. Read the OZ Sui module's source at the pinned commit before calling its functions.

## Module naming changes between releases

Early OZ Sui releases used certain names; later releases reorganized. Examples (illustrative): `access_control` could be moved into `auth::access_control` in a later release.

Pin a version, document it in `build-context.md`, and treat upgrades as a project (not a casual bump).

## Capability by value vs by reference

Most OZ Sui helpers expect a reference (`&Cap`). Passing by value (`Cap`) consumes the cap and breaks future operations.

Compile error is clear:

```
error: function consumes value of type Cap but value is shared
```

Easy to miss in PR review when the diff is small.

## Audit scope is per-module

Just because OZ Sui exists does not mean every module is audited. Check the audit metadata in the OZ repo per module before relying on it for high-value paths.

If a module is unaudited, decide:

- Use it anyway and document the risk.
- Do not use it; stay hand-rolled with audit on your code.

## OZ's upgrade pattern does not replace Sui's native upgrade

Sui has a protocol-level upgrade mechanism via `UpgradeCap`. OZ Sui's "upgradeable" module wraps that with policy (timelock, multisig, etc.). It does not replace it.

Common confusion: a developer expects "OZ upgradeable" to handle all upgrades. The native `UpgradeCap` still exists and still has authority. The OZ wrapper enforces additional policy on top.

If you import OZ upgradeable, make sure the `UpgradeCap` is held by the OZ policy contract, not loose somewhere else.

## Dependency conflicts with Sui framework

OZ Sui depends on the Sui framework. If your project pins a Sui framework rev that is much older or newer than OZ's pin, you can hit type conflicts.

Mitigations:

- Use a Sui framework rev compatible with the OZ release.
- Pin both deps consistently.
- If a conflict appears, the resolution is usually to update the older one to match the newer.

## Refactoring tests is not optional

OZ migration changes function signatures. Tests that used the hand-rolled pattern compile against old types and fail at runtime when the refactor lands.

Update tests as part of the same commit as the code refactor. A passing CI is the point of the migration.

## Removing the hand-rolled stubs completely

After migration, dead structs and dead functions can linger. They look harmless but:

- Confuse future readers.
- Show up in audit scope.
- Provide attack surface if accidentally re-used.

Delete them in the same commit as the migration. Do not leave a "we'll clean up later."

## Documentation drift

If your README or CLAUDE.md references the old pattern, update them. Audit reviewers read both code and docs; mismatched docs raise findings.

Last updated: 2026-05-10.
