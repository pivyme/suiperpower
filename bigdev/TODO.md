# Suiperpower bigdev TODO

29 phases, AI-skills-first ordering. Source-of-truth plan docs live in `plans/`. Use `plans/README.md` as the index. The build loop reads the per-phase plan reference column to know which doc to load.

Reference patterns (NOT content) may be adapted from `reference/solana-new-main/`. Never bring Solana-specific content, branding, or copy across. Suiperpower is for the Sui network only.

No demo polish phases (the user is not presenting). No landing page polish (a placeholder text page is enough).

Quality bar: `plans/29-DOCS-AUTHORING-STANDARDS.md` for every markdown / JSON file authored. `plans/15-BRAND.md` for every user-facing string. No em-dashes. No banned words. Sui terms capitalized.

## Phase 1: Workspace skeleton [x]
- [x] write `package.json` per `plans/02-PROJECT-STRUCTURE.md` (name `suiperpower`, ESM, NodeNext, `bin: ./dist/cli/index.js`, `engines.node >= 20`, devDeps `tsx` + `typescript` + `@types/node`, prod dep `convex` only)
- [x] write `pnpm-workspace.yaml` listing `cli`, `convex`
- [x] write `tsconfig.json` (strict, ESM, NodeNext, `outDir: dist`, `rootDir: .`, `module: NodeNext`, `target: ES2022`)
- [x] write `.npmignore` excluding `plans/`, `bigdev/`, `reference/`, `web/`, dev configs
- [x] write `.editorconfig` (utf-8, lf, 2-space indent, final newline)

## Phase 2: CLI brand + color foundation [x]
- [x] write `cli/branding.ts` per `plans/08-CLI-DESIGN.md` (single source of truth, `BRAND` const exports `PRODUCT_NAME`, `TAGLINE`, `INSTALL_URL`, `WEBSITE_URL`, `GH_REPO` placeholder, `NPM_PKG`, `CONFIG_DIR`, `CONVEX_URL_DEFAULT` placeholder, `TELEGRAM_URL`, `HACKATHON_URL`, `SUBMISSION_URL`)
- [x] write `cli/colors.ts` (raw ANSI helpers, no chalk dep)
- [x] write `cli/banner.ts` (Suiperpower ASCII banner, uses colors.ts, prints tagline `think. build. ship.`)
- [x] write `cli/index.ts` dispatcher stub per `plans/08-CLI-DESIGN.md` (dynamic-import handlers map, `--version`, `--help`, fallthrough to interactive-onboarding when no args)

## Phase 3: Phase-handoff context-file spec [x]
- [x] write `skills/data/specs/phase-handoff.md` per `plans/30-SHARED-GUIDES-SPEC.md` (idea-context, build-context, deploy-context, submission-context, learnings; field rules; merging rules; bootstrap rules)
- [x] include the canonical section headers every skill must use (Chosen Idea, Stack, Move Package, Deploy, Submission, etc.)
- [x] include the timestamp / append-only / non-deletion rules verbatim

## Phase 4: Sui knowledge core docs [x]
- [x] write `skills/data/sui-knowledge/01-what-and-why-sui.md` per `plans/06-SUI-KNOWLEDGE-BASE.md` outline
- [x] write `skills/data/sui-knowledge/02-what-makes-sui-unique.md`
- [x] write `skills/data/sui-knowledge/03-move-and-objects.md`
- [x] write `skills/data/sui-knowledge/04-protocols-and-sdks.md`
- [x] write `skills/data/sui-knowledge/05-app-layer-and-consumer.md`
- [x] write `skills/data/sui-knowledge/06-opensource-research.md`

## Phase 5: Sui cookbook + sponsor knowledge docs [x]
- [x] write `skills/data/sui-knowledge/cookbook-index.md` linking to recipes (Move, dapp-kit, Walrus, DeepBook, Scallop, zkLogin)
- [x] write `skills/data/sui-knowledge/sponsor-docs/walrus.md` per `plans/11-SPONSOR-INTEGRATION.md`
- [x] write `skills/data/sui-knowledge/sponsor-docs/deepbook.md`
- [x] write `skills/data/sui-knowledge/sponsor-docs/scallop.md`
- [x] write `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`
- [x] write `skills/data/sui-knowledge/sponsor-docs/ottersec-checklist.md`

