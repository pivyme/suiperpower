# Migrating hand-rolled patterns to OZ Sui

Migrations are dangerous if rushed. Pattern: rewrite one path, rebuild, run tests, commit. Then the next.

Source: https://docs.openzeppelin.com/contracts-sui/1.x (v1.1.0)

## Pattern A: hand-rolled admin transfer to two_step_transfer

Before (direct transfer, one mistake and the cap is gone forever):

```move
module my_pkg::treasury;

public struct AdminCap has key, store { id: UID }

fun init(ctx: &mut TxContext) {
    transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
}

/// Dangerous: if new_owner is wrong, AdminCap is lost
public fun transfer_admin(cap: AdminCap, new_owner: address) {
    transfer::transfer(cap, new_owner);
}
```

After (two-step: initiate, then new owner accepts; original owner can cancel):

```move
module my_pkg::treasury;

use openzeppelin_access::two_step_transfer;

public struct AdminCap has key, store { id: UID }

fun init(ctx: &mut TxContext) {
    let cap = AdminCap { id: object::new(ctx) };
    // Wrap the cap so transfers require initiate + accept
    let wrapper = two_step_transfer::wrap(cap, ctx);
    transfer::transfer(wrapper, ctx.sender());
}

/// Start transfer. Creates a shared PendingOwnershipTransfer.
/// Original owner retains cancel authority.
public fun start_transfer(
    wrapper: two_step_transfer::TwoStepTransferWrapper<AdminCap>,
    new_owner: address,
    ctx: &mut TxContext,
) {
    two_step_transfer::initiate_transfer(wrapper, new_owner, ctx);
}

/// New owner calls this to complete the transfer.
public fun accept(
    request: two_step_transfer::PendingOwnershipTransfer<AdminCap>,
    wrapper_ticket: sui::transfer::Receiving<
        two_step_transfer::TwoStepTransferWrapper<AdminCap>
    >,
    ctx: &mut TxContext,
) {
    two_step_transfer::accept_transfer(request, wrapper_ticket, ctx);
}

/// Original owner calls this to cancel a pending transfer.
public fun cancel(
    request: two_step_transfer::PendingOwnershipTransfer<AdminCap>,
    wrapper_ticket: sui::transfer::Receiving<
        two_step_transfer::TwoStepTransferWrapper<AdminCap>
    >,
    ctx: &mut TxContext,
) {
    two_step_transfer::cancel_transfer(request, wrapper_ticket, ctx);
}

/// Access the wrapped cap without ownership change.
public fun do_admin_thing(
    wrapper: &two_step_transfer::TwoStepTransferWrapper<AdminCap>,
) {
    let _cap: &AdminCap = two_step_transfer::borrow(wrapper);
    // use _cap for authorization checks
}
```

Migration steps:

1. Add `openzeppelin_access = { r.mvr = "@openzeppelin-move/access" }` to `Move.toml`.
2. Update `init` to wrap the cap with `two_step_transfer::wrap`.
3. Replace direct `transfer::transfer(cap, new_owner)` with `initiate_transfer` + `accept_transfer`.
4. Update every function that took `AdminCap` by value to take `&TwoStepTransferWrapper<AdminCap>` and use `borrow`.
5. Rewrite tests: scenarios that transferred the cap now use the two-step flow.
6. Run `sui move test`. Fix any failures before proceeding.

## Pattern B: hand-rolled delay to delayed_transfer

Before (manual timestamp check, easy to get wrong):

```move
public struct TimeLock has key, store {
    id: UID,
    admin_cap: Option<AdminCap>,
    unlock_at_ms: u64,
    pending_owner: address,
}

public fun schedule(lock: &mut TimeLock, new_owner: address, clock: &Clock) {
    lock.unlock_at_ms = clock::timestamp_ms(clock) + 86_400_000; // 24h
    lock.pending_owner = new_owner;
}

public fun execute(lock: &mut TimeLock, clock: &Clock) {
    assert!(clock::timestamp_ms(clock) >= lock.unlock_at_ms, E_TOO_EARLY);
    let cap = option::extract(&mut lock.admin_cap);
    transfer::transfer(cap, lock.pending_owner);
}
```

After (OZ delayed_transfer handles all the bookkeeping):

