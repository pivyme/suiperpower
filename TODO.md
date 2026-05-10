# TODO, Suiperpower phased build plan

Phased implementation steps for Suiperpower v1. Each phase is independently testable. Ordered by dependency. Polish phases at the end.

When the build loop runs, it works through these top to bottom, marking each `[x]` when done. Steps are concrete and checkable.

References throughout point to the source-of-truth docs in `plans/` (now 30 docs covering 00-29).

---

## Phase 0: Repo bootstrap [ ]
- [ ] Resolve open questions 1-5 from `plans/19-OPEN-QUESTIONS.md` (GitHub handle, domain, npm name, Convex account, Vercel account)
- [ ] `git init`, push to `github.com/<your-handle>/suiperpower`
- [ ] Set up pnpm workspace (root `package.json`, `pnpm-workspace.yaml`)
- [ ] Add `tsconfig.json` (strict, ESM, NodeNext)
- [ ] Add `.gitignore`, `.npmignore`, MIT `LICENSE`
- [ ] Add `vercel.json` (rewrite `/setup.sh` → `/public/setup.sh`)
- [ ] Add `CLAUDE.md` (already authored under root)
- [ ] Add `README.md` (already authored under root)
- [ ] Author `CONTRIBUTING.md` from `plans/20-CONTRIBUTING-PLAN.md`
- [ ] Author `AGENTS.md` (Codex / generic-agent context, mirrors `CLAUDE.md`)
- [ ] Set up `markdownlint` config per `plans/29-DOCS-AUTHORING-STANDARDS.md`

## Phase 1: branding.ts (single source of truth) [ ]
- [ ] Create `cli/branding.ts` with all brand strings from `plans/15-BRAND.md` and `plans/08-CLI-DESIGN.md`
- [ ] Export `BRAND` const including PRODUCT_NAME, INSTALL_URL, GH_REPO, NPM_PKG, CONFIG_DIR, etc.
- [ ] Resolve placeholder `<your-handle>` after Phase 0 question 1 is answered

## Phase 2: install.sh + setup.sh hosting [ ]
- [ ] Author `install.sh` mirroring `reference/solana-new-main/install.sh`, branded for suiperpower per `plans/03-INSTALL-FLOW.md`
- [ ] Add Cursor to the agent CLI install loop
- [ ] Add `public/setup.sh` symlinking or copying `install.sh`
- [ ] Verify `vercel.json` rewrite serves `/setup.sh` with the script content

## Phase 3: CLI skeleton [ ]
- [ ] `cli/index.ts` dispatcher with dynamic imports per command
- [ ] `cli/banner.ts` with the suiperpower ASCII banner
- [ ] `cli/colors.ts` (raw ANSI helpers, no chalk)
- [ ] `cli/init.ts` minimal version: writes config dir, prints quickstart
- [ ] `cli/doctor.ts` minimal version: prints env health table
- [ ] `cli/uninstall.ts`
- [ ] `cli/agent-cli.ts` (detect Claude / Codex / Cursor)
- [ ] `package.json` `bin` field pointing to compiled `cli/index.js`
- [ ] Local test: `pnpm dev init` and `pnpm dev doctor` run cleanly

## Phase 4: First five skills end-to-end [ ]
- [ ] Author `skills/idea/find-next-sui-idea/SKILL.md` per `plans/05-SKILL-FORMAT.md`, modeled on `plans/22-SAMPLE-SKILL.md`
- [ ] Author `skills/build/scaffold-project/SKILL.md`
- [ ] Author `skills/build/build-with-claude/SKILL.md`
- [ ] Author `skills/build/build-with-move/SKILL.md` (use `plans/22-SAMPLE-SKILL.md` directly as the reference)
- [ ] Author `skills/ship/deploy-to-testnet/SKILL.md`
- [ ] Add `agents/openai.yaml` for each
- [ ] Author `scripts/inject-preamble.ts` to inject the canonical telemetry preamble
- [ ] Run injector across all five skills
- [ ] Author `skills/SKILL_ROUTER.md` from `plans/23-SKILL-ROUTER-SPEC.md`
- [ ] `init` writes them to `~/.claude/skills/`

## Phase 5: Multi-agent install [ ]
- [ ] `cli/init.ts` writes to `~/.codex/skills/` (full skill folder)
- [ ] `scripts/generate-cursor-rules.ts` converts SKILL.md + references → `.mdc`
- [ ] `cli/init.ts` writes generated `.mdc` files to `~/.cursor/rules/`
- [ ] `~/.suiperpower/skills-installed.json` manifest written for uninstall safety
- [ ] Test: install fresh on a machine, confirm all three dirs populated

