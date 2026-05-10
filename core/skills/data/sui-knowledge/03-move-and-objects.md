# 03. Move and Objects

> Audience: an AI skill or a dev writing Sui Move code. This is the working reference, copy-paste-ready for the common patterns.

Sui Move is a resource-oriented language. Values are not just data; they are typed, non-duplicable resources that the type system tracks across function boundaries. If your mental model is "structs that the runtime cannot lose or duplicate," you are most of the way there.

## Move package layout

A Sui Move package is a directory:

```
my_package/
├── Move.toml
├── sources/
│   ├── module_a.move
│   └── module_b.move
└── tests/
    └── module_a_tests.move
```

`Move.toml` declares the package name, version, and dependencies:

```toml
[package]
name = "my_package"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/mainnet" }

[addresses]
my_package = "0x0"
```

Pin the dep `rev` to a specific commit or tag in production; `framework/mainnet` is fine for early development but moves over time.

Build:

```bash
sui move build
```

Test:

```bash
sui move test
```

## Module declaration

Sui Move 2024 syntax:

```move
module my_package::treasury;

use sui::object::{Self, UID};
use sui::tx_context::TxContext;
use sui::transfer;

public struct Treasury has key {
    id: UID,
    balance: u64,
}

fun init(ctx: &mut TxContext) {
    let treasury = Treasury {
        id: object::new(ctx),
        balance: 0,
    };
    transfer::transfer(treasury, ctx.sender());
}
```

Notes:

- Modules are declared with `module <package>::<name>;`.
- `init` runs once at package publish; takes `&mut TxContext`.
- `public` is for cross-package functions; `public(package)` for intra-package; default (no modifier) is private.
- `friend` exists in older Move; prefer `public(package)` in 2024 edition.

## Abilities (key, store, copy, drop)

Every struct must declare which abilities it has:

| Ability | Meaning |
|---|---|
| `key` | The struct can be a top-level Object (has a `UID`, can be stored in the global Object table) |
| `store` | The struct can be nested inside another struct that has `key` |
| `copy` | The struct can be duplicated (rare for stateful resources) |
| `drop` | The struct can be silently dropped at end of scope (rare for stateful resources) |

Rules:

- Top-level on-chain Objects need `key`. They have a `UID` field.
- Nested Objects (children, contents) need `store`.
- Pure data types (primitives, enums, structs that are values not state) typically have `copy` and `drop`.
- Capabilities and resources usually have only `key` (or `key, store` if they nest).

Common mistake: forgetting `store` when nesting. The compiler will reject it but the error message takes a second to parse.

```move
public struct Player has key {
    id: UID,
    inventory: vector<Item>,  // requires Item: store
}

public struct Item has store {
    name: vector<u8>,
}
```

## Owned, shared, immutable Objects

After construction, you place an Object on chain via the `transfer` module:

```move
use sui::transfer;

// Owned by an address
transfer::transfer(obj, recipient);

// Shared (anyone can use, consensus-ordered)
transfer::share_object(obj);

// Immutable (read-only forever)
transfer::freeze_object(obj);
```

Lifecycle constraints:

- Once shared, an Object cannot be transferred to an address again.
- Once frozen, an Object cannot be mutated.
- Owned Objects can be transferred, wrapped inside another Object, or deleted by the owner.

When to choose which: see `02-what-makes-sui-unique.md`. Default to owned.

## Capability pattern

Capabilities are unforgeable proofs of permission. Mint them at module init or in controlled functions, never expose constructors publicly.

```move
public struct AdminCap has key, store {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    let admin = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin, ctx.sender());
}

public fun do_admin_thing(_cap: &AdminCap, /* ... */) {
    // possession of the cap reference proves authorization
}
```

For coin minting, use `TreasuryCap<T>` from `sui::coin`:

```move
use sui::coin::{Self, TreasuryCap};

public fun mint(cap: &mut TreasuryCap<MYCOIN>, amount: u64, recipient: address, ctx: &mut TxContext) {
    let coin = coin::mint(cap, amount, ctx);
    transfer::public_transfer(coin, recipient);
}
```

## Witness pattern (one-time witness)

A one-time witness (OTW) is a struct named exactly the same as the module in uppercase, declared with only `drop`. The Sui framework guarantees exactly one instance is passed to your `init`, ever.

```move
module my_package::mycoin;

use sui::coin;

public struct MYCOIN has drop {}

fun init(witness: MYCOIN, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        9,                       // decimals
        b"MYCOIN",
        b"My Coin",
        b"Description",
        option::none(),
        ctx,
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury, ctx.sender());
}
```

