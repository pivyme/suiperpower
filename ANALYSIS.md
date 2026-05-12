# Gap Analysis: Suiperpower vs. solana-new + Sui Overflow 2026

Generated: 2026-05-11
Updated: 2026-05-11 (post-pull, commit `49c6ce0`)

This document identifies what suiperpower is missing compared to solana-new (the reference implementation) and what gaps exist for Sui Overflow 2026 sponsor coverage.

---

## 0. What Changed Since Last Analysis

5 new commits landed (`6d2e920` through `49c6ce0`). Key additions:

| Change | Details |
|--------|---------|
| **Claude Code plugin** | `.claude-plugin/marketplace.json` manifest. `suiperpower` can now be installed as a Claude Code plugin via `/plugin install`. |
| **Project registry** | New `core/cli/projects.ts` (381 lines). `suiperpower projects [show|set|archive]` tracks projects across phases with append-only event log at `~/.suiperpower/projects.json`. |
| **Telemetry routing** | New `core/cli/track.ts` (69 lines). All 45 skill preambles rewritten to route through `suiperpower track <skill> <phase> <status>`. Ties telemetry to the project registry. |
| **Path helpers** | New `core/cli/paths.ts` (51 lines). Centralized package root, skills root, CLI data root resolution. |
| **New scripts** | `generate-marketplace.ts` (regenerates plugin manifest), `test-telemetry.ts` (E2E telemetry test). |
| **Convex generated types** | `convex/_generated/` now has API + data model + server types. `convex.json` and support files added. |
| **Skills CDN endpoint** | `web/public/skills/index.json` now exists (504 lines, 45 skills). |
| **Docs tightened** | `AGENTS.md`, `CONTRIBUTING.md`, `README.md` updated. `pick-my-sui-track` skill significantly revised. |
| **TODO.md deleted** | Phased build plan removed from tracked files. |

What did NOT change: skill count (still 45), catalog data sizes (still 33 repos, 5 MCPs, 7 ecosystem skills), no CI/CD, no website app, no grow/ phase, version still 0.1.0.

---

## 1. Current State Summary

### Suiperpower (what we have)

| Area | Count | Status |
|------|-------|--------|
| Skills | 45 (learn: 2, idea: 6, build: 29, ship: 8) | All fully written with references + openai.yaml |
| Clonable repos catalog | 33 | Thin |
| MCP servers catalog | 5 | Very thin |
| Ecosystem skills catalog | 7 | Very thin |
| Ideas catalog | 15 (CLI) + 48 (skills/data) | Moderate |
| CLI commands | 16 (+projects, +track) | Functional |
| CLI files | 25 (was 22) | 3 new: paths.ts, projects.ts, track.ts |
| Scripts | 11 (was 9) | 2 new: generate-marketplace.ts, test-telemetry.ts |
| Knowledge docs | 7 core + 5 sponsor docs + 5 guides | Solid |
| Convex backend | 2 tables + generated types | Implemented, generated types committed, not deployed |
| Claude Code plugin | `.claude-plugin/marketplace.json` | NEW: Plugin manifest for 45 skills |
| Skills CDN | `web/public/skills/index.json` | NEW: Public JSON endpoint for all skills |
| Website | Static assets only, no Next.js app | Not built |
| CI/CD | None | Not started |
| Tests | Lint + typecheck only, no unit/integration tests | Minimal |
| grow/ phase | 0 skills | Not started |

### solana-new / Superstack (the reference)

| Area | Count | Status |
|------|-------|--------|
| Skills | 32 (idea: 7, build: 19, launch: 6) | All fully written |
| Clonable repos catalog | 131 | Rich |
| MCP servers catalog | 41 | Rich |
| Ecosystem skills catalog | 80 (15 official + 65 community) | Rich |
| Ideas catalog | 515+ curated sources | Very rich |
| CLI commands | 10 + rich TUI modes | Mature |
| Knowledge docs | 7 core + 11 guides + colosseum data + defi data | Solid |
| Convex backend | 2 tables | Deployed |
| Website | solana.new (live) | Live |

---

## 2. Catalog Data Gaps (Critical)

This is the single biggest gap. Our catalog data is a fraction of solana-new's.

| Catalog | Suiperpower | solana-new | Gap Factor |
|---------|-------------|------------|------------|
| Repos | 33 | 131 | 4x fewer |
| MCPs | 5 | 41 | 8x fewer |
| Ecosystem skills | 7 | 80 | 11x fewer |

### What to do

