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

For a quick snapshot of live pools, the DeepBook reference SDK (`@mysten/deepbook-v3`) typically exposes:

```ts
const sdk = new DeepBookClient({ network: "mainnet" });
const pools = await sdk.getPools();
```

Confirm the API name in the current SDK version.

## Pool depth at a price

For a given pool, depth at +/-X% of mid is the standard liquidity metric.

```ts
const orderBook = await sdk.getOrderBook(poolId, { depth: 50 });
const mid = (orderBook.bestBid + orderBook.bestAsk) / 2;
const oneCcyAbove = mid * 1.01;
const oneCcyBelow = mid * 0.99;
const bidDepth = orderBook.bids.filter(b => b.price >= oneCcyBelow).reduce((sum, b) => sum + b.quantity, 0);
const askDepth = orderBook.asks.filter(a => a.price <= oneCcyAbove).reduce((sum, a) => sum + a.quantity, 0);
```

Record both bid depth and ask depth, asymmetry is itself a signal.

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

A few addresses provide most depth in many DeepBook pools. Measure concentration:

```ts
const orders = await sdk.getOpenOrders(poolId);
const byMaker = new Map<string, number>();
for (const o of orders) byMaker.set(o.maker, (byMaker.get(o.maker) ?? 0) + o.quantity);
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
