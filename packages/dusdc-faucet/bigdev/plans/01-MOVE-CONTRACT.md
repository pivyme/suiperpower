# 01, Move Contract

The on-chain faucet. One Move package, one shared `Faucet` object, one `AdminCap`. Generic over the quote coin type so we can publish with the test DUSDC first, then republish with the real DUSDC type. No upgrade gymnastics needed.

## Package layout

```
contracts/faucet/
├── Move.toml
└── sources/
    └── faucet.move
```

`Move.toml`:

```toml
[package]
name = "faucet"
version = "0.1.0"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
faucet = "0x0"
```

## Types

```move
module faucet::faucet {
    use std::option::{Self, Option};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::object::{Self, UID};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// Shared. Holds liquidity, rate, caps, daily usage.
    /// Generic over T, the quote coin type (real DUSDC or the rehearsal test coin).
    public struct Faucet<phantom T> has key {
        id: UID,
        sui_balance: Balance<SUI>,
        quote_balance: Balance<T>,
        rate_numerator: u64,      // default 100
        rate_denominator: u64,    // default 1, so 100 DUSDC per 1 SUI
        per_tx_sui_cap_mist: u64, // default 1_000_000_000 (1 SUI)
        per_wallet_daily_sui_cap_mist: u64, // default 5_000_000_000 (5 SUI)
        usage: Table<address, DailyUsage>,
        paused: bool,
        return_enabled: bool,
        total_served_quote: u64,  // running total of quote coin paid out
        total_claims: u64,
    }

    public struct DailyUsage has store, copy, drop {
        utc_day: u64,
        consumed_sui_mist: u64,
    }

    /// Owned. Whoever holds this can tune the faucet.
    public struct AdminCap has key, store {
        id: UID,
        /// Bound to one Faucet via object id, prevents cross-pollination.
        faucet_id: address,
    }
}
```

`DailyUsage` is `copy, drop` so we can read and rewrite cheaply via `table::add`/`table::borrow_mut`.

`AdminCap.faucet_id` is the workshop-class trick that stops a stolen AdminCap from controlling some other deployment. We assert it matches in every admin entry function.

## Error codes

```move
const E_PAUSED: u64                 = 1;
const E_OVER_PER_TX_CAP: u64        = 2;
const E_OVER_DAILY_WALLET_CAP: u64  = 3;
const E_INSUFFICIENT_VAULT_QUOTE: u64 = 4;
const E_INSUFFICIENT_VAULT_SUI: u64 = 5;
const E_ZERO_AMOUNT: u64            = 6;
const E_RETURN_DISABLED: u64        = 7;
const E_DUST_RETURN: u64            = 8;
const E_WRONG_ADMIN_CAP: u64        = 9;
const E_BAD_RATE: u64               = 10;
```

## Events

```move
public struct Claimed has copy, drop {
    wallet: address,
    sui_mist_in: u64,
    quote_out: u64,
    rate_numerator: u64,
    rate_denominator: u64,
    utc_day: u64,
    total_served_quote: u64,
    total_claims: u64,
}

public struct Returned has copy, drop {
    wallet: address,
    quote_in: u64,
    sui_mist_out: u64,
    rate_numerator: u64,
    rate_denominator: u64,
}

public struct Refilled has copy, drop {
    from: address,
    quote_in: u64,
    new_quote_balance: u64,
}

public struct AdminAction has copy, drop {
    field: vector<u8>,     // b"rate" | b"per_tx_cap" | b"daily_cap" | b"paused" | b"return_enabled"
    new_value_u64: u64,
    new_value_bool: bool,
}
```

## Init

```move
fun init(_w: FAUCET, _ctx: &mut TxContext) {
    // module init runs at publish time but we want to defer creating the
    // shared object until we know the quote type. Use a separate entry
    // for that.
}
```

A one-time witness here would not help because the Faucet is generic over T at module load time. Instead we ship a public entry `create_faucet<T>` that any wallet can call once after publish. Publisher calls it themselves and pockets the AdminCap.