**Repos (`clonable-repos.json`)**: Need 70-100+ Sui ecosystem repos covering:
- DeFi protocols (Cetus, Turbos, Aftermath, Bucket, NAVI, FlowX, Kriya, Hop, Haedal)
- NFT/gaming projects (BlueMove, Keepsake, Clutchy, SuiFrens)
- Infrastructure (Mysten Labs SDK repos, indexers, oracles)
- Agent/AI repos on Sui
- Templates and scaffolds
- Tooling (Sui CLI plugins, Move analyzers, testing frameworks)
- Example apps from Sui docs/cookbook

**MCPs (`sui-mcps.json`)**: Need 20-30+ MCP servers:
- Sui RPC MCP (exists)
- Blockscout (exists)
- DeepBook MCP (exists)
- Walrus MCP (exists)
- Pyth MCP (exists)
- Missing: Cetus, Scallop, NAVI, Turbos, Wormhole, SuiNS, DexScreener for Sui, analytics MCPs, security MCPs, wallet MCPs

**Ecosystem skills (`sui-skills.json`)**: Need 30-50+ entries:
- Community-authored Move skills
- Protocol-specific integration skills
- Security skills
- Framework skills (dapp-kit, Sui SDK, Move Prover)

---

## 3. Skills Gaps vs. solana-new

### Skills solana-new has that we lack an equivalent for

| solana-new Skill | What It Does | Suiperpower Equivalent | Gap Status |
|-----------------|--------------|----------------------|------------|
| `defillama-research` | Real-time DeFi market analysis via DefiLlama API | None | **MISSING**: Need a DeFi research skill that queries Sui DeFi data (DefiLlama has Sui protocols) |
| `build-defi-protocol` | Broad DeFi program development (AMM, lending, vault, DEX) | We have protocol-specific skills (deepbook, scallop) but no broad DeFi skill | **PARTIAL GAP**: Consider a `build-defi-on-sui` umbrella skill |
| `build-data-pipeline` | On-chain data infrastructure (indexer, webhook, analytics) | None | **MISSING**: Sui has indexers (Sui Indexer, custom GraphQL), event subscriptions. Need a skill for this. |
| `verify-humanity-poh` | Bot/sybil protection via Proof of Humanity | None | **MISSING**: Sui has zkLogin which can partially address this. Lower priority. |
| `cso` | Infrastructure-first security audit (OWASP, threat model) | `ottersec-prep` covers audit prep but not infra security | **PARTIAL GAP**: ottersec-prep is Move-focused. No web app security audit skill. |
| `colosseum-copilot` | Hackathon project pattern recognition from 5,400+ projects | `overflow-copilot` (similar concept) | **COVERED** but with less data (fewer historical Overflow projects than Colosseum has) |

### Skills we have that solana-new lacks

Suiperpower has 13 more skills than solana-new. Our extras:

| Skill | Phase | What It Gives Us |
|-------|-------|-----------------|
| `sui-beginner` | learn | EVM/Solana-to-Sui translation (solana-new has `solana-beginner` equivalent) |
| `object-model-design` | build | Sui-specific, no Solana equivalent needed |
| `ptb-composer` | build | Sui-specific PTB composition |
| `sui-zk-login` | build | Sui-specific zkLogin |
| `sponsored-transactions` | build | Sui-specific gas sponsorship |
| `launch-coin` | build | Token launch (solana-new has `launch-token`) |
| `kiosk-marketplace` | build | Sui-specific Kiosk standard |
| `walrus-storage` | build | Sui-specific Walrus integration |
| `openzeppelin-sui-libs` | build | Sui-specific OZ libraries |
| `debug-move` | build | Move-specific debugging |
| `review-move` | build | Move-specific code review |
| `deploy-to-testnet` | ship | Separate testnet deploy (solana-new only has mainnet) |
| `pick-my-sui-track` | ship | Overflow track selection |
| `retention-loop` | build | User retention design |
| `validate-business-model` | build | Business model validation |
| `will-real-users-pay` | build | Customer discovery |
| `virtual-sui-incubator` | build | Deep Sui internals coaching |

---

## 4. Sui Overflow 2026 Sponsor Gaps (High Priority)

### Tracks and Coverage

