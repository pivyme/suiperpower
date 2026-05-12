---
name: cetus-swap
description: Integrate Cetus CLMM, Sui's largest DEX, for token swaps and liquidity provision. Use when the user says "swap on Cetus", "Cetus integration", "AMM on Sui", "add liquidity on Sui", "concentrated liquidity on Sui", "DEX swap on Sui", "Cetus SDK", or "build a Sui DEX with AMM". Reads .suiperpower/build-context.md if present. Loads references/cetus-quickstart.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track cetus-swap build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track cetus-swap build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Integrates Cetus CLMM into a project so the user can execute real token swaps and, optionally, manage concentrated liquidity positions on testnet or mainnet. Sets up the SDK, queries pools, builds swap transactions with slippage protection, and verifies a real swap settles on chain before declaring done.

## When to use it

- Building a DEX frontend, swap aggregator, or DeFi app that needs AMM liquidity on Sui.
- The user wants to swap tokens through Cetus pools.
- The user wants to provide concentrated liquidity (LP positions) on Cetus.
- The user is targeting the DeFi & Payments track at Sui Overflow 2026.

## When NOT to use it

- For orderbook trading (limit orders, partial fills), use `deepbook-orderbook` instead.
- For lending and borrowing, use `scallop-money-market` or `navi-lending`.
- For research before building, use the idea-phase skill instead.
- If the user has not scaffolded a project, use `scaffold-project` first.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The token pair the user wants to swap or LP on (or "any liquid pair on testnet" for a demo).

If unclear, interview the user for:

- What pair? (e.g. SUI/USDC, SUI/CETUS)
- Swap only, liquidity provision only, or both?
- Testnet or mainnet?
- Frontend wallet-signed or backend keeper?

## Outputs

- Working Cetus swap code using the SDK V2 (`@cetusprotocol/sui-clmm-sdk`).
- A verifiable testnet swap: one real swap executed, observable on suiscan with a recorded digest.
- Optionally, position management code (open, add liquidity, close).
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## cetus-swap session, <timestamp>
  - pool id: <pool object id>
  - coin pair: <coinA> / <coinB>
  - fee tier: <rate>
  - first swap tx digest: <digest>
  - slippage: <value>
  - position id: <id, if LP>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm the token pair, direction (swap vs LP vs both), and target network.

2. **SDK setup**
   - Install the SDK V2 package and its peer dependency (V1 `@cetusprotocol/cetus-sui-clmm-sdk` is deprecated):
     ```bash
     npm install @cetusprotocol/sui-clmm-sdk @cetusprotocol/common-sdk
     ```
   - Initialize:
     ```ts
     import { CetusClmmSDK } from '@cetusprotocol/sui-clmm-sdk'
     const sdk = CetusClmmSDK.createSDK({ env: 'testnet' })
     ```
   - Optionally pass `full_rpc_url` for a custom RPC. Set the sender address after init via `sdk.setSenderAddress(wallet)`.

3. **Pool selection**
   - Query pools by coin types:
     ```ts
     const pools = await sdk.Pool.getPoolByCoins([coinTypeA, coinTypeB])
     ```
   - Read pool params: `fee_rate`, `tick_spacing`, `current_sqrt_price`, `liquidity`.
   - Coin type ordering rule: compare ASCII values of both coin type addresses. Higher ASCII = `coin_type_a`.
   - Document the chosen pool in `build-context.md`.

4. **Swap implementation**
   - **Pre-swap estimate**: `sdk.Swap.preSwap()` simulates on chain and returns `estimated_amount_in` / `estimated_amount_out`.
   - **Slippage**: `adjustForSlippage(toAmount, slippage, !byAmountIn)` computes the minimum acceptable output.
   - **Build payload**: `sdk.Swap.createSwapPayload()` with pool id, coin types, `a2b`, `by_amount_in`, `amount`, `amount_limit`.
   - **Execute**: `sdk.fullClient.sendTransaction(signer, swapPayload)`.
   - The `a2b` flag: `true` means coin_type_a to coin_type_b.
   - See `references/cetus-quickstart.md` for the full code flow.

5. **Liquidity provision (optional)**
   - Only if the user asks for LP. Do not add this by default.
   - Open a position: `sdk.Position.openPositionPayload()` or the price-based variant.
   - Add liquidity: `sdk.Position.createAddLiquidityFixTokenPayload()`.
   - Close position: `sdk.Position.closePositionPayload()` (must collect all pending rewards first).
   - See `references/cetus-quickstart.md` for add-liquidity code.

6. **Demo**
   - Execute a real testnet swap. Capture the transaction digest.
   - Verify on suiscan testnet: `https://suiscan.xyz/testnet/tx/<digest>`.
   - If doing LP, open a position and verify.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

## Aggregator alternative

For user-facing swap UIs that need best execution across multiple DEXes, consider the Cetus Aggregator SDK (`@cetusprotocol/aggregator-sdk`). It routes across 30+ Sui DEXes (Cetus, DeepBook v3, Turbos, FlowX, Bluefin, and others). Use direct CLMM SDK (this skill) when you need liquidity management, position control, or fine-grained pool interaction. Use the aggregator when you only need swaps and want optimal pricing.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did at least one real testnet swap settle on chain, observable on suiscan, with a recorded digest?
- Is slippage protection enforced (not zero, not omitted)?
- Are pool params (fee tier, coin types, pool id) documented in `build-context.md`?
- Is SDK V2 (`@cetusprotocol/sui-clmm-sdk`) used, not the deprecated V1 package?
- If LP was requested: is there a position id recorded and verified on chain?
- Is coin type ordering correct (higher ASCII = coin_type_a)?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## Context: May 2025 exploit

Cetus was exploited for ~$223M in May 2025 due to a bug in shared Move math libraries (not the SDK). The protocol relaunched June 8, 2025 and is fully operational. The SDK API was not affected. Contract addresses listed in references are the current post-fix versions.

## References

On-demand references (load when relevant to the user's question):

- `references/cetus-quickstart.md`: Install, pool query, swap, and add-liquidity recipes for the SDK V2.

Knowledge docs (load when scope expands beyond what is in references):

- Cetus Developer Docs: https://cetus-1.gitbook.io/cetus-developer-docs
- Cetus SDK V2 GitHub: https://github.com/CetusProtocol/cetus-sdk-v2
- Cetus Aggregator GitHub: https://github.com/CetusProtocol/aggregator

## Use in your agent

- Claude Code: `claude "/suiper:cetus-swap <your message>"`
- Codex: `codex "/cetus-swap <your message>"`
- Cursor: paste a chat message that includes a phrase like "swap on Cetus" or "Cetus integration", or load `~/.cursor/rules/cetus-swap.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
