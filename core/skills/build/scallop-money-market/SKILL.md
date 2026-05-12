---
name: scallop-money-market
description: Use when integrating Scallop on Sui for deposit, borrow, or repay flows, or adding a money market to a Sui app.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track scallop-money-market build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track scallop-money-market build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Integrates Scallop's money market into the project. Sets up the Scallop SDK (mainnet only, testnet not supported), creates the user's Obligation Object, walks through deposit-borrow-repay end to end against a live pool, surfaces oracle and liquidation risk, and verifies the round-trip works on mainnet before declaring done.

## When to use it

- The project needs lending or borrowing without rebuilding the underlying interest model.
- Building a yield aggregator, looped-borrow strategy app, or treasury app.
- The user wants Sui DeFi composability (borrow on Scallop, route to another protocol in the same flow).
- The user is targeting Scallop's university award track at Sui Overflow 2026.

## When NOT to use it

- If the asset the user wants is not listed on Scallop, point them at the live market list before designing.
- For pure trading or orderbook flows, use `deepbook-orderbook` instead.
- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The intended asset(s) for collateral and borrow.

If unclear, interview the user for:

- Deposit only, or deposit plus borrow?
- Which collateral, which borrow asset?
- Who manages the position, end user via wallet, or app keeper?
- What is the user-facing risk surface, and how is liquidation explained?

## Outputs

- Scallop SDK client setup.
- Obligation Object creation and persistence.
- Deposit, borrow, repay, withdraw flows.
- A live mainnet round-trip: deposit, borrow, repay, observable on suiscan. (SDK is mainnet-only.)
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## scallop-money-market session, <timestamp>
  - obligation id: <id>
  - markets: <list of asset symbols>
  - sample deposit tx digest: <digest>
  - sample borrow tx digest: <digest>
  - sample repay tx digest: <digest>
  - oracle: Pyth (sole active provider)
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm the asset list and the flow shape (deposit only, full deposit-borrow-repay, leveraged loop).

2. **Network and SDK setup**
   - The SDK only supports mainnet. Testnet has no address package IDs and will error. Use mainnet for all integration work.
   - Install `@scallop-io/sui-scallop-sdk` and `@mysten/sui`.
   - Initialize with the `Scallop` class (not `ScallopClient` directly), passing `addressId`, `networkType`, and `secretKey`. Call `await scallopSDK.init()` before using any sub-clients.
   - Verify SDK version matches a current Scallop docs reference.

3. **Obligation Object**
   - Create the user's Obligation via `openObligationEntry()` on the ScallopTxBlock. This is a per-user Object holding their cross-market positions.
   - Each address can hold up to 5 Obligation sub-accounts. For first integration, treat it as a singleton.
   - Persist the Obligation id. Do not regenerate per session.

4. **Deposit**
   - Construct the deposit transaction for the chosen asset.
   - Submit and capture the digest. Verify the position appears in `getObligationAccount`.

5. **Borrow**
   - Confirm the post-borrow risk level before submitting. Refuse to submit a borrow that would push risk above a safe threshold unless the user explicitly opts in.
   - Submit and capture the digest.

6. **Repay**
   - Query the live amount owed via `getObligationAccount(obligationId)` before constructing repay. Interest accrues continuously, so paying the original borrow amount leaves dust debt.
   - Submit and capture the digest. Confirm the borrow record is closed or reduced.

7. **Risk surfacing**
   - Compute and display the position's risk level. Scallop uses "Risk Level" with `liquidation_factor` and `borrow_weight` per market, not a generic "health factor" with "collateral_factor".
   - Document the oracle source and the liquidation threshold. Scallop currently relies solely on Pyth for price feeds on Sui. Multi-oracle support (Switchboard, Supra) is on the roadmap but not yet active.
   - For end-user UIs, add a clear "this position can be liquidated if X happens" message.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did a real mainnet deposit, borrow, and repay all settle, with digests recorded? (SDK only supports mainnet.)
- Is the Obligation id persisted, not regenerated each run?
- Does the borrow path compute the risk level before submission and refuse if it would exceed the safe threshold?
- Does the repay path query live amount-owed, not assume the original borrow amount?
- Is liquidation risk documented in the user-facing UI, not hidden behind a tooltip?
- Is the oracle source named (Pyth) so the user knows where the prices come from?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/scallop-quickstart.md`: Deposit, borrow, repay recipes for the TS SDK.
- `references/scallop-risk.md`: Risk level math, oracle drift, liquidation surface, borrow caps.
- `references/scallop-obligation.md`: Obligation Object lifecycle and ownership.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/sponsor-docs/scallop.md`: Concepts, key terms, deeper integration notes.

## Use in your agent

- Claude Code: `claude "/suiper:scallop-money-market <your message>"`
- Codex: `codex "/scallop-money-market <your message>"`
- Cursor: paste a chat message that includes a phrase like "integrate Scallop" or "borrow on Sui", or load `~/.cursor/rules/scallop-money-market.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
