---
name: launch-coin
description: Launch a coin on Sui using the standard Move coin module, decide tokenomics, manage TreasuryCap custody, and confirm the coin renders in wallets. Use when the user says "launch a coin on Sui", "create a Sui token", "tokenomics", "issue a Sui coin", "Sui coin standard", "mint a coin on Sui", or "make my own Sui token". Reads .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/03-move-and-objects.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track launch-coin build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track launch-coin build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Authors a Sui coin module using the standard `coin::create_currency` flow, decides tokenomics (fixed supply, mintable, burnable), handles `TreasuryCap` custody, sets the coin metadata so wallets render it correctly, and verifies a real testnet mint and transfer end to end.

Stops the user from making the most common coin-launch mistakes: leaking `TreasuryCap`, using ad-hoc balance tracking instead of `Coin<T>`, or shipping a coin with a nonsensical decimals choice.

## When to use it

- Issuing a fungible token on Sui for any purpose (utility, governance, in-app currency).
- Migrating an existing ERC-20 to Sui-equivalent.
- Adding a per-app reward token to an existing project.

## When NOT to use it

- For NFTs, use `kiosk-marketplace` (with a custom Object type).
- For receipt tokens of a position (e.g. a deposit receipt), use a custom Move struct, not a generic coin.
- If the user has not picked a project yet, use `find-next-sui-idea` first.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project with at least one Move package (or a fresh scaffold).
- Optional: `.suiperpower/build-context.md`.
- Tokenomics decisions: name, symbol, decimals, initial supply, supply policy.

If unclear, interview the user for:

- Coin name and symbol?
- Decimals (6 for stablecoin-like, 9 for SUI-like, justify the choice)?
- Initial supply at launch?
- Fixed supply (burn TreasuryCap after initial mint), capped (mint up to X), or open (no cap)?
- Who holds TreasuryCap (user, multisig, governance, burned)?

## Outputs

- A Move module implementing the coin via `coin::create_currency`.
- A test asserting initial mint and a transfer.
- An on-chain CoinMetadata Object (or a frozen one).
- A live testnet deploy with a real mint and transfer captured.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## launch-coin session, <timestamp>
  - coin: <Symbol> (<full name>)
  - decimals: <n>
  - initial supply: <amount>
  - supply policy: <fixed | capped | open>
  - treasury cap holder: <addr | multisig | burned>
  - first mint tx digest: <digest>
  - first transfer tx digest: <digest>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if present.
   - Confirm tokenomics decisions.

2. **Author the module**
   - Create `sources/<symbol>.move`.
   - Define the OTW: `public struct <SYMBOL> has drop {}`.
   - In `init`, call `coin::create_currency` with the metadata.
   - Decide whether `metadata` is shared, frozen, or transferred.

3. **Supply policy**
   - Fixed: mint the full initial supply in `init`, transfer to a treasury, then `coin::burn(treasury_cap)` at the end of `init` so no more can be minted.
   - Capped: keep `TreasuryCap`, but enforce a cap inside a wrapper `mint` function.
   - Open: keep `TreasuryCap` and document who holds it.

4. **Tests**
   - Test initial mint amount.
   - Test transfer.
   - For capped supply, test that mint at the cap is allowed and over-cap is rejected.

5. **Local build**
   - Run `sui move build` and `sui move test`.

6. **Testnet deploy**
   - Hand off to `deploy-to-testnet` if not already deployed.
   - Capture the `package_id` and the `CoinMetadata` Object id.

7. **Verify in wallet**
   - Have the user import / detect the coin in their wallet.
   - Confirm the icon, symbol, and decimals render correctly.
   - Send a test transfer to a second wallet.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did a real testnet mint and a real transfer settle, with digests recorded?
- Is the supply policy explicit and enforced (fixed: cap burned; capped: cap checked; open: cap holder documented)?
- Is `CoinMetadata` configured with a sane name, symbol, decimals, and icon URL?
- Does at least one wallet render the coin correctly with the chosen metadata?
- Is `TreasuryCap` custody documented (multisig address, burned, or explicit holder), not just sent to a default EOA?
- Are tests covering at least: initial mint amount, a transfer, and (for capped) the cap behavior?

If any answer is no, the skill reports the gap and works through it before claiming the launch is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/coin-module-template.md`: A full Move module skeleton with metadata setup and three supply variants.
- `references/tokenomics-decisions.md`: Decimals, supply, custody decisions and their implications.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/03-move-and-objects.md`: Coin standard context.

## Use in your agent

- Claude Code: `claude "/suiper:launch-coin <your message>"`
- Codex: `codex "/launch-coin <your message>"`
- Cursor: paste a chat message that includes a phrase like "launch a coin on Sui", or load `~/.cursor/rules/launch-coin.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
