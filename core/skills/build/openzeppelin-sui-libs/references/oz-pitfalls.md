# OZ Sui pitfalls

Surprises that come from assuming OZ Sui matches OZ EVM, or from skipping version discipline.

Source: https://docs.openzeppelin.com/contracts-sui/1.x (v1.1.0)

## The library is much smaller than OZ EVM

OZ Contracts for Sui ships three packages: `openzeppelin_access` (two-step and delayed transfer), `openzeppelin_math` (integer math, u512, decimal scaling), and `openzeppelin_fp_math` (fixed-point types). That is it.

There is no `access_control`, no `pausable`, no `ownable`, no `upgradeable`, no `signer_registry`, no `events` helpers. Do not search for these modules. If your project needs role-based access control or a pause mechanism, keep it hand-rolled.

## API parity is not one-to-one with OZ EVM

OZ EVM's `Ownable2Step` changes a storage slot. OZ Sui's `two_step_transfer` wraps an entire object in a `TwoStepTransferWrapper<T>` and uses `Receiving<T>` for the accept flow. The mental model is completely different.

Do not assume. Read the OZ Sui module's source or API docs at the pinned version before calling its functions.

## Math functions return Option, not abort

`mul_div`, `checked_shl`, `checked_shr`, and `inv_mod` return `Option<T>`. They do not abort on overflow or invalid input. If you blindly call `.destroy_some()` without handling the `None` case, you get an abort at runtime with an unhelpful error.

Decide per call site: is `None` a programming error (abort is fine) or a user-input edge case (return an error)?

## delayed_transfer needs a Clock reference

`schedule_transfer`, `schedule_unwrap`, `execute_transfer`, and `unwrap` all take `&Clock`. The Clock is a Sui framework shared object at address `0x6`. If you forget to pass it in your PTB or test, the call aborts.

In tests, use `sui::test_scenario` clock utilities. In PTBs, include the Clock object.

## two_step_transfer is for single-owned objects

The docs state explicitly: "This package is designed for single-owned objects." `ctx.sender()` is stored as the owner-of-record during `wrap`.

Do not use `two_step_transfer` directly in shared-object executor flows unless the signer identity maps explicitly to cancel authority. If your admin cap lives inside a shared object, restructure so the wrapper itself is single-owned.

## Wrapper consumes the object

When you `wrap(cap, ctx)`, the cap moves into the wrapper as a dynamic field. You access it via `borrow(&wrapper)` or `borrow_mut(&mut wrapper)`. You no longer hold the cap directly.

Functions that previously took `&AdminCap` must be updated to take `&TwoStepTransferWrapper<AdminCap>` and call `borrow` internally. This changes your public API surface. Plan for it.

## borrow_val is a hot potato

`borrow_val` returns `(T, Borrow)`. The `Borrow` guard has no `drop`, so you must call `return_val` before the transaction ends. If you forget, the transaction aborts. This is intentional: it prevents extracting the wrapped object permanently through this path.

Use `unwrap` if you genuinely want to destroy the wrapper and reclaim the object.

## Dependency format is MVR, not git

OZ Sui uses the MVR (Move Version Registry) for dependency resolution:

```toml
openzeppelin_access = { r.mvr = "@openzeppelin-move/access" }
```

Not:

```toml
OpenZeppelin = { git = "https://github.com/OpenZeppelin/openzeppelin-sui.git", rev = "..." }
```

The repo URL is `https://github.com/OpenZeppelin/contracts-sui` (not `openzeppelin-sui`, that 404s). But MVR is the intended dependency path. You need the MVR CLI installed (`mvr add @openzeppelin-move/access`).

## Sui CLI version matters

The repo requires Sui CLI 1.71.1 or compatible. If your project pins an older Sui framework revision, you may hit type conflicts between OZ's expected Sui stdlib and yours.

Pin both deps consistently. If a conflict appears, update the older one to match.

## Experimental status

The README states: "This is experimental software provided on an 'as is' and 'as available' basis." Past audits are in the `/audits` directory of the repo. Check audit coverage for the specific modules you adopt, not just the existence of audits.

## Refactoring tests is not optional

OZ migration changes function signatures and types. Tests that used the hand-rolled pattern break when the refactor lands. Update tests in the same commit. A passing `sui move test` is the whole point.

## Remove dead code completely

After migration, dead structs and dead functions can linger. They look harmless but confuse future readers, show up in audit scope, and provide attack surface if accidentally reused. Delete them in the same commit as the migration.

## OZ MCP server does not support Sui

The OpenZeppelin MCP server at `mcp.openzeppelin.com` supports Solidity, Cairo, Stellar, and Stylus. It does not support Move or Sui. Do not attempt to use it for OZ Sui questions. Read the docs or repo directly.

Last updated: 2026-05-11. Source: OZ Contracts for Sui v1.1.0.
