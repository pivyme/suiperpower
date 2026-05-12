# DeepBook pitfalls

Mistakes that look right and break order placement.

## Tick and lot violations

Orders not aligned to the pool's `tickSize` and `lotSize` reject. The SDK does not auto-round.

Mitigations:

- Read `poolBookParams(poolKey)` once at app start and cache.
- Round in the UI layer before submitting.
- Show a "minimum order: X" hint when the user types below `minSize`.

## BalanceManager not funded

A BalanceManager Object holds the funds available for trading. Placing an order without depositing first results in "insufficient balance" with no obvious cause.

Mitigations:

- On first order, explicitly create the BalanceManager and deposit input token.
- Persist the BalanceManager id; do not regenerate per session.
- If the user is moving from spot wallet to BalanceManager, surface the deposit step in the UI.

## Pay-with-DEEP optionality

DeepBook offers a fee discount when paid in DEEP token. The default for `payWithDeep` is `true`. If the BalanceManager has zero DEEP balance and `payWithDeep` is not explicitly set to `false`, the order rejects.

For first integration, explicitly set `payWithDeep: false`. Add the DEEP discount path only after the base flow works and DEEP is deposited into the BalanceManager.

## Stale book reads

A level-2 read is a snapshot. If you place a market-style order based on a five-second-old read, it can slip into thin liquidity or revert.

Mitigations:

- Always set a worst-acceptable price as the limit.
- For latency-sensitive flows, read again immediately before submitting.
- For backend keepers, subscribe to events instead of polling.

## v2 vs v3

Some older Sui pools are v2 and use a different SDK. New development uses v3. Mixing types between v2 pools and the v3 SDK fails type-checking with confusing messages.

Confirm the pool version in the pool registry before integrating.

## Pool creation

DeepBook v3 supports `createPermissionlessPool`, which allows anyone to create a new pool for an arbitrary pair without a special capability. However, pool creation has costs and constraints (fee tier selection, minimum tick/lot sizing). Check the current SDK and docs for the exact parameters before assuming defaults.

For projects that need a market that does not exist, treat pool creation as a deliberate step with its own testing, not a side effect of order placement.

DeepBook also offers specialized pool types on testnet and mainnet. DeepBook Predict (testnet) supports prediction-market pools. DeepBook Margin (mainnet) supports margin trading. DeepBook Sandbox provides a simulated environment for testing. Check which pool type fits your use case.

## Order expiry and pruning

Resting orders consume book slots. Long-lived orders without expiry can collide with re-listing logic during volatile periods.

Set `expiration` for orders that should auto-cancel. For market-makers, replace orders frequently rather than relying on indefinite resting orders.

## Frontend wallet vs backend keeper

Frontend wallet flows: each order is signed by the user. Latency is human-scale.

Backend keeper flows: the keeper holds a key, signs in code, and BalanceManager ownership lives with the keeper. This is fine for market-makers but introduces custody concerns; the keeper key has full control over BalanceManager funds.

Document the choice in `build-context.md`. They are different security and ops models.

Last updated: 2026-05-10.
