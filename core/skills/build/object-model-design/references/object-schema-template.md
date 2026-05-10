# Worked example: a small lending app

Concrete Object map and capability map for a small Sui lending app. Use it as a pattern, not a literal copy.

## Project: depo

A simple per-asset deposit + borrow product. Users deposit USDC as collateral, borrow SUI against it. One market per asset.

## Entities

- `Market<T>`: the per-asset pool (e.g. `Market<USDC>`).
- `Position`: per-user record of deposits and borrows.
- `AdminCap`: admin operations (pause, fee change).
- `MarketCap`: per-market admin (set interest rate model).
- `LiquidationCap`: any liquidator can hold one; permissionless.

## Object map

| Object | Abilities | Ownership | Mutation gate | Why |
|---|---|---|---|---|
| `Market<T>` | key | shared | `MarketCap` for params; permissionless deposit/borrow logic | Many users deposit and borrow concurrently. Must contend at consensus level. |
| `Position` | key, store | owned | self (signature) | Per-user state. High throughput, low latency, no contention. |
| `AdminCap` | key, store | owned (multisig) | none (capability is the gate) | Pause, fee change. Held by multisig. |
| `MarketCap` | key, store | owned (multisig) | none | Per-market params. |
| `LiquidationCap` | key, store | owned (anyone) | none | Permissionless liquidation; any holder can call liquidate. |

## Capability map

| Cap | Created where | Held by | Passed by | Leak risk |
|---|---|---|---|---|
| `AdminCap` | `init` | multisig | reference (`&AdminCap`) | None unless multisig compromised |
| `MarketCap` | `create_market` (gated by `&AdminCap`) | multisig | reference | Same |
| `LiquidationCap` | `mint_liquidation_cap` (permissionless, public) | anyone | by value (consumed in liquidate) | None; permissionless by design |
| `TreasuryCap<MY_COIN>` | `init` of a coin module (if any) | issuer multisig | reference | High; treat like a printing press |

## Public entry surface

| Function | Object args | Cap required | Returns |
|---|---|---|---|
| `create_market<T>` | none | `&AdminCap` | `Market<T>` (shared) + `MarketCap` |
| `deposit<T>` | `&mut Market<T>`, `&mut Position`, `Coin<T>` | none | nothing |
| `borrow<T>` | `&mut Market<T>`, `&mut Position` | none | `Coin<T>` |
| `repay<T>` | `&mut Market<T>`, `&mut Position`, `Coin<T>` | none | nothing |
| `withdraw<T>` | `&mut Market<T>`, `&mut Position` | none | `Coin<T>` |
| `liquidate<T>` | `&mut Market<T>`, `&mut Position` (target), `Coin<T>` (repayment) | `LiquidationCap` (consumed) | `Coin<T>` (collateral seized) |
| `pause` | `&mut Market<T>` | `&AdminCap` | nothing |

## Stress tests

### Concurrency

- Many users depositing into `Market<T>` at once: shared Object handles contention via consensus. Throughput limited by consensus, not by us.
- One user mutating their `Position`: owned, no contention.

### Reinitialization

- `create_market<T>` is gated by `&AdminCap`. Calling twice for the same `T` would create two markets, which is wrong. Add a registry that maps `T -> market id` and refuse a duplicate.

```move
public struct MarketRegistry has key {
    id: UID,
    markets: VecMap<TypeName, ID>,
}
```

### Capability leakage

- `AdminCap` is never returned from a public function.
- `LiquidationCap` is freely mintable, no leak concerns.
- `TreasuryCap` (if applicable) lives in the coin module, not exposed via Display.

### Versioning

- `Market<T>` is a shared Object. Mutations bump version internally; we do not need explicit version handling.
- `Position` is owned; no version contention.

## Notes for build-with-move

- `Position` should hold `borrow_balance` and `collateral_balance` as `Balance<T>`, not raw `u64`, so `coin` API works directly.
- Implement interest accrual lazily: every `deposit/borrow/repay/withdraw` updates a per-position `last_accrual_epoch` and applies the delta.
- Liquidation:
  - Refuse to liquidate if `health_factor >= 1.0`.
  - Liquidator pays the borrow asset, receives the collateral asset at a discount.
  - Discount is configurable in `Market<T>`.

## Open questions

- Oracle source for prices? Pyth feed per asset.
- Should we support multi-asset positions (one Position with multiple deposits/borrows)? Currently single-asset for v1; revisit for v1.1.
- Treasury for fees? Could add `Treasury<T>` per market or aggregate. Decide before launch.

Last updated: 2026-05-10.
