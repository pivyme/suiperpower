# Common slice shapes

A "slice" is a unit of work that fits in a single reviewable commit, defined by a clear "done" check, not by a clock. With AI-assisted pacing, a slice may finish in minutes or stretch longer, what matters is that it has one observable outcome and a passing build at the end.

## Move-only slice

- Author one Move module (or extend an existing one).
- Add tests for every public function added.
- Run `sui move build` and `sui move test`.
- Commit.

Example slice intent: "implement the deposit and withdraw functions on `vault.move`."

Done means: the module compiles, tests pass, and a Move-side caller can call deposit and withdraw end to end.

## Frontend-connect slice

- Wire wallet connect.
- Display the user's address.
- Show a single piece of on-chain state read from the package.
- Commit.

Example slice intent: "show the user's USDC balance from chain on the home page."

Done means: connect a wallet, the page renders the live balance, and disconnecting clears it.

## End-to-end action slice

- Pick one user action.
- Implement Move side (entry function with test).
- Implement frontend side (wallet sign + execute).
- Verify against testnet manually.
- Commit.

Example slice intent: "user can deposit USDC into the vault from the UI."

Done means: a fresh testnet wallet, with USDC, can hit a button, sign a transaction, and see their position update.

## Sponsor integration slice

- Hand off to the relevant sponsor skill (`walrus-storage`, `deepbook-orderbook`, `scallop-money-market`).
- Bring back the integration into the project.
- Confirm the demo works end to end.
- Commit.

Example slice intent: "add Walrus storage for the user's avatar upload."

## Anti-slop slice

- Run a single anti-slop skill (`validate-business-model`, `retention-loop`, `roast-my-product`).
- Capture findings in `.suiperpower/build-context.md`.
- Decide which findings to address before submission.
- Commit (the build-context update).

Example slice intent: "stress-test the retention loop assumption."

## Pre-deploy slice

- Run `review-move`, fix every P0.
- Run `ottersec-prep`, fill the engagement package.
- Update `Move.toml` to a release rev.
- Commit.

Example slice intent: "audit-prep pass before mainnet."

## Slice anti-patterns

- "Build the whole feature with no done-check." Split until every chunk has one observable outcome and one passing build.
- "Refactor everything." Probably not a slice; it is a project. Defer until needs are concrete.
- "Add three sponsor integrations in one commit." Each is its own slice, mainly so the load-bearing test for each is reviewable.
- "Polish the UI." Vague. Pick a specific screen and a specific quality bar.

A slice is too big when it has more than one done-check or more than one passing-build moment inside it. Time is not the constraint, reviewability is.

Last updated: 2026-05-10.