```move
public entry fun create_faucet<T>(ctx: &mut TxContext) {
    let id = object::new(ctx);
    let faucet_addr = object::uid_to_address(&id);

    let faucet = Faucet<T> {
        id,
        sui_balance: balance::zero<SUI>(),
        quote_balance: balance::zero<T>(),
        rate_numerator: 100,
        rate_denominator: 1,
        per_tx_sui_cap_mist: 1_000_000_000,
        per_wallet_daily_sui_cap_mist: 5_000_000_000,
        usage: table::new<address, DailyUsage>(ctx),
        paused: false,
        return_enabled: true,
        total_served_quote: 0,
        total_claims: 0,
    };

    let admin = AdminCap { id: object::new(ctx), faucet_id: faucet_addr };
    transfer::transfer(admin, tx_context::sender(ctx));
    transfer::share_object(faucet);
}
```

We deliberately ship a `create_faucet` rather than auto-creating in `init` so the publisher can decide the quote coin type at deploy time.

## Public entry functions

### `claim`

```move
public entry fun claim<T>(
    faucet: &mut Faucet<T>,
    payment: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(!faucet.paused, E_PAUSED);

    let sui_in = coin::value(&payment);
    assert!(sui_in > 0, E_ZERO_AMOUNT);
    assert!(sui_in <= faucet.per_tx_sui_cap_mist, E_OVER_PER_TX_CAP);

    let wallet = tx_context::sender(ctx);
    let today = clock::timestamp_ms(clock) / 86_400_000;

    // Update usage BEFORE moving coins.
    let new_consumed = if (table::contains(&faucet.usage, wallet)) {
        let prior = table::borrow_mut(&mut faucet.usage, wallet);
        if (prior.utc_day != today) {
            prior.utc_day = today;
            prior.consumed_sui_mist = 0;
        };
        prior.consumed_sui_mist = prior.consumed_sui_mist + sui_in;
        assert!(prior.consumed_sui_mist <= faucet.per_wallet_daily_sui_cap_mist, E_OVER_DAILY_WALLET_CAP);
        prior.consumed_sui_mist
    } else {
        let usage = DailyUsage { utc_day: today, consumed_sui_mist: sui_in };
        assert!(sui_in <= faucet.per_wallet_daily_sui_cap_mist, E_OVER_DAILY_WALLET_CAP);
        table::add(&mut faucet.usage, wallet, usage);
        sui_in
    };

    // Compute payout. quote_out = sui_in * num / (den * 10^3) is wrong; we
    // are working in base units. SUI has 9 decimals, DUSDC has 6.
    // Raw rate 100 DUSDC per 1 SUI in human units means:
    //   1_000_000_000 MIST -> 100_000_000 base DUSDC
    // i.e. base_quote = sui_mist * (rate_num * 10^6) / (rate_den * 10^9)
    //                 = sui_mist * rate_num / (rate_den * 1000)
    let quote_out = (sui_in as u128)
        * (faucet.rate_numerator as u128)
        / ((faucet.rate_denominator as u128) * 1000);
    let quote_out = (quote_out as u64);

    assert!(quote_out > 0, E_ZERO_AMOUNT);
    assert!(balance::value(&faucet.quote_balance) >= quote_out, E_INSUFFICIENT_VAULT_QUOTE);

    // Move coins.
    let sui_in_balance = coin::into_balance(payment);
    balance::join(&mut faucet.sui_balance, sui_in_balance);

    let payout_balance = balance::split(&mut faucet.quote_balance, quote_out);
    let payout_coin = coin::from_balance(payout_balance, ctx);
    transfer::public_transfer(payout_coin, wallet);

    faucet.total_served_quote = faucet.total_served_quote + quote_out;
    faucet.total_claims = faucet.total_claims + 1;
    let _ = new_consumed; // silence unused

    event::emit(Claimed {
        wallet,
        sui_mist_in: sui_in,
        quote_out,
        rate_numerator: faucet.rate_numerator,
        rate_denominator: faucet.rate_denominator,
        utc_day: today,
        total_served_quote: faucet.total_served_quote,
        total_claims: faucet.total_claims,
    });
}
```

