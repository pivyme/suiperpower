---
name: Sui Data Pipeline and Indexing Research
description: Complete Sui data access research: GraphQL RPC, gRPC, custom indexers, event polling, third-party services, JSON-RPC deprecation timeline, recommended hackathon approach
type: reference
---

## Sui Data Pipeline / Indexing Research (verified 2026-05-11)

### Data Access Methods (4 official)

1. **gRPC API** (replacing JSON-RPC on full nodes): binary serialization, ultra-low latency, for DeFi/exchanges
2. **GraphQL RPC** (reads from General-Purpose Indexer): flexible queries, for web apps, relaxed latency
3. **Custom Indexers** (sui-indexer-alt-framework): Rust framework, app-specific pipelines
4. **Event Polling** (queryEvents): simplest, valid for hackathons

### JSON-RPC Deprecation
- Deprecated as of Sept/Oct 2025
- **Migrate by July 2026**
- Replace with gRPC or GraphQL RPC

### GraphQL RPC Endpoints (verified)
- Mainnet: https://graphql.mainnet.sui.io/graphql
- Testnet: https://graphql.testnet.sui.io/graphql
- Devnet: https://graphql.devnet.sui.io/graphql
- (Beta playground also at: https://sui-mainnet.mystenlabs.com/graphql)
- Rate-limited, public good, NOT for production

### GraphQL Limits
- Request size: 175KB tx, 5KB queries
- Timeout: 74s execution, 40s reads
- Complexity: 300 input nodes, 20 nesting levels
- Output: 1M nodes max
- Pagination: cursor-based, 50 items default per page
- Data retention: ~1hr consistent, ~30-90 days DB, indefinite archival

### WebSocket subscribeEvent: DEPRECATED
- Was suix_subscribeEvent / sui_subscribeEvent
- Mysten confirmed deprecated due to ws server instability
- Replacement: poll via queryEvents
- Future: GraphQL subscriptions planned (no ETA)

### Event Polling (recommended for hackathons)
```typescript
// @mysten/sui SDK
const events = await client.queryEvents({
  query: { MoveEventType: '0xPKG::module::EventType' }
});
// Also: { Transaction: digest }, { Package: id }, { Sender: addr }
```

### Custom Indexer Framework
- Crate: `sui-indexer-alt-framework` (git dep from MystenLabs/sui)
- Language: Rust
- Storage: PostgreSQL (built-in via Diesel ORM)
- Data sources: remote checkpoints, GCS buckets, gRPC streaming, local files
- Pipeline types: sequential (ordered) or concurrent (high-throughput)
- Demo: github.com/amnn/sui-sender-indexer

### Third-Party Indexers
- **BlockVision**: Sui Indexing API, NFTs/coins/transactions, commercial
- **ZettaBlock**: Sui data on Snowflake/Google Cloud, 500+ datasets, real-time
- **Envio HyperIndex**: Does NOT support Sui (EVM + Solana only as of 2026)
- **Space and Time**: No confirmed Sui integration found

### Sui Equivalent of Helius/Triton
No single dominant provider. Closest equivalents:
- BlockVision (most Sui-specific, indexing API + explorer)
- ZettaBlock (data warehouse, SQL access)
- For simple reads: GraphQL RPC (free, public)
- For production: self-hosted custom indexer or commercial RPC providers (Chainstack, QuickNode, Ankr)

### Hackathon Recommendation (simplest path)
1. **Read data**: GraphQL RPC (free, no setup)
2. **Monitor events**: queryEvents polling with @mysten/sui SDK
3. **If you need custom indexing**: sui-indexer-alt-framework (Rust, PostgreSQL)
4. **Skip**: gRPC (overkill for hackathons), WebSocket subscriptions (deprecated)
