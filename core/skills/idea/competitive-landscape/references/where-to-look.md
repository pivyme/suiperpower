# Where to look for competitors

Sources to scan when building the on-Sui, adjacent-chain, and off-chain rings of the competitive map. Visit at least one source per ring before concluding the map is complete.

## On-Sui ring

- **SuiVision** (suivision.xyz): top dapps by activity, explore the leaderboards.
- **Sui Foundation showcase / blog**: featured projects, recent announcements.
- **Suipiens, Web3Goyala**: ecosystem explorers, often more current than aggregators.
- **DefiLlama Sui chain page**: TVL by category, named projects in each.
- **GitHub topic search**: `topic:sui`, `topic:move`, sort by recently updated. Often surfaces stealth or pre-launch projects.
- **Sui Telegram, Discord**: community channels, search "<your category>" for recent threads.
- **Sui Overflow past projects** (deepsurge.xyz archive): historical hackathon entries, useful for "has anyone tried this before".
- **`cli/data/clonable-repos.json`**: the suiperpower-curated ecosystem catalog.

## Adjacent-chain ring

- **DefiLlama category pages**: cross-chain comparisons, which chain has which players.
- **Token Terminal**: revenue and KPI data for production projects.
- **Dune**: query-driven analytics dashboards, often community-built per category.
- **Crunchbase / Pitchbook**: fundraises in the category, signals which teams have runway.
- **Twitter / X search**: "<category> on <chain>" sorted by latest, often surfaces project announcements.
- **Crypto twitter category lists**: e.g. "DeFi accounts", "infra accounts", curated by community.

For each adjacent-chain incumbent, ask: have they announced Sui support? If yes, when? If they have not, that is either an opportunity (gap) or a signal (chain choice is wrong).

## Off-chain ring

- **Web2 incumbents in the same problem space**: every category has them. Crypto trading -> Robinhood, Coinbase. Decentralized storage -> AWS, IPFS. Identity -> Auth0, Clerk. Payments -> Stripe, Wise.
- **The user's own daily tools**: what does the user use today to solve the problem the candidate aims to solve?
- **Forums / Reddit**: where do users complain about the off-chain solution?

## How to capture findings

Per source visited, write a one-liner:

```markdown
- source: <name + URL>, scope: <on-sui | adjacent-chain | off-chain>, projects found: <list>, time spent: <minutes>
```

Sources matter for two reasons: defensibility (you can show the work) and revisit cadence (categories evolve fast; the user can re-scan in 2-4 months).

## Avoid these sources

- Generic "top 10 Sui projects" listicles SEO content. Often outdated, listicle content optimizes for clicks not accuracy.
- Aggregator dashboards that have not been updated in over 90 days. Stale data is worse than no data.
- LLM-generated competitor lists without citations. Always confirm each name in a primary source.

## Time budget

A useful competitive map takes 60 to 120 minutes:

- 30 min on-Sui ring (visit 3 sources, capture 3-7 projects).
- 30 min adjacent-chain ring (visit 2 sources, capture 3-5 projects).
- 15 min off-chain ring (visit 1-2 sources, capture 1-3 projects).
- 15-30 min synthesis and write-up.

Spending more is rarely useful at this stage; the candidate has not been tested in the market yet, so deeper analysis is over-fitting.
