---
name: deepbook-orderbook
description: Integrate DeepBook v3 orderbook on Sui (limit orders, CLOB, DEX). Use when the user wants to build on DeepBook or a Sui orderbook DEX.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track deepbook-orderbook build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track deepbook-orderbook build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Integrates DeepBook v3 into a project so the user can place and settle real orders on testnet. Picks the right pool, sets up a BalanceManager, walks the user through tick and lot constraints, writes the place-order, cancel-order, and read-book code, and verifies one real order settles on chain before declaring done.

## When to use it

- Building a DEX, market-making bot, or trading interface that needs orderbook semantics.
- The project requires limit orders, partial fills, or post-only behavior.
- The user is targeting the DeepBook track at Sui Overflow 2026.
- The user wants atomic order-then-route inside a single PTB.

## When NOT to use it

- For long-tail token swaps where AMM concentrated liquidity is a better fit, point the user toward Cetus, Aftermath, or Turbos.
- If the user wants market research before building, use `deepbook-research` (idea phase) instead.
- If the user has not scaffolded a project, use `scaffold-project` first.
- For perpetual futures specifically, there are protocols built on top of DeepBook; surface them rather than recreating perp logic.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The pair the user wants to trade (or "any liquid pair on testnet" for a demo).

If unclear, interview the user for:

- What pair? Existing pool, or a new pool the user wants to create?
- Maker side, taker side, or both?
- Where do orders originate, frontend signed by user wallet, or backend keeper?
- What is the slippage policy for market-style flows?

## Outputs

- DeepBook v3 client code that places, cancels, and reads orders.
- BalanceManager creation and deposit code.
- A verifiable testnet trade: one real order placed and either filled or cancelled, observable on suiscan.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## deepbook-orderbook session, <timestamp>
  - pool: <poolKey>
  - balance manager id: <id>
  - sample order ids: <list>
  - first settled tx digest: <digest>
  - tick size: <value>
  - lot size: <value>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm the pair and the side(s).
   - Verify v3 is the right version. New development should use v3.

2. **Pool selection**
   - List candidate pools on the target network (testnet or mainnet).
   - Read pool params: tick size, lot size, fees, min order size.
   - Document the chosen pool and its constraints in `build-context.md`.

3. **BalanceManager**
   - Create a BalanceManager Object for the user (or app keeper).
   - Deposit input token. Without funded balance, orders reject.
   - Persist the BalanceManager id.

4. **Implementation**
   - Place order: limit or market, with explicit price, quantity, and slippage where applicable.
   - Cancel order: by order id.
   - Read book: level-2 snapshot for the price band the UI cares about.
   - Subscribe to fills via event indexing (off chain) or poll the order status from the SDK.

5. **Demo settlement**
   - Place one real testnet order. Either match it against existing book liquidity (taker) or post a maker order and self-fill from a second wallet.
   - Capture the transaction digest. Verify on suiscan testnet.

6. **Slippage and tick alignment**
   - Round prices to the pool's tick.
   - Round quantities to the pool's lot.
   - Reject UI inputs that violate either, with a message that explains the constraint.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

8. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new DeepBook integration, BalanceManager wiring, real on-chain settlement path), recommend `verify-against-intent` as the next step so the sponsor-load-bearing settlement is checked before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did at least one real testnet order settle on chain, observable on suiscan, with a recorded digest?
- Is the BalanceManager funded and the id persisted, not regenerated every run?
- Are tick and lot constraints enforced before submitting orders, with a clear UI message on violation?
- Is there a cancel path with a positive test? Stuck orders are a real failure mode.
- Are slippage limits set on market-style flows? "No slippage" is not a default.
- If integrating Move-side, is there a positive test for the entry function that wraps the DeepBook call?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/deepbook-quickstart.md`: Place, cancel, read recipes for the v3 TS SDK.
- `references/deepbook-pitfalls.md`: Tick and lot violations, BalanceManager funding, pay-with-DEEP, stale prices, v2 vs v3 pools.
- `references/balancemanager-setup.md`: BalanceManager creation, deposit, and lifetime.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/sponsor-docs/deepbook.md`: Concepts, key terms, deeper integration notes.

## Related DeepBook features

These are separate DeepBook modules. Do not integrate them into the core orderbook flow unless the user specifically asks.

| Feature | Status | What it is | Docs |
|---|---|---|---|
| **DeepBook Predict** | Testnet only | On-chain prediction markets built on the DeepBook engine. | https://docs.sui.io/onchain-finance/deepbook-predict/ |
| **DeepBook Margin** | Mainnet | Margin trading with multiplier, settled through DeepBook pools. | https://docs.sui.io/onchain-finance/deepbook-margin |
| **DeepBook Sandbox** | Dev tool | Docker-based local dev environment for testing DeepBook integrations without hitting testnet. | https://github.com/MystenLabs/deepbook-sandbox |

## Use in your agent

- Claude Code: `claude "/suiper:deepbook-orderbook <your message>"`
- Codex: `codex "/deepbook-orderbook <your message>"`
- Cursor: paste a chat message that includes a phrase like "build on DeepBook", or load `~/.cursor/rules/deepbook-orderbook.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
