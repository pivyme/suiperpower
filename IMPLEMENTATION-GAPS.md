# Implementation Gaps: Suiperpower Completion Plan

Generated: 2026-05-11
Cross-referenced against: ANALYSIS.md, RECHECK.md, RESOURCES.md, solana-new repo, Sui Overflow 2026 official site, 2025 winner patterns

This document is the single source of truth for what suiperpower still needs to reach parity with solana-new (adapted for Sui) and be fully ready for Sui Overflow 2026.

---

## 0. Where We Stand Right Now

| Area | Suiperpower | solana-new | Gap |
|------|-------------|------------|-----|
| Skills | 45 (learn:2, idea:6, build:29, ship:8) | 32 (idea:7, build:19, launch:6) | Ahead by 13 |
| Clonable repos | 33 | 106 | 3.2x behind |
| MCP servers | 5 | 36 | 7.2x behind |
| Ecosystem skills | 7 | 80 (15 official + 65 community) | 11.4x behind |
| Curated ideas | 15 (CLI) + 68 (data/) = 83 total | 521 across 10 sources | 6.3x behind |
| Knowledge docs | 7 core + 5 sponsor + 5 guides = 17 | 7 core + 11 guides + DeFi + Colosseum = 21 | Close |
| CLI commands | 16 | 10 | Ahead |
| CI/CD | None | None | Tied (both missing) |
| Tests | Lint/typecheck only | Lint/typecheck only | Tied |
| Website | Static shell | Separate deployment | Both incomplete |
| Plugin manifest | Yes (.claude-plugin/) | No | Ahead |
| Project tracking | Yes (projects.ts) | No | Ahead |
| Convex backend | Schema + generated types | Schema + deployed | Behind (not deployed) |

**Bottom line**: We lead on skills (45 vs 32), Sui-specific coverage, plugin architecture, and project tracking. We are significantly behind on catalog data volume (repos, MCPs, ecosystem skills, ideas). We also have critical skill gaps for Sui Overflow 2026's new tracks.

---

## 1. Skill Gaps (What to Build)

### 1A. Missing Skills for Sui Overflow 2026

These skills do not exist and are needed for the 2026 hackathon tracks.

| Proposed Skill | Phase | Priority | Why | Covers Tracks |
|---|---|---|---|---|
| `seal-access-control` | build | **P0** | Seal is the #1 new Sui primitive for 2026. 2025 Crypto 1st/4th place winners used it. Required for Walrus access control. No skill exists. | Walrus ($70K), Agentic Web, DeFi, Crypto |
| `pyth-oracle` | build | **P0** | Every DeFi project needs oracle feeds. 2025 DeFi 2nd place and DeepMaker (university) used Pyth. 1500+ feeds available on Sui. | DeFi & Payments ($62.5K), DeepBook ($70K) |
| `build-ai-agent` | build | **P0** | "Agentic Web" is a new core track for 2026 with $62.5K prizes. AI agents transacting on Sui is the theme. No skill exists. Combines PTBs + wallets + possibly Nautilus + Seal. | Agentic Web ($62.5K) |
| `nautilus-offchain` | build | **P1** | Trusted off-chain compute (TEEs) for AI inference, private data, custom oracles. 2025 Crypto 3rd place used it. Launched on mainnet June 2025. | Agentic Web, Infra & DevX |
| `defillama-sui` | idea | **P1** | DeFi market research via DefiLlama API. solana-new has this. Covers TVL analysis, protocol comparison, gap identification for Sui DeFi. | DeFi & Payments |
| `build-data-pipeline` | build | **P1** | Indexers, event subscriptions, GraphQL queries on Sui. solana-new has this. 2025 Infra 1st place (SuiSQL) was a data tool. | Infra & DevX ($62.5K) |
| `suins-integration` | build | **P2** | .sui name resolution + MVR package naming. 2025 Storage 4th place (Walpress) integrated SuiNS. Consumer UX improvement. | All consumer tracks |
| `walrus-sites` | build | **P2** | Decentralized static hosting on Walrus. Relevant for Infra + Walrus tracks. Separate from blob storage. | Walrus ($70K), Infra |
| `cso` (security infra audit) | build | **P2** | solana-new's largest skill (630 lines). Infrastructure-first security audit covering OWASP, STRIDE, dependency supply chain. We have `ottersec-prep` and `review-move` but no broad infra security skill. | All tracks |
| `eve-frontier` | build | **P3** | $50K specialized track. EVE Frontier Smart Assembly system. Niche but lucrative. | EVE ($50K) |