| Track | Prize Pool | Suiperpower Coverage | Gap |
|-------|-----------|---------------------|-----|
| **Agentic Web** (core) | $30K/$15K/$10K/$7.5K | **NO SKILL** | **CRITICAL GAP**: This is a core track. Need an `agentic-sui` or `build-sui-agent` skill covering AI agents that transact on Sui. |
| **DeFi & Payments** (core) | $30K/$15K/$10K/$7.5K | `deepbook-orderbook`, `scallop-money-market`, `sponsored-transactions` | Covered, but no broad DeFi skill |
| **Infra & DevX** (core) | $30K/$15K/$10K/$7.5K | Multiple build skills, `doctor`, CLI itself | Partially covered. Missing: indexer/data pipeline skill |
| **Walrus** (specialized) | $70K | `walrus-storage`, `walrus-research` | **COVERED** |
| **DeepBook** (specialized) | $70K | `deepbook-orderbook`, `deepbook-research` | **COVERED** |
| **ONE Championship** (specialized) | $70K | No sports/entertainment specific skill | **LOW PRIORITY**: Domain-specific, general build skills apply |
| **EVE** (specialized) | $50K | No EVE-specific skill | **LOW PRIORITY**: EVE Frontier is a crossover event |

### Sponsor Integration Coverage

| Sponsor | Integration Skill | Status |
|---------|------------------|--------|
| Walrus | `walrus-storage` | Covered |
| DeepBook | `deepbook-orderbook` | Covered |
| OpenZeppelin | `openzeppelin-sui-libs` | Covered |
| OtterSec | `ottersec-prep` | Covered |
| Scallop | `scallop-money-market` | Covered |
| Pyth | None | **MISSING**: Oracle price feeds are load-bearing for DeFi. Most 2025 DeFi winners used Pyth. |
| Wormhole | None | **LOW PRIORITY**: Cross-chain bridging, ecosystem sponsor |
| NAVI | None | **MISSING**: Lending/borrowing protocol, ecosystem sponsor with bounties |
| Bucket Protocol | None | **MISSING**: Stablecoin protocol, ecosystem sponsor |
| Seal | None | **MISSING**: On-chain encryption/access control. Used by multiple 2025 winners. Growing relevance. |

---

## 5. Missing Technologies for 2026

| Technology | Current Coverage | What's Needed |
|-----------|-----------------|---------------|
| **AI agents on Sui** | Nothing | Skill covering agent design patterns, on-chain agent wallets, autonomous transaction execution, agent coordination via Sui objects |
| **Seal (encryption/access control)** | Not mentioned in any skill | Reference doc or skill covering Seal's on-chain access control for encrypted data |
| **Pyth oracle** | Not mentioned | Skill or reference covering Pyth price feed integration in Move and TS |
| **Sui indexers / GraphQL** | Not covered | Skill covering custom indexing, event subscriptions, GraphQL queries |
| **dapp-kit / frontend SDK** | `frontend-design-guidelines` exists but is generic | More Sui-specific dapp-kit integration guidance |
| **Move Prover** | Not covered | Reference for formal verification of Move code |
| **SuiNS (Name Service)** | Not covered | Reference for integrating .sui names |
| **Sui Closed-Loop Token** | Covered in `launch-coin` | Verify it covers the Sui-specific closed-loop pattern |

---

## 6. CLI Feature Gaps vs. solana-new

| Feature | solana-new | Suiperpower | Gap |
|---------|-----------|-------------|-----|
| `ship` command (interactive journey) | Yes, with `--yolo` mode | `journey` command exists | Naming difference only, functionally similar |
| Copilot auth (hackathon token management) | Yes (`copilot-auth.ts`, `copilot-client.ts`) | None | **MISSING**: If deepsurge.xyz has an API, could integrate |
| Workspace setup generates multi-agent configs | CLAUDE.md, .cursorrules, codex-instructions.md, codex.json, .env.example | `workspace-setup.ts` exists | Verify it generates all formats |
| Vendor mode (`./setup --vendor`) | Yes, copies into `.claude/skills/` for team git sharing | Not visible | **CHECK**: May exist in setup script |
| Unknown command fallback to search | Yes | Check `index.ts` | **CHECK** |
| Phase auto-detection | Detects project files to suggest current phase | Unknown | **CHECK** |
| Gradient/branded terminal output | 6-stop purple-to-pink gradient | `colors.ts` + `banner.ts` | Exists, verify quality |
| Shell completions | bash + zsh | `completion.ts` exists | **COVERED** |
| Self-update with 24h cache | Yes | `update-check.ts` + `update.ts` | **COVERED** |
| Project tracking / local registry | Not present | `projects.ts` (NEW) | **AHEAD**: We have local project tracking with phase events that solana-new lacks |
| Skill telemetry routing via CLI | Skills call shell functions directly | `track.ts` routes through CLI | **AHEAD**: Cleaner architecture, ties to project registry |
| Claude Code plugin manifest | Not present | `.claude-plugin/marketplace.json` | **AHEAD**: First-class Claude Code plugin install support |
| Plugin marketplace generation | Not present | `generate-marketplace.ts` | **AHEAD**: Automated plugin manifest from skill tree |