### `return_quote`

Symmetric to `claim`. Floor dust, abort if the result is zero.

```move
public entry fun return_quote<T>(
    faucet: &mut Faucet<T>,
    payment: Coin<T>,
    _clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(!faucet.paused, E_PAUSED);
    assert!(faucet.return_enabled, E_RETURN_DISABLED);

    let quote_in = coin::value(&payment);
    assert!(quote_in > 0, E_ZERO_AMOUNT);

    // Inverse: sui_mist = quote_in * rate_den * 1000 / rate_num
    let sui_mist_out = (quote_in as u128)
        * (faucet.rate_denominator as u128)
        * 1000u128
        / (faucet.rate_numerator as u128);
    let sui_mist_out = (sui_mist_out as u64);

    assert!(sui_mist_out > 0, E_DUST_RETURN);
    assert!(balance::value(&faucet.sui_balance) >= sui_mist_out, E_INSUFFICIENT_VAULT_SUI);

    let quote_in_balance = coin::into_balance(payment);
    balance::join(&mut faucet.quote_balance, quote_in_balance);

    let payout_balance = balance::split(&mut faucet.sui_balance, sui_mist_out);
    let payout_coin = coin::from_balance(payout_balance, ctx);
    transfer::public_transfer(payout_coin, tx_context::sender(ctx));

    event::emit(Returned {
        wallet: tx_context::sender(ctx),
        quote_in,
        sui_mist_out,
        rate_numerator: faucet.rate_numerator,
        rate_denominator: faucet.rate_denominator,
    });
}
```

### `refill`

Permissionless. Anyone can top up the vault.

```move
public entry fun refill<T>(
    faucet: &mut Faucet<T>,
    deposit: Coin<T>,
    ctx: &mut TxContext,
) {
    let quote_in = coin::value(&deposit);
    assert!(quote_in > 0, E_ZERO_AMOUNT);

    let in_balance = coin::into_balance(deposit);
    balance::join(&mut faucet.quote_balance, in_balance);

    event::emit(Refilled {
        from: tx_context::sender(ctx),
        quote_in,
        new_quote_balance: balance::value(&faucet.quote_balance),
    });
}
```

## Admin functions

Every admin function asserts `cap.faucet_id == object::uid_to_address(&faucet.id)`.

```move
public entry fun set_rate<T>(
    cap: &AdminCap,
    faucet: &mut Faucet<T>,
    num: u64,
    den: u64,
) {
    assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
    assert!(num > 0 && den > 0, E_BAD_RATE);
    faucet.rate_numerator = num;
    faucet.rate_denominator = den;
    event::emit(AdminAction { field: b"rate", new_value_u64: num, new_value_bool: false });
}

public entry fun set_per_tx_cap<T>(cap: &AdminCap, faucet: &mut Faucet<T>, mist: u64) {
    assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
    faucet.per_tx_sui_cap_mist = mist;
    event::emit(AdminAction { field: b"per_tx_cap", new_value_u64: mist, new_value_bool: false });
}

public entry fun set_daily_cap<T>(cap: &AdminCap, faucet: &mut Faucet<T>, mist: u64) {
    assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
    faucet.per_wallet_daily_sui_cap_mist = mist;
    event::emit(AdminAction { field: b"daily_cap", new_value_u64: mist, new_value_bool: false });
}

public entry fun set_paused<T>(cap: &AdminCap, faucet: &mut Faucet<T>, paused: bool) {
    assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
    faucet.paused = paused;
    event::emit(AdminAction { field: b"paused", new_value_u64: 0, new_value_bool: paused });
}

public entry fun set_return_enabled<T>(cap: &AdminCap, faucet: &mut Faucet<T>, enabled: bool) {
    assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
    faucet.return_enabled = enabled;
    event::emit(AdminAction { field: b"return_enabled", new_value_u64: 0, new_value_bool: enabled });
}

public entry fun withdraw_sui<T>(
    cap: &AdminCap,
    faucet: &mut Faucet<T>,
    amount_mist: u64,
    ctx: &mut TxContext,
) {
    assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
    let bal = balance::split(&mut faucet.sui_balance, amount_mist);
    let c = coin::from_balance(bal, ctx);
    transfer::public_transfer(c, tx_context::sender(ctx));
}

public entry fun transfer_admin(cap: AdminCap, recipient: address) {
    transfer::public_transfer(cap, recipient);
}
```