### 1B. Existing Skills That Need Updates

| Skill | What Needs Updating | Priority |
|---|---|---|
| `pick-my-sui-track` | Add 2026 expanded tracks: EVE, ONE Championship, Degen, Payments & Wallets, Entertainment & Culture, Explorations | P0 |
| `overflow-copilot` | Add 2025 winner data for pattern matching (36 main + 10 university winners) | P1 |
| `walrus-storage` | Reference Seal as the access control layer (not just "encryption is your problem") | P1 |
| `scaffold-project` | Add Nautilus, Seal, Pyth as dependency options in the stack decision tree | P1 |
| `submit-to-sui-overflow` | Reflect expanded 2026 track list and new sponsors | P1 |

### 1C. Skills We Have That solana-new Lacks (our advantages)

These are differentiators we should preserve and highlight:

- `sui-beginner` (learn phase, no solana equivalent in separate phase)
- `object-model-design` (Sui-specific, no parallel in Solana)
- `ptb-composer` (Sui-specific PTB composition)
- `sui-zk-login` (Sui-specific zkLogin)
- `sponsored-transactions` (Sui-specific gas sponsorship)
- `kiosk-marketplace` (Sui-specific Kiosk standard)
- `walrus-storage` (Sui-specific Walrus)
- `openzeppelin-sui-libs` (Sui-specific OZ)
- `deploy-to-testnet` (separate testnet deploy, solana-new only has mainnet)
- `pick-my-sui-track` (hackathon-specific with sponsor integration gates)
- `retention-loop`, `validate-business-model`, `will-real-users-pay` (business skills solana-new lacks)

---

## 2. Catalog Data Gaps (What to Populate)

This is the single biggest volume gap. Users running `suiperpower repos`, `suiperpower mcps`, or `suiperpower skills` see a thin catalog.

### 2A. Clonable Repos (33 now, need 80+)

**What solana-new has (106 repos)**: Anchor templates, Metaplex NFT repos, Jupiter aggregator, Raydium AMM, Orca Whirlpool, Helius examples, SPL token repos, Solana mobile examples, AI agent repos, gaming repos, DePIN repos, data pipeline repos.

**What we need to add for Sui**:

| Category | Example Repos to Add | Est. Count |
|---|---|---|
| DeFi protocols | Cetus, Turbos, Aftermath, Bucket, NAVI, FlowX, Kriya, Hop, Haedal | 10-12 |
| NFT/gaming | BlueMove, Keepsake, Clutchy, SuiFrens, Originbyte | 5-7 |
| Infrastructure | Mysten SDK repos (ts-sdks, sui), indexers, suiscan, blockvision | 8-10 |
| AI/Agent | AtomaSui, Sui agent frameworks, MemWal | 3-5 |
| Templates | sui-dapp-scaffold, sui-move-template, starter repos | 5-7 |
| Tooling | Move analyzers, testing frameworks, IDE plugins | 3-5 |
| Sui docs examples | sui/examples/ from MystenLabs/sui, sui-cookbook | 5-8 |
| Walrus ecosystem | walrus-sites, walrus-examples, seal examples | 3-5 |
| DeepBook | deepbookv3, deepbook-sandbox, deepbook examples | 2-3 |
| Cross-chain | Wormhole Sui, LayerZero Sui, CCTP | 2-3 |

**Target**: 80-100 repos

### 2B. MCP Servers (5 now, need 25+)

**What solana-new has (36 MCPs)**: Helius, Jupiter, Phantom, Orca, Metaplex, Tensor, DexScreener, Birdeye, Raydium, Magic Eden, and 26 more.

