# OpenZeppelin on Sui (knowledge brief)

Source: https://docs.openzeppelin.com/contracts-sui/1.x and https://github.com/OpenZeppelin/contracts-sui

## What it is

OpenZeppelin Contracts for Sui (v1.1.0) is a set of audited Move libraries covering safe ownership transfer and math primitives. The library is designed around Move's resource semantics. It is not a port of OZ EVM's full module set.

OpenZeppelin is a Sui Overflow 2026 prize sponsor.

## What it covers

Three published packages, each independent:

**1. openzeppelin_access** (MVR: `@openzeppelin-move/access`)
- `two_step_transfer` module: wraps any `key + store` object in a `TwoStepTransferWrapper<T>`. Ownership transfer requires initiate + accept. Original owner retains cancel authority.
- `delayed_transfer` module: wraps objects in `DelayedTransferWrapper<T>` with a configurable minimum delay. Schedule a transfer or unwrap, wait for the delay, then execute. Includes cancel.

**2. openzeppelin_math** (MVR: `@openzeppelin-move/integer-math`)
- `rounding` module: `Down`, `Up`, `Nearest` rounding modes.
- Integer modules for every width (u8, u16, u32, u64, u128, u256): `mul_div`, `sqrt`, `log2`, `log10`, `log256`, `average`, `clz`, `msb`, `checked_shl`, `checked_shr`, `inv_mod`, `mul_mod`.
- `u512` module: wide 512-bit arithmetic (`mul_u256`, `div_rem_u256`).
- `decimal_scaling` module: `safe_upcast_balance`, `safe_downcast_balance` for converting between token decimal precisions.

**3. openzeppelin_fp_math** (MVR: `@openzeppelin-move/fixed-point-math`)
- `UD30x9`: unsigned fixed-point (30 integer digits + 9 decimal digits). Arithmetic, comparisons, bitwise.
- `SD29x9`: signed fixed-point (29 integer digits + 9 decimal digits). Arithmetic, comparisons.
- 9 decimals matches Sui coin precision. Casting preserves raw scale; converting applies the 10^9 factor.

## What it does NOT cover

There is no `access_control`, no `pausable`, no `ownable`, no `upgradeable`, no `signer_registry`, no `events` helpers. These modules do not exist. If you need role-based access control, pause/unpause, single-owner, or multi-sig patterns, keep them hand-rolled.

## How to depend on OZ Sui in Move.toml

Use MVR (Move Version Registry) format. Only add the packages you need:

```toml
[dependencies]
openzeppelin_access = { r.mvr = "@openzeppelin-move/access" }
openzeppelin_math = { r.mvr = "@openzeppelin-move/integer-math" }
openzeppelin_fp_math = { r.mvr = "@openzeppelin-move/fixed-point-math" }
```

You can also use the MVR CLI: `mvr add @openzeppelin-move/access`.

Do NOT use git dependencies pointing at `openzeppelin-sui.git` (that URL 404s). The correct repo is `https://github.com/OpenZeppelin/contracts-sui`.

## Mainnet package addresses

| Package | Mainnet address |
|---|---|
| `openzeppelin_access` | `0x0a031c162f9982ee32b199b98fbfbb6561051f2c4d2e17d358b09beafc20ce45` |
| `openzeppelin_math` | `0xe716e7441295447a18cf8c573dd3e238945093385ad47433d1a5a527f06f3009` |
| `openzeppelin_fp_math` | `0xf18ad29e1549aec2d5ce12d1a461ea0a03b5a113cc04aced0e07963738fd8a84` |

## Minimal integration: two-step transfer

```move
module my_package::admin;

use openzeppelin_access::two_step_transfer;

public struct AdminCap has key, store { id: UID }

fun init(ctx: &mut TxContext) {
    let cap = AdminCap { id: object::new(ctx) };
    let wrapper = two_step_transfer::wrap(cap, ctx);
    transfer::transfer(wrapper, ctx.sender());
}

/// Use the admin cap without transferring ownership
public fun admin_action(
    wrapper: &two_step_transfer::TwoStepTransferWrapper<AdminCap>,
) {
    let _cap: &AdminCap = two_step_transfer::borrow(wrapper);
    // perform admin action using _cap as proof of authority
}
```

## Minimal integration: safe math

```move
module my_package::fees;

use openzeppelin_math::rounding;
use openzeppelin_math::u64;

/// Calculate fee without overflow risk
public fun calculate_fee(amount: u64, fee_bps: u64): u64 {
    let result = u64::mul_div(amount, fee_bps, 10000, rounding::down());
    result.destroy_some() // aborts on overflow; handle Option for user-facing paths
}
```

## Minimal integration: decimal scaling

```move
module my_package::bridge;

use openzeppelin_math::decimal_scaling;

/// Convert 6-decimal stablecoin to 9-decimal representation
public fun scale_up(amount: u64): u256 {
    decimal_scaling::safe_upcast_balance(amount, 6, 9)
}
```

## Common pitfalls

- **Move resource semantics differ from Solidity.** `two_step_transfer` wraps an entire object via dynamic field, not a storage slot. You access the wrapped object through `borrow(&wrapper)`.
- **Math functions return `Option`, not abort.** `mul_div`, `inv_mod`, `checked_shl/shr` return `None` on overflow or invalid input. Handle it.
- **`delayed_transfer` needs `&Clock`.** The Sui framework Clock object (ID `0x6`) must be passed to schedule and execute functions.
- **Experimental status.** The README says "experimental software." Check the `/audits` directory for coverage of the specific modules you use.
- **Sui CLI version.** The repo requires Sui CLI 1.71.1. Older Sui framework pins may cause type conflicts.
- **OZ MCP server does not support Sui.** Only Solidity, Cairo, Stellar, Stylus. Read the docs directly.

## Where to go deeper

- OZ Contracts for Sui docs: `https://docs.openzeppelin.com/contracts-sui/1.x`
- OZ Contracts for Sui repo: `https://github.com/OpenZeppelin/contracts-sui`
- API reference (access): `https://docs.openzeppelin.com/contracts-sui/1.x/api/access`
- API reference (math): `https://docs.openzeppelin.com/contracts-sui/1.x/api/math`
- Suiperpower skill: `skills/build/openzeppelin-sui-libs/`
- Related skill: `skills/build/review-move/` flags hand-rolled patterns OZ replaces.

Last updated: 2026-05-11. Source: OZ Contracts for Sui v1.1.0.
