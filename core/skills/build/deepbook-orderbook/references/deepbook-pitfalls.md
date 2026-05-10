# DeepBook pitfalls

Mistakes that look right and break order placement.

## Tick and lot violations

Orders not aligned to the pool's `tickSize` and `lotSize` reject. The SDK does not auto-round.

Mitigations:

- Read `getPoolBookParams` once at app start and cache.
- Round in the UI layer before submitting.
- Show a "minimum order: X" hint when the user types below `minSize`.

## BalanceManager not funded

A BalanceManager Object holds the funds available for trading. Placing an order without depositing first results in "insufficient balance" with no obvious cause.

Mitigations:

- On first order, explicitly create the BalanceManager and deposit input token.
- Persist the BalanceManager id; do not regenerate per session.
- If the user is moving from spot wallet to BalanceManager, surface the deposit step in the UI.

## Pay-with-DEEP optionality

DeepBook offers a fee discount when paid in DEEP token. If `payWithDeep: true` and the BalanceManager has zero DEEP, the order rejects.

For first integration, use `payWithDeep: false`. Add the DEEP discount path only after the base flow works.

## Stale book reads

A level-2 read is a snapshot. If you place a market-style order based on a five-second-old read, it can slip into thin liquidity or revert.

Mitigations:

- Always set a worst-acceptable price as the limit.
- For latency-sensitive flows, read again immediately before submitting.
- For backend keepers, subscribe to events instead of polling.

## v2 vs v3

Some older Sui pools are v2 and use a different SDK. New development uses v3. Mixing types between v2 pools and the v3 SDK fails type-checking with confusing messages.

Confirm the pool version in the pool registry before integrating.

## Pool creation requires a capability

Anyone cannot freely create new DeepBook pools. The current policy gates pool creation behind a capability or governance flow. Check the live policy before assuming you can spin up a market for an arbitrary pair.

For projects that need a market that does not exist, plan for the pool-creation flow as a separate workstream, not a side effect.

## Order expiry and pruning

Resting orders consume book slots. Long-lived orders without expiry can collide with re-listing logic during volatile periods.

Set `expireTimestamp` for orders that should auto-cancel. For market-makers, replace orders frequently rather than relying on indefinite resting orders.

## Frontend wallet vs backend keeper

Frontend wallet flows: each order is signed by the user. Latency is human-scale.

Backend keeper flows: the keeper holds a key, signs in code, and BalanceManager ownership lives with the keeper. This is fine for market-makers but introduces custody concerns; the keeper key has full control over BalanceManager funds.

Document the choice in `build-context.md`. They are different security and ops models.

Last updated: 2026-05-10.