**What we need to add**:

| MCP | What It Does |
|---|---|
| Cetus MCP | AMM/DEX queries |
| Scallop MCP | Lending protocol queries |
| NAVI MCP | Lending protocol queries |
| Turbos MCP | DEX queries |
| Wormhole MCP | Bridge queries |
| SuiNS MCP | Name resolution |
| DexScreener Sui | Token/pair analytics |
| Blockvision MCP | Sui analytics |
| SuiVision MCP | Explorer data |
| Walrus MCP (extended) | Storage operations |
| DeepBook MCP (extended) | Orderbook queries |
| Pyth MCP | Price feed queries |
| Aftermath MCP | DEX/DeFi queries |
| Sui Move Analyzer MCP | Code analysis |
| Sui Security MCP | Vulnerability detection |

**Target**: 25-30 MCPs

### 2C. Ecosystem Skills (7 now, need 40+)

**What solana-new has (80 skills)**: 15 official Solana skills + 65 community skills covering every major protocol, tool, and framework.

**What we need**: External skills from Mysten Labs, protocol teams, and community.

| Source | Est. Skills |
|---|---|
| MystenLabs/skills (official) | 5-10 |
| MystenLabs/sui-dev-skills | 3-5 |
| Protocol-specific skills (Cetus, NAVI, Turbos) | 5-8 |
| Community Move skills | 5-10 |
| Security skills (Move Prover, audit tools) | 2-3 |
| Framework skills (dapp-kit, Walrus SDK) | 3-5 |
| Agent/AI skills | 2-3 |

**Target**: 40-50 ecosystem skills

### 2D. Curated Ideas (83 total now, need 200+)

**What solana-new has (521 ideas)**: YC crypto companies (71), Superteam ideas (240), a16z big ideas (12), a16z state of crypto (8), Alliance ideas (13), YC RFS (10), Web3 ideas (120), RWA/DeFi (15), Yash DeFi (32).

**What we have**: a16z state of crypto (12), Alliance ideas (10), Sui-native gaps (25), Superteam Sui ideas (9), YC RFS crypto (12) = 68 in data files, 15 in CLI catalog.

**What to add**:

| Source | Est. Ideas |
|---|---|
| Sui Overflow 2025 winner patterns (36 winners) | 36 |
| Sui ecosystem gap analysis (DeFi, gaming, social, infra) | 30-40 |
| Cross-chain idea adaptation from solana-new sources | 40-50 |
| Walrus-specific ideas (storage, sites, Seal combos) | 10-15 |
| DeepBook-specific ideas (trading, analytics, bots) | 10-15 |
| AI/Agent Sui ideas | 10-15 |

**Target**: 200-250 ideas

---

## 3. Infrastructure Gaps

### 3A. Must Have Before Launch

| Item | Status | What To Do |
|---|---|---|
| **Deploy Convex backend** | Schema exists, generated types committed, not deployed | Run `pnpm -F @suiperpower/convex convex:deploy`. Telemetry and feedback are dead without it. |
| **npm publish** | `publish.ts` gate exists, not executed | Run `pnpm publish:dry` then actual publish. Package must be on npm as `suiperpower`. |
| **CI/CD (GitHub Actions)** | No `.github/` directory | Create basic workflow: typecheck, lint:skills, lint:catalog, preamble:check on push/PR. |

### 3B. Should Have for Quality

| Item | Status | What To Do |
|---|---|---|
| **ESLint + Prettier** | Not configured | Add configs, wire `pnpm lint`. solana-new also lacks this, so not a competitive gap, but it is in our plans. |
| **Unit/integration tests** | Zero test files | At minimum: CLI command tests, catalog validation tests. |
| **pnpm-lock.yaml** | Not committed | Commit for reproducible builds. |

### 3C. Nice to Have

| Item | Status | What To Do |
|---|---|---|
| **Website (Next.js)** | Static shell only | Build the landing page at suiperpower.dev. Plans exist in `plans/14-WEBSITE-STRUCTURE.md`. |
| **grow/ phase skills** | 0 skills, directory does not exist | Post-hackathon growth guidance. Lower priority. |

