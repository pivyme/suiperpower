---
name: kiosk-marketplace
description: Use when building a Sui NFT marketplace on the Kiosk standard, listing NFTs, enforcing transfer policies, or taking royalties.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track kiosk-marketplace build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track kiosk-marketplace build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Builds a marketplace on top of the Kiosk standard. Sets up the seller's Kiosk Object, defines a TransferPolicy with royalty and lock rules, writes list and purchase entry points, and verifies a real listing-to-purchase round-trip on testnet before declaring done. Avoids reinventing escrow logic that Kiosk already provides.

## When to use it

- Building a marketplace, gallery, or trading venue for Sui NFTs.
- The user wants Sui-native royalty enforcement (Kiosk's TransferPolicy is the supported mechanism).
- The user wants a lock-and-list pattern where the seller cannot rug after listing.
- Migrating an EVM-style marketplace to Sui and wanting the right primitive.

## When NOT to use it

- For fungible token trading, use `deepbook-orderbook` instead.
- If the user is launching a coin (fungible), use `launch-coin` instead.
- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md`. Read it if present.
- The asset type to be traded (existing NFT type, or one the user creates).

If unclear, interview the user for:

- What asset type is traded? Existing collection, or a new collection the user mints?
- Royalty policy? Fixed percent, tiered, or none?
- Are listings public, invite-only, or curated?
- Is there a primary sale (mint to first buyer) plus secondary, or only secondary?

## Outputs

- Move module(s) defining the asset type (if new), the TransferPolicy, and any custom rules.
- TS client code that creates a Kiosk per seller, lists items, and executes purchases.
- A live testnet round-trip: list one item, purchase it from a different wallet, observable on suiscan.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## kiosk-marketplace session, <timestamp>
  - asset type: <module::Type>
  - transfer policy id: <id>
  - sample kiosk id (seller): <id>
  - sample listing tx digest: <digest>
  - sample purchase tx digest: <digest>
  - royalty policy: <description>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm asset type, royalty policy, and listing model.

2. **Asset type**
   - If new, define the asset's Move struct with `key + store` abilities.
   - Set up Display for the asset (so wallets render it correctly).
   - Mint a test specimen to the seller wallet.

3. **TransferPolicy**
   - Create a TransferPolicy for the asset type. The publisher (creator) holds the policy capability.
   - Add rules: royalty rule (percentage of sale to creator), lock rule (buyer cannot pull out of Kiosk for N seconds), or custom rules.
   - Persist the policy id.

4. **Seller Kiosk**
   - Create a Kiosk Object for the seller. Holds the asset until sold.
   - Place the asset in the Kiosk and lock it (TransferPolicy enforced).
   - List with a price.

5. **Buyer purchase**
   - From a different wallet, construct the purchase PTB:
     - Pay the seller.
     - Acquire the asset from the Kiosk.
     - Confirm the TransferPolicy (royalty + any rules).
     - Either keep the asset in the buyer's own Kiosk or transfer freely depending on policy.

6. **Royalty verification**
   - Confirm the royalty payment landed in the publisher's address.

7. **Demo settlement**
   - Run the real testnet round-trip end to end. Capture digests.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

9. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new Kiosk integration, TransferPolicy rules added, royalty path live), recommend `verify-against-intent` as the next step so the policy capability holder and royalty enforcement are checked before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did a real listing and a real purchase from a different wallet both settle on testnet, with digests recorded?
- Was the TransferPolicy enforced on the purchase, with the royalty visibly paid out?
- Is the listed asset's Display configured so wallets render it correctly?
- Does the buyer end up either with the asset in their own Kiosk or with a clean transfer that complies with the TransferPolicy?
- If the user defined custom rules (lock, allowlist), is each rule tested with a positive case and an expected-failure case?
- Is there at least one Move test for any custom entry function added (mint, list, custom rule check)?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/kiosk-quickstart.md`: Kiosk creation, listing, purchase recipes for the TS SDK.
- `references/transfer-policy.md`: TransferPolicy, royalty rules, lock rules, custom rules.
- `references/kiosk-pitfalls.md`: Common mistakes (wrong Object type, missing Display, royalty bypass attempts).

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/03-move-and-objects.md`: Object model and capability reference.

## Use in your agent

- Claude Code: `claude "/suiper:kiosk-marketplace <your message>"`
- Codex: `codex "/kiosk-marketplace <your message>"`
- Cursor: paste a chat message that includes a phrase like "build a marketplace on Sui", or load `~/.cursor/rules/kiosk-marketplace.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
