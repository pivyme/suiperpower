# DefiLlama API endpoints for Sui DeFi research

No authentication required. Free tier rate limit: ~500 requests per 5 minutes.

The chain identifier for Sui is `"Sui"` (case-sensitive) in all endpoints.

## Base URLs

| Service      | Base URL                        |
|--------------|---------------------------------|
| Core API     | `https://api.llama.fi`          |
| Yields       | `https://yields.llama.fi`       |
| Stablecoins  | `https://stablecoins.llama.fi`  |

## Chain-level endpoints

### GET /v2/chains

Returns all chains with current TVL.

```
https://api.llama.fi/v2/chains
```

Response shape (array of objects):

```json
[
  {
    "gecko_id": "sui",
    "tvl": 1234567890.12,
    "tokenSymbol": "SUI",
    "cmcId": "20947",
    "name": "Sui",
    "chainId": null
  }
]
```

Use this to get Sui's absolute TVL and rank it against other chains.

### GET /v2/historicalChainTvl/{chain}

Returns daily historical TVL for a chain.

```
https://api.llama.fi/v2/historicalChainTvl/Sui
```

Response shape (array of objects):

```json
[
  { "date": 1680307200, "tvl": 50000000.0 },
  { "date": 1680393600, "tvl": 52000000.0 }
]
```

`date` is a Unix timestamp (seconds). Use this for TVL trend analysis (growing, flat, declining).

## Protocol-level endpoints

### GET /protocols

Returns all protocols across all chains.

```
https://api.llama.fi/protocols
```

Response shape (array of objects, abbreviated):

```json
[
  {
    "id": "123",
    "name": "Cetus",
    "slug": "cetus",
    "chains": ["Sui"],
    "category": "Dexes",
    "tvl": 100000000.0,
    "chainTvls": { "Sui": 100000000.0 },
    "change_1d": 1.5,
    "change_7d": -2.3
  }
]
```

Filter client-side: `protocol.chains.includes("Sui")`.

Key fields: `name`, `category`, `tvl`, `chainTvls`, `chains`, `change_1d`, `change_7d`.

Known Sui DeFi protocols on DefiLlama (non-exhaustive):
- DEXes: Cetus CLMM, FlowX V2, FlowX V3, Kriya, Turbos, DeepBook V2, DeepBook V3, Aftermath
- Lending: Scallop, NAVI, Suilend, Bucket
- Liquid staking: SpringSui, Haedal
- Perps: Bluefin
- AMM: STEAMM

## DEX volume endpoints

### GET /overview/dexs/{chain}

Returns DEX volume breakdown by protocol for a chain.

```
https://api.llama.fi/overview/dexs/Sui
```

Response shape (abbreviated):

```json
{
  "totalDataChart": [[1680307200, 5000000.0]],
  "totalDataChartBreakdown": [[1680307200, {"Cetus": 3000000.0, "Turbos": 1000000.0}]],
  "protocols": [
    {
      "name": "Cetus",
      "total24h": 3000000.0,
      "total7d": 20000000.0,
      "totalAllTime": 500000000.0
    }
  ],
  "total24h": 5000000.0,
  "total7d": 30000000.0
}
```

Use `protocols` array for per-DEX breakdown. Use `total24h` for chain aggregate.

## Fee and revenue endpoints

### GET /overview/fees/{chain}

Returns fee and revenue breakdown by protocol for a chain.

```
https://api.llama.fi/overview/fees/Sui
```

Response shape (abbreviated):

```json
{
  "protocols": [
    {
      "name": "Bluefin",
      "total24h": 50000.0,
      "total7d": 300000.0,
      "totalAllTime": 10000000.0
    }
  ],
  "total24h": 150000.0
}
```

Protocols that generate fees but have low TVL relative to fees may indicate efficient capital use or high-velocity trading.

## Yield endpoints

### GET /pools

Returns all yield pools across all chains.

```
https://yields.llama.fi/pools
```

Response shape (abbreviated):

```json
{
  "status": "success",
  "data": [
    {
      "chain": "Sui",
      "project": "cetus",
      "symbol": "SUI-USDC",
      "tvlUsd": 5000000.0,
      "apy": 12.5,
      "apyBase": 8.0,
      "apyReward": 4.5,
      "pool": "0xabc123",
      "stablecoin": false,
      "ilRisk": "yes",
      "exposure": "multi"
    }
  ]
}
```

Filter client-side: `pool.chain === "Sui"`.

Key fields: `project`, `symbol`, `tvlUsd`, `apy`, `apyBase`, `apyReward`, `stablecoin`, `ilRisk`.

- `apyBase`: yield from trading fees or protocol mechanics.
- `apyReward`: yield from token incentives (less sustainable).
- Pools where `apyReward` dominates `apy` are incentive-dependent.

## Stablecoin endpoints

### GET /stablecoincharts/{chain}

Returns historical stablecoin market cap for a chain.

```
https://stablecoins.llama.fi/stablecoincharts/Sui
```

Response shape (array of objects):

```json
[
  {
    "date": "1680307200",
    "totalCirculatingUSD": { "peggedUSD": 100000000.0 },
    "totalMintedUSD": { "peggedUSD": 100000000.0 },
    "totalBridgedToUSD": { "peggedUSD": 80000000.0 }
  }
]
```

Stablecoin depth is a proxy for DeFi maturity. Low stablecoin cap relative to TVL signals bridged-asset dependency.

## Usage notes

- All endpoints return JSON. No pagination; responses can be large (the `/protocols` endpoint returns all ~4000 protocols).
- Rate limit is approximately 500 requests per 5 minutes. No API key needed.
- Data updates vary by endpoint: TVL updates every ~15 minutes, yields every ~1 hour, volumes every ~1 hour.
- For cross-chain comparison, run the same chain-level queries substituting "Ethereum" or "Solana" for "Sui".
- Always note the query timestamp when citing numbers. DeFi data moves fast.
