# 06. Sui knowledge base

## Purpose

The knowledge base gives the AI grounded, current Sui information so skills do not need to re-explain primitives every time. Skills load knowledge docs on demand by relative path. Users can also read them directly.

Source-of-truth upstream: `https://docs.sui.io/`. Knowledge docs do not duplicate every page, they distill what an AI needs to act correctly when paired with skills.

## Files

```
skills/data/sui-knowledge/
├── 01-what-and-why-sui.md
├── 02-what-makes-sui-unique.md
├── 03-move-and-objects.md
├── 04-protocols-and-sdks.md
├── 05-app-layer-and-consumer.md
├── 06-opensource-research.md
├── cookbook-index.md
└── sponsor-docs/
    ├── walrus.md
    ├── deepbook.md
    ├── scallop.md
    ├── openzeppelin-sui.md
    └── ottersec-checklist.md
```

## File outlines

### 01-what-and-why-sui.md

Audience: someone deciding whether Sui is right for their idea.

Sections:

1. What Sui is (single-paragraph definition)
2. Why Sui exists (the design choices, where it sits vs Solana / EVM)
3. When Sui is the right pick (object-centric apps, parallel-execution wins, social UX with zkLogin and sponsored tx)
4. When Sui is the wrong pick (be honest, e.g. when EVM ecosystem reach is the dominant constraint)
5. Status check (mainnet / network health snapshot pointer)
6. Where to go next (pointer to 02 and 03)

Length target: 600-1000 words. Updated each major Sui release.

### 02-what-makes-sui-unique.md

Audience: a dev who has shipped on EVM or Solana and is deciding whether Sui's primitives buy them anything.

Sections:

1. The object model in 5 minutes (vs accounts, vs EVM contracts)
2. Owned vs shared objects, when to use which
3. Capabilities, why they matter for permissions
4. Programmable Transaction Blocks, what they enable
5. Parallel execution, what it actually unlocks
6. Sponsored transactions, the UX impact
7. zkLogin, the social-login wedge
8. Move (Sui flavor), how it differs from Aptos Move and from Rust
9. Kiosk standard, marketplaces without custom programs

Length target: 1500-2500 words. Code snippets minimal, intuition first.

### 03-move-and-objects.md

Audience: an AI skill or a dev writing Move code.

Sections:

1. Move package layout (sources, Move.toml, dependencies)
2. Module declaration, init function, friend / public modifiers
3. Object types, abilities (key, store, copy, drop), the rules
4. Owned, shared, immutable objects, lifecycle
5. Capability pattern (TreasuryCap, AdminCap, custom)
6. Witness pattern (one-time witness, otw)
7. Coin standard
8. Display standard
9. Common patterns: escrow, vault, treasury, registry
10. Common mistakes (mismatched abilities, forgetting `store`, leaking capabilities)
11. Test patterns (sui::test_scenario, expected failures)
12. Building and publishing (`sui move build`, `sui client publish`)

Length target: 3000-5000 words. Code-heavy, copy-paste-ready snippets.

### 04-protocols-and-sdks.md

Audience: a dev integrating with the Sui ecosystem (DEXes, money markets, oracles, indexers).

Sections:

