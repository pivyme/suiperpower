# OpenZeppelin Contracts for Sui, quickref

Source: https://docs.openzeppelin.com/contracts-sui/1.x and https://github.com/OpenZeppelin/contracts-sui (v1.1.0)

Always verify against the pinned release before quoting an API. This quickref covers all three published packages.

## Dependency format (MVR)

```toml
[dependencies]
openzeppelin_access = { r.mvr = "@openzeppelin-move/access" }
openzeppelin_math = { r.mvr = "@openzeppelin-move/integer-math" }
openzeppelin_fp_math = { r.mvr = "@openzeppelin-move/fixed-point-math" }
```

Only add the packages you actually use.

---

## Package 1: openzeppelin_access

Ownership-transfer wrappers for privileged `key + store` objects. Two modules.

### two_step_transfer

Wraps an object so ownership transfer requires initiate + accept (like OZ EVM's Ownable2Step, but for arbitrary objects).

**Types:**

| Type | Purpose |
|---|---|
| `TwoStepTransferWrapper<T>` | Wraps the object, stores it as dynamic field |
| `PendingOwnershipTransfer<T>` | Shared object created when transfer is initiated |
| `Borrow` | Hot-potato guard for `borrow_val` / `return_val` |
| `RequestBorrow` | Hot-potato guard for borrowing during pending transfer |

**Functions:**

| Function | Signature | Notes |
|---|---|---|
| `wrap` | `(obj: T, ctx: &mut TxContext) -> TwoStepTransferWrapper<T>` | Wraps object, caller becomes owner |
| `borrow` | `(&self) -> &T` | Immutable access to wrapped object |
| `borrow_mut` | `(&mut self) -> &mut T` | Mutable access, no ownership change |
| `borrow_val` | `(&mut self) -> (T, Borrow)` | Extracts object temporarily; must call `return_val` |
| `return_val` | `(&mut self, obj: T, borrow: Borrow)` | Returns borrowed object; aborts on identity mismatch |
| `unwrap` | `(self, ctx: &mut TxContext) -> T` | Destroys wrapper, returns object. Bypasses pending requests |
| `initiate_transfer` | `(self, new_owner: address, ctx: &mut TxContext)` | Creates shared `PendingOwnershipTransfer`; caller becomes cancel authority |
| `accept_transfer` | `(request, wrapper_ticket: Receiving<...>, ctx: &mut TxContext)` | Completes transfer; aborts if caller is not the designated recipient |
| `cancel_transfer` | `(request, wrapper_ticket: Receiving<...>, ctx: &mut TxContext)` | Cancels; returns wrapper to original owner |
| `request_borrow_val` | `(&mut request, wrapper_ticket: Receiving<...>, ctx: &mut TxContext) -> (TwoStepTransferWrapper<T>, RequestBorrow)` | Borrow wrapper from pending request |
| `request_return_val` | `(&request, wrapper, borrow: RequestBorrow)` | Return wrapper to pending request |

**Events:** `WrapExecuted<T>`, `UnwrapExecuted<T>`, `TransferInitiated<T>`, `TransferAccepted<T>`, `TransferCancelled<T>`

**Errors:** `EInvalidTransferRequest`, `EWrongTwoStepTransferWrapper`, `EWrongTwoStepTransferObject`, `ENotOwner`, `ENotNewOwner`

### delayed_transfer

Time-locked transfers. Schedule a transfer, wait for the delay to elapse, then execute.

**Types:**

| Type | Purpose |
|---|---|
| `DelayedTransferWrapper<T>` | Wraps the object with a minimum delay |
| `PendingTransfer` | Internal: stores recipient, `execute_after_ms` |
| `Borrow` | Hot-potato guard for `borrow_val` / `return_val` |

**Functions:**

| Function | Signature | Notes |
|---|---|---|
| `wrap` | `(obj: T, min_delay_ms: u64, recipient: address, ctx: &mut TxContext)` | Wraps object; transfers wrapper to recipient |
| `borrow` | `(&self) -> &T` | Immutable access |
| `borrow_mut` | `(&mut self) -> &mut T` | Mutable access |
| `borrow_val` | `(&mut self) -> (T, Borrow)` | Temporary extraction |
| `return_val` | `(&mut self, obj: T, borrow: Borrow)` | Return borrowed object |
| `schedule_transfer` | `(&mut self, new_owner: address, clock: &Clock, ctx: &mut TxContext)` | Schedules transfer at `now + min_delay_ms`; aborts if action pending |
| `schedule_unwrap` | `(&mut self, clock: &Clock, ctx: &mut TxContext)` | Schedules delayed unwrap |
| `execute_transfer` | `(self, clock: &Clock, ctx: &mut TxContext)` | Executes after delay; consumes wrapper |
| `unwrap` | `(self, clock: &Clock, ctx: &mut TxContext) -> T` | Executes scheduled unwrap after delay |
| `cancel_schedule` | `(&mut self)` | Cancels pending transfer or unwrap |

**Events:** `WrapExecuted<T>`, `TransferScheduled<T>`, `UnwrapScheduled<T>`, `OwnershipTransferred<T>`, `PendingTransferCancelled<T>`, `UnwrapExecuted<T>`

**Errors:** `ETransferAlreadyScheduled`, `ENoPendingTransfer`, `EDelayNotElapsed`, `EWrongPendingAction`, `EWrongDelayedTransferWrapper`, `EWrongDelayedTransferObject`

---

## Package 2: openzeppelin_math

Overflow-safe unsigned integer arithmetic with configurable rounding. Pure functions, no on-chain storage.

### rounding module

```move
use openzeppelin_math::rounding;

rounding::down()     // floor
rounding::up()       // ceiling
rounding::nearest()  // round to nearest
```

### Integer modules (u8, u16, u32, u64, u128, u256)

All widths share the same function surface. Replace the type prefix as needed.

| Function | Signature (u64 shown) | Returns |
|---|---|---|
| `mul_div` | `(a: u64, b: u64, denom: u64, rounding) -> Option<u64>` | `None` on overflow or zero denom |
| `mul_shr` | `(a: u64, b: u64, shift: u8, rounding) -> Option<u64>` | Multiply then right-shift |
| `sqrt` | `(value: u64, rounding) -> u64` | Square root |
| `log2` | `(value: u64, rounding) -> u8` | Base-2 logarithm |
| `log10` | `(value: u64, rounding) -> u8` | Base-10 logarithm |
| `log256` | `(value: u64, rounding) -> u8` | Base-256 logarithm |
| `average` | `(a: u64, b: u64, rounding) -> u64` | Average of two values |
| `clz` | `(value: u64) -> u8` | Count leading zeros |
| `msb` | `(value: u64) -> u8` | Most significant bit index |
| `checked_shl` | `(value: u64, shift: u8) -> Option<u64>` | Left shift, `None` on overflow |
| `checked_shr` | `(value: u64, shift: u8) -> Option<u64>` | Right shift, `None` on overflow |
| `inv_mod` | `(value: u64, modulus: u64) -> Option<u64>` | Modular inverse |
| `mul_mod` | `(a: u64, b: u64, modulus: u64) -> u64` | Modular multiplication |

### u512 module (wide arithmetic)

```move
use openzeppelin_math::u512::{Self, U512};
```

| Function | Signature |
|---|---|
| `new` | `(hi: u256, lo: u256) -> U512` |
| `zero` | `() -> U512` |
| `from_u256` | `(value: u256) -> U512` |
| `hi` | `(&U512) -> u256` |
| `lo` | `(&U512) -> u256` |
| `ge` | `(&U512, &U512) -> bool` |
| `mul_u256` | `(a: u256, b: u256) -> U512` |
| `div_rem_u256` | `(numerator: U512, divisor: u256) -> (bool, u256, u256)` |

**Errors:** `ECarryOverflow`, `EUnderflow`, `EDivideByZero`, `EInvalidRemainder`

### decimal_scaling module

Converts between different decimal precisions. Common use: bridging 6-decimal stablecoins to 9-decimal Sui coins.

| Function | Signature |
|---|---|
| `safe_upcast_balance` | `(amount: u64, source_decimals: u8, target_decimals: u8) -> u256` |
| `safe_downcast_balance` | `(raw_amount: u256, source_decimals: u8, target_decimals: u8) -> u64` |

**Errors:** `ESafeDowncastOverflowedInt`, `EInvalidDecimals`

---

## Package 3: openzeppelin_fp_math

Fixed-point decimal types with 9 decimal places (matching Sui coin precision). Pure functions.

### UD30x9 (unsigned fixed-point)

Unsigned values from 0 to ~3.4 x 10^29 with 9 decimals of precision. Supports arithmetic (`add`, `sub`, `mul`, `div`, `pow`), comparisons, and bitwise helpers.

**Casting vs converting:** casting preserves existing fixed-point scale (raw value). Converting applies or removes the 10^9 scale factor when working with whole integers.

### SD29x9 (signed fixed-point)

Signed values from ~-1.7 x 10^29 to ~1.7 x 10^29 with 9 decimals. Supports arithmetic and comparisons. No bitwise helpers.

**Division rounding:** truncation or rounding away from zero, configurable per call.

---

## What does NOT exist in OZ Sui

Do not look for these. They are not in the library:

- `access_control` (role-based registry)
- `ownable` (single-owner)
- `pausable` (pause/unpause)
- `upgradeable` (upgrade policy wrapper)
- `signer_registry` (multi-sig)
- `events` (event helpers)

If you need these patterns, keep them hand-rolled.

Last updated: 2026-05-11. Source: OZ Contracts for Sui v1.1.0.