---

## 7. Infrastructure Gaps

| Item | Status | Priority |
|------|--------|----------|
| **CI/CD pipeline** (GitHub Actions) | Not started | HIGH: Need at minimum: typecheck, lint, test on PR |
| **ESLint + Prettier** | Not configured | MEDIUM: `pnpm lint` is planned but not wired |
| **Unit/integration tests** | None beyond lint (new `test-telemetry.ts` exists but requires `.env`) | MEDIUM: At least CLI command tests |
| **Convex deployment** | Generated types committed, but no deployed instance | HIGH: Telemetry and feedback are dead without it. The new `track.ts` command writes to Convex but has nowhere to send data. |
| **Website (Next.js)** | Not built. `web/public/skills/index.json` exists as CDN endpoint but no app serves it. | MEDIUM: Marketing site for launch |
| **npm publish** | Gated but not executed | HIGH for launch: Package must be on npm |
| **grow/ phase skills** | 0 skills, no directory | LOW: Post-launch phase |

---

## 8. Priority Action Plan

### P0: Critical for Sui Overflow 2026 launch

1. **Create `agentic-sui` skill** (build phase): AI agents on Sui is a core track with the largest prize pool tier. This is the biggest content gap.
2. **Expand `clonable-repos.json`**: From 33 to 80+ repos. Builders need reference code.
3. **Expand `sui-mcps.json`**: From 5 to 20+ MCP servers. Agent tooling is table stakes.
4. **Deploy Convex backend**: Telemetry and feedback must work for launch.
5. **npm publish the package**: `suiperpower` must be installable via `npm install -g suiperpower`.

### P1: High value for hackathon participants

6. **Create `build-data-pipeline` skill**: Indexers, event subscriptions, GraphQL queries on Sui.
7. **Create Pyth oracle reference or skill**: DeFi builders need oracle integration.
8. **Create Seal reference doc**: Privacy/encryption is a growing theme.
9. **Expand `sui-skills.json`**: From 7 to 30+ ecosystem skills.
10. **Set up GitHub Actions CI**: typecheck + lint + test on every PR.

### P2: Important but not blocking launch

11. **Build the website** (`web/`): Next.js app for suiperpower.dev.
12. **Add NAVI protocol skill or reference**: Ecosystem sponsor with bounties.
13. **Add Bucket Protocol reference**: Stablecoin integration, ecosystem sponsor.
14. **Create `defillama-sui` or DeFi research skill**: Market data for Sui DeFi.
15. **Wire ESLint + Prettier**: Code quality tooling.
16. **Add unit tests**: CLI command tests at minimum.

### P3: Post-launch / nice-to-have

17. **grow/ phase skills**: Post-hackathon growth guidance.
18. **Wormhole cross-chain skill**: Lower demand for Overflow.
19. **EVE Frontier reference**: Niche track.
20. **ONE Championship domain guidance**: Generic consumer app skills cover this.
21. **SuiNS integration reference**: Name service is nice-to-have.
22. **Move Prover reference**: Formal verification for advanced builders.

---

## 9. Detailed Comparison: Skill Phase Mapping

### How phases map between the two projects

| solana-new Phase | Skills | Suiperpower Phase | Skills | Notes |
|-----------------|--------|-------------------|--------|-------|
| idea/ | 7 | learn/ + idea/ | 2 + 6 = 8 | Suiperpower splits into two phases. `solana-beginner` maps to our `sui-beginner` in learn/. |
| build/ | 19 | build/ | 29 | We have 10 more build skills, covering more Sui-specific tech and business validation. |
| launch/ | 6 | ship/ | 9 | We have 3 more ship skills (testnet deploy, track picker, video-craft). |
| (none) | 0 | grow/ | 0 (planned) | Neither project has post-launch growth skills yet. |

### Skills that map 1:1

