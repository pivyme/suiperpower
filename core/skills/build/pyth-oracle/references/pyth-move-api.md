# Pyth Move API reference

Core types and functions for reading Pyth prices in Sui Move contracts.

Source: `pyth-network/pyth-crosschain` `target_chains/sui/contracts/sources/`

## Types

### PriceInfoObject

The on-chain Object that holds a price feed's latest update. Created and managed by the Pyth package. Your contract receives it as `&PriceInfoObject` (immutable borrow), never owns or creates it.

```move
use pyth::price_info::PriceInfoObject;
```

### Price

A snapshot of a price feed at a point in time. Contains the price value, confidence interval, exponent, and timestamp.

```move
use pyth::price::Price;
```

### I64

Pyth's signed 64-bit integer type. Used for price values and exponents (which are typically negative).

```move
use pyth::i64::{Self, I64};
```

## Reading prices (module: `pyth::pyth`)

All price query functions live in the `pyth::pyth` module, not `pyth::price_info`.

### get_price_no_older_than (recommended)

Returns the price if it was updated within `max_age_secs` seconds. Aborts if the price is stale.

```move
// pyth::pyth
public fun get_price_no_older_than(
    price_info_object: &PriceInfoObject,
    clock: &Clock,
    max_age_secs: u64
): Price
```

Use this for all production code. The `max_age_secs` parameter enforces freshness. Typical values: 60 seconds for DeFi, 10 seconds for high-frequency flows.

### get_price

Like `get_price_no_older_than` but uses the Pyth state's default stale threshold instead of a caller-supplied max age.

```move
// pyth::pyth
public fun get_price(
    state: &PythState,
    price_info_object: &PriceInfoObject,
    clock: &Clock
): Price
```

### get_price_unsafe

Returns the price regardless of age. Do NOT use in production. Only useful for debugging or display-only reads where staleness is acceptable.

```move
// pyth::pyth
public fun get_price_unsafe(
    price_info_object: &PriceInfoObject
): Price
```

## Price accessors (module: `pyth::price`)

All accessors operate on a `Price` value returned by the functions above.

```move
// Raw price value as I64. Multiply by 10^expo to get the real price.
public fun get_price(price: &Price): I64

// Confidence interval as u64. Same scale as the price value.
public fun get_conf(price: &Price): u64

// Exponent as I64. Typically -8 for crypto feeds (8 decimal places).
public fun get_expo(price: &Price): I64

// Unix timestamp (seconds) of the price update.
public fun get_timestamp(price: &Price): u64
```

## I64 helpers (module: `pyth::i64`)

```move
// Get the absolute magnitude
public fun get_magnitude_if_positive(i: &I64): u64
public fun get_magnitude_if_negative(i: &I64): u64

// Check sign
public fun get_is_negative(i: &I64): bool

// Convert unsigned to signed (positive)
public fun from_u64(from: u64): I64
```

## EMA (Exponential Moving Average)

Pyth publishes an EMA price alongside the spot price. The EMA smooths short-term volatility. Prefer EMA for settlement and liquidation calculations. Prefer spot for real-time display.

There are no top-level `get_ema_price_no_older_than` or `get_ema_price_unsafe` functions. To read the EMA, extract it from the PriceFeed:

```move
use pyth::price_info;
use pyth::price_feed;

// Step 1: get PriceInfo from the object
let info = price_info::get_price_info_from_price_info_object(price_info_object);

// Step 2: get PriceFeed from PriceInfo
let feed = price_info::get_price_feed(&info);

// Step 3: get EMA price from PriceFeed
let ema: Price = price_feed::get_ema_price(feed);
```

Note: this path does NOT enforce staleness. If you need EMA with a freshness check, call `pyth::pyth::get_price_no_older_than` first to confirm the feed is fresh (it will abort if stale), then extract the EMA from the same object.

## PriceInfo accessors (module: `pyth::price_info`)

These are data extraction functions, not price query functions:

```move
public fun get_price_info_from_price_info_object(obj: &PriceInfoObject): PriceInfo
public fun get_price_identifier(info: &PriceInfo): PriceIdentifier
public fun get_price_feed(info: &PriceInfo): &PriceFeed
public fun get_attestation_time(info: &PriceInfo): u64
public fun get_arrival_time(info: &PriceInfo): u64
```

## HotPotatoVector pattern

The `pyth::hot_potato_vector::HotPotatoVector<PriceInfo>` has no `drop`, `copy`, or `store` abilities. It exists only during the transaction that creates it (the update call) and must be fully consumed within the same PTB. The TS SDK handles this. Your Move contract never touches it directly.

## Example: reading SUI/USD with confidence check

```move
public fun get_sui_price_usd(
    price_info: &PriceInfoObject,
    clock: &Clock,
): (u64, u64, bool) {
    let price = pyth::get_price_no_older_than(price_info, clock, 60);

    let raw_price = price::get_price(&price);
    let conf = price::get_conf(&price);
    let expo = price::get_expo(&price);

    let is_negative = i64::get_is_negative(&expo);
    assert!(is_negative, 0); // crypto feeds always have negative exponent

    let price_mag = i64::get_magnitude_if_positive(&raw_price);
    let expo_mag = i64::get_magnitude_if_negative(&expo);

    // Check confidence is within 1% of price
    let conf_ok = conf * 100 < price_mag;

    (price_mag, expo_mag, conf_ok)
}
```

The caller applies `price_mag * 10^(-expo_mag)` to get the USD value.

Last updated: 2026-05-12. Source: github.com/pyth-network/pyth-crosschain target_chains/sui/contracts/sources/{pyth,price_info,price_feed,price,i64}.move
