# 16. Content plan, curated ideas

## Purpose

Suiperpower's `find-next-sui-idea` skill needs a real corpus of ideas to recommend from, not the AI's first hunch. This doc lists the sources we curate from, the schema, and what to seed in v1.

## Sources

| Source | What it is | How we use it |
|---|---|---|
| a16z State of Crypto 2026 | a16z annual report with thesis + ideas | Re-tag for Sui where applicable, drop EVM-specific ideas |
| YC Requests for Startups, crypto category | Y Combinator's published RFS | Adapt prompts to "what would this look like on Sui" |
| Alliance DAO ideas | Alliance accelerator's published ideas | Cross-chain ideas, cherry-pick fits |
| Sui-native gaps (curated by us) | Ideas that only make sense because of Sui's primitives | Original content, our differentiator |
| Superteam Sui ideas | If Superteam Sui chapter publishes, ingest | Optional, depends on availability |
| Past Sui Overflow patterns | Winning categories from past hackathons | Pattern-mine for whitespace |
| OpenAI / Anthropic AI agent ideas | If applicable to Sui (AI-on-chain) | Adapt prompts |

## Files

```
skills/data/ideas/
├── a16z-state-of-crypto-2026.json
├── yc-rfs-crypto.json
├── alliance-ideas.json
├── sui-native-gaps.json          ← our original content
├── superteam-sui-ideas.json      ← if available
├── past-overflow-patterns.json   ← curated from past hackathons
└── ai-on-sui.json                ← AI x Sui ideas (small)
```

## Schema (per `07-ECOSYSTEM-CATALOG.md`)

```json
{
  "id": "perpetuals-with-deepbook-settlement",
  "title": "Perpetuals using DeepBook as the settlement venue",
  "summary": "Perp protocol where DeepBook is the on-chain settlement layer instead of a custom AMM",
  "source": "sui-native-gaps",
  "category": "defi",
  "fitForSui": "DeepBook's CLOB makes funding-rate computation cheap on-chain, no AMM impermanent loss",
  "marketSignal": "Perp DEX volume on Sui still under $X, growth runway",
  "competitors": ["bluefin", "vest", "...not on sui yet"],
  "difficulty": "hard",
  "recommendedTrack": "deepbook",
  "sponsorTags": ["deepbook"],
  "addedAt": "2026-XX-XX"
}
```

## Sui-native gaps (our differentiator)

These are ideas that only make sense because of what Sui uniquely enables. Our most defensible content. Initial list (to be expanded during build phase):

### Object model + capabilities

1. **Composable membership / role contracts**, where a user's "membership object" carries capabilities other apps can verify without integration.
2. **Capability-based key management**, granular keys per app per scope (think Sigstore for on-chain).
3. **Object-as-passport apps**, an event ticket / membership / certification that travels across multiple frontends because it is just an object.

### Walrus storage

4. **Permanent personal memory / journal app**, where blob storage is the user's permanent record, social layer optional.
5. **Decentralized podcast / video host** with Walrus as the content layer and Sui-native creator economics.
6. **Provenance-verified AI training datasets** stored on Walrus, sold or licensed via Sui.
7. **Encrypted file vault**, Walrus storage + Sui access control via capabilities.

### DeepBook (CLOB)

8. **Perps with DeepBook settlement** (above).
9. **Limit-order based UI for any token pair**, target users who want CLOB UX not AMM UX.
10. **Dark pools on DeepBook**, batched matching, MEV-resistant.

### Scallop (lending)

11. **Lending with NFT / kiosk-object collateral**, only works when collateral is composable like Sui objects.
12. **Yield aggregator across Scallop / NAVI / Suilend**, single deposit, optimized routing.

### zkLogin + sponsored transactions

