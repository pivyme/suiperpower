# DeepBook data queries

Patterns for pulling DeepBook v3 pool and trade data. Use Sui RPC for on-chain reads; use the DeepBook indexer (when published) or a community indexer for historical trades.

Confirm exact endpoint URLs and method names against `skills/data/sui-knowledge/sponsor-docs/deepbook.md` and the official DeepBook docs at the time of use; the surface evolves.

## List active pools

DeepBook pools are shared Objects of a specific type. Query by type:

```bash
sui client --client.url https://fullnode.mainnet.sui.io \
  events --query '{"MoveEventType":"<deepbook_package>::pool::PoolCreated"}'
```

Or via the GraphQL endpoint (suiscan or Mysten GraphQL service) for historical pool events.

The DeepBook TS SDK does not expose a `getPools()` or list-all-pools method. To discover pools, query on-chain pool creation events as shown above, or check the SDK's built-in pool key constants (e.g. `SUI_DBUSDC`, `DEEP_DBUSDC` on testnet).

For SDK initialization, use the `$extend` pattern:

```ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { deepbook } from "@mysten/deepbook-v3";

const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
const client = suiClient.$extend(deepbook({ address: userAddr }));
```

## Pool depth at a price

For a given pool, depth at +/-X% of mid is the standard liquidity metric. The SDK provides `getLevel2Range(poolKey, priceLow, priceHigh, isBid)` and `getLevel2TicksFromMid(poolKey, ticks)`. There is no `getOrderBook()` method.

```ts
// Get bids in a price range
const bids = await client.deepbook.getLevel2Range("SUI_DBUSDC", 1.40, 1.60, true);
// Get asks in a price range
const asks = await client.deepbook.getLevel2Range("SUI_DBUSDC", 1.40, 1.60, false);

// Or get N ticks around mid-price (both sides)
const snapshot = await client.deepbook.getLevel2TicksFromMid("SUI_DBUSDC", 50);
```

Record both bid depth and ask depth; asymmetry is itself a signal.

## 24h trade volume

Aggregate the trade events in the last 24h:

```ts
const events = await suiClient.queryEvents({
  query: { MoveEventType: `${deepbookPackageId}::pool::OrderFilled` },
  cursor: null,
  limit: 1000,
  order: "descending",
});
const last24h = events.data.filter(e => e.timestampMs > Date.now() - 86_400_000);
const volume = last24h.reduce((sum, e) => sum + Number(e.parsedJson.quantity), 0);
```

For pools with high event counts, page until the cutoff.

## Fee tier

Each pool has a fee tier (basis points). Read from the pool Object's metadata field:

```ts
const pool = await suiClient.getObject({ id: poolId, options: { showContent: true } });
const feeBps = pool.data.content.fields.fee_bps;
```

## Maker concentration

A few addresses provide most depth in many DeepBook pools. Measure concentration using `accountOpenOrders(poolKey, managerKey)`, which returns open orders for a specific BalanceManager. There is no `getOpenOrders()` that returns all orders across all makers.

For broad concentration analysis, query `OrderPlaced` and `OrderFilled` events from the RPC and aggregate by maker address:

```ts
const events = await suiClient.queryEvents({
  query: { MoveEventType: `${deepbookPackageId}::pool::OrderPlaced` },
  cursor: null,
  limit: 1000,
  order: "descending",
});
const byMaker = new Map<string, number>();
for (const e of events.data) {
  const maker = e.parsedJson.maker;
  const qty = Number(e.parsedJson.quantity);
  byMaker.set(maker, (byMaker.get(maker) ?? 0) + qty);
}
const sorted = [...byMaker.entries()].sort(([,a], [,b]) => b - a);
const top3Share = (sorted.slice(0, 3).reduce((s, [, q]) => s + q, 0)) /
                  (sorted.reduce((s, [, q]) => s + q, 0));
```

If `top3Share` is over 80%, the pool is "thin and concentrated", a known gap shape.

## Useful aggregator endpoints

Confirm presence and freshness against current docs:

- DefiLlama Sui chain page: aggregated TVL and volume by category.
- Suiscan, SuiVision: per-pool metadata, historical events.
- Aggregator dashboards (Cetus, Aftermath, Bluefin): show which DeepBook pools they route through.

## Citation discipline

Every quantitative claim in the research output must include the query that produced it (or the link). "Pool X has thin depth" without a query is not citation.

Write findings as:

```markdown
- pool: <type>, depth at +/-1%: <bid> / <ask> SUI, query: <RPC call or SDK call>, retrieved: <date>
```