1. RPC endpoints (mainnet, testnet, devnet) and SDK clients (TS SDK, Rust SDK, Python)
2. Wallet adapters (Sui Wallet, Phantom-Sui, Slush, Surf)
3. Indexers (Mysten's indexer, third-party options)
4. DeFi (DeepBook, Cetus, Aftermath, Turbos, Bluefin, Scallop, NAVI)
5. Stablecoins on Sui (USDC, USDT, native options)
6. NFTs (kiosk standard, BlueMove, Tradeport)
7. Cross-chain (Wormhole, LayerZero, IBC for Sui)
8. Oracles (Pyth on Sui, Switchboard)
9. Storage (Walrus, alternative IPFS gateways)
10. Auth (zkLogin providers, Enoki, Privy-on-Sui status)

Length target: 2000-3500 words.

### 05-app-layer-and-consumer.md

Audience: a builder making a consumer-facing app on Sui.

Sections:

1. Frontend stack defaults (Next.js + dapp-kit / Suiet's connect kit)
2. Wallet connection patterns (Slush, Sui Wallet, mobile)
3. zkLogin in production
4. Sponsored tx in production
5. Mobile (React Native + Sui Mobile SDK + Expo)
6. Onboarding patterns (gas-less first action, named accounts)
7. UX gotchas specific to Sui (object versioning, finality timing, fee predictability)
8. Live examples (table of consumer apps actually shipping on Sui)

Length target: 1500-2500 words.

### 06-opensource-research.md

Audience: a dev researching prior art before building.

Sections:

1. How to read a Move package on chain
2. How to find similar projects (suiscan, github topics, ecosystem catalog in this repo)
3. How to evaluate a Sui repo for fork-worthiness
4. License / attribution norms in the Sui ecosystem
5. Reference repos by category (DeFi, NFT, infra, gaming, social)

Length target: 1500-2000 words.

### cookbook-index.md

A directory of cookbook-style snippets keyed by intent. Mirrors solana-new's cookbook-index pattern.

```markdown
# Cookbook Index

Quick recipes by intent. Each entry links to the canonical reference (Sui docs cookbook, Mysten examples, or our own knowledge docs).

| Intent | Recipe pointer |
|---|---|
| Mint a coin | docs.sui.io/guides/developer/coin |
| Sponsor a transaction | docs.sui.io/concepts/transactions/sponsored-transactions |
| Add zkLogin | docs.sui.io/concepts/cryptography/zklogin |
| Store a blob on Walrus | sponsor-docs/walrus.md |
| Place an order on DeepBook | sponsor-docs/deepbook.md |
| Borrow on Scallop | sponsor-docs/scallop.md |
| Build a kiosk | docs.sui.io/standards/kiosk |
| Publish a Move package | 03-move-and-objects.md, "Building and publishing" section |
| ...30+ more entries... |
```

The cookbook-index is the AI's first-stop dispatcher. Skills reference it when the user asks something the skill can answer with a one-line pointer.

## Sponsor docs

Each sponsor doc has the same shape:

```markdown
# <Sponsor> on Sui (knowledge brief)

## What it is
1-2 sentences

## When to use it
bullet list of fit conditions

## Key concepts
glossary of the 5-10 terms an AI needs to use the SDK / API correctly

## Minimal integration recipe
copy-paste-ready snippet for the simplest useful call

## Common pitfalls
known footguns, gas behaviors, version mismatches

## Where to go deeper
links to the sponsor's official docs and our matching skill
```

### sponsor-docs/walrus.md

Walrus is the headline Overflow 2026 partner. Doc covers:

- What Walrus is (decentralized blob storage on Sui)
- Storage model (epochs, certified blobs, deletable / permanent)
- Pricing model (storage cost, write certification)
- TS SDK + CLI
- Minimal recipe: store a file, retrieve by id
- Pitfall: blob lifetime / extension
- Pitfall: encryption is the user's responsibility
- Skill pointer: `walrus-storage`

### sponsor-docs/deepbook.md

DeepBook is the Overflow 2026 track sponsor. Doc covers:

- What DeepBook is (CLOB on Sui, central limit orderbook)
- Pool structure, settlement, fees
- Maker vs taker
- TS SDK
- Minimal recipe: create a pool, place a limit order, fill
- Pitfall: orderbook tick size, lot size constraints
- Skill pointer: `deepbook-orderbook`

### sponsor-docs/scallop.md

Scallop is the university award sponsor. Doc covers:

- What Scallop is (money market on Sui)
- Markets, collateral, borrow caps
- Interest model
- TS SDK
- Minimal recipe: deposit, borrow, repay
- Pitfall: liquidation thresholds, oracle drift
- Skill pointer: `scallop-money-market`

### sponsor-docs/openzeppelin-sui.md

OpenZeppelin is a prize sponsor. Doc covers:

- What OpenZeppelin Sui libraries are (audited primitives, distinct from EVM/Solana libs)
- Key modules (access control, pausable, upgradeable patterns adapted for Move)
- How to depend on them in `Move.toml`
- Minimal recipe per module
- Pitfall: Move's resource semantics differ from Solidity, do not assume API parity
- Skill pointer: `openzeppelin-sui-libs`

### sponsor-docs/ottersec-checklist.md

OtterSec is a prize sponsor and a respected Sui auditor. Doc covers:

- What OtterSec looks for in a Sui Move package
- Pre-audit checklist (tests pass, no `unsafe`, no commented-out checks, abilities reviewed)
- Common findings (capability leakage, missing assertions, race conditions on shared objects)
- How to engage them (link to ottersec.io)
- Skill pointer: `ottersec-prep`

## Update cadence

| Doc | Cadence |
|---|---|
| 01, 02 | Each Sui major release |
| 03 (Move) | Each Move-relevant Sui release |
| 04 (protocols) | Quarterly, also on protocol launches we want to surface |
| 05 (app layer) | Quarterly |
| 06 (research) | Every six months, mostly stable |
| cookbook-index | Continuous, every PR that touches a recipe |
| sponsor-docs/* | Each sponsor's quarterly release; for Overflow 2026, frozen one week before judging |

## Authoring rules

- Fact-check every claim against `docs.sui.io` or the sponsor's official docs at the time of authoring.
- Date-stamp the bottom of each doc with `Last updated: YYYY-MM-DD` and the Sui mainnet version it targets.
- No marketing copy from sponsors verbatim, restate in our voice.
- Code snippets must compile at the time of authoring against the current Sui CLI and TS SDK versions referenced at the top of the doc.
- Keep docs at the listed length targets, longer docs mean the AI loads more context and slows down.

## Skill cross-references

| Knowledge doc | Loaded by skills |
|---|---|
| 01-what-and-why-sui | sui-beginner, find-next-sui-idea |
| 02-what-makes-sui-unique | sui-beginner, virtual-sui-incubator, scaffold-project |
| 03-move-and-objects | build-with-move, ptb-composer, object-model-design, debug-move, review-move, virtual-sui-incubator |
| 04-protocols-and-sdks | scaffold-project, build-with-claude, deepbook-orderbook, scallop-money-market, walrus-storage |
| 05-app-layer-and-consumer | build-with-claude, build-mobile-sui, frontend-design-guidelines, sui-zk-login, sponsored-transactions |
| 06-opensource-research | competitive-landscape, find-next-sui-idea, scaffold-project |
| cookbook-index | navigate-skills, build-with-claude (as router), all build skills |
| sponsor-docs/walrus | walrus-storage, walrus-research, scaffold-project |
| sponsor-docs/deepbook | deepbook-orderbook, deepbook-research |
| sponsor-docs/scallop | scallop-money-market |
| sponsor-docs/openzeppelin-sui | openzeppelin-sui-libs, build-with-move, review-move |
| sponsor-docs/ottersec-checklist | ottersec-prep, review-move |

## What is intentionally NOT in the knowledge base

- Solana / EVM comparisons in depth (a few callouts, not a full chapter, see `02-what-makes-sui-unique.md`)
- Full reproduction of Sui docs (just distillation)
- Marketing collateral
- Project-team biographies
- Anything the AI can find with a web search that does not need persistent context

This keeps the knowledge base lean, current, and worth the AI loading every time.
