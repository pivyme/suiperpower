# Per-topic deep dives

Outlines and key takeaways. Pair with the longer chapters in `skills/data/sui-knowledge/`.

## Object model

Mental model: every piece of state on Sui is an Object. Objects have abilities (`key`, `store`), an owner (an address, a shared id, or "immutable"), and a version that bumps on mutation.

Key takeaways:

- Owned Object mutations bypass consensus for ordering between owners; throughput is high.
- Shared Object mutations go through consensus; throughput is lower but multiple writers are allowed.
- Capability is a small `key + store` Object held by a privileged actor; possession equals permission.

Concrete example: walk through a `Counter` shared Object and contrast it with a per-user `Profile` owned Object.

Common surprises:

- A "global" record that is really per-user belongs as owned.
- A struct stored inside another struct uses `store`, not `key`.

## Consensus and ordering

Mental model: Sui uses a DAG-based consensus (Mysticeti at present). Owned-Object transactions can use a fast path (no full consensus); shared-Object transactions require the full path.

Key takeaways:

- "Finality" on Sui means the consensus DAG has committed the block containing the tx.
- Reads are usually post-finality. The SDK handles the wait.
- Latency varies: owned-only flows are fast (sub-second possible); shared-Object flows are consensus-bound.

Concrete example: time a coin transfer (owned-only) vs a DeepBook order (shared pool).

## Move execution

Mental model: Move is a typed, resource-aware language. Resources are linear; they cannot be silently copied or destroyed. The compiler enforces ownership transfers.

Key takeaways:

- A Move function receiving a value-typed Object consumes it.
- A Move function receiving a `&` reference does not consume.
- A Move function receiving a `&mut` reference can mutate the underlying Object.
- The compiler tracks "everything must be moved or destroyed by the end of scope."

Concrete example: a `mint` function that returns a `Coin` and a separate `transfer` function that consumes the `Coin`.

Common surprises:

- Capability passed by value is consumed; usually you wanted `&Cap`.
- Forgetting to consume a return value yields a compile error.

## Gas and storage

Mental model: gas is split into computation (per opcode) and storage (per byte stored, with a partial rebate on deletion).

Key takeaways:

- Storing data is expensive; deleting yields a rebate.
- Computation is cheap unless you do something silly (loop a million times).
- The `setGasBudget` is a cap; under-spending refunds.

Concrete example: a contract that stores a 1 KB blob vs one that hashes it and stores 32 bytes.

Common surprises:

- Storing user-uploaded media on chain is almost never the right call. Use Walrus.
- Deletion rebate makes "create + destroy" patterns cheaper than they look.

## Upgrades

Mental model: Sui packages are upgradeable. The `UpgradeCap` is the authority. Upgrades preserve the package's logical id; the underlying address moves.

Key takeaways:

- `package_id` after upgrade is different from the original publish id.
- Use the "latest" id at runtime; fetch via the package's metadata Object.
- Upgrade authority decisions: keep, transfer, or burn the cap.

Concrete example: upgrade a counter contract to add a reset function. Confirm old Objects still work.

Common surprises:

- Storing a hardcoded `package_id` in your client breaks after upgrade. Resolve dynamically.
- The original package id is not the address you call after upgrade.

## Indexers and events

Mental model: Sui emits events via `event::emit`. An off-chain indexer subscribes to events and stores them in a queryable database.

Key takeaways:

- Events are typed structs; emit one per significant state change.
- The Sui RPC supports event subscription and historical event queries.
- For complex queries, build an indexer (or use a hosted one) rather than scanning chain state.

Concrete example: a `Purchased` event emitted by a marketplace contract. Walk through indexing it into a Postgres view.

Common surprises:

- Events are not on-chain consensus state; they are observability. A function can succeed without emitting events; emission is by author choice.
- The Sui RPC pagination model differs from EVM logs. Read the SDK docs before assuming.

## How to use this reference

For a 90-minute session, cover 3 to 4 topics. Pick based on the user's project:

- Building a DEX: object model + consensus + events.
- Building a money market: object model + Move execution + gas.
- Building an NFT marketplace: object model + upgrades + events.
- Building a gaming app: object model + gas + zkLogin (cross-reference `sui-zk-login`).

Last updated: 2026-05-10.