## Phase 6: Knowledge base + shared guides v0 [ ]
- [ ] `skills/data/sui-knowledge/01-what-and-why-sui.md`
- [ ] `skills/data/sui-knowledge/03-move-and-objects.md`
- [ ] `skills/data/sui-knowledge/cookbook-index.md`
- [ ] `skills/data/sui-knowledge/sponsor-docs/walrus.md`
- [ ] `skills/data/sui-knowledge/sponsor-docs/deepbook.md`
- [ ] Author shared guides per `plans/30-SHARED-GUIDES-SPEC.md`:
  - [ ] `skills/data/guides/rpc-wallet-guide.md`
  - [ ] `skills/data/guides/deploy-runbook.md`
  - [ ] `skills/data/guides/security-checklist.md`
  - [ ] `skills/data/guides/package-id-capture.md`
  - [ ] `skills/data/guides/deepsurge-submission.md`
- [ ] Author phase-handoff spec: `skills/data/specs/phase-handoff.md` per `plans/30-SHARED-GUIDES-SPEC.md`
- [ ] Cross-reference: `build-with-move` SKILL.md links to 03-move-and-objects
- [ ] Cross-reference: `scaffold-project` links to walrus.md when storage intent
- [ ] Cross-reference: `deploy-to-testnet` and `deploy-to-mainnet` link to `deploy-runbook.md` and `package-id-capture.md`

## Phase 7: Catalog v0 [ ]
- [ ] `cli/data/clonable-repos.json` with 15-20 entries (Mysten official + DeFi + auth + storage)
- [ ] `cli/data/sui-mcps.json` with 5-8 entries (Blockscout Sui + any sui-side MCPs found)
- [ ] `cli/data/sui-skills.json` with 5-10 ecosystem skills
- [ ] `cli/data/sui-ideas.json` with 50+ entries (Sui-native gaps + a16z mapped + YC RFS mapped)
- [ ] `cli/repos.ts` (`suiperpower repos` command renders the JSON)
- [ ] CI script: verify all repo URLs return 200, all `lastChecked` dates present

## Phase 8: Convex backend [ ]
- [ ] `convex/schema.ts` per `plans/13-CONVEX-BACKEND.md`
- [ ] `convex/telemetry.ts` (track mutation)
- [ ] `convex/feedback.ts` (submit mutation)
- [ ] `npx convex deploy` to staging
- [ ] CONVEX_URL added to `cli/branding.ts`
- [ ] Telemetry preamble fires successfully (verify event in Convex dashboard)

## Phase 9: Hackathon submission generator [ ]
- [ ] Author `skills/ship/submit-to-sui-overflow/SKILL.md` per `plans/10-HACKATHON-SUBMISSION.md`
- [ ] Author `skills/ship/pick-my-sui-track/SKILL.md`
- [ ] Author `skills/data/guides/deepsurge-submission.md`
- [ ] Author `skills/data/guides/package-id-capture.md`
- [ ] `deploy-to-testnet` skill captures package-id and writes to `.suiperpower/deploy-context.md`
- [ ] Test: full journey on a sample project, generate a submission package, manually verify it would paste into deepsurge.xyz

## Phase 10: Anti-slop skills [ ]
- [ ] Author `skills/build/validate-business-model/SKILL.md`
- [ ] Author `skills/build/retention-loop/SKILL.md`
- [ ] Author `skills/build/will-real-users-pay/SKILL.md`
- [ ] Author `skills/build/roast-my-product/SKILL.md`
- [ ] Author `skills/build/product-review/SKILL.md`
- [ ] Author `skills/build/review-move/SKILL.md`
- [ ] Inject anti-slop quality gates into all build / ship skills (per `plans/12-ANTI-SLOP-FRAMEWORK.md`)

## Phase 11: Sui-unique skills (object model + Move depth) [ ]
- [ ] Author `skills/build/ptb-composer/SKILL.md`
- [ ] Author `skills/build/object-model-design/SKILL.md`
- [ ] Author `skills/build/sui-zk-login/SKILL.md`
- [ ] Author `skills/build/sponsored-transactions/SKILL.md`
- [ ] Author `skills/build/kiosk-marketplace/SKILL.md`
- [ ] Author `skills/build/launch-coin/SKILL.md`
- [ ] Author `skills/build/debug-move/SKILL.md`
- [ ] Add references for each as needed

## Phase 12: Sponsor skills (deep integrations) [ ]
- [ ] Author `skills/build/walrus-storage/SKILL.md` + references
- [ ] Author `skills/build/deepbook-orderbook/SKILL.md` + references
- [ ] Author `skills/build/scallop-money-market/SKILL.md` + references
- [ ] Author `skills/build/openzeppelin-sui-libs/SKILL.md` + references
- [ ] Author `skills/build/ottersec-prep/SKILL.md` + references
- [ ] Author `skills/data/sui-knowledge/sponsor-docs/scallop.md`
- [ ] Author `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`
- [ ] Author `skills/data/sui-knowledge/sponsor-docs/ottersec-checklist.md`