Use OTW any time you need a unique-per-module token.

## Coin standard

`sui::coin::Coin<T>` is the standard fungible token. The phantom type parameter `T` makes coins of different types non-interchangeable in Move.

Create a new coin type with the OTW pattern above. Mint with `coin::mint`, burn with `coin::burn`, split with `coin::split`, join with `coin::join`.

Use `Coin<SUI>` for native SUI; everything else is your own type.

## Display standard

`sui::display::Display<T>` defines how an Object renders in wallets and explorers. Set it once at deploy:

```move
use sui::display;
use sui::package;

let publisher = package::claim(witness, ctx);
let mut display = display::new<MyNft>(&publisher, ctx);
display::add(&mut display, b"name", b"{name}");
display::add(&mut display, b"image_url", b"{image_url}");
display::update_version(&mut display);
transfer::public_transfer(display, ctx.sender());
transfer::public_transfer(publisher, ctx.sender());
```

Fields with `{...}` are template references to Object fields.

## Common patterns

### Escrow

Two parties hold their items in escrow until both deposit, then atomic swap:

```move
public struct Escrow<T: key + store, U: key + store> has key {
    id: UID,
    item: Option<T>,
    counterparty_item: Option<U>,
    creator: address,
    counterparty: address,
}
```

Pattern: shared Object, both parties deposit, finalize when both options are filled, abort returns items.

### Vault

A vault holds Objects on behalf of users; access gated by a capability:

```move
public struct Vault has key {
    id: UID,
    contents: Bag,
}

public struct VaultCap has key, store {
    id: UID,
    vault_id: ID,
}
```

### Registry

A shared registry maps keys to values, gated by an admin cap for writes:

```move
public struct Registry has key {
    id: UID,
    entries: Table<vector<u8>, ID>,
}
```

## Common mistakes

1. **Forgetting `store` on nested Objects.** Compiler catches it, but the message can mislead.
2. **Making everything `public` instead of `public(package)`.** Leaks API surface.
3. **Capability accepted by value when reference would do.** `take_cap(cap: AdminCap)` consumes the cap; use `&AdminCap` if you do not intend to consume.
4. **Sharing an Object that should be owned.** Once shared, no take-back.
5. **Forgetting the OTW name must match the module name in uppercase.** The compiler error is clear but easy to skim past.
6. **Returning an Object from a function and letting it dangle.** Move's borrow checker catches this; you must transfer, freeze, share, or destroy the Object.
7. **Using `as u64` casts without bounds checks.** Truncates silently in some cases.

## Test patterns

Use `sui::test_scenario`:

```move
#[test_only]
module my_package::treasury_tests;

use sui::test_scenario;
use my_package::treasury::{Self, Treasury};

#[test]
fun test_init_creates_treasury() {
    let admin = @0xA;
    let mut scenario = test_scenario::begin(admin);
    {
        treasury::init_for_testing(scenario.ctx());
    };
    scenario.next_tx(admin);
    {
        let t = scenario.take_from_sender<Treasury>();
        assert!(treasury::balance(&t) == 0, 0);
        scenario.return_to_sender(t);
    };
    scenario.end();
}

#[test]
#[expected_failure(abort_code = treasury::E_UNAUTHORIZED)]
fun test_unauthorized_caller_aborts() {
    // ...
}
```

Patterns:

- `begin(addr)` opens a scenario as a given address
- `next_tx(addr)` simulates a new transaction from that address
- `take_from_sender`, `take_shared`, `take_immutable` retrieve Objects
- `return_to_sender` puts owned Objects back
- `#[expected_failure]` asserts a specific abort code

Always test happy path + at least one failure path per public entry point.

## Building and publishing

```bash
sui move build
sui client switch --env devnet
sui client gas
sui client publish --gas-budget 200000000 --json | tee /tmp/publish.json
```

Capture the package id:

```bash
PACKAGE_ID=$(jq -r '.objectChanges[] | select(.type=="published") | .packageId' /tmp/publish.json)
echo $PACKAGE_ID
```

For the full deploy lifecycle (devnet → testnet → mainnet, upgrade authority handling, cost reference), see `skills/data/guides/deploy-runbook.md`.

## Where to go next

- For PTB construction and composition: `skills/build/ptb-composer/` skill.
- For Object design (owned vs shared, ability decisions): `skills/build/object-model-design/` skill.
- For security review: `skills/data/guides/security-checklist.md`.
- For deploy: `skills/data/guides/deploy-runbook.md`.

Last updated: 2026-05-10. Targeting Sui CLI 1.x and Move 2024.beta edition.