```move
use openzeppelin_access::delayed_transfer;

/// At init: wrap the cap with a 24-hour minimum delay
public fun wrap_with_delay(
    cap: AdminCap,
    recipient: address,
    ctx: &mut TxContext,
) {
    delayed_transfer::wrap(cap, 86_400_000, recipient, ctx);
    // wrapper is transferred to recipient automatically
}

/// Owner schedules a transfer to a new address
public fun schedule(
    wrapper: &mut delayed_transfer::DelayedTransferWrapper<AdminCap>,
    new_owner: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    delayed_transfer::schedule_transfer(wrapper, new_owner, clock, ctx);
}

/// After delay elapses, anyone can execute
public fun execute(
    wrapper: delayed_transfer::DelayedTransferWrapper<AdminCap>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    delayed_transfer::execute_transfer(wrapper, clock, ctx);
}

/// Cancel a pending transfer
public fun cancel(
    wrapper: &mut delayed_transfer::DelayedTransferWrapper<AdminCap>,
) {
    delayed_transfer::cancel_schedule(wrapper);
}
```

Migration steps:

1. Add the `openzeppelin_access` MVR dependency.
2. Replace your custom `TimeLock` struct with `DelayedTransferWrapper<AdminCap>`.
3. Replace manual timestamp arithmetic with `schedule_transfer` and `execute_transfer`.
4. Pass `&Clock` from the Sui framework (object ID `0x6`) to schedule and execute calls.
5. Update tests. In particular, test the `EDelayNotElapsed` abort when executing too early.
6. Delete the old `TimeLock` struct and its helpers.

## Pattern C: hand-rolled arithmetic to openzeppelin_math

Before (overflow risk, wrong rounding, precision loss):

```move
/// Hand-rolled fee calculation. Overflows if amount * fee_bps > u64::MAX.
public fun apply_fee(amount: u64, fee_bps: u64): u64 {
    (amount * fee_bps) / 10000
}
```

After (overflow-safe, explicit rounding):

```move
use openzeppelin_math::u64;
use openzeppelin_math::rounding;

/// Safe fee calculation. Returns 0 on overflow instead of aborting.
public fun apply_fee(amount: u64, fee_bps: u64): u64 {
    let result = u64::mul_div(amount, fee_bps, 10000, rounding::down());
    result.destroy_some() // or handle None for overflow
}
```

For decimal conversion between tokens:

```move
use openzeppelin_math::decimal_scaling;

/// Convert 6-decimal USDC amount to 9-decimal representation
public fun usdc_to_sui_decimals(usdc_amount: u64): u256 {
    decimal_scaling::safe_upcast_balance(usdc_amount, 6, 9)
}

/// Convert back (u256 -> u64, aborts if value too large)
public fun sui_decimals_to_usdc(raw: u256): u64 {
    decimal_scaling::safe_downcast_balance(raw, 9, 6)
}
```

Migration steps:

1. Add `openzeppelin_math = { r.mvr = "@openzeppelin-move/integer-math" }` to `Move.toml`.
2. Replace `(a * b) / c` with `u64::mul_div(a, b, c, rounding::down())` (or `rounding::up()` depending on which direction favors the protocol).
3. Handle the `Option` return: `mul_div` returns `None` on overflow or zero denominator.
4. Replace hand-rolled decimal conversion with `decimal_scaling::safe_upcast_balance` / `safe_downcast_balance`.
5. Run `sui move test`. Verify edge cases (max values, zero inputs) still pass.

## Migration checklist

For every pattern migrated:

- [ ] MVR dep added, `sui move build` succeeds.
- [ ] All call sites updated.
- [ ] All tests updated.
- [ ] All tests pass.
- [ ] Old struct(s) and functions deleted, not just orphaned.
- [ ] `build-context.md` updated.
- [ ] Diff reviewed for any leftover hand-rolled paths.

## Rollback plan

If an OZ migration introduces a regression you cannot diagnose quickly:

- Revert the migration commit.
- File an issue at https://github.com/OpenZeppelin/contracts-sui/issues.
- Revisit after the OZ release that addresses the gap (or stay hand-rolled with documented rationale).

Do not ship a half-migrated package. Either go all in for a pattern, or stay out.

Last updated: 2026-05-11. Source: OZ Contracts for Sui v1.1.0.