13. **Truly walletless social apps** (Sui's wedge), where Google/Apple sign-in IS the wallet, sponsored gas hides the rest.
14. **One-tap on-chain games**, no wallet popups, every action sponsored.
15. **Onchain receipts as a service**, a user signs in with Google, app sponsors gas, every purchase becomes a kiosk receipt.

### Kiosk

16. **Marketplaces for non-NFT objects**, e.g. domains, memberships, certifications.
17. **Cross-marketplace listings**, list once, appear on every kiosk-aware frontend.

### PTBs

18. **Composable strategies as PTB recipes**, user picks from a library of "DeFi recipes" (e.g. "borrow on Scallop, swap on Cetus, deposit to Aftermath") and signs once.

### Sponsored tx

19. **Pay-per-use SaaS that bills in fiat, settles on Sui**, sponsored gas means users never see a wallet.
20. **Onchain customer support tools**, where every support ticket creates a sponsored on-chain object the support team and user can both audit.

### AI x Sui

21. **AI agents with their own Sui-native wallets and capabilities**, agents pay for compute / data via on-chain ops.
22. **Autonomous market makers operated by AI**, transparent strategy on chain, signed by capability.

This is a starting set. Target: 50+ Sui-native-gaps ideas by v1 ship. Build phase fills the rest.

## a16z-state-of-crypto-2026.json (mapping plan)

a16z's 2026 report (publish date in late 2026 if pattern holds; for now we use the 2025 version as a placeholder):

- Read each idea in the original.
- For each, ask: "would this be better on Sui?" If yes, include with `fitForSui:` rationale. If no, drop.
- Re-tag categories to our controlled vocabulary.
- Source citation in every entry.

Example:

```json
{
  "id": "a16z-prediction-markets",
  "title": "Prediction markets with sub-second resolution",
  "summary": "Polymarket-class prediction market with finer event resolution",
  "source": "a16z-state-of-crypto-2026",
  "category": "defi",
  "fitForSui": "Sui's parallel execution + DeepBook settlement enables sub-second markets without bottlenecking",
  "marketSignal": "$2B+ volume on Polymarket in 2025, no Sui-native equivalent",
  "competitors": ["polymarket", "kalshi"],
  "difficulty": "hard",
  "recommendedTrack": "deepbook",
  "sponsorTags": ["deepbook"],
  "addedAt": "2026-XX-XX"
}
```

## yc-rfs-crypto.json (mapping plan)

YC's "Requests for Startups" lists themes YC actively wants to fund. Re-cast those that fit Sui:

- AI agents with on-chain wallets → fits Sui's sponsored tx + zkLogin perfectly
- Stablecoin payment infra → Sui has good stablecoin liquidity (USDC native)
- Verifiable AI inference → fits Sui's parallel execution
- Onchain credit → fits Scallop / capability-based lending

Drop:

- L2 scaling (we are on Sui, the L1 is fast enough)
- ZK rollups for EVM (irrelevant)
- MEV protection (different model on Sui)

## alliance-ideas.json (mapping plan)

Alliance accelerator's published ideas. Take the cross-chain / chain-agnostic ones, cherry-pick fits.

## past-overflow-patterns.json (curated from past hackathons)

Read past Sui Overflow winners (2023, 2024, 2025) and extract:

- Categories that won (and how many submissions in each)
- Categories that did not win (whitespace)
- Demos that were memorable (extract the pattern)

For Suiperpower this is tactical: it tells our `find-next-sui-idea` users "here is what won before, here is what is still open."

## superteam-sui-ideas.json (optional)

If Superteam launches a Sui chapter and publishes ideas, ingest. Otherwise skip in v1.

## ai-on-sui.json

A small dedicated set for AI x Sui. Sui's primitives are a good fit for AI agents:

- Sponsored tx hides gas from agents
- zkLogin gives agents identity
- Capabilities give agents granular permissions
- Walrus stores agent-generated content
- DeepBook lets agents trade

Examples:

- Agent-operated DAO treasuries
- Onchain RAG corpora (Walrus + Sui)
- Agent-curated content marketplaces
- Verifiable AI inference receipts
- Agent-to-agent payment rails on Sui

## Quality bar for ideas

Every idea entry must:

1. Have a clear `fitForSui:` (1-2 sentences). If we cannot articulate why Sui specifically, we drop the idea.
2. Have a `category:` from our controlled vocabulary.
3. Have a `marketSignal:` (real market data, even if rough).
4. Have at least one `competitor:` or "no Sui-native equivalent" with explanation.
5. Have a `recommendedTrack:` from the Overflow track list (or "general").
6. Have an `addedAt:` date.

Ideas that cannot meet this bar do not ship in v1.

## Volume target

| Source | v1 target | v1.1 target |
|---|---|---|
| Sui-native gaps | 50 | 100 |
| a16z 2026 (Sui-mapped) | 20 | 40 |
| YC RFS (Sui-mapped) | 15 | 30 |
| Alliance | 10 | 20 |
| Past Overflow patterns | 20 | 40 |
| AI on Sui | 10 | 25 |
| Superteam (if available) | 0-15 | 20-40 |
| **Total** | **~140-150** | **~275-300** |

solana-new shipped with 220+ ideas. We can match that by v1.1, ship lighter for v1 to keep launch tight.

## Editorial rules

- No marketing copy from sources verbatim. Always restate in our voice.
- Source citation required for every idea.
- Prefer specific over generic. "Perps with DeepBook settlement" beats "DeFi protocol on Sui."
- Prefer ideas with measurable market signal over speculative ones.
- Tag sponsor track only if the integration would actually be load-bearing.

## How `find-next-sui-idea` consumes the corpus

The skill:

1. Interviews the user (background, interests, available time, team size).
2. Filters the corpus by user-stated constraints.
3. Ranks the top 5-7 matches with rationale.
4. Lets the user dive into one for a deeper validate-idea pass.
5. Writes `.suiperpower/idea-context.md` with the chosen idea.

User can also paste a custom idea, in which case the skill skips the corpus lookup and goes straight to validation.

## Update cadence

- Quarterly content review: prune stale, add fresh.
- Pre-Overflow 2026: full content refresh, ensure every idea is current.
- Each new sponsor doc release: add 5-10 new ideas tied to that sponsor's tech.

## Risk: outdated ideas

Mitigation: every idea has `addedAt:`. Skills filter out ideas older than 18 months by default unless the user explicitly asks for "evergreen" ideas.

## Risk: AI hallucinating ideas not in the corpus

`find-next-sui-idea` is instructed to recommend ONLY from the corpus, with one exception: if the user describes a hyper-specific intent that the corpus does not cover, the skill may suggest one custom idea, clearly marked "(off-corpus, AI-generated)."

This keeps the corpus the source of truth for "validated" ideas, while not being a hard wall.
