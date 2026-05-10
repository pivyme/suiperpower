# Threat model template

A one-page threat model. The auditor reads this to understand what to attack.

## Template

```markdown
# Threat model: <project name>

Last updated: <date>
Authors: <names>

## What this package does

One paragraph. What does the package do, what does the user gain by using it.

## Assets at risk

What could a successful attack steal or destroy? Examples:

- User-deposited collateral inside <module>::Vault.
- Treasury tokens held by <module>::Treasury.
- Reputation tokens minted under <module>::Reputation.
- Off-chain user balance the smart contract is the source of truth for.

For each asset, name the maximum value at risk.

## Trust assumptions

Who is trusted, and for what?

- Admin (holds AdminCap): trusted to upgrade the package, pause the contract, set fees.
- Oracle (Pyth feed id): trusted to provide non-manipulated prices within X seconds of staleness.
- Walrus aggregator: trusted for data availability of stored blobs.
- Sponsor server: trusted to sign only allowlisted transactions.

For each, name the failure mode if trust is violated.

## Roles

- **End user**: signs transactions on the user-facing UI.
- **Admin**: holds AdminCap, performs privileged operations.
- **Liquidator** (if applicable): permissionless, profits from liquidating undercollateralized positions.
- **Sponsor server** (if applicable): pays gas for end users.

## Public entry points

For each public entry function, document:

- Function: `module::function_name`
- Caller: who is allowed to call (anyone, holder of cap X, etc.)
- Inputs: object types, value types
- Side effects: state mutations, transfers, events
- Failure modes: when and why it aborts
- Invariants the function maintains

## Out-of-scope

What is explicitly not in scope for this audit?

- Frontend code (separate audit if applicable).
- Off-chain backend service (separate audit).
- Third-party dependencies (e.g. OpenZeppelin Sui modules; we trust their published audits).

## Known risks

Risks the team is aware of and chose to ship anyway, with rationale:

- Oracle staleness during volatile periods can cause unfair liquidations. Mitigation: surface oracle freshness in UI.
- Admin key is held in a single multisig; compromise of two of three signers is full compromise. Mitigation: monitor admin actions on chain; rotate signers quarterly.

Be honest. The auditor finds these anyway; the question is whether you knew or did not.

## Past incidents

If the package has been deployed before with security incidents, document them:

- 2026-04-22: incorrect interest accrual on edge case (zero-deposit). Fixed in commit <sha>. Affected funds: zero. Detection: internal review.

If no incidents, say "no prior deployment incidents."

## Changes since last audit (if applicable)

If this is a re-audit after fixes:

- Diff scope: which modules changed.
- Findings addressed: <number> from previous report, with commit references.
- New features: any code added since last audit, separately scoped.

## Scope summary

- Package(s): <list>
- Commit hash: <sha>
- LoC (Move only): <count>
- Test count: <count>
- Test coverage: <percent>
- Dependencies (audited): <list>
- Dependencies (unaudited): <list, ideally empty>
```

## Filling rules

- Be specific. "Funds at risk" without an amount is not useful.
- Be honest about known risks. Burying them is the worst outcome.
- Cite commit hashes for changes since last audit. Words drift, hashes do not.
- One page. If yours is longer, you are mixing in implementation detail that belongs elsewhere.

Last updated: 2026-05-10.
