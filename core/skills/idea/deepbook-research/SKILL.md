---
name: deepbook-research
description: Query DeepBook trading data and pool activity to find market niches, underserved pairs, and product opportunities. Use when the user says "DeepBook research", "find DeepBook market gaps", "DeepBook pools", "underserved DeepBook pairs", "trading data on Sui", "DeepBook opportunities", or "what to build on DeepBook". Reads skills/data/sui-knowledge/sponsor-docs/deepbook.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when you finish this skill, run the matching completion command:
#   suiperpower track deepbook-research idea completed
# Or use "failed" / "aborted" if it ended that way. This closes the loop so the
# user's local project log and the maintainer's stats reflect real outcomes.
command -v suiperpower >/dev/null 2>&1 && suiperpower track deepbook-research idea started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Pulls DeepBook on-chain trading data (pools, recent trades, depth, fees) and turns it into a list of product opportunities. The skill identifies underserved pairs, low-spread niches, and observable gaps (no aggregator coverage, no charting tool, no MEV resistance, no specific market-making strategy). Output is a ranked list of candidate ideas grounded in real DeepBook activity, not speculation.

## When to use it

- The user wants to build on DeepBook but is not sure what.
- The user is mid-idea-validation and wants to confirm DeepBook traction.
- The user is sponsor-track-aligned (Sui Overflow DeepBook track) and needs a load-bearing integration angle.

## When NOT to use it

- The user wants to build a DeepBook integration with a chosen idea, route to `deepbook-orderbook`.
- The user wants general Sui idea search, route to `find-next-sui-idea`.
- The user wants Walrus-specific research, route to `walrus-research`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's interest in DeepBook (curious, picking an idea, validating).
- Optional: a specific pair the user is interested in (e.g. SUI/USDC, DEEP/USDC).
- Optional: the user's chain experience (helps tailor the analysis depth).

## Outputs

A research block written to `.suiperpower/idea-context.md` (or a new `.suiperpower/research-deepbook-<timestamp>.md` if no idea is chosen yet):

```markdown
## DeepBook research, <timestamp>

### Pools surveyed
- <pair>: <observed depth>, <observed daily volume>, <fee tier>, <maker concentration>

### Observable gaps
1. <gap>: <evidence from data>, <product idea this enables>
2. ...

### Underserved pairs
- <pair>: <why underserved>, <product idea this enables>

### Risks
- <risk to building on DeepBook today>: <mitigation>

### Citations
- <DeepBook docs link, RPC query examples, dashboards>
```

## Workflow

1. **Confirm scope**
   - Is the user open to any DeepBook angle, or focused on a specific pair or product type?

2. **Survey pools**
   - List active DeepBook v3 pools (read-only RPC, or via DeepBook indexer if available).
   - Note for each: trading pair, fee tier (basis points), 24h volume, current depth at +/-1% of mid.
   - Identify the top 5 by volume; the top 5 by depth; the bottom 5 by spread efficiency.

3. **Walk the gap categories**
   - **Aggregator coverage**: which pools are indexed by aggregators (Cetus, Aftermath, Bluefin, Hop, etc.)? Pools that are active but not aggregated are an opportunity.
   - **Charting / data tooling**: is there a public dashboard for DeepBook activity beyond the official one? If thin, opportunity.
   - **Market-making bots**: are there public bot frameworks? If thin, opportunity for a Sui-native MM strategy as a product.
   - **MEV resistance**: is there observable MEV in the order flow? If yes, opportunity for a private-RFQ or bundled-PTB product.
   - **Specific pairs**: which pairs have no liquidity, no tooling, or no integration with consumer-facing apps?

4. **Surface underserved pairs**
   - Stablecoins paired with sponsor tokens (DEEP, WAL, SCA): often thin liquidity, high spread.
   - Long-tail tokens with active community but no DeepBook listing.
   - Cross-asset pairs that depend on bridged tokens (look for bridge-native pairs).

5. **Identify risks**
   - DeepBook v3 may have specific listing or fee constraints; document.
   - Aggregator dominance: if 90% of volume routes through one aggregator, the moat for new aggregators is small.
   - User audience: most Sui DeepBook users are sophisticated; consumer-facing products need a different audience hypothesis.

6. **Cite the work**
   - Every claim is tied to a DeepBook RPC query, an explorer link, an aggregator docs page, or a dashboard.
   - Refuse to make claims without citations. "I assume" is not citation.

7. **Writeback**
   - Append to the chosen output file.

## Quality gate (anti-slop)

Before reporting done:

- Is every quantitative claim (volume, depth, fee) tied to a citation (RPC query result, dashboard link, docs)?
- Are the gaps named with specific evidence, not abstract "DeepBook needs X"?
- Did the analysis include at least one risk, not just upside?
- Did the writeback happen?
- Did the analysis avoid recommending a product the candidate cannot ship in their stated timeline?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/deepbook-data-queries.md`: RPC query patterns and indexer endpoints for DeepBook.
- `references/gap-categories.md`: The categories of gaps to walk through.

Knowledge docs:

- `skills/data/sui-knowledge/sponsor-docs/deepbook.md`: DeepBook integration knowledge doc.
- `skills/data/sui-knowledge/04-protocols-and-sdks.md`: SDK and integration overview.

## Use in your agent

- Claude Code: `claude "/suiper:deepbook-research <your message>"`
- Codex: `codex "/deepbook-research <your message>"`
- Cursor: paste a chat message that includes a phrase like "DeepBook research", or load `~/.cursor/rules/deepbook-research.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