## Phase 13: Idea + research skills (depth) [ ]
- [ ] Author `skills/idea/validate-idea/SKILL.md`
- [ ] Author `skills/idea/competitive-landscape/SKILL.md`
- [ ] Author `skills/idea/deepbook-research/SKILL.md`
- [ ] Author `skills/idea/walrus-research/SKILL.md`
- [ ] Author `skills/idea/overflow-copilot/SKILL.md`

## Phase 14: Learn + design + remaining build skills [ ]
- [ ] Author `skills/learn/sui-beginner/SKILL.md`
- [ ] Author `skills/learn/learn/SKILL.md`
- [ ] Author `skills/build/virtual-sui-incubator/SKILL.md`
- [ ] Author `skills/build/build-mobile-sui/SKILL.md`
- [ ] Author `skills/build/brand-design/SKILL.md`
- [ ] Author `skills/build/frontend-design-guidelines/SKILL.md`
- [ ] Author `skills/build/number-formatting/SKILL.md`
- [ ] Author `skills/build/page-load-animations/SKILL.md`
- [ ] Author `skills/build/design-taste/SKILL.md`
- [ ] Author `skills/build/navigate-skills/SKILL.md`

## Phase 15: Remaining ship skills [ ]
- [ ] Author `skills/ship/deploy-to-mainnet/SKILL.md`
- [ ] Author `skills/ship/create-pitch-deck/SKILL.md`
- [ ] Author `skills/ship/marketing-video/SKILL.md`
- [ ] Author `skills/ship/video-craft/SKILL.md`
- [ ] Author `skills/ship/apply-grant/SKILL.md`

## Phase 16: Knowledge base depth [ ]
- [ ] `skills/data/sui-knowledge/02-what-makes-sui-unique.md`
- [ ] `skills/data/sui-knowledge/04-protocols-and-sdks.md`
- [ ] `skills/data/sui-knowledge/05-app-layer-and-consumer.md`
- [ ] `skills/data/sui-knowledge/06-opensource-research.md`
- [ ] `skills/data/guides/rpc-wallet-guide.md`
- [ ] `skills/data/guides/deploy-runbook.md`
- [ ] `skills/data/guides/security-checklist.md`
- [ ] `skills/data/specs/phase-handoff.md` (the contract for `.suiperpower/<phase>-context.md`)

## Phase 17: Catalog full v1 [ ]
- [ ] `cli/data/clonable-repos.json` extended to 40-60 entries
- [ ] `cli/data/sui-mcps.json` to 10-15 (build wrappers under `mcps/` if needed)
- [ ] `cli/data/sui-skills.json` to 15-25
- [ ] `cli/data/sui-ideas.json` to 150+
- [ ] CI script verifies all entries

## Phase 18: CLI complete [ ]
- [ ] `cli/interactive-onboarding.ts` (no-args TUI)
- [ ] `cli/interactive-skills.ts` (`suiperpower skills`)
- [ ] `cli/interactive-mcps.ts` (`suiperpower mcps`)
- [ ] `cli/interactive-search.ts` (`suiperpower search`)
- [ ] `cli/interactive-journey.ts` (`suiperpower journey`)
- [ ] `cli/feedback.ts` (`suiperpower feedback`, posts to Convex)
- [ ] `cli/update-check.ts` (async version-check on every command)
- [ ] `cli/completion.ts` (bash + zsh completions)
- [ ] `cli/workspace-setup.ts` (project bootstrap helper)
- [ ] All TUIs share primitives in `cli/interactive-universal.ts`

## Phase 19: Vendor mode [ ]
- [ ] `cli/init.ts` `--vendor` flag detects project root, copies skills under `.<agent>/skills/suiperpower/`
- [ ] Adds README snippet to project explaining vendor install
- [ ] Test on a sample project

## Phase 20: Convex production + telemetry verified [ ]
- [ ] Convex production deployment, URL committed in `branding.ts`
- [ ] All skill preambles fire telemetry to prod Convex (verified)
- [ ] Telemetry buffer + retry logic for offline mode
- [ ] Per-tier behavior verified (off / anonymous / community)
- [ ] Privacy policy text matches behavior

## Phase 21: Website skeleton [ ]
- [ ] Next.js app under `web/` (or root if simpler)
- [ ] `app/page.tsx` landing per `plans/14-WEBSITE-STRUCTURE.md`
- [ ] `app/install/page.tsx`
- [ ] `app/skills/page.tsx` + `app/skills/[name]/page.tsx`
- [ ] `app/repos/page.tsx`, `app/mcps/page.tsx`, `app/ideas/page.tsx`
- [ ] `app/docs/[slug]/page.tsx` from `skills/data/sui-knowledge/`
- [ ] `app/sponsors/page.tsx`, `app/overflow/page.tsx` (source content from `plans/24-OVERFLOW-2026-PLAYBOOK.md`)
- [ ] `app/privacy/page.tsx` aligned with `plans/25-SECURITY-POSTURE.md` public commitments
- [ ] `app/changelog/page.tsx`, `app/terms/page.tsx`
- [ ] No styling beyond defaults (per project rule, structure-only for v1 plans)

