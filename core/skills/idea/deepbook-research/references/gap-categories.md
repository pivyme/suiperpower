# DeepBook gap categories

The categories of opportunity to walk through during research. Not every category will produce a real gap; the discipline is to walk all five and see which ones do.

## 1. Aggregator coverage

DeepBook is the orderbook layer; aggregators (Cetus, Aftermath, Bluefin, Hop, others) route user trades. Pools that are active but not aggregated leave end-users (and their gas) on the table.

Test:
- For each top-10-by-volume pool, check whether the major aggregators include it in their routing.
- For each underserved pair, check whether ANY aggregator routes through it.

Opportunity shapes:
- A new aggregator focused on long-tail Sui pairs.
- A "best execution" tool that combines DeepBook with on-chain AMMs.
- A dashboard that surfaces which pools are best routed (e.g. for arbitrage bots).

## 2. Charting and data tooling

DeepBook order flow is on-chain and queryable. Tooling around it (charting, historical analytics, alerts) is uneven.

Test:
- Search for public DeepBook charting tools beyond the official one.
- Search for historical trade dashboards for individual pools.
- Search for alert services (price, depth, large trade notifications).

Opportunity shapes:
- A TradingView-style charting overlay on DeepBook pools.
- A whale-watcher dashboard for large fills.
- A spread-monitor for market makers.

## 3. Market-making bots and frameworks

Market making is the core economic activity on an orderbook. A Sui-native MM framework (open source bots, configurable strategies, backtesting on real DeepBook data) is a useful product.

Test:
- Search for public open-source MM bots on Sui.
- Are there educational resources for new MMs?
- What strategies are dominant (passive depth, active rebalancing, cross-pool arbitrage)?

Opportunity shapes:
- A configurable MM framework (the Sui equivalent of Hummingbot).
- A managed MM service for token issuers wanting to bootstrap their pool's liquidity.
- A backtesting tool that replays historical DeepBook activity.

## 4. MEV and execution quality

DeepBook order flow can suffer the same MEV concerns as other on-chain venues (sandwich attacks, frontrunning). Sui's parallel execution mitigates some, but not all.

Test:
- Examine recent large fills, look for sandwich patterns (a smaller fill before, then a larger fill, then a counter-fill after).
- Are there sponsor-RFQ or private-mempool products on Sui?

Opportunity shapes:
- A private-RFQ matching layer that posts fills to DeepBook only when settlement is sandwich-resistant.
- A bundled-PTB router that batches user trades to deny MEV opportunities.
- An MEV-aware aggregator.

## 5. Specific underserved pairs

Some pairs lack liquidity entirely; some are listed but have wide spreads.

Test:
- For each sponsor token (DEEP, WAL, SCA, etc.) paired with a stable: depth, spread, daily volume.
- For long-tail community tokens with audience: are they listed at all?
- For wrapped / bridged tokens: do bridge-native pairs exist or only stable-paired pairs?

Opportunity shapes:
- A market-making bot (or product) targeting one underserved pair.
- A consumer wallet that surfaces "swap to <token>" with deep DeepBook routing.
- A token-issuer toolkit that bootstraps initial DeepBook liquidity.

## How to use

For each candidate idea the research surfaces, write:

```markdown
- gap category: <1-5>
- specific gap: <one sentence>
- evidence: <citation>
- product idea: <one sentence>
- why this user can ship it: <one sentence tied to their stated experience and timeline>
```

Five gaps with no candidate idea ranked is a research-only output. Useful, but not enough to move into scaffold-project.
