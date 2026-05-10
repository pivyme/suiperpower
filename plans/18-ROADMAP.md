# 18. Roadmap

## Versions

| Version | Target window | Theme |
|---|---|---|
| v0.1 | T-3w (internal alpha) | Bones working: install + 5-10 skills |
| v0.2 | T-2w (closed beta) | ~25 skills + sponsor docs + submission generator |
| v0.3 / v1.0 | T-1w to T-0 (launch) | ~30 skills + full knowledge base + catalog + website |
| v1.1 | T+4w | Stabilization + Grow phase skills + first community PRs merged |
| v1.2 | T+12w (post-Overflow) | Long-tail skills, knowledge depth, post-hackathon journey |
| v2.0 | 2026 H2 | Major rev: more agents, possibly own MCP server, possibly funding-track skills |

## v0.1 (internal alpha)

**Goal**: Verify the install flow works end-to-end and the canonical journey produces something useful.

Ships:

- CLI: `init`, `doctor`, `--version`, `--help`, basic `branding.ts`
- Install: `install.sh`, `setup.sh` hosted on Vercel from `public/setup.sh`
- Multi-agent install to `~/.claude/skills/` only (Codex + Cursor in v0.2)
- Skills (5-10): `find-next-sui-idea`, `scaffold-project`, `build-with-claude`, `build-with-move`, `deploy-to-testnet`, `submit-to-sui-overflow`
- Knowledge: `01-what-and-why-sui.md`, `03-move-and-objects.md`, one sponsor doc (Walrus)
- Catalog: `cli/data/clonable-repos.json` with 10 entries
- Convex: schema + telemetry mutation deployed to staging
- Internal repo, not public

Quality gate: Kelvin runs `find-next-sui-idea → scaffold → build → deploy → submit` on a real test idea and the output is genuinely useful.

## v0.2 (closed beta)

**Goal**: Multi-agent parity, sponsor coverage, hackathon submission generator working.

Ships everything in v0.1 plus:

- CLI: `update`, `uninstall`, `skills`, `repos`, `mcps`, `ideas`, `search`, `feedback`, `journey`
- Multi-agent install: `~/.claude/`, `~/.codex/`, `~/.cursor/` (Cursor `.mdc` generator)
- Skills (~25): all Idea phase, all Build phase except v1.1-deferred ones, key Ship phase, plus all anti-slop skills
- Knowledge: docs 01, 02, 03, 04, plus all 5 sponsor docs
- Catalog: 30+ repos, 8+ MCPs, 100+ ideas
- Website: landing + install + skills + repos + ideas pages (no styling beyond default)
- Convex: production deployment + feedback mutation
- 5-10 friendly Sui builders test, fix feedback

Quality gate: 5/5 beta testers can complete `find-next-sui-idea → scaffold → build → submit` without intervention.

## v0.3 / v1.0 (launch)

**Goal**: Full v1 scope per `00-OVERVIEW.md`.

Ships everything in v0.2 plus:

- Skills (~30): full v1 set, see `04-SKILLS-CATALOG.md`
- Knowledge: all 6 core docs + cookbook-index + all sponsor docs
- Catalog: 40-60 repos, 10-15 MCPs, 150+ ideas, 15+ ecosystem skills
- Website: full landing + all catalog browsers + sponsors page + overflow page + docs + privacy + terms
- Sponsor outreach completed
- Twitter / Telegram / HN announcements scheduled
- npm publish, GitHub release, Vercel deploy

Quality gate: launch checklist in `17-LAUNCH-PLAN.md`.

## v1.1 (T+4w, mid-hackathon)

**Goal**: Stabilization + Grow phase skills + first community contributions.

Ships:

- Bug fixes from launch week
- Grow phase skills: `analytics-baseline`, `retention-instrumentation`, `partnership-outreach`, `community-launch`
- 5-10 community-contributed catalog entries
- 1-3 community-contributed skills (likely sponsor-related)
- Sponsor doc refreshes if any sponsor pushed an SDK update
- Website: changelog page populated, /stats page (read-only Convex dashboard) shipped
- v1.1 catalog target: 80+ repos, 200+ ideas

## v1.2 (T+12w, post-Overflow)

**Goal**: Long-tail skills + post-hackathon journey.

Ships:

- Post-hackathon journey skill: `apply-for-real-funding`, `pitch-to-vc`, `apply-for-grant-2`
- Deferred Build skills: `build-data-pipeline`, deeper indexer + analytics tooling
- Sui-mobile depth: `build-mobile-sui` upgraded with full MWA-equivalent flow
- Knowledge depth: more cookbook entries, deeper protocol docs
- Continue.dev / Aider / Goose agent support (post-Cursor)
- Telemetry-driven prioritization: skills that are heavily used get reference depth, skills nobody uses get re-evaluated for removal

## v2.0 (2026 H2)

**Goal**: Major rev based on a year of real usage.

Possible directions (decided based on telemetry + community feedback by mid-2026):

- Suiperpower's own MCP server (so any MCP-aware client gets the catalog without skill-format conversion)
- Grant-application sub-product (`suiperpower-grants`)
- Mobile-first sub-product (`suiperpower-mobile`)
- Cross-chain skills if Sui builders increasingly need EVM / Solana interop
- Self-hostable Convex alternative (for orgs that want to fork)
- Premium tier for orgs that want SLAs / private skill libraries (only if there is real demand and we can sustain it without compromising the open-source core)

## What stays in scope across all versions

- Open source MIT
- Anti-slop quality gates as first-class
- Skills are markdown, transparent, audit-friendly
- Multi-agent parity (we never become Claude-only or Codex-only)
- Telemetry opt-in, anonymous, no PII

## What we will reconsider over time

- Whether Convex remains the right backend (it likely does)
- Whether the website grows beyond catalog browsing
- Whether we add a hosted dashboard for users who want one
- Whether we monetize in any form (default: no, only if community-sustainable)

## Reasons to delay (anti-rush rules)

We delay launch if:

- Install fails on either macOS or Linux in CI
- 30%+ of beta testers cannot complete the canonical journey
- Convex telemetry is silently dropping events
- A critical sponsor reaches out asking for changes we have not made
- The website has more than 5 minor bugs in the catalog browser

We do not delay for:

- Cursor MDC rendering being slightly off (accepted v1 quirk)
- Codex skill activation occasionally needing explicit slash command (accepted v1 quirk)
- Catalog being short of stretch targets (we ship at the floor target)
- Cosmetic website issues (we said no styling, this is fine)

## Hot-fix policy

- Critical (install broken, security): fix within 24h, push v1.0.x patch.
- Important (a skill produces broken output, telemetry endpoint down): fix within 48h.
- Cosmetic (typo in a skill, broken link in docs): fix within a week, batch into v1.0.x roll-up.

## Versioning strategy

Semver. Skills do not version individually, the CLI version is the truth. Breaking changes (skill name renamed, context-file shape changed) require a minor bump and changelog entry. Patch bumps for fixes only.

## Communication

- Roadmap visible at `suiperpower.dev/roadmap` (this doc rendered).
- Each release tagged on GitHub with release notes derived from `changelog/` MDX entries.
- Major version planning happens in GitHub Discussions (open RFC pattern).

## End-state vision

By end of 2026:

- Any Sui dev who shows up to ship a real product reaches for Suiperpower first, the way Solana devs reach for solana-new.
- Sponsors maintain their own knowledge docs and integration skills as PRs into our repo.
- The community has authored 10-20% of the skill catalog.
- The anti-slop framework is a recognized pattern other ecosystems adopt.
- Suiperpower is mentioned as table stakes when a serious Sui project starts.

That is the long arc. Sui Overflow 2026 is the launch occasion, not the destination.
