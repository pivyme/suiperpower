# Common data pipeline pitfalls on Sui

## Using deprecated APIs

JSON-RPC (`suix_queryEvents`, `suix_getObject`, etc.) is deprecated. Migrate to GraphQL or gRPC by July 2026. WebSocket `subscribeEvent` is also deprecated. Use `queryEvents` polling instead.

If you find code using `suix_*` methods or WebSocket subscriptions, flag it for migration.

## Not persisting the event cursor

If you poll with `queryEvents` and store the cursor only in memory, a crash or restart means you reprocess events from the beginning or miss events entirely. Always persist the cursor to disk or a database after each successful batch.

## Ignoring pagination

`queryEvents` returns at most 50 items per call. GraphQL returns at most 50 nodes per page. If you assume the first page is "all the data," you silently drop events during high-activity periods. Always check `hasNextPage` and loop.

## Polling too aggressively

Polling every 100ms on testnet gains nothing (block time is ~2-3 seconds) and may hit rate limits. Sensible defaults: 5 seconds for testnet, 1 second for mainnet.

## Not handling network errors in the poll loop

A single failed HTTP request should not crash the polling loop. Wrap each poll in try/catch with exponential backoff (start at 1 second, cap at 60 seconds). Log the error. Resume from the last known cursor.

## GraphQL query exceeding limits

Queries over 5KB are rejected. Queries requesting more than 300 nodes are rejected. Queries running longer than 40 seconds time out. If your query is complex, break it into smaller focused queries. Do not try to fetch an entire object graph in one call.

## Assuming event ordering across transactions

Events within a single transaction are ordered by `eventSeq`. Events across transactions follow checkpoint order when you query with `order: 'ascending'`. Do not assume events from different transactions within the same checkpoint have a meaningful relative order beyond their sequence numbers.

## Hardcoding package IDs

Package IDs change when you redeploy to a different network or upgrade. Store them in environment variables or config files, not in query strings. This applies to `MoveEventType` filter strings too: the package address prefix changes per deployment.

## Not indexing PostgreSQL tables (custom indexer)

If you build a custom indexer and forget to add indexes on the columns you query (event type, sender address, timestamp ranges), read queries will be slow as the table grows. Add indexes for every query pattern at schema creation time, not after.

## Confusing testnet and mainnet data

Testnet is reset periodically. Objects and events from last week may not exist. Mainnet data is permanent. Always confirm which network you are targeting, and do not mix endpoint URLs.
