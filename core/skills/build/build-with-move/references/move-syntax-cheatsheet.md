# Move on Sui, Syntax Cheatsheet

A senior-friendly skim. Not a full tutorial. Use it as a memory jog while authoring.

## Module Declaration

```move
module my_pkg::registry {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    public struct Registry has key {
        id: UID,
        count: u64,
    }
}
```

- Module path is `<address>::<module>`. Address comes from `Move.toml [addresses]`.
- `public struct` for types intended for external use, otherwise plain `struct`.
- Visibility: `public`, `public(package)` (Move 2024, package-scoped), `entry` (callable from PTBs), or default (private).

## Abilities

| Ability | Use it when |
|---|---|
| `key` | The struct is a top-level Object addressable on chain. |
| `store` | The struct can be embedded inside another Object. |
| `copy` | Rare. Value-type semantics. Never on a resource holding state. |
| `drop` | Rare. Allows silent destruction. Avoid for valuable resources. |

Common combos: `has key, store` for ordinary Objects; `has store` for embedded structs; `has copy, drop, store` for plain values like `u64` wrappers.

## Object Lifecycle

```move
public fun new(ctx: &mut TxContext): Registry {
    Registry { id: object::new(ctx), count: 0 }
}

public fun share(registry: Registry) {
    transfer::share_object(registry);
}

public fun freeze(registry: Registry) {
    transfer::freeze_object(registry);
}
```

- Created via `object::new(ctx)`.
- Transferred to an address with `transfer::transfer(obj, addr)`.
- Shared (anyone can mutate by ref) with `transfer::share_object(obj)`.
- Frozen (immutable, anyone can read) with `transfer::freeze_object(obj)`.
- Mutated through `&mut` references in entry functions.

## Capability Pattern

```move
public struct AdminCap has key, store { id: UID }

fun init(ctx: &mut TxContext) {
    let cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(cap, tx_context::sender(ctx));
}

public entry fun set_count(_: &AdminCap, registry: &mut Registry, n: u64) {
    registry.count = n;
}
```

- A capability is a struct that exists once. Holding it grants authority.
- Pass by reference (`&AdminCap`) when verifying authority. Pass by value only if the action consumes the cap (e.g. burning it).
- For multi-feature packages, prefer one cap per feature over a single AdminCap.

## Witness Pattern

```move
public struct REGISTRY has drop {}

fun init(witness: REGISTRY, ctx: &mut TxContext) {
    // witness type is named exactly like the module in caps
    // it cannot be created outside this module's init
}
```

- Use the one-time witness for module-level singletons (e.g. registering a coin currency, creating a Display).
- Type name is the module name in caps; ability is `drop`.

## Coin Standard

```move
use sui::coin::{Self, TreasuryCap};

public struct MYCOIN has drop {}

fun init(witness: MYCOIN, ctx: &mut TxContext) {
    let (cap, metadata) = coin::create_currency(
        witness, 9, b"MYC", b"My Coin", b"My demo coin", option::none(), ctx,
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer(cap, tx_context::sender(ctx));
}
```

The `TreasuryCap` controls minting. Treat it as the most sensitive capability in the package.

## Display Standard

```move
use sui::display;

let mut d = display::new<MyNft>(&publisher, ctx);
display::add(&mut d, b"name", b"{name}");
display::add(&mut d, b"image_url", b"{image_url}");
display::update_version(&mut d);
transfer::public_transfer(d, tx_context::sender(ctx));
```

Display fields template against the Object's public fields. Do not put internal state in Display; it leaks to indexers.

## Common Patterns

- **Escrow**: shared Object holding two parties' assets, capability gated on each side, atomic release.
- **Vault**: owned Object with a capability for withdraw; deposits open, withdraws gated.
- **Registry**: shared Object indexing other Objects via a `Table` or `Bag`.

## Building and Publishing

```bash
sui move build
sui client publish --gas-budget 200000000 --json
```

Capture the package id via the recipe in `skills/data/guides/package-id-capture.md`.

## Test Patterns

```move
#[test]
fun test_set_count() {
    let mut scenario = test_scenario::begin(@0xA);
    {
        let ctx = test_scenario::ctx(&mut scenario);
        // ... build state, call entry funcs, assert outcomes
    };
    test_scenario::end(scenario);
}

#[test, expected_failure(abort_code = E_UNAUTHORIZED)]
fun test_set_count_unauthorized() {
    // ...
}
```

`sui::test_scenario` simulates multi-address flows. Always end the scenario; orphaned objects fail the test.

For depth, see `skills/data/sui-knowledge/03-move-and-objects.md`.
