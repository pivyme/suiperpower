---
name: pyth-oracle
description: Integrate Pyth oracle prices into a Sui Move package. Use when the user mentions Pyth or wants price oracles on Sui.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track pyth-oracle build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track pyth-oracle build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Integrates Pyth pull-based price feeds into a Sui project so the user's Move contract can read real-time, signed prices for 1500+ assets. Walks the user through the Move dependency, TS client setup, on-chain price consumption, and verifies a real price read on testnet before declaring done.

## When to use it

- The project needs real-time token or asset prices on chain (DeFi, lending, perps, liquidations).
- The user wants to integrate Pyth price feeds into a Move contract.
- The user is building a protocol that requires oracle data (collateral valuation, settlement, trigger conditions).
- The user is targeting a DeFi-related track at Sui Overflow 2026 and needs price data.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the user needs to write general Move code (not oracle-specific), use `build-with-move`.
- If the user wants to build a DEX orderbook, use `deepbook-orderbook`.
- If the user wants lending/borrowing integration, use `scallop-money-market` (which may itself use Pyth internally).

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The asset(s) the user needs prices for.

If unclear, interview the user for:

- Which asset prices? (SUI/USD, BTC/USD, a custom pair?)
- What staleness tolerance? (seconds, default 60)
- How is the price used? (collateral valuation, settlement, display only)
- Testnet or mainnet target?

## Outputs

- Move code that receives `&PriceInfoObject` and reads price with staleness check.
- TS client code using `@pythnetwork/pyth-sui-js` that fetches prices from Hermes and passes them in the same PTB.
- A verified testnet price read: one real transaction that reads a Pyth price on chain, observable on suiscan.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## pyth-oracle session, <timestamp>
  - feeds: <list of feed IDs>
  - staleness: <max_age_secs>
  - network: testnet | mainnet
  - hermes endpoint: <url>
  - pyth state id: <id>
  - wormhole state id: <id>
  - verified tx digest: <digest>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Architecture: the pull model

Pyth is a pull oracle. The price lives off chain on Hermes servers. Your client fetches a signed price update, then passes it on chain in the same PTB that reads the price. The flow:

```
1. TS client calls Hermes: getPriceFeedsUpdateData([feedId])
2. TS client builds PTB:
   a. pythClient.updatePriceFeeds(tx, updateData, [feedId])  -> PriceInfoObject IDs
   b. tx.moveCall your_module::use_price(priceInfoObjectId, clock, maxAge)
3. User signs and executes the PTB
4. Your Move contract reads price from &PriceInfoObject via get_price_no_older_than
```

Your Move contract never calls Pyth update functions directly. It only receives `&PriceInfoObject` as a parameter. The TS SDK handles updates. This is critical because the Pyth package ID changes on upgrades, and hard-coding it in Move would brick your contract.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm which asset prices are needed and the staleness tolerance.
   - Decide testnet or mainnet. Default to testnet for development.

2. **Add Move dependency**
   - Add Pyth to `Move.toml`. See `references/pyth-quickstart.md` for the exact config.
   - Use `rev = "sui-contract-testnet"` for testnet, `"sui-contract-mainnet"` for mainnet.
   - Also add the Wormhole dependency (Pyth requires it).

3. **Write the Move contract**
   - Accept `&PriceInfoObject` and `&Clock` as function parameters.
   - Call `pyth::pyth::get_price_no_older_than(price_info_object, clock, max_age)` for staleness-checked reads.
   - Use `price::get_price()`, `price::get_expo()`, `price::get_conf()` to extract values.
   - Handle the exponent correctly: the raw price is `value * 10^expo`. See `references/pyth-pitfalls.md`.
   - Never hard-code any Pyth package ID or update call in Move.

4. **Write the TS client**
   - Install `@pythnetwork/pyth-sui-js`.
   - Create `SuiPriceServiceConnection` pointing to the right Hermes endpoint (no extra config needed).
   - Create `SuiPythClient(suiClient, pythStateId, wormholeStateId)` for the target network.
   - Build a PTB: `updatePriceFeeds` first, then your `moveCall` with the returned `PriceInfoObject` IDs.
   - See `references/pyth-quickstart.md` for the full pattern.

5. **Look up feed IDs**
   - Use the Hermes API: `GET https://hermes.pyth.network/v2/price_feeds?query=<symbol>&asset_type=crypto`
   - Common feeds listed in `references/pyth-quickstart.md`.
   - Feed IDs differ between Beta (testnet) and Stable (mainnet) Hermes. Always verify.

6. **Test on testnet**
   - Execute the PTB on testnet.
   - Verify the price was read correctly by checking the transaction effects on suiscan.
   - Confirm the exponent math produces sensible USD values.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

8. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did a real testnet transaction read a Pyth price on chain, observable on suiscan, with a recorded digest?
- Does the Move contract use `get_price_no_older_than` (not `get_price_unsafe`) with an explicit max age?
- Does the Move contract accept `&PriceInfoObject` as a parameter instead of hard-coding any Pyth update call?
- Is the exponent handled correctly in the application logic? (raw price * 10^expo = real price)
- Is the confidence interval considered if the price is used for collateral or obligations?
- Are Hermes endpoint and state IDs correct for the target network (testnet vs mainnet)?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/pyth-quickstart.md`: Move dependency config, TS SDK setup, contract addresses, feed IDs, full integration recipe.
- `references/pyth-move-api.md`: Move API reference for reading prices, extractors, and the PriceInfoObject type.
- `references/pyth-pitfalls.md`: Exponent math, confidence intervals, staleness, upgrade safety, gas costs, EMA vs spot.

Official docs (fetch at runtime for the latest details):

- https://docs.pyth.network/price-feeds/use-real-time-data/sui
- https://docs.pyth.network/price-feeds/contract-addresses/sui
- https://docs.pyth.network/price-feeds/best-practices

## Use in your agent

- Claude Code: `claude "/suiper:pyth-oracle <your message>"`
- Codex: `codex "/pyth-oracle <your message>"`
- Grok Build: run `grok`, then `/pyth-oracle <your message>` in the session
- Cursor: paste a chat message that includes a phrase like "integrate Pyth price feed", or load `~/.cursor/rules/pyth-oracle.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
