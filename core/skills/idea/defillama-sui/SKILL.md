---
name: defillama-sui
description: Use when researching Sui DeFi market gaps using DefiLlama TVL, yield, and protocol data.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track defillama-sui idea completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track defillama-sui idea started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Fetches live DeFi metrics from DefiLlama's free API (TVL, DEX volumes, lending rates, stablecoin flows) and compares Sui against Ethereum and Solana to surface concrete market gaps. Output is a ranked list of opportunities where Sui has low presence in categories that show high demand on other chains. Every opportunity cites a specific metric.

## When to use it

- The user wants data-driven DeFi ideas on Sui (not vibes, not "what's hot").
- The user is evaluating which DeFi vertical to enter on Sui.
- The user wants to compare Sui DeFi maturity against other L1s.

## When NOT to use it

- The user already has an idea and wants to build it. Route to `validate-idea` or a build-phase skill.
- The user wants DeepBook-specific research. Route to `deepbook-research`.
- The user wants general Sui idea search beyond DeFi. Route to `find-next-sui-idea`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's DeFi interest (broad survey, specific vertical like lending or DEX, yield farming).
- Optional: verticals to focus on (DEXes, lending, stablecoins, derivatives, yield).
- Optional: chains to compare against (defaults to Ethereum + Solana).

## Outputs

A research block written to `.suiperpower/idea-context.md` (or `.suiperpower/research-defillama-<timestamp>.md` if no idea is chosen yet):

```markdown
## DeFi market research (DefiLlama), <timestamp>

### Sui overview
- Total TVL: $X (rank #Y across all chains)
- 24h DEX volume: $X
- Stablecoin market cap: $X
- Active protocols tracked: N

### Cross-chain comparison
| Metric         | Sui     | Ethereum | Solana  |
|----------------|---------|----------|---------|
| TVL            | ...     | ...      | ...     |
| DEX 24h volume | ...     | ...      | ...     |
| Lending TVL    | ...     | ...      | ...     |
| Stablecoin cap | ...     | ...      | ...     |

### Market gaps (ranked by opportunity size)
1. <gap>: <Sui metric> vs <comparison chain metric>, <why this is an opportunity>
2. ...

### Top yield opportunities
- <pool>: <APY>, <TVL>, <protocol>, <risk notes>

### Risks
- <risk>: <mitigation>

### Data sources
- <endpoint called, timestamp, response summary>
```

## Workflow

1. **Confirm scope**
   - Broad DeFi survey, or a specific vertical? Which comparison chains?

2. **Fetch Sui baseline metrics**
   - `GET https://api.llama.fi/v2/chains` for Sui TVL and rank.
   - `GET https://api.llama.fi/v2/historicalChainTvl/Sui` for TVL trend (is it growing, flat, declining?).
   - `GET https://stablecoins.llama.fi/stablecoincharts/Sui` for stablecoin market cap trend.
   - Note: "Sui" is case-sensitive in all DefiLlama endpoints.

3. **Fetch protocol-level data**
   - `GET https://api.llama.fi/protocols` and filter where `chains` includes "Sui".
   - Group Sui protocols by category (DEX, lending, yield, derivatives, stablecoin, liquid staking).
   - Note protocol count per category. Categories with fewer than 3 protocols are potential gaps.

4. **Fetch DEX and fee data**
   - `GET https://api.llama.fi/overview/dexs/Sui` for DEX volume breakdown by protocol.
   - `GET https://api.llama.fi/overview/fees/Sui` for fee and revenue breakdown by protocol.
   - Identify which DEX dominates volume. A single protocol with >60% share signals aggregator or alternative DEX opportunity.

5. **Fetch yield data**
   - `GET https://yields.llama.fi/pools` and filter where `chain === "Sui"`.
   - Sort by APY (descending) and by TVL (descending) separately.
   - Flag pools with high APY but low TVL (potential early opportunities or risk signals).
   - Flag pools with high TVL but low APY (stable but possibly oversaturated).

6. **Compare against Ethereum and Solana**
   - Run the same chain-level queries for each comparison chain.
   - Build the cross-chain comparison table.
   - For each DeFi category, compute: number of protocols, total TVL, total volume.
   - Categories where Sui has <10% of Solana's protocol count are strong gap signals.

7. **Identify and rank gaps**
   - For each gap, state: what the gap is, the specific metric that proves it, why a builder could fill it.
   - Known Sui DeFi protocols to contextualize gaps: DEXes (Cetus CLMM, FlowX V2/V3, Kriya, Turbos, DeepBook V2/V3, Aftermath), Lending (Scallop, NAVI, Suilend, Bucket), Liquid staking (SpringSui, Haedal), Perps/Fees (Bluefin), AMM (STEAMM).
   - Rank by: (demand on comparison chains) x (inverse of Sui presence in that category).

8. **Surface risks**
   - TVL concentration: if one protocol holds >50% of Sui TVL, ecosystem risk is high.
   - Stablecoin depth: low stablecoin cap limits DeFi composability.
   - Bridge dependency: DeFi on Sui depends on bridged assets; map the bridge risk.

9. **Cite everything**
   - Every number links to the API endpoint that produced it.
   - Include the query timestamp. DeFi data moves fast; stale numbers mislead.

10. **Writeback**
    - Append to the chosen output file.

## Quality gate (anti-slop)

Before reporting done:

- Does every opportunity cite a specific metric from a specific DefiLlama endpoint?
- Does the cross-chain comparison use data from the same time window (not mixing cached and live)?
- Did the analysis include at least one risk per gap, not just upside?
- Are yield numbers accompanied by TVL context (high APY on $1k TVL is not an opportunity)?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant):

- `references/defillama-endpoints.md`: All verified DefiLlama API endpoints with response shapes.

Knowledge docs:

- `skills/data/sui-knowledge/06-opensource-research.md`: Open-source research patterns.
- `skills/data/sui-knowledge/04-protocols-and-sdks.md`: SDK and integration overview.

## Use in your agent

- Claude Code: `claude "/suiper:defillama-sui <your message>"`
- Codex: `codex "/defillama-sui <your message>"`
- Cursor: paste a chat message that includes a phrase like "DeFi research on Sui", or load `~/.cursor/rules/defillama-sui.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
