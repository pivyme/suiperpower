# Pyth integration pitfalls

Mistakes that look right and break price integrations.

## Exponent handling

Pyth prices are fixed-point: `real_price = raw_value * 10^exponent`. The exponent is typically -8 for crypto feeds.

Example: raw price `12276250` with exponent `-5` means `12276250 * 10^-5 = $122.76250`.

Common mistake: treating the raw value as the price directly, producing prices that are millions of dollars off. Always apply the exponent in your application logic.

## Confidence intervals

Pyth publishes a confidence interval (`conf`) alongside each price. The interval `(price - conf, price + conf)` estimates where the true price lies.

Rules for DeFi:

- **Valuing collateral**: use `price - conf` (conservative, lower bound).
- **Valuing obligations/debt**: use `price + conf` (conservative, upper bound).
- **Circuit breaker**: if `conf / price > threshold` (e.g., 1%), pause the protocol. Wide confidence means the price is uncertain.

Ignoring confidence works for display-only use cases. For anything that moves funds, confidence matters.

## Staleness: never use get_price_unsafe in production

`get_price_unsafe` returns whatever price is stored, even if it is hours old. Use `get_price_no_older_than` with an explicit `max_age_secs`.

Typical staleness thresholds:

| Use case             | max_age_secs |
|----------------------|--------------|
| Lending/liquidation  | 30 to 60     |
| Settlement           | 60           |
| Display only         | 300          |

If no update has been pushed within your threshold, the transaction aborts. This is the correct behavior, it prevents stale-price exploits.

## Do NOT hard-code Pyth calls in Move

Your Move contract must NOT call `pyth::update_single_price_feed` or any other Pyth update function directly. The Pyth package ID changes when the Pyth team upgrades their contracts. A hard-coded call would brick your contract.

Correct pattern:

1. TS client calls `pythClient.updatePriceFeeds(tx, ...)` (SDK resolves the current package ID dynamically).
2. TS client passes the resulting `PriceInfoObject` IDs to your contract's function.
3. Your Move function accepts `&PriceInfoObject` as a parameter and reads from it.

## Gas costs

Updating Pyth price feeds costs SUI. The `SuiPythClient.updatePriceFeeds` method automatically splits the fee from the transaction's gas coin. No manual coin splitting needed.

If the wallet's gas balance is too low, the transaction will fail with an insufficient gas error before your contract logic runs. Make sure the wallet has enough SUI for both the update fee and execution gas.

## Beta vs Stable feeds

Hermes has two channels:

- **Beta** (`hermes-beta.pyth.network`): used with Sui testnet. Feed IDs may differ from Stable.
- **Stable** (`hermes.pyth.network`): used with Sui mainnet.

Do not mix channels. Using a Beta feed ID against the Stable endpoint (or vice versa) returns empty data or the wrong feed silently.

When migrating from testnet to mainnet, re-verify every feed ID against the Stable Hermes endpoint.

## EMA vs spot

Pyth publishes both a spot price and an EMA (exponential moving average) price for each feed.

- **Spot**: reflects the most recent aggregated price. Use for real-time display and triggers.
- **EMA**: smooths short-term volatility. Use for settlement, liquidation thresholds, and any logic that should resist flash manipulation.

For most DeFi protocols, use EMA for critical financial decisions and spot for UI display.

## Multiple feeds in one PTB

You can update and read multiple price feeds in a single PTB. Pass all feed IDs to `getPriceFeedsUpdateData` and `updatePriceFeeds` at once. The SDK returns one `PriceInfoObject` ID per feed in the same order.

```typescript
const feeds = [SUI_USD_FEED, BTC_USD_FEED];
const updateData = await connection.getPriceFeedsUpdateData(feeds);
const infoIds = await pythClient.updatePriceFeeds(tx, updateData, feeds);
// infoIds[0] = SUI/USD PriceInfoObject, infoIds[1] = BTC/USD PriceInfoObject
```

Do not update feeds one at a time in separate transactions. Batching is cheaper and ensures all prices are from the same timestamp window.

## Adversarial price selection

Pull-based oracles let the transaction submitter choose which price update to include. A malicious user can pick a historical price within the staleness window that is most favorable to them.

Mitigations:

- Set tight staleness thresholds (seconds, not minutes) for latency-sensitive flows.
- Use commit-reveal or delayed settlement for large positions.
- Combine with confidence interval checks to reject prices during high-volatility windows.

Last updated: 2026-05-11. Source: https://docs.pyth.network/price-feeds/best-practices
