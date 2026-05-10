# Common slice shapes

A "slice" is a unit of MVP work that fits in a single commit. Aim for 30 to 90 minutes of focused work.

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

- "Build the whole feature." Too big. Split.
- "Refactor everything." Probably not a slice; it is a project. Defer until needs are concrete.
- "Add three sponsor integrations." Each is its own slice.
- "Polish the UI." Vague. Pick a specific screen and a specific quality bar.

A slice that takes more than 2 hours of focused work is too big. Break it down before starting.

Last updated: 2026-05-10.
