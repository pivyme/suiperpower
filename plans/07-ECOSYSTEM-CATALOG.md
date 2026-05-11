# 07. Ecosystem catalog

## Purpose

Four JSON files in `cli/data/`. They are read by skills (for grounded recommendations) and by the website (for the catalog browser). They are the single source of truth for "what exists in the Sui ecosystem that we recommend."

```
cli/data/
  clonable-repos.json     Sui ecosystem repos worth cloning as a starting point
  sui-skills.json         Sui ecosystem-published agent skills (Walrus, DeepBook, Scallop, etc.)
  sui-mcps.json           MCP servers usable for Sui dev
  sui-ideas.json          Curated startup ideas, source-tagged (a16z, YC, Alliance, Sui-native gaps)
```

JSON over Markdown because it is diffable, machine-rendered, and contributors PR a single object.

## Schemas

### clonable-repos.json

```json
{
  "version": "0.1.0",
  "generatedAt": "2026-XX-XXT00:00:00Z",
  "repos": [
    {
      "id": "mysten-sui-examples",
      "name": "Sui Examples",
      "owner": "MystenLabs",
      "url": "https://github.com/MystenLabs/sui-examples",
      "description": "Official example Move packages and dapps from Mysten Labs",
      "category": "examples",
      "tags": ["move", "examples", "official"],
      "license": "Apache-2.0",
      "official": true,
      "stars": 0,
      "lastChecked": "2026-XX-XX"
    }
  ]
}
```

Categories (controlled vocabulary):

- `examples`, official or canonical examples
- `template`, project starters / scaffolds
- `move-lib`, reusable Move libraries
- `frontend`, frontend stacks for Sui dapps
- `backend`, indexers, bots, off-chain workers
- `mobile`, mobile starters
- `defi`, DeFi protocols (DeepBook, Scallop, Cetus, Aftermath, Turbos, Bluefin, NAVI)
- `nft`, NFT / kiosk frameworks
- `storage`, Walrus and adjacent
- `auth`, zkLogin / Enoki / wallet adapter examples
- `oracle`, Pyth, Switchboard
- `cross-chain`, Wormhole, LayerZero
- `tooling`, CLIs, devtools, debuggers
- `audit`, security tooling, OtterSec / OpenZeppelin assets

### sui-skills.json

```json
{
  "version": "0.1.0",
  "generatedAt": "2026-XX-XXT00:00:00Z",
  "skills": [
    {
      "id": "walrus-storage-official",
      "name": "Walrus Storage (official skill)",
      "publisher": "Walrus",
      "publisherType": "ecosystem",
      "url": "https://github.com/MystenLabs/walrus/tree/main/skills/...",
      "description": "Official Walrus skill for blob storage on Sui",
      "agents": ["claude", "codex", "cursor"],
      "phase": "build",
      "tags": ["walrus", "storage", "sponsor-headline"],
      "skillsSh": {
        "id": "walrus-storage",
        "npxCmd": "npx skills add pivyme/suiperpower/skills/build/walrus-storage"
      },
      "lastChecked": "2026-XX-XX"
    }
  ]
}
```

`publisherType`: `official` (Sui Foundation / Mysten), `ecosystem` (a project on Sui), `community` (independent author).

`skillsSh` is optional. Present only for skills that ship a per-skill install path via the skills.sh CLI (`npx skills add <github-shorthand>`). The `id` is the shipped folder name, the `npxCmd` is the literal command a user types. The TUI in `cli/interactive-skills.ts` shows this command alongside the catalog entry. For Suiperpower-published skills the path is `pivyme/suiperpower/skills/<phase>/<id>`. For ecosystem skills hosted in their own repos, fill the path their owner publishes.

### sui-mcps.json

```json
{
  "version": "0.1.0",
  "generatedAt": "2026-XX-XXT00:00:00Z",
  "mcps": [
    {
      "id": "blockscout-sui",
      "name": "Blockscout Sui MCP",
      "publisher": "Blockscout",
      "url": "https://...",
      "installCmd": "npx -y blockscout-mcp",
      "configSnippet": "{ \"mcpServers\": { \"blockscout-sui\": { \"command\": \"npx\", \"args\": [\"-y\", \"blockscout-mcp\"] } } }",
      "description": "Query Sui chain data via Blockscout MCP server",
      "tools": ["get_block_info", "get_transaction_info", "..."],
      "useCases": ["analytics", "research", "indexer-replacement"],
      "lastChecked": "2026-XX-XX"
    }
  ]
}
```

If a Sui-native MCP server does not exist for a given need (e.g. dedicated Mysten RPC MCP), we either:

1. List the gap in `19-OPEN-QUESTIONS.md`.
2. Ship a thin wrapper MCP under `mcps/<name>/` in the repo and reference it here.

### sui-ideas.json