## Phase 6: Shared procedural guides [ ]
- [ ] write `skills/data/guides/rpc-wallet-guide.md` per `plans/30-SHARED-GUIDES-SPEC.md`
- [ ] write `skills/data/guides/deploy-runbook.md` (Sui CLI publish flow, devnet to mainnet, cost ref)
- [ ] write `skills/data/guides/security-checklist.md` (P0 to P3, Sui Move specific findings only)
- [ ] write `skills/data/guides/package-id-capture.md` (jq recipe, deploy-context.md write rules)
- [ ] write `skills/data/guides/deepsurge-submission.md` per `plans/10-HACKATHON-SUBMISSION.md`

## Phase 7: Curated idea sources [ ]
- [ ] write `skills/data/ideas/sui-native-gaps.json` per `plans/16-CONTENT-PLAN.md` (gaps curated by us; schema in `plans/07-ECOSYSTEM-CATALOG.md`)
- [ ] write `skills/data/ideas/a16z-state-of-crypto-2026.json` (entries adapted to Sui)
- [ ] write `skills/data/ideas/yc-rfs-crypto.json`
- [ ] write `skills/data/ideas/alliance-ideas.json`
- [ ] write `skills/data/ideas/superteam-sui-ideas.json`

## Phase 8: Telemetry preamble injector script [ ]
- [ ] write `scripts/inject-preamble.ts` per `plans/05-SKILL-FORMAT.md` (replaces the bash preamble in any `SKILL.md`, parameterized on `<skill-name>`, `<phase>`, `<version>`)
- [ ] include the verbatim preamble template inside the script as a constant
- [ ] add a `pnpm preamble:check` script entry to `package.json` that runs the injector in `--check` mode against every skill

## Phase 9: Canonical sample skill, build-with-move [ ]
- [ ] write `skills/build/build-with-move/SKILL.md` per `plans/22-SAMPLE-SKILL.md` (full content, run preamble injector after)
- [ ] write `skills/build/build-with-move/agents/openai.yaml` mirroring the frontmatter
- [ ] write `skills/build/build-with-move/references/move-syntax-cheatsheet.md`
- [ ] write `skills/build/build-with-move/references/common-move-pitfalls.md`
- [ ] write `skills/build/build-with-move/references/package-manifest-example.md`

## Phase 10: Sui-unique build skills batch 1 [ ]
- [ ] author `skills/build/walrus-storage/` (SKILL.md + agents/openai.yaml + references) per `plans/04-SKILLS-CATALOG.md` and `plans/11-SPONSOR-INTEGRATION.md`. Quality gate: demo retrieves a stored blob and renders it.
- [ ] author `skills/build/deepbook-orderbook/` per same. Quality gate: demo places + settles a real testnet order.
- [ ] author `skills/build/scallop-money-market/` per same. Quality gate: deposit + borrow + repay against live Scallop pool.
- [ ] author `skills/build/sui-zk-login/`. Quality gate: real OAuth provider end-to-end, not stub.
- [ ] author `skills/build/kiosk-marketplace/`. Quality gate: full kiosk listing + purchase flow.

## Phase 11: Sui-unique build skills batch 2 [ ]
- [ ] author `skills/build/sponsored-transactions/`. Quality gate: real sponsor flow, not stubbed signing.
- [ ] author `skills/build/ottersec-prep/` referencing `sponsor-docs/ottersec-checklist.md` and `guides/security-checklist.md`. Quality gate: every P0 item has a recorded answer.
- [ ] author `skills/build/openzeppelin-sui-libs/` referencing `sponsor-docs/openzeppelin-sui.md`. Quality gate: identify hand-rolled patterns OZ replaces.
- [ ] author `skills/build/ptb-composer/`. Quality gate: PTB compiles + dry-runs against testnet.
- [ ] author `skills/build/object-model-design/`. Quality gate: owned vs shared decision recorded with rationale per object.

