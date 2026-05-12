---
name: DefiLlama API Research for Sui
description: Complete DefiLlama API endpoint reference verified via live fetches, response shapes, rate limits, Sui chain identifier, and gotchas for skill authoring
type: reference
---

## DefiLlama API for Sui DeFi Research (verified 2026-05-11)

### Base URLs (all free, no auth)
- TVL/Protocols/Volume/Fees: `https://api.llama.fi`
- Yields/Pools: `https://yields.llama.fi`
- Stablecoins: `https://stablecoins.llama.fi`
- Pro API: `https://pro-api.llama.fi/{API_KEY}` ($300/mo)
- Official docs: https://api-docs.defillama.com/

### Sui Chain Identifier
Case-sensitive: `"Sui"` (verified via live /v2/chains response)

### Rate Limits
- Free: ~500 requests per 5 minutes (undocumented exact)
- Pro: 1,000 req/min, 1M calls/month
- No API key needed for free tier

### Verified Endpoints (31 free total)

**TVL**: /v2/chains, /v2/historicalChainTvl/{chain}, /protocols, /protocol/{name}, /tvl/{name}
**Volume**: /overview/dexs, /overview/dexs/{chain}, /summary/dexs/{protocol}, /overview/options, /overview/options/{chain}, /summary/options/{protocol}
**Fees**: /overview/fees, /overview/fees/{chain}, /summary/fees/{protocol}
**Yields**: /pools, /chart/{pool} (base: yields.llama.fi)
**Stablecoins**: /stablecoins, /stablecoincharts/{chain}, /stablecoinchains, /stablecoin/{asset}, /stablecoincharts/all, /stablecoinprices (base: stablecoins.llama.fi)
**Prices**: /prices/current/{coins}, /prices/historical/{timestamp}/{coins}, /batchHistorical, /chart/{coins}, /percentage/{coins}, /prices/first/{coins}, /block/{chain}/{timestamp}

### Response Shapes (live-verified for Sui)
- /v2/chains Sui entry: {gecko_id, tvl, tokenSymbol, cmcId, name, chainId}
- /v2/historicalChainTvl/Sui: [{date (unix), tvl}] ~1095 entries
- /protocols fields: id, name, chain, chains[], tvl, category, change_1h/1d/7d, chainTvls, mcap, etc.
- /overview/dexs/Sui: {totalDataChart, totalDataChartBreakdown} with protocol-keyed volumes
- /overview/fees/Sui: {totalDataChart, totalDataChartBreakdown} with protocol-keyed fees
- /pools fields: pool, chain, project, symbol, tvlUsd, apyBase, apyReward, rewardTokens[], underlyingTokens[], poolMeta, url

### Pro-Only Endpoints
/api/categories, /api/raises, /api/hacks, /api/treasuries, /api/forks, /api/oracles, /api/emissions, stablecoindominance

### Sui Protocols on DefiLlama
DEXes: Cetus CLMM, FlowX V2/V3, Kriya, Turbos, DeepBook V2/V3, Aftermath
Lending/Fees: Bluefin, Scallop, NAVI, Suilend, Bucket, SpringSui, Haedal, STEAMM, Sudo Perps, Typus DOV