## Read helpers

```move
public fun quote_balance<T>(f: &Faucet<T>): u64 { balance::value(&f.quote_balance) }
public fun sui_balance<T>(f: &Faucet<T>): u64   { balance::value(&f.sui_balance) }
public fun rate<T>(f: &Faucet<T>): (u64, u64)   { (f.rate_numerator, f.rate_denominator) }
public fun is_paused<T>(f: &Faucet<T>): bool    { f.paused }
public fun return_enabled<T>(f: &Faucet<T>): bool { f.return_enabled }
public fun total_served_quote<T>(f: &Faucet<T>): u64 { f.total_served_quote }
public fun total_claims<T>(f: &Faucet<T>): u64       { f.total_claims }
```

These let the frontend pull state via `sui_devInspectTransactionBlock` or just `sui_getObject` with parsed fields.

## Tests

`contracts/faucet/tests/faucet_tests.move`:

- `test_claim_happy_path`: mint test coin, refill, claim 1 SUI, assert 100 DUSDC received and counters updated.
- `test_claim_over_per_tx_cap`: try to claim 2 SUI when cap is 1, expect `E_OVER_PER_TX_CAP`.
- `test_claim_over_daily_cap`: claim 1 SUI five times, assert sixth aborts with `E_OVER_DAILY_WALLET_CAP`.
- `test_daily_reset`: claim, advance clock by 24h, claim again, assert counter reset.
- `test_return_dust`: return 1 base unit of DUSDC, expect `E_DUST_RETURN`.
- `test_refill_then_claim_again_after_dry`: drain vault, refill, claim succeeds.
- `test_pause_blocks_claim`: pause, claim, expect `E_PAUSED`.
- `test_wrong_admin_cap`: create two faucets, try to admin one with the other's cap, expect `E_WRONG_ADMIN_CAP`.

Run with `sui move test --path contracts/faucet`.

## Test DUSDC clone

`contracts/test-dusdc/sources/test_dusdc.move`:

```move
module test_dusdc::test_dusdc {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url;

    /// One-time witness.
    public struct TEST_DUSDC has drop {}

    fun init(witness: TEST_DUSDC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            6,
            b"DUSDC-TEST",
            b"Test DUSDC",
            b"Rehearsal coin for the DUSDC faucet, not for production use.",
            option::none(),
            ctx,
        );
        transfer::public_transfer(treasury, tx_context::sender(ctx));
        transfer::public_freeze_object(metadata);
    }
}
```

Treasury cap is transferred to the publisher so we can mint whatever amount the rehearsal needs.

## Why these decisions

- **Generic over `T`**: one codebase covers both the rehearsal coin and the real DUSDC. We publish twice, once per quote type. Cheap.
- **No upgrade authority needed**: the AdminCap-gated admin functions cover every operational knob. We can change rates and caps without publishing again.
- **AdminCap bound to faucet_id**: defense in depth. If a phishing tx slips through, the cap only works against the faucet it was minted for.
- **Daily reset via timestamp_ms / 86_400_000**: UTC day, matches what the backend uses for its rate-limit table, no time-zone drift.
- **Dust check on returns**: prevents silent zero-SUI refunds when someone returns one base unit of DUSDC.
- **Permissionless refill**: anyone, including a bot, can keep the vault topped up. The brief's pitch to DeepBook hinges on this being zero-effort for them.