## Phase 12: General build skills [ ]
- [ ] author `skills/build/scaffold-project/` (writes initial `build-context.md`, picks template per `plans/06-SUI-KNOWLEDGE-BASE.md` `04-protocols-and-sdks`)
- [ ] author `skills/build/build-with-claude/` (multi-step pair-programming, quality gate per sub-step)
- [ ] author `skills/build/virtual-sui-incubator/` (deep-dive teaching skill)
- [ ] author `skills/build/build-mobile-sui/` (Sui Mobile SDK, references rpc-wallet-guide.md)
- [ ] author `skills/build/launch-coin/` (Sui Move coin standard, treasury cap handling)
- [ ] author `skills/build/debug-move/` (compile errors + runtime + capability leakage)
- [ ] author `skills/build/review-move/` per `plans/12-ANTI-SLOP-FRAMEWORK.md` (P0-P3 walk, OZ migration suggestions)
- [ ] author `skills/build/navigate-skills/` (meta skill listing what is available, reads `cli/data/sui-skills.json`)

## Phase 13: Frontend / design build skills [ ]
- [ ] author `skills/build/brand-design/` (color, typography, name)
- [ ] author `skills/build/frontend-design-guidelines/`
- [ ] author `skills/build/number-formatting/` (Sui-native helpers, MIST conversion)
- [ ] author `skills/build/page-load-animations/`
- [ ] author `skills/build/design-taste/`

## Phase 14: Idea phase skills [ ]
- [ ] author `skills/idea/find-next-sui-idea/` (writes initial `idea-context.md`, scoring rubric)
- [ ] author `skills/idea/validate-idea/` (stress-test, go/no-go output)
- [ ] author `skills/idea/competitive-landscape/`
- [ ] author `skills/idea/deepbook-research/` (queries DeepBook trading data, finds market niches)
- [ ] author `skills/idea/walrus-research/`
- [ ] author `skills/idea/overflow-copilot/` (past Sui hackathon project search; analog to colosseum-copilot but Sui-only)

## Phase 15: Anti-slop skills [ ]
- [ ] author `skills/build/validate-business-model/` per `plans/12-ANTI-SLOP-FRAMEWORK.md` (5 questions, refuses to claim model exists if unanswered)
- [ ] author `skills/build/retention-loop/` (day 1/2/7/30 anchors, single-paragraph loop output)
- [ ] author `skills/build/will-real-users-pay/` (cheap pricing experiment recipe)
- [ ] author `skills/build/roast-my-product/` (brutal critique, numbered weakness list)
- [ ] author `skills/build/product-review/` (balanced UX review, prioritized roadmap)

## Phase 16: Learn phase skills [ ]
- [ ] author `skills/learn/sui-beginner/` (Sui from scratch, framing for EVM / Solana migrants)
- [ ] author `skills/learn/learn/` (writes session learnings to `.suiperpower/learnings.md` per phase-handoff spec)

## Phase 17: Ship phase skills [ ]
- [ ] author `skills/ship/deploy-to-testnet/` (uses `guides/deploy-runbook.md`, captures package id via `guides/package-id-capture.md`, writes `deploy-context.md`)
- [ ] author `skills/ship/deploy-to-mainnet/` (refuses unless `validate-business-model`, `retention-loop`, `review-move` outputs exist; reuses guides)
- [ ] author `skills/ship/pick-my-sui-track/` per `plans/11-SPONSOR-INTEGRATION.md` (track must score 3 on load-bearing integration)
- [ ] author `skills/ship/submit-to-sui-overflow/` per `plans/10-HACKATHON-SUBMISSION.md` (deepsurge form fill, preflight gate, captures `submission-context.md`)
- [ ] author `skills/ship/create-pitch-deck/`
- [ ] author `skills/ship/marketing-video/`
- [ ] author `skills/ship/video-craft/`
- [ ] author `skills/ship/apply-grant/` (Sui Foundation grant flow)

## Phase 18: Skill router + skills README [ ]
- [ ] write `skills/SKILL_ROUTER.md` per `plans/23-SKILL-ROUTER-SPEC.md` (full per-row routing table, every v1 skill, common-wrong-pick column)
- [ ] write `skills/README.md` (catalog overview grouped by phase, one-liner per skill, links to SKILL.md sources)
- [ ] verify every authored skill ends with the "consult skills/SKILL_ROUTER.md and hand off" line