## Phase 22: Vercel deployment + setup.sh live [ ]
- [ ] Deploy site to Vercel production
- [ ] Verify `https://suiperpower.dev/setup.sh` returns the install script
- [ ] Verify all catalog routes render from JSON
- [ ] Privacy / terms pages live and accurate

## Phase 23: Sponsor outreach [ ]
- [ ] Contact Walrus team, share `sponsor-docs/walrus.md`, request review + Overflow channel mention
- [ ] Contact DeepBook team, same
- [ ] Contact Scallop team, same
- [ ] Contact OpenZeppelin Sui team, same
- [ ] Contact OtterSec team, same
- [ ] Track responses in `plans/19-OPEN-QUESTIONS.md`

## Phase 24: Closed beta [ ]
- [ ] Recruit 5-10 friendly Sui builders to test
- [ ] Each runs `find-next-sui-idea → scaffold → build → submit` on a real test idea
- [ ] Capture feedback (skill that broke, skill that confused, missing knowledge, install issue)
- [ ] Triage into fix-now vs fix-post-launch

---

## Polish phases (mandatory before launch)

## Phase 25: Design system foundation [ ]
- [ ] (Per project rule, no styling in plans phase, however the build phase needs basic typography + spacing tokens for the website)
- [ ] Decide on font stack (likely Geist Sans + Geist Mono, mirroring solana-new tone)
- [ ] Color tokens (one accent only, conservative palette)
- [ ] Apply tokens across landing + catalog pages
- [ ] Mobile responsive baseline

## Phase 26: UI states pass [ ]
- [ ] Every catalog page has empty state, loading state, error state
- [ ] No Lorem ipsum, no "<placeholder>", no TODO strings
- [ ] All copy matches `plans/15-BRAND.md` voice
- [ ] Real catalog data wired (not stub data)

## Phase 27: Demo polish + day-of preflight [ ]
- [ ] Run the full canonical journey on a fresh test project. Capture screenshots for the README.
- [ ] README screenshot placeholders filled (`docs/screenshots/*.png`)
- [ ] Day-of launch checklist (per `plans/17-LAUNCH-PLAN.md`) verified
- [ ] Convex telemetry verified live
- [ ] Sponsor mentions confirmed (or noted as not-yet-confirmed)

---

## Distribution / launch (T-0)

## Phase 28: npm publish + GitHub release [ ]
- [ ] `pnpm publish:dry` reviews the package contents
- [ ] `pnpm publish` to npm
- [ ] Git tag the release
- [ ] GitHub release notes from `changelog/`
- [ ] Vercel deploys the new website version

## Phase 29: Announcements [ ]
- [ ] Twitter / X thread (5-7 tweets per `plans/17-LAUNCH-PLAN.md`)
- [ ] Sui Overflow Telegram post
- [ ] Sui Discord post
- [ ] Hacker News Show HN
- [ ] Reddit r/Sui_network
- [ ] Crypto builder communities (Superteam, etc.)

## Phase 30: Inbox + hot-fix window [ ]
- [ ] Monitor GitHub issues, Twitter mentions, Discord pings
- [ ] Acknowledge every non-spam message within 4h on launch day
- [ ] Triage bugs into fix-now vs fix-soon
- [ ] Ship v1.0.x patches as needed in launch week

---

## Notes for the build loop

- Phases 0-9 are blocking for any user value. Ship those first if scope must shrink.
- Phases 10-16 expand the surface area. Slip in this order if needed: 14, 15, 13, 12, 11, 10.
- Phase 17 (full catalog) can be a stretch target for v1. Floor target: 30 repos, 8 mcps, 100 ideas.
- Phases 25-27 are mandatory before launch. Do not skip.
- Phase 24 (closed beta) can run in parallel with Phases 11-16.

Read order before starting any phase: `00-OVERVIEW`, `01-ARCHITECTURE`, the relevant phase doc, plus `22-SAMPLE-SKILL` (if authoring a skill), `21-TESTING-STRATEGY` (before merging anything), `25-SECURITY-POSTURE` (before any install / publish step), and `29-DOCS-AUTHORING-STANDARDS` (always).

If a phase fails the quality gate (build broken, skill doesn't actually work end-to-end), do not move on. Diagnose and fix, then continue.

When stuck on an open question, consult `plans/19-OPEN-QUESTIONS.md` and add a new entry if needed.
