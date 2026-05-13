---
name: navi-lending
description: Integrate Navi lending protocol on Sui. Use when the user mentions Navi or wants to lend or borrow on Sui via Navi.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track navi-lending build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track navi-lending build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Integrates NAVI Protocol lending into the project. Sets up the `@naviprotocol/lending` SDK (PTB-native, no standalone client class), walks through deposit, borrow, repay, and withdraw flows, adds health factor monitoring, and optionally wires up flash loans. Verifies a real lending operation executes on mainnet before declaring done.

## When to use it

- Building a lending frontend, yield aggregator, liquidation bot, or DeFi app that needs lending primitives on Sui.
- The user wants flash loans for arbitrage or liquidation flows.
- The user needs E-Mode for higher LTV on correlated asset pairs (e.g., vSUI/SUI).
- The user is targeting the DeFi & Payments track at Sui Overflow 2026.

## When NOT to use it

- For Scallop lending, use `scallop-money-market` instead. Both are production protocols. NAVI uses PTB-native functions with coin type identifiers. Scallop uses sCoins receipt tokens and a builder pattern (`depositQuick`). Pick based on asset coverage and API preference.
- For token swaps or AMM liquidity, use `cetus-swap` or `deepbook-orderbook`.
- For DeFi research without implementation, use `defillama-sui`.
- If the user has not scaffolded a project, use `scaffold-project` first.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- Which operations: deposit only, deposit + borrow, flash loans.
- Which assets: SUI, USDC, USDT, WETH, etc. (35 supported assets total).

If unclear, interview the user for:

- Deposit only, or deposit plus borrow?
- Which collateral asset, which borrow asset?
- Need flash loans?
- Who manages the position: end user via wallet, or app keeper?

## Outputs

- NAVI SDK integration code with PTB-based deposit, borrow, repay, withdraw.
- Health factor check before any borrow.
- Optional: flash loan flow with `flashloanPTB` + `repayFlashLoanPTB`.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## navi-lending session, <timestamp>
  - markets: <list of asset symbols>
  - operations: deposit | borrow | repay | withdraw | flash-loan
  - sample tx digest: <digest>
  - health factor: <value>
  - oracle: Pyth + Supra (15s validity)
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm which assets the user needs and the flow shape (deposit only, deposit + borrow, flash loan).
   - Verify the target assets are in NAVI's 35 supported assets. Check via `getPools()`.

2. **SDK setup**
   - Install: `npm install @naviprotocol/lending` (peer dep: `@mysten/sui >=1.25.0`).
   - The old `navi-sdk` package is deprecated. Do NOT use it.
   - There is no standalone client class. All operations are PTB functions: `depositCoinPTB(tx, identifier, coinObj, opts)`.
   - AssetIdentifier: a coin type string (e.g., `'0x2::sui::SUI'`), a Pool object, or a numeric asset ID.
   - Options pattern: `{ env: 'prod', accountCap, market: 'main' }`.
   - Two markets: Main (id: 0, key: `'main'`) and Ember (id: 1, key: `'ember'`). Default is Main.

3. **Pool queries**
   - `getPools()` returns all pool data (rates, capacity, LTV, oracle prices, APY, liquidation params).
   - `getPool(identifier)` returns a single pool by coin type, asset ID, or Pool object.
   - `getStats()` returns aggregate protocol stats.
   - Document pool parameters (LTV, liquidation threshold, borrow cap) in `build-context.md`.

4. **Core operations**
   - Deposit: `depositCoinPTB(tx, identifier, coinObject, { amount })`. Merge coins first with `mergeCoinsPTB()`.
   - Borrow: `borrowCoinPTB(tx, identifier, amount, { accountCap })`. A 0.3% borrow fee is applied at borrow time.
   - Withdraw: `withdrawCoinPTB(tx, identifier, amount, { accountCap })`.
   - Repay: `repayCoinPTB(tx, identifier, coinObject, { amount, accountCap })`.
   - All return or modify a `Transaction` that must be signed and executed.

5. **Health monitoring**
   - `getHealthFactor(address)` returns current health factor. Below 1.0 triggers liquidation.
   - `getSimulatedHealthFactor(address, identifier, operations)` predicts the impact of a new borrow.
   - Always check health factor before submitting a borrow. Refuse to submit if simulated HF would drop below a safe threshold (recommend >= 1.5).
   - Liquidation: 35% close factor, 5-15% bonus depending on asset.

6. **Flash loans (optional)**
   - `flashloanPTB(tx, identifier, amount)` returns `[balance, receipt]`.
   - `repayFlashLoanPTB(tx, identifier, receipt, coinObject)` repays the flash loan.
   - Both MUST be in the same PTB transaction. If the transaction fails, the flash loan reverts.
   - Fee is asset-dependent. Query available assets via `getAllFlashLoanAssets()`.
   - Not all pools support flash loans. Verify first.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

8. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did a real deposit or borrow execute on chain, with a recorded transaction digest?
- Is the health factor checked before every borrow, with a clear refuse-if-unsafe path?
- Are pool parameters (LTV, liquidation threshold, borrow fee) documented, not hardcoded from stale data?
- Does the code use `@naviprotocol/lending`, not the deprecated `navi-sdk`?
- Are coin types passed as full type strings, not pre-imported constants (the new SDK removed those)?
- For flash loans: do `flashloanPTB` and `repayFlashLoanPTB` both appear in the same PTB?
- Is oracle staleness addressed? (Pyth + Supra, 15-second validity. Call `updateOraclePricesPTB()` before time-sensitive ops.)

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/navi-quickstart.md`: Install, deposit, borrow, repay, withdraw, flash loan, health factor recipes for the `@naviprotocol/lending` SDK.

SDK documentation (load when scope expands beyond what is in references):

- SDK docs: https://sdk.naviprotocol.io/lending
- Migration guide: https://sdk.naviprotocol.io/navi-sdk-migration/lending
- Protocol docs: https://naviprotocol.gitbook.io/navi-protocol-docs

## Use in your agent

- Claude Code: `claude "/suiper:navi-lending <your message>"`
- Codex: `codex "/navi-lending <your message>"`
- Cursor: paste a chat message that includes a phrase like "NAVI lending" or "borrow on NAVI", or load `~/.cursor/rules/navi-lending.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