## Phase 19: Ecosystem catalog data [ ]
- [ ] write `cli/data/clonable-repos.json` per `plans/07-ECOSYSTEM-CATALOG.md` (Sui ecosystem repos, schema validated, sorted alphabetically by id, ~40 entries seed list)
- [ ] write `cli/data/sui-skills.json` (Sui ecosystem-published skills: Walrus, DeepBook, Scallop, OZ, OtterSec entries; schema in 07)
- [ ] write `cli/data/sui-mcps.json` (Sui-relevant MCP servers)
- [ ] write `cli/data/sui-ideas.json` (top idea picks promoted from `skills/data/ideas/*.json`, deduped)

## Phase 20: CLI install / health commands [ ]
- [ ] write `cli/init.ts` per `plans/03-INSTALL-FLOW.md` and `plans/08-CLI-DESIGN.md` (writes to `~/.claude/skills`, `~/.codex/skills`, `~/.cursor/rules`; manifest at `~/.suiperpower/skills-installed.json`; supports `--vendor`, `--convex-url`, `--agent`)
- [ ] write `cli/agent-cli.ts` (detect / install Claude Code, Codex; detect Cursor; never block)
- [ ] write `cli/doctor.ts` (status table per `plans/08-CLI-DESIGN.md`, never exits non-zero, surfaces Sui CLI version, active env, gas address)
- [ ] write `cli/update.ts` (calls `init.ts` after `npm install -g suiperpower@latest`, prints changelog summary)
- [ ] write `cli/uninstall.ts` (reads manifest, removes only files we own, prompts before deleting `~/.suiperpower/`)

## Phase 21: CLI utility commands [ ]
- [ ] write `cli/telemetry.ts` (tiny helper for CLI commands; same Convex schema; respects tier in `~/.suiperpower/config.json`)
- [ ] write `cli/feedback.ts` (interactive prompts: skill, rating, free-text, optional contact; submits via Convex)
- [ ] write `cli/update-check.ts` (async `npm view suiperpower version` cached 24h in `~/.suiperpower/.update-check`, one-line nudge)
- [ ] write `cli/completion.ts` (bash + zsh completion scripts emitted to stdout)
- [ ] write `cli/workspace-setup.ts` (creates `.suiperpower/` in user project, README, `.env.example`)
- [ ] write `cli/repos.ts` (reads `cli/data/clonable-repos.json`, renders TUI list)

## Phase 22: CLI interactive TUIs [ ]
- [ ] write `cli/interactive-universal.ts` (shared TUI primitives: list picker, fuzzy-find, keyboard nav, no third-party UI lib)
- [ ] write `cli/interactive-onboarding.ts` (no-args entry, options menu per `plans/08-CLI-DESIGN.md`)
- [ ] write `cli/interactive-skills.ts` (`suiperpower skills` browser)
- [ ] write `cli/interactive-mcps.ts` (`suiperpower mcps` browser)
- [ ] write `cli/interactive-search.ts` (`suiperpower search <query>` and `ideas`; fuzzy match across skills + repos + mcps + ideas)
- [ ] write `cli/interactive-journey.ts` (guided journey TUI, idea -> build -> ship)

## Phase 23: Cursor rules generator [ ]
- [ ] write `scripts/generate-cursor-rules.ts` per `plans/05-SKILL-FORMAT.md` and `plans/09-MULTI-AGENT-PARITY.md` (renders SKILL.md to `.mdc`, inlines `references/` content under "## References (inlined)")
- [ ] wire into `init.ts` so Cursor rules emit to `~/.cursor/rules/` whenever Cursor is detected
- [ ] verify a sample skill (`build-with-move`) round-trips correctly under `--check` mode

