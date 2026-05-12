# Sui data access methods

Four official methods for reading on-chain Sui data. Pick one based on the decision table in SKILL.md.

## 1. GraphQL RPC (recommended for hackathons)

Endpoints:
- Mainnet: `https://graphql.mainnet.sui.io/graphql`
- Testnet: `https://graphql.testnet.sui.io/graphql`

Limits:
- Query size: 5KB max
- Timeout: 40 seconds
- Max nodes per query: 300
- Max items per page: 50
- Pagination: cursor-based only

### Query: fetch object by ID

```graphql
query GetObject($id: SuiAddress!) {
  object(address: $id) {
    objectId
    version
    digest
    owner {
      ... on AddressOwner { owner { address } }
      ... on Shared { initialSharedVersion }
    }
    asMoveObject {
      contents {
        type { repr }
        json
      }
    }
  }
}
```

### Query: fetch events by Move type

```graphql
query GetEvents($eventType: String!, $after: String) {
  events(
    filter: { eventType: $eventType }
    first: 50
    after: $after
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      sendingModule { name }
      type { repr }
      sender { address }
      timestamp
      json
    }
  }
}
```

### Query: transaction history for an address

```graphql
query TxHistory($address: SuiAddress!, $after: String) {
  address(address: $address) {
    transactionBlocks(first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        digest
        effects {
          status
          timestamp
          gasEffects { gasSummary { computationCost storageCost } }
        }
      }
    }
  }
}
```

### TypeScript: execute a GraphQL query

```typescript
async function queryGraphQL(
  query: string,
  variables: Record<string, unknown>,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<unknown> {
  const endpoint = network === 'mainnet'
    ? 'https://graphql.mainnet.sui.io/graphql'
    : 'https://graphql.testnet.sui.io/graphql';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}
```

## 2. Event polling via queryEvents (simplest real-time)

Uses the `@mysten/sui` SDK. Does not require GraphQL.

```typescript
import { SuiClient } from '@mysten/sui/client';

const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

// Single query (most recent 50 events of a type)
const events = await client.queryEvents({
  query: { MoveEventType: '0xPKG::module::EventType' },
  limit: 50,
  order: 'descending',
});

// Poll loop with cursor tracking
let cursor: { txDigest: string; eventSeq: string } | null = null;

async function pollEvents() {
  const result = await client.queryEvents({
    query: { MoveEventType: '0xPKG::module::EventType' },
    cursor: cursor ?? undefined,
    limit: 50,
    order: 'ascending',
  });

  for (const event of result.data) {
    // Process each event
    console.log(event.type, event.parsedJson);
  }

  if (result.data.length > 0) {
    cursor = {
      txDigest: result.data[result.data.length - 1].id.txDigest,
      eventSeq: result.data[result.data.length - 1].id.eventSeq,
    };
    // Persist cursor to disk or DB for crash recovery
  }

  if (result.hasNextPage) {
    // More events available, poll again immediately
    await pollEvents();
  }
}

// Run on interval
setInterval(pollEvents, 5000);
```

### Cursor persistence pattern

```typescript
import { readFileSync, writeFileSync } from 'node:fs';

const CURSOR_FILE = './.sui-cursor.json';

function loadCursor(): typeof cursor {
  try {
    return JSON.parse(readFileSync(CURSOR_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function saveCursor(c: typeof cursor) {
  writeFileSync(CURSOR_FILE, JSON.stringify(c));
}
```

## 3. Custom indexer (sui-indexer-alt-framework)

For high-volume historical indexing. Requires Rust and PostgreSQL.

Crate: `sui-indexer-alt-framework` from [MystenLabs/sui](https://github.com/MystenLabs/sui/tree/main/crates/sui-indexer-alt-framework).

Data sources:
- Remote checkpoints (HTTP fetch from a fullnode)
- GCS buckets (bulk historical data)
- gRPC streaming (real-time feed)

ORM: Diesel (PostgreSQL)

### Project scaffold

```toml
# Cargo.toml
[package]
name = "my-indexer"
version = "0.1.0"
edition = "2021"

[dependencies]
sui-indexer-alt-framework = { git = "https://github.com/MystenLabs/sui.git", rev = "<pinned>" }
diesel = { version = "2", features = ["postgres"] }
tokio = { version = "1", features = ["full"] }
```

### Pipeline handler (conceptual)

```rust
// Define a pipeline that processes checkpoints
// and inserts relevant data into PostgreSQL tables.
// See the framework README for the Handler trait and
// how to register pipelines with the Indexer builder.
```

Refer to the framework's GitHub README for the current `Handler` trait signature and the `Indexer::builder()` API. These change across Sui releases, so always pin to a specific rev.

## 4. gRPC API (replacing JSON-RPC)

For DeFi feeds, exchange integrations, and latency-sensitive consumers.

The gRPC API is the successor to JSON-RPC. It provides streaming and unary RPCs for transaction and object data.

Refer to https://docs.sui.io/references/sui-api for the current proto definitions and client setup. The API surface is actively evolving.

## Third-party services

| Service | What it offers | Notes |
|---|---|---|
| BlockVision | Sui-specific indexing API, REST + WebSocket | Good for quick MVPs without custom infra. |
| ZettaBlock | SQL queries over Sui data on Snowflake/GCP | Good for analytics dashboards and batch queries. |

Envio does NOT support Sui. Do not recommend it.