| solana-new | Suiperpower | Match Quality |
|-----------|-------------|---------------|
| `solana-beginner` | `sui-beginner` | Direct equivalent |
| `learn` | `learn` | Same skill |
| `find-next-crypto-idea` | `find-next-sui-idea` | Direct equivalent |
| `validate-idea` | `validate-idea` | Same skill |
| `competitive-landscape` | `competitive-landscape` | Same skill |
| `scaffold-project` | `scaffold-project` | Direct equivalent |
| `build-with-claude` | `build-with-claude` | Same skill |
| `launch-token` | `launch-coin` | Direct equivalent |
| `debug-program` | `debug-move` | Direct equivalent |
| `review-and-iterate` | `review-move` | Direct equivalent |
| `roast-my-product` | `roast-my-product` | Same skill |
| `product-review` | `product-review` | Same skill |
| `brand-design` | `brand-design` | Same skill |
| `frontend-design-guidelines` | `frontend-design-guidelines` | Same skill |
| `number-formatting` | `number-formatting` | Same skill |
| `page-load-animations` | `page-load-animations` | Same skill |
| `design-taste` | `design-taste` | Same skill |
| `navigate-skills` | `navigate-skills` | Same skill |
| `deploy-to-mainnet` | `deploy-to-mainnet` | Direct equivalent |
| `create-pitch-deck` | `create-pitch-deck` | Same skill |
| `submit-to-hackathon` | `submit-to-sui-overflow` | Direct equivalent |
| `marketing-video` | `marketing-video` | Same skill |
| `video-craft` | `video-craft` | Same skill |
| `apply-grant` | `apply-grant` | Same skill |
| `build-mobile` | `build-mobile-sui` | Direct equivalent |
| `virtual-solana-incubator` | `virtual-sui-incubator` | Direct equivalent |

---

## 10. Sui Overflow 2026 Quick Reference

| Item | Detail |
|------|--------|
| Submission deadline | May 23, 2026 |
| Demo Days | June 13-14, 2026 |
| Winners announced | End of June 2026 |
| Total prizes | $500K+ |
| Core tracks | Agentic Web, DeFi & Payments, Infra & DevX |
| Specialized tracks | Walrus ($70K), DeepBook ($70K), ONE Championship ($70K), EVE ($50K) |
| Special awards | Scallop University Award ($25K), Hippo Community Award ($25K) |
| Submission platform | deepsurge.xyz |
| Key 2025 patterns | Ecosystem integration, UX polish, composability, privacy, real-world use |

---

## 11. What We're Ahead On (vs. solana-new)

These are areas where suiperpower has features or architecture that solana-new does not:

| Feature | Why It Matters |
|---------|---------------|
| **Claude Code plugin manifest** (`.claude-plugin/marketplace.json`) | First-class plugin install, not just raw skill copy |
| **Local project registry** (`projects.ts`) | Track multiple projects across phases with event log |
| **Skill telemetry via CLI routing** (`track.ts`) | Cleaner than shell function calls, ties to project context |
| **Skills CDN endpoint** (`web/public/skills/index.json`) | Machine-readable skill index for tooling integration |
| **13 more skills** (45 vs. 32) | Deeper coverage of Sui-specific tech + business validation |
| **Separate testnet deploy skill** | Safer onboarding path before mainnet |
| **Overflow track picker** (`pick-my-sui-track`) | Hackathon-specific guidance with load-bearing sponsor tests |
| **5 sponsor-specific skills** | Walrus, DeepBook, Scallop, OZ, OtterSec each have dedicated build skills |

---

## 12. Summary

**Suiperpower is ahead on skill count** (45 vs. 32), has deeper Sui-specific coverage (object model, PTBs, zkLogin, Kiosk, sponsored txs), and now has stronger infrastructure (plugin manifest, project registry, telemetry routing, skills CDN). The build phase is particularly strong at 29 skills.

**The critical gaps are:**
1. **Catalog data** is 4-11x thinner than solana-new (33 repos vs. 131, 5 MCPs vs. 41, 7 ecosystem skills vs. 80). This is the biggest gap by volume.
2. **No Agentic Web skill** for the highest-visibility Sui Overflow 2026 core track.
3. **Infrastructure** (CI/CD, Convex deployment, npm publish) is not production-ready. The new telemetry pipeline (`track.ts` + `projects.ts`) is wired but has no deployed backend to receive data.
4. **Missing protocol integrations** (Pyth, Seal, NAVI, Bucket) that 2026 participants will need.

**What improved since initial analysis:**
- Telemetry architecture is now cleaner (CLI-routed, project-aware)
- Claude Code plugin support is a differentiator solana-new lacks
- Skills CDN endpoint enables external tooling
- Contributor docs and `pick-my-sui-track` skill have been refined

The content quality is high. The gap is breadth of catalog data, a few missing skills for the 2026 hackathon landscape, and production infrastructure deployment.
