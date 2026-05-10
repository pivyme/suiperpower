# Mainnet gate rationale

Each gate exists for a concrete reason. The gate is not a moral test; it is a check that the project has done the work mainnet implies.

## business-model gate

Why: a project that goes to mainnet without a clear answer to "who pays" tends to either (1) burn through funding and disappear, or (2) silently subsidize users until the founder runs out of patience. Both are bad outcomes for the user and for the protocol's reputation.

Failure looks like: `business-model.md` does not exist, or its verdict is `no`.

How to clear: run `validate-business-model` and answer the five questions concretely.

## retention-loop gate

Why: a product on mainnet exposed to real users without a retention loop is a slot machine on novelty. The first 100 users cycle in and out and the second 100 never come.

Failure looks like: `retention-loop.md` does not exist, or its verdict is `no`.

How to clear: run `retention-loop` and articulate the day 1 / day 2 / day 7 / day 30 anchors.

## review-move gate

Why: mainnet exposes the Move package to attack from anyone. A package that has not been reviewed in the last two weeks is likely missing a P0 finding that would have been caught.

Failure looks like: no recent `review-move` evidence in `learnings.md` or `review-move.md`, or the latest review left an unresolved P0.

How to clear: run `review-move`. If the latest review left an unresolved P0, fix it before mainnet.

## testnet exercised gate

Why: a testnet deploy without a frontend or PTB exercising it is a blind deploy. The shape of the on-chain object graph at runtime is not the same as at compile time. Testnet is the place to find out.

Failure looks like: no `testnet` entry in `deploy-context.md`, or the user cannot point at a frontend or PTB that exercised it.

How to clear: run `deploy-to-testnet`, then drive transactions against the testnet package from a frontend or a PTB script.

## When override is appropriate

There are real cases where overriding a gate is the right call:

- A pre-existing product migrating to mainnet from another chain. The business model and retention loop already exist; they are documented elsewhere.
- A mainnet deploy of a public good with no payer (gates business-model). Document why in `Notes`.
- A re-publish of a known-safe package after a tooling-only change (gates review-move).

Override responsibly. The override is logged in `deploy-context.md` so it is on the record.