---

## 4. Feature Gaps vs. solana-new

### 4A. Features solana-new Has That We Should Match

| Feature | solana-new Implementation | Suiperpower Status | Priority |
|---|---|---|---|
| **`--agent` flag on all commands** | Every CLI command supports `--agent` for machine-readable JSON output | Needs verification | P1 |
| **Unknown command fallback to search** | Typing an unknown command runs universal search | Needs verification | P2 |
| **`setup --vendor` mode** | Copies skills into project `.claude/skills/` for team sharing via git | Not confirmed | P2 |
| **`skills.tar.gz` packaging** | Vercel serves tarball for remote install without npm | `package-skills.sh` exists, verify it produces tarball | P2 |
| **postinstall auto-init** | `npm install` triggers `init --agent` automatically | Check core/package.json postinstall | P2 |
| **Copilot API integration** | 5,400+ Colosseum projects with PAT auth, similarity search | `overflow-copilot` exists but likely no API (deepsurge.xyz has no public API) | P3 (blocked by API availability) |
| **DefiLlama research** | DeFi market research via API | Missing | P1 (new skill) |
| **Phase handoff spec** | 211-line spec for idea-context.md, build-context.md, learnings.md | `plans/30-SHARED-GUIDES-SPEC.md` exists (our equivalent) | Covered |

### 4B. Features We Have That solana-new Lacks (keep these)

| Feature | Why It Matters |
|---|---|
| `.claude-plugin/marketplace.json` | Namespaced plugin install, no collision with other skill packs |
| Local project registry (`projects.ts`) | Track multiple projects across phases, append-only event log |
| Skill telemetry via CLI routing (`track.ts`) | Cleaner than shell function calls, tied to project context |
| Skills CDN endpoint (`web/public/skills/index.json`) | Machine-readable index for external tooling |
| 4 phases (learn/idea/build/ship) vs 3 | Separate learn phase for Sui onboarding |
| 5 sponsor-specific skills | Walrus, DeepBook, Scallop, OZ, OtterSec each have dedicated skills |
| `skills-lock.json` with SHA-256 hashing | Content-addressed skill manifest for integrity verification |
| Monorepo layout (core/convex/web) | Cleaner separation of concerns |

---

## 5. Sui Overflow 2026 Readiness

### 5A. Track Coverage Matrix

| Track | Prize | Current Coverage | Missing | Ready? |
|---|---|---|---|---|
| **Agentic Web** (core) | $62.5K | None | `build-ai-agent`, `nautilus-offchain`, `seal-access-control` | NO |
| **DeFi & Payments** (core) | $62.5K | deepbook-orderbook, scallop-money-market, sponsored-transactions | `pyth-oracle` | PARTIAL |
| **Infra & DevX** (core) | $62.5K | Multiple build skills, CLI itself | `build-data-pipeline` | PARTIAL |
| **Walrus** (specialized) | $70K | walrus-storage, walrus-research | `seal-access-control`, `walrus-sites` | PARTIAL |
| **DeepBook** (specialized) | $70K | deepbook-orderbook, deepbook-research | `pyth-oracle` (for price-aware trading) | MOSTLY |
| **ONE Championship** (specialized) | $70K | kiosk-marketplace, build-mobile-sui | Gaming-specific skill | PARTIAL |
| **EVE Frontier** (specialized) | $50K | None | `eve-frontier` | NO |
| **Degen** (specialized) | TBD | launch-coin | None critical | YES |
| **Payments & Wallets** (specialized) | TBD | sponsored-transactions, sui-zk-login | None critical | YES |
| **Entertainment & Culture** (specialized) | TBD | kiosk-marketplace | None critical | MOSTLY |
| **Explorations** (specialized) | TBD | scaffold-project | None critical | MOSTLY |
| **University Award** (Scallop) | $25K | scallop-money-market | None critical | YES |

### 5B. 2025 Winner Technology Usage (what we must cover)