```json
{
  "version": "0.1.0",
  "generatedAt": "2026-XX-XXT00:00:00Z",
  "sources": ["a16z-state-of-crypto-2026", "yc-rfs-crypto", "alliance-ideas", "sui-native-gaps"],
  "ideas": [
    {
      "id": "perpetuals-with-deepbook-settlement",
      "title": "Perpetuals using DeepBook as the settlement venue",
      "summary": "1-2 sentence pitch",
      "source": "sui-native-gaps",
      "category": "defi",
      "fitForSui": "DeepBook's CLOB makes funding-rate computation cheap on-chain",
      "marketSignal": "$X trading volume in last 30d",
      "competitors": ["existing-perp-platform-1", "existing-perp-platform-2"],
      "difficulty": "hard",
      "recommendedTrack": "deepbook",
      "addedAt": "2026-XX-XX"
    }
  ]
}
```

Idea sources (initial seed in `16-CONTENT-PLAN.md`):

- `a16z-state-of-crypto-2026` (re-tagged for Sui where applicable)
- `yc-rfs-crypto` (rewritten for Sui where the original was chain-agnostic)
- `alliance-ideas` (cross-chain ideas that fit Sui)
- `sui-native-gaps` (curated by us, things that only make sense because of Sui's primitives)

## Initial seed (v1 launch target counts)

| Catalog | v1 target | v1.1 stretch |
|---|---|---|
| clonable-repos | 40-60 | 80-100 |
| sui-skills | 15-25 (depends on what sponsors have published) | 30-50 |
| sui-mcps | 10-15 | 20-30 (will require us to ship some wrappers) |
| sui-ideas | 150+ | 300+ |

## Initial seed list (clonable-repos starting points)

These are placeholder-confirmed at planning time, each entry needs verification before v1 ship:

**Official / Mysten:**

- mystenlabs/sui (the chain itself, for spelunking)
- mystenlabs/sui-examples
- mystenlabs/dapp-kit (frontend hooks)
- mystenlabs/walrus
- mystenlabs/typescript-sdk
- mystenlabs/sui-rust-sdk

**DeFi:**

- DeepBook (official repo)
- Scallop
- Cetus Protocol
- Aftermath Finance
- Turbos
- Bluefin
- NAVI Protocol

**NFT / Kiosk:**

- Mysten kiosk standard examples
- BlueMove
- Tradeport

**Auth:**

- Enoki
- Slush (Sui Wallet)
- Surf wallet adapter examples

**Storage:**

- Walrus examples
- (any community walrus dapps worth showing)

**Mobile:**

- Sui Mobile SDK examples
- Surf mobile adapter

**Oracles:**

- Pyth Sui examples
- Switchboard Sui

**Cross-chain:**

- Wormhole Sui
- LayerZero Sui

**Audit / Security:**

- OpenZeppelin Sui repos (when published)
- OtterSec public reports / templates

Verification step before v1 ship: run a script that fetches each repo URL, checks 200, fetches license, fetches star count, last commit date. Repos that 404 or have not been updated in 12+ months get flagged for human review.

## Initial seed list (sui-mcps starting points)

To be confirmed during implementation:

- Blockscout Sui MCP (already in our environment, see system reminder above)
- Mysten official MCP if released
- Pyth oracle MCP
- Walrus MCP if Walrus team publishes one

If Sui-side MCP coverage is thin at launch, we ship 3-5 thin wrappers under `mcps/` in the repo (for example, a "sui-rpc" MCP that wraps `sui_getObject`, `sui_getTransactionBlock`, `sui_executeTransactionBlock`).

## Catalog browser on the website

`suiperpower.dev/repos`, `/skills`, `/mcps`, `/ideas` render each JSON file as a filterable table. Pure read-only. Spec in `14-WEBSITE-STRUCTURE.md`.

## How skills consume the catalog

Skills do not bundle ecosystem URLs hardcoded. They ask the user via a flow like:

```
"Looks like you want a Sui DeFi protocol. From the ecosystem catalog:
 - Cetus (concentrated liquidity AMM)
 - DeepBook (CLOB)
 - Scallop (money market, sponsor)
 - Aftermath (multi-product DeFi suite)
 Which fits your idea best, or do you want to pick something else?"
```

The skill loads `cli/data/clonable-repos.json` filtered to `category=defi`, lists them, and lets the user pick. This keeps recommendations always-current without re-authoring skills.

## Update cadence

- Catalog data is updated by PR. Quality gate: every PR that touches a catalog file must include the `lastChecked` date update for affected rows.
- Quarterly: a maintainer runs the verification script, updates `lastChecked` for everything, marks dead repos for removal.
- Pre-Sui Overflow 2026: full audit, every entry verified by a human within the two weeks before launch.

## Contribution path

Adding a repo / skill / MCP is the lowest-friction contribution. Expected PR shape:

1. One row appended to the relevant JSON (sorted alphabetically by id).
2. `lastChecked` set to PR date.
3. PR description includes a link to the upstream and a one-line "why this belongs in the catalog."

Reviewer checks:

- URL is reachable.
- License is permissive (MIT / Apache-2.0 preferred, GPL flagged).
- Description is in our voice (no marketing copy verbatim).
- Category is from the controlled vocabulary.
- No supply-chain risk (e.g. an MCP from an unknown publisher needs maintainer review).

This is the most-PR'd file in the repo. Keep the bar low for additions, high for promotion to "official" status.