## Phase 24: install.sh + curl one-liner host [ ]
- [ ] write `install.sh` per `plans/03-INSTALL-FLOW.md` (banner, prereq check, npm install -g, agent CLI install, `suiperpower init`, `suiperpower doctor`, telemetry opt-in only on TTY, quickstart print). Adapt patterns from `reference/solana-new-main/install.sh` but rebrand fully.
- [ ] copy/symlink `install.sh` into `public/setup.sh` and add `vercel.json` rewrite `/setup.sh -> /public/setup.sh`
- [ ] write `setup` (bash convenience that calls `install.sh` for local dev)
- [ ] write `suiperpower-pass.sh` (local dev helper mirroring `solana-pass.sh` shape but Sui-specific commands)
- [ ] sanity test: `bash install.sh` in a fresh shell does not error out at the prereq + npm-install + init steps (mocked npm registry OK, see Phase 26)

## Phase 25: Convex backend [ ]
- [ ] write `convex/schema.ts` per `plans/13-CONVEX-BACKEND.md` (telemetry + feedback tables, indexes by_skill / by_timestamp)
- [ ] write `convex/telemetry.ts` (`track` mutation; field validation matches schema; respects tier passthrough)
- [ ] write `convex/feedback.ts` (`submit` mutation)
- [ ] write `.env.example` (`NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `SUIPERPOWER_TELEMETRY` override)
- [ ] write `.env.local-stub` (local-mock defaults so loop iterations do not pause for real Convex setup)

## Phase 26: Tests and CI matrix [ ]
- [ ] write skill linter under `scripts/lint-skills.ts` (frontmatter present, name == folder, description trigger phrase count, sections present, telemetry preamble byte-identical, no em-dashes, no banned words, Sui terms capitalized) per `plans/05-SKILL-FORMAT.md` and `plans/15-BRAND.md`
- [ ] write `scripts/lint-catalog.ts` for JSON catalog (schema check, ids sorted alphabetically, every required field present) per `plans/07-ECOSYSTEM-CATALOG.md`
- [ ] write install smoke test (`scripts/test-install.sh`) per `plans/21-TESTING-STRATEGY.md` (fresh container, run install.sh, run `suiperpower doctor`, assert exit 0 and skill count > 0)
- [ ] write multi-agent install matrix test (asserts skills appear under `~/.claude/skills`, `~/.codex/skills`, `~/.cursor/rules`)
- [ ] add `pnpm test`, `pnpm test:install`, `pnpm lint:skills`, `pnpm lint:catalog`, `pnpm typecheck` scripts to root `package.json`

## Phase 27: Website placeholder [ ]
- [ ] scaffold `web/` as a minimal Next.js 14 App Router project (no styling, no Tailwind, no design system; just the framework so Vercel deploy works)
- [ ] write `web/app/page.tsx` with placeholder text only: project name, tagline, a single `pre`-rendered link list pointing at `plans/README.md` and `https://github.com/<your-handle>/suiperpower`. Per user instruction the landing page is intentionally text-only for v1.
- [ ] write `web/app/layout.tsx` (no styling, just metadata)
- [ ] add `web:dev`, `web:build`, `web:start` scripts; verify `pnpm web:build` produces a clean Next build

## Phase 28: Root docs [ ]
- [ ] write `README.md` per `plans/15-BRAND.md` voice (what Suiperpower is, install one-liner, quickstart commands, link to `plans/README.md`, telemetry posture, MIT). No marketing-speak. No banned words.
- [ ] write `AGENTS.md` (Codex / generic-agent context, mirrors `CLAUDE.md` shape)
- [ ] write `CONTRIBUTING.md` per `plans/20-CONTRIBUTING-PLAN.md` (PR shapes, supply-chain rules, reviewer checklists, code-of-conduct outline)
- [ ] write `LICENSE` (MIT)

## Phase 29: Pre-publish gate [ ]
- [ ] write `scripts/publish.ts` (pre-publish: typecheck, lint:skills, lint:catalog, build, smoke-test install in a Docker layer, version sync between `package.json`, `cli/branding.ts`, and `skills-lock.json`)
- [ ] generate `skills-lock.json` listing every shipped skill with sha256 of the rendered file content (manifest used by `update`)
- [ ] verify `package.json` `files` field matches `plans/02-PROJECT-STRUCTURE.md` (dist + skills/ + cli/data/, never plans / bigdev / reference / web)
- [ ] add `publish:dry` script (`npm pack` + diff against expected file list)
- [ ] final: `pnpm publish:dry` clean run; commit; output `<promise>ALL PHASES COMPLETE</promise>`
