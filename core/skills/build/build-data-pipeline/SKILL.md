---
name: build-data-pipeline
description: Build a Sui data indexer or analytics pipeline. Use when the user wants to index Sui events, build a pipeline, or query Sui RPC data.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track build-data-pipeline build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track build-data-pipeline build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Helps the user read, index, and monitor on-chain Sui data. Picks the right data access method (GraphQL RPC, event polling, custom indexer, or gRPC), implements the queries or indexer, and verifies that real data comes back before declaring done.

## When to use it

- The user needs to read on-chain state (balances, objects, transaction history).
- The user wants to listen for events emitted by a Move module.
- The project needs a backend indexer for analytics, leaderboards, or historical data.
- The user asks about GraphQL queries on Sui.
- The user wants to monitor specific transaction types or object changes.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the user is writing Move code (not reading data), use `build-with-move`.
- If the user is composing transactions (writing, not reading), use `ptb-composer`.
- If the user wants DeepBook market data specifically, use `deepbook-orderbook` (it has DeepBook-specific queries).

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (TS app, backend service, or standalone script).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The data requirement: what on-chain data the user needs and why.

If unclear, interview the user for:

- What data do you need? (events, object state, transaction history, balances)
- How fresh must the data be? (real-time, near-real-time, periodic batch)
- What volume do you expect? (a few queries vs. indexing all events for a module)
- Is this for a frontend, a backend analytics service, or a standalone script?

## Outputs

- Query code or indexer implementation matching the chosen method.
- For GraphQL: working `.graphql` queries or inline TS query strings.
- For event polling: a polling loop with cursor tracking and persistence.
- For custom indexer: Rust project scaffolded with `sui-indexer-alt-framework`.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## build-data-pipeline session, <timestamp>
  - method: <graphql | event-polling | custom-indexer | grpc>
  - data targets: <what is being indexed/queried>
  - network: <mainnet | testnet | devnet>
  - polling interval: <if applicable>
  - third-party services: <if applicable>
  - open issues: <list>
  ```

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Identify which Move modules or event types the user cares about.
   - Confirm the data freshness and volume requirements.

2. **Pick the data access method**
   - Use the decision table below. Confirm the choice with the user before writing code.
   - For hackathon projects, default to GraphQL RPC + event polling. Custom indexers are overkill for a hackathon.

3. **Implement queries**
   - For GraphQL: write queries against `https://graphql.testnet.sui.io/graphql` (or mainnet). Respect the limits: 5KB query size, 40s timeout, 300 nodes max, 50 items per page, cursor-based pagination.
   - For event polling: implement `queryEvents` with cursor tracking, descending order, and a persistence mechanism for the last-seen cursor.
   - For custom indexer: scaffold the Rust project with `sui-indexer-alt-framework`, configure the PostgreSQL schema, and write the pipeline handler.
   - For gRPC: configure the gRPC client against the Sui gRPC endpoint.
   - See `references/data-access-methods.md` for code patterns.

4. **Add event polling if monitoring is needed**
   - If the project needs to react to events in near-real-time, layer event polling on top of any read method.
   - Implement a poll loop with configurable interval (default: 5s for testnet, 1s for mainnet).
   - Track the cursor between polls to avoid reprocessing.
   - Handle the case where events arrive faster than the poll interval (pagination within a poll).

5. **Test with real data**
   - Run every query against the target network and verify non-empty results.
   - For event polling, trigger a real event (or use a known recent event) and confirm it appears.
   - For custom indexers, run against a small checkpoint range and verify rows land in PostgreSQL.

6. **Optimize and harden**
   - Add error handling for network failures (retry with backoff).
   - Add pagination handling for queries that may exceed 50 results.
   - Set appropriate timeouts on all network calls.
   - Review `references/data-pipeline-pitfalls.md` and fix any matching issues.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

8. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Decision table: which method to pick

| Use case | Method | When to pick |
|---|---|---|
| Read object state, balances, transaction history | GraphQL RPC | Default for most read-only queries. Best for hackathons. |
| React to Move events in near-real-time | Event polling (`queryEvents`) | Simplest real-time option. Good up to moderate event volume. |
| High-volume historical indexing, complex joins | Custom indexer (`sui-indexer-alt-framework`) | When you need PostgreSQL-backed analytics or full history. Rust + PostgreSQL required. |
| DeFi feed, exchange integration, low-latency streaming | gRPC API | Replacing JSON-RPC. Best for high-throughput, latency-sensitive consumers. |
| Quick prototyping without running infrastructure | Third-party (BlockVision, ZettaBlock) | When you want SQL or REST without running your own infra. |

Notes:
- JSON-RPC is deprecated. Migrate to GraphQL or gRPC by July 2026.
- WebSocket `subscribeEvent` is also deprecated. Use `queryEvents` polling instead.
- Envio does NOT support Sui. Do not recommend it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Does every query return real data from the target network (not mocked or empty)?
- Is pagination handled for all list queries (no silent truncation at 50 items)?
- For event polling: is the cursor persisted between restarts (not lost on crash)?
- For event polling: is there a backoff/retry on network failure (not a crash loop)?
- Are deprecated methods avoided (no JSON-RPC `suix_*` calls, no WebSocket `subscribeEvent`)?
- Is the query within GraphQL limits (under 5KB, under 300 nodes)?
- For custom indexers: does the PostgreSQL schema have appropriate indexes for the query patterns?

If any answer is no, the skill reports the gap and works through it before claiming the pipeline is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/data-access-methods.md`: All 4 data access methods with code examples, endpoints, and limits.
- `references/data-pipeline-pitfalls.md`: Common mistakes with Sui data pipelines and how to avoid them.

External docs (fetch at runtime for the latest API surface):

- Sui GraphQL RPC: https://docs.sui.io/references/sui-graphql
- Sui gRPC API: https://docs.sui.io/references/sui-api
- sui-indexer-alt-framework: https://github.com/MystenLabs/sui/tree/main/crates/sui-indexer-alt-framework
- BlockVision: https://docs.blockvision.org/
- ZettaBlock: https://docs.zettablock.com/

## Use in your agent

- Claude Code: `claude "/suiper:build-data-pipeline <your message>"`
- Codex: `codex "/build-data-pipeline <your message>"`
- Grok Build: run `grok`, then `/build-data-pipeline <your message>` in the session
- Cursor: paste a chat message that includes a phrase like "index Sui data" or "query events", or load `~/.cursor/rules/build-data-pipeline.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
