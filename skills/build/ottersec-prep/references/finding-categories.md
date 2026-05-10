# Common OtterSec findings (Sui Move)

Patterns that appear repeatedly in OtterSec's public Sui Move audit reports. Catch them before submission.

## Capability passed by value where reference would do

Bad:

```move
public fun mint(cap: AdminCap, /* ... */) {
    // ...
}
```

The function consumes the cap, which is rarely intended. Now no one can mint again unless a new cap is issued.

Good:

```move
public fun mint(_: &AdminCap, /* ... */) {
    // ...
}
```

The function checks possession via the reference, no consumption.

## Reinitialization possible

Bad:

```move
public entry fun create_global(ctx: &mut TxContext) {
    let g = Global { id: object::new(ctx), counter: 0 };
    transfer::share_object(g);
}
```

Anyone can call this function, producing arbitrarily many "global" Objects.

Good: gate behind a capability that is consumed at first call, or move the creation to `init`.

## Shared Object mutated without capability check

Bad:

```move
public fun update_config(global: &mut Global, new_value: u64) {
    global.value = new_value;
}
```

Any caller can mutate. Probably not intended for an admin-config struct.

Good:

```move
public fun update_config(_: &AdminCap, global: &mut Global, new_value: u64) {
    global.value = new_value;
}
```

## Coin operations bypass standard API

Bad: directly manipulating `Balance<T>` for a registered coin type. Skips the standard event emission and may break invariants the standard relies on.

Good: use `coin::*` for anything involving a registered currency. Hand-rolled balance manipulation is reserved for genuinely custom non-coin cases.

## Display leaks internal state

Bad:

```move
display::add(&mut display, b"admin_secret", b"{admin_secret}");
```

A Display field interpolates fields from the Object. If the field was not meant to be public, it now is, on every wallet that renders the Object.

Good: never put admin-only data in Display. Use Display for genuinely public-facing fields (name, image, description).

## Missing events on critical state transitions

Bad: a `transfer_ownership` function that mutates state silently.

Good: emit a typed event so indexers and clients can observe the change.

```move
public struct OwnershipTransferred has copy, drop { from: address, to: address }

public fun transfer_ownership(/* ... */) {
    // ... mutate ...
    event::emit(OwnershipTransferred { from, to });
}
```

## Hand-rolled patterns where OZ Sui has a replacement

Bad: writing your own role-based access control, pausable, or upgradeable patterns from scratch.

Good: import the OZ Sui library and use the audited primitive. Reduces audit surface and produces a known-good pattern the auditor recognizes.

## Magic numbers for error codes

Bad:

```move
assert!(amount > 0, 0);
assert!(caller == owner, 1);
```

The auditor cannot tell what the codes mean.

Good:

```move
const E_ZERO_AMOUNT: u64 = 0;
const E_NOT_OWNER: u64 = 1;

assert!(amount > 0, E_ZERO_AMOUNT);
assert!(caller == owner, E_NOT_OWNER);
```

## Floating dependency versions

Bad: `Sui = { git = "...", branch = "main" }`

`main` moves over time, breaking reproducibility.

Good: `Sui = { git = "...", rev = "<commit-or-tag>" }`

## Capability stored in a public read path

Bad:

```move
public fun get_pool(global: &Global): &PoolInfo {
    &global.pool
}

// where pool contains an AdminCap field
```

Returning a reference to a struct that contains a capability via a public function leaks the capability's payload to anyone.

Good: split internal from public state. Capabilities stay in private structures or in standalone Cap Objects.

## Arithmetic boundary not handled

Bad:

```move
let total = (a as u128) + (b as u128);
let truncated = total as u64;
```

If `total` exceeds `u64::MAX`, the cast aborts (which is OK for accounting paths) but the developer might intend a different behavior.

Good: be explicit:

```move
assert!(total <= (U64_MAX as u128), E_OVERFLOW);
let truncated = total as u64;
```

Or use a checked-arithmetic helper from OZ Sui Math.

## PTB-side trust assumption

Bad: a function that assumes a previous step in the PTB validated something.

Good: do not assume context across calls. Each function checks its inputs.

This is especially important in sponsored-tx flows where the sponsor's signature covers the whole PTB; a malicious user could compose calls in unexpected order.

Last updated: 2026-05-10.
