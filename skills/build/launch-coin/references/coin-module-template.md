# Coin module templates

Three patterns covering fixed, capped, and open supply.

## Pattern A: fixed supply (TreasuryCap burned)

```move
module my_pkg::my_coin;

use sui::coin::{Self, TreasuryCap};
use sui::transfer;
use sui::tx_context::TxContext;
use sui::url::{Self, Url};
use std::option;

public struct MY_COIN has drop {}

const INITIAL_SUPPLY: u64 = 1_000_000_000_000_000; // 1B at 6 decimals

fun init(witness: MY_COIN, ctx: &mut TxContext) {
    let (mut treasury, metadata) = coin::create_currency(
        witness,
        6,                              // decimals
        b"MYCOIN",                       // symbol
        b"My Coin",                      // name
        b"Utility token of My App",      // description
        option::some(url::new_unsafe_from_bytes(b"https://example.com/icon.png")),
        ctx,
    );

    // Mint full supply to deployer
    let coin = coin::mint(&mut treasury, INITIAL_SUPPLY, ctx);
    transfer::public_transfer(coin, ctx.sender());

    // Freeze metadata so it cannot change
    transfer::public_freeze_object(metadata);

    // Burn the TreasuryCap so no more can ever be minted
    let dummy = coin::mint(&mut treasury, 0, ctx);
    coin::burn(&mut treasury, dummy);
    transfer::public_freeze_object(treasury); // freezing the cap also makes it unusable
}
```

Note on freezing the TreasuryCap: freezing renders it immutable; you cannot mint with `&mut TreasuryCap`. Combined with the OTW pattern (init runs once), supply is fixed forever.

For total destruction, use a custom `destroy` flow if the framework supports it; freezing is sufficient for "no more mints."

## Pattern B: capped supply

```move
module my_pkg::my_coin;

use sui::coin::{Self, TreasuryCap};
use sui::transfer;
use sui::tx_context::TxContext;
use std::option;

public struct MY_COIN has drop {}

const SUPPLY_CAP: u64 = 10_000_000_000_000_000; // 10B at 6 decimals
const E_CAP_EXCEEDED: u64 = 0;

public struct CapWrapper has key, store {
    id: UID,
    cap: TreasuryCap<MY_COIN>,
    minted: u64,
}

fun init(witness: MY_COIN, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"MYCOIN",
        b"My Coin",
        b"Capped supply token",
        option::none(),
        ctx,
    );

    transfer::public_freeze_object(metadata);

    let wrapper = CapWrapper {
        id: object::new(ctx),
        cap: treasury,
        minted: 0,
    };
    transfer::transfer(wrapper, ctx.sender());
}

public fun mint(
    wrapper: &mut CapWrapper,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(wrapper.minted + amount <= SUPPLY_CAP, E_CAP_EXCEEDED);
    wrapper.minted = wrapper.minted + amount;
    let coin = coin::mint(&mut wrapper.cap, amount, ctx);
    transfer::public_transfer(coin, recipient);
}
```

The wrapper enforces the cap. The `TreasuryCap` is hidden inside; only `mint` can use it.

## Pattern C: open supply (admin-controlled)

```move
module my_pkg::my_coin;

use sui::coin::{Self, TreasuryCap};
use sui::transfer;
use sui::tx_context::TxContext;
use std::option;

public struct MY_COIN has drop {}

fun init(witness: MY_COIN, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"MYCOIN",
        b"My Coin",
        b"Admin-controlled supply",
        option::none(),
        ctx,
    );

    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury, ctx.sender()); // or to a multisig
}

public fun mint_more(
    cap: &mut TreasuryCap<MY_COIN>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    let coin = coin::mint(cap, amount, ctx);
    transfer::public_transfer(coin, recipient);
}

public fun burn_some(
    cap: &mut TreasuryCap<MY_COIN>,
    coin: sui::coin::Coin<MY_COIN>,
) {
    coin::burn(cap, coin);
}
```

The cap holder controls supply. Recommend transferring the cap to a multisig for production.

## Test scaffold

```move
#[test_only]
module my_pkg::my_coin_tests {
    use my_pkg::my_coin::{Self, MY_COIN};
    use sui::coin::{Self, Coin};
    use sui::test_scenario;

    #[test]
    fun test_initial_supply() {
        let admin = @0xA;
        let mut scenario = test_scenario::begin(admin);
        // call init via test scenario init helper
        // assert balance equals INITIAL_SUPPLY
        test_scenario::end(scenario);
    }
}
```

Last updated: 2026-05-10.