| Technology | 2025 Winners Using It | Suiperpower Skill | Gap |
|---|---|---|---|
| **Seal** | ZeroLeaks (Crypto 1st), Sui Shadow (Crypto 4th) | None | CRITICAL |
| **Walrus** | SuiSQL (Infra 1st), SuiSign (Storage 1st), WalGraph (Storage 2nd), SuiMail (Storage 3rd) | walrus-storage | Covered |
| **Pyth** | Pismo Protocol (DeFi 2nd), DeepMaker (University) | None | CRITICAL |
| **Nautilus** | Sui Sentinel (Crypto 3rd) | None | HIGH |
| **DeepBook** | DeepMaker (University), multiple DeFi projects | deepbook-orderbook | Covered |
| **SuiNS** | Walpress (Storage 4th) | None | MEDIUM |
| **zkLogin** | Multiple consumer apps | sui-zk-login | Covered |

---

## 6. Quality Status (from RECHECK.md fixes)

All critical and high severity issues from RECHECK.md have been fixed on the `skill-recheck` branch:

| Category | Original Count | Fixed | Remaining |
|---|---|---|---|
| CRITICAL | 13 | 13 | 0 |
| HIGH | 24 | 24 | 0 |
| MEDIUM | 18 | 18 | 0 |
| LOW | 28 | ~20 | ~8 (enrichment items, not errors) |

Commits on `skill-recheck` branch:
1. `b2d1394` fix: rewrite fabricated OZ skill, fix DeepBook/Scallop/Walrus SDK patterns, fix TreasuryCap safety
2. `f5f9364` fix: migrate knowledge docs and skill references to Sui SDK v2.0
3. `8261d27` fix: walrus deletable default, PTB limit, Seal reference, sponsored-tx types
4. `d3da460` docs: add skill recheck audit, resources, SDK migration analysis
5. `845e778` fix: remaining SDK v2 migrations in deepbook docs and stale OZ cookbook entries
6. `78b7904` fix: align DeepBook tx execution with official docs (client.core.signAndExecuteTransaction)

---

## 7. Prioritized Action Plan

### Phase A: Critical for Overflow 2026 (do first)

| # | Task | Type | Est. Effort | Tracks Covered |
|---|---|---|---|---|
| A1 | Create `seal-access-control` skill | New skill | 1 day | Walrus, Agentic Web, Crypto |
| A2 | Create `pyth-oracle` skill | New skill | 1 day | DeFi, DeepBook |
| A3 | Create `build-ai-agent` skill | New skill | 1 day | Agentic Web |
| A4 | Update `pick-my-sui-track` for 2026 tracks | Skill update | 2 hours | All |
| A5 | Merge `skill-recheck` branch | Git | 5 min | All (quality fixes) |
| A6 | Deploy Convex backend | Infrastructure | 1 hour | All (telemetry) |
| A7 | npm publish `suiperpower` package | Infrastructure | 1 hour | All (install flow) |

### Phase B: High Value (do next)

| # | Task | Type | Est. Effort |
|---|---|---|---|
| B1 | Populate `clonable-repos.json` to 80+ repos | Catalog data | 1 day |
| B2 | Populate `sui-mcps.json` to 25+ MCPs | Catalog data | 0.5 day |
| B3 | Populate `sui-skills.json` to 40+ ecosystem skills | Catalog data | 0.5 day |
| B4 | Create `nautilus-offchain` skill | New skill | 1 day |
| B5 | Create `defillama-sui` idea-phase skill | New skill | 0.5 day |
| B6 | Create `build-data-pipeline` skill | New skill | 0.5 day |
| B7 | Add curated ideas to 200+ total | Catalog data | 1 day |
| B8 | Set up GitHub Actions CI | Infrastructure | 2 hours |
| B9 | Update `overflow-copilot` with 2025 winner data | Skill update | 2 hours |
| B10 | Update `walrus-storage` to reference Seal | Skill update | 1 hour |

### Phase C: Polish (do if time allows)

| # | Task | Type | Est. Effort |
|---|---|---|---|
| C1 | Create `suins-integration` skill | New skill | 0.5 day |
| C2 | Create `walrus-sites` skill | New skill | 0.5 day |
| C3 | Create `cso` (infra security audit) skill | New skill | 1 day |
| C4 | Create `eve-frontier` skill | New skill | 0.5 day |
| C5 | Add `--agent` flag to all CLI commands | CLI feature | 0.5 day |
| C6 | Add `setup --vendor` mode | CLI feature | 2 hours |
| C7 | Wire ESLint + Prettier | Infrastructure | 2 hours |
| C8 | Build website (Next.js) | Website | 2-3 days |
| C9 | Add unit/integration tests | Tests | 1-2 days |
| C10 | Create `grow/` phase skills | New skills | 1-2 days |

---

## 8. What Wins at Sui Overflow (from 2025 data)

Patterns from 599 submissions and 46 winners:

1. **Load-bearing integration**: Judges detect decorative SDK imports. Winners had sponsor tech on the critical path.
2. **Novel primitives, not clones**: AMM clones and basic NFT marketplaces did not win. Yield abstraction (Magma), decentralized SQL (SuiSQL), stealth payments (ZeroLeaks) won.
3. **Working demo over ambitious scope**: One polished flow beats five half-built features.
4. **Walrus + Seal combination**: Most common winning pattern in storage/crypto tracks.
5. **AI + verifiable data**: AI track winners had data verification or marketplace angles, not just chatbot wrappers.
6. **Developer tools can win**: SuiSQL (Infra 1st) and Sui Multisig (Payments 2nd) were developer tools.
7. **University teams are competitive**: 10 teams won $2.5K each via Scallop University Award.

---

## 9. Comparison Summary Table

| Dimension | Suiperpower | solana-new | Verdict |
|---|---|---|---|
| Total skills | 45 | 32 | **We lead** |
| Sui/chain-specific skills | 17 (PTB, zkLogin, Kiosk, Move, etc.) | 8 (Anchor, SPL, PDAs, etc.) | **We lead** |
| Sponsor integration skills | 5 (Walrus, DeepBook, Scallop, OZ, OtterSec) | 0 | **We lead** |
| Business validation skills | 3 (retention, business model, will-users-pay) | 0 | **We lead** |
| Clonable repos | 33 | 106 | **They lead 3.2x** |
| MCP servers | 5 | 36 | **They lead 7.2x** |
| Ecosystem skills | 7 | 80 | **They lead 11.4x** |
| Curated ideas | 83 | 521 | **They lead 6.3x** |
| Plugin architecture | Yes (marketplace.json) | No | **We lead** |
| Project tracking | Yes (projects.ts) | No | **We lead** |
| Security skills | 2 (ottersec-prep, review-move) | 2 (cso, review-and-iterate) | Tied |
| DeFi research skill | No | Yes (defillama-research) | **They lead** |
| Data pipeline skill | No | Yes (build-data-pipeline) | **They lead** |
| Hackathon-specific data | 2025 Overflow gaps, no winner DB | 5,400 Colosseum projects | **They lead** |
| CI/CD | None | None | Tied |
| Tests | Lint only | Lint only | Tied |

---

## 10. TL;DR

**We are ahead on**: skill count, Sui-specific depth, sponsor integrations, plugin architecture, project tracking, business validation skills.

**We are behind on**: catalog data volume (repos 3x, MCPs 7x, ecosystem skills 11x, ideas 6x), DeFi research tooling, 3 critical skills for new 2026 tracks (Seal, Pyth, AI agents), infrastructure deployment (Convex, npm publish, CI/CD).

**Highest impact actions right now**:
1. Create 3 new skills: `seal-access-control`, `pyth-oracle`, `build-ai-agent` (covers $195K in track prizes)
2. Populate catalog data (repos, MCPs, skills, ideas)
3. Deploy Convex + npm publish (make the product installable)
4. Merge `skill-recheck` fixes (quality cleanup)

The skill quality is high after the recheck fixes. The gap is breadth of catalog data and 3 missing skills for the highest-value 2026 hackathon tracks.
