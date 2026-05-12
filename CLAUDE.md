# CLAUDE.md, Suiperpower

Context for any AI agent (Claude Code, Codex, Cursor) working on the Suiperpower codebase itself.

## What this project is

Suiperpower is the open platform behind https://suiperpower.dev. It packages skills, knowledge, an ecosystem catalog, and a CLI so an AI coding agent can take a developer from "what should I build on Sui" to a deployed, sustainable product. Distributed via curl one-liner. Built around an explicit anti-slop quality bar so projects survive past hackathons, not just win them.

Tagline: **Build something meaningful, on Sui**

The launch occasion is Sui Overflow 2026, but Suiperpower is built as a long-lived production tool, not a hackathon helper.

## Tech stack

- **Language**: TypeScript (strict, ESM, NodeNext)
- **Runtime**: Node.js 20+
- **Package manager**: pnpm workspaces
- **CLI**: zero runtime deps. The Convex backend owns its own package dependencies.
- **Backend**: Convex (telemetry + feedback only)
- **Website**: React Router v7 + Vite (Remix successor), containerized via `web/Dockerfile`
- **Skills**: plain markdown (Anthropic skill spec) with optional `references/` and `agents/openai.yaml`
- **Knowledge base**: plain markdown
- **Ecosystem catalog**: plain JSON
- **Install**: bash script hosted at suiperpower.dev/setup.sh, npm package `suiperpower`

## Project structure

Monorepo via pnpm workspaces. Three packages: `@pivyme/suiperpower` (published CLI under `core/`), `@suiperpower/convex`, `@suiperpower/web`.

```
suiperpower/
├── README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, LICENSE
├── package.json, pnpm-workspace.yaml
├── .claude-plugin/marketplace.json   # generated, Claude Code plugin manifest
├── core/                              # published npm package "@pivyme/suiperpower"
│   ├── cli/                           # CLI source + cli/data/ ecosystem catalog
│   ├── skills/                        # SKILL_ROUTER.md + phase folders + skills/data/
│   ├── scripts/                       # release tooling (preamble, lint, package, publish)
│   ├── install.sh                     # curl one-liner bootstrap
│   ├── setup, suiperpower-pass.sh
│   ├── skills-lock.json               # generated, content-addressed skill manifest
│   └── dist/                          # build output (gitignored)
├── convex/                            # telemetry + feedback backend
└── web/                               # marketing site + public/skills/ artifacts
```

Skills live under `core/skills/<phase>/<name>/SKILL.md`. Phases: `learn/`, `idea/`, `build/`, `ship/`, `grow/`. Today `learn/`, `idea/`, `build/`, `ship/` exist; `grow/` is planned.

## Key design decisions and why

- **Single npm package** (`@pivyme/suiperpower`): easiest install, easiest versioning, lowest cognitive cost for users.
- **Claude Code skills ship as a plugin, not a flat copy**: `.claude-plugin/marketplace.json` declares one plugin named `suiper`. Users install via `/plugin marketplace add pivyme/suiperpower` then `/plugin install suiper@suiperpower`. Skills auto-namespace as `/suiper:scaffold-project`, so installing alongside other packs causes zero collision. Codex and Cursor still receive flat copies because neither has a plugin model today. Regenerate after adding or renaming a skill: `pnpm marketplace:gen`.
- **Skills as plain markdown**: transparent, audit-friendly, anyone can read or fork.
- **Multi-agent parity from v1**: Claude Code + Codex + Cursor.
- **Convex backend**: zero-ops, free tier sufficient, telemetry + feedback only.
- **Anti-slop quality gates as first-class skills**: every build / ship skill embeds a gate. This is the differentiator.
- **Sponsor integrations are real**: Walrus / DeepBook / Scallop have first-class skills, knowledge docs, catalog entries. `/pick-my-sui-track` refuses to recommend a sponsor track unless the integration is load-bearing.
- **No webapp, no signup, no dashboard in v1**: the CLI is the product. Website is content-only (catalog browsing + install).
- **Skills handoff via filesystem** (`.suiperpower/<phase>-context.md`, plus intent-loop artifacts `intent.md` and `build-plan.md`): no global state, no DB on the user critical path.
- **Telemetry opt-in, anonymous default**: documented prominently. Source is public.

## Build commands

Run from the repo root. The root `package.json` proxies to `core` via `pnpm -F @pivyme/suiperpower`; you can also `cd core/` and invoke scripts directly.

```bash
pnpm install                  # install workspace deps
pnpm dev                      # run CLI locally via tsx (core/cli/index.ts)
pnpm build                    # tsc to core/dist/ + chmod +x dist/cli/index.js
pnpm setup                    # run core/setup
pnpm typecheck                # tsc --noEmit on core
pnpm preamble:check           # verify telemetry preamble injection on skills
pnpm lint:skills              # validate SKILL.md frontmatter + structure
pnpm lint:catalog             # validate cli/data/*.json catalog entries
pnpm package:skills           # build per-skill tarballs + index.json (+ web app mirror)
pnpm skills:watch             # watch core/skills/** and re-run package:skills on save
pnpm skills:lock              # regenerate core/skills-lock.json
pnpm marketplace:gen          # regenerate .claude-plugin/marketplace.json
pnpm web:dev                  # run the website dev server (auto-runs package:skills first)
pnpm web:build                # build the website for prod (auto-runs package:skills first)
pnpm lint                     # ESLint on core/cli/ and core/scripts/
pnpm format                   # Prettier check
pnpm format:fix               # Prettier write
pnpm test                     # typecheck + lint + lint:skills + lint:catalog + preamble:check + setup:check
pnpm test:install             # exercise install flow via core/scripts/test-install.sh
pnpm test:telemetry           # smoke-test Convex telemetry ingestion (reads .env)
pnpm setup:check              # verify core/setup is in sync with sources (CI gate)
pnpm setup:sync               # regenerate core/setup from sources
pnpm publish:dry              # gated pre-publish check
```

Convex backend scripts live in `convex/package.json`:

```bash
pnpm -F @suiperpower/convex convex:dev      # Convex dev backend
pnpm -F @suiperpower/convex convex:deploy   # Convex deploy to prod
```

### Skills artifact pipeline (keep this in sync, easy to forget)

The website consumes generated artifacts at `web/public/skills/*.tar.gz`, `web/public/skills/index.json`, and a checked-in mirror at `web/app/data/skills-index.json`. They are all written by `pnpm package:skills` (which runs `core/scripts/package-skills.sh` then `core/scripts/generate-skills-index.mjs`). Packaging is deterministic and the tracked index files are only rewritten when the actual skill payload changes.

Two automatic safety nets so you do not ship a stale `/skills` page:

1. **Web auto-regen**: `web/package.json` declares `predev` and `prebuild` that invoke `pnpm -F @pivyme/suiperpower package:skills` first. So `pnpm web:dev` and `pnpm web:build` verify artifacts before the site boots or builds. If no skill content changed, the tracked JSON files stay untouched. Vercel deploys get fresh data without manual steps.
2. **Active-author watcher**: `pnpm skills:watch` recursively watches `core/skills/**`, debounces saves at 400ms, and re-runs `package:skills` per change. Use this in a side terminal when editing skills so the running dev server picks up new tarballs.

When you add or edit a SKILL.md, both `web/public/skills/index.json` and `web/app/data/skills-index.json` must regenerate. `core/skills-lock.json` only needs to change when skill files change. If a skill is missing from the website, the cause is almost always a stale index. Run `pnpm package:skills` once and reload.

Do not commit `web/public/skills/*.tar.gz` or the two index JSONs without first running `pnpm package:skills`. CI does not currently regenerate them.

## Conventions

- ESM only (`.js` extensions in imports under NodeNext).
- Strict TypeScript, no implicit any.
- Single source of truth for branding strings: `core/cli/branding.ts`.
- Skills are plain markdown, no code generation in skills.
- Catalog data is JSON, sorted alphabetically by id.
- Naming: kebab-case for skills / files / folders / catalog ids.
- No emojis in product copy unless explicitly part of an output the user asked for.
- No em-dashes (commas / periods instead).
- No "leverage" / "cutting-edge" / "world-class" / "revolutionary" / "AI-powered" / "Web3".
- Capitalize Sui-specific terms: Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin.

## Quality bar reference

When implementing a skill or adding catalog content:

- Every build / ship skill must end with a real anti-slop gate ("will this survive past the hackathon"), not a checkbox.
- Senior-friend voice: direct, no marketing-speak, no em-dashes.
- Anthropic skill format: valid frontmatter, byte-identical telemetry preamble, kebab-case naming, folder name matches frontmatter `name:`.
- Mechanical doc rules: code blocks language-tagged, dates `YYYY-MM-DD`, Sui terms capitalized.

Use existing skills under `core/skills/build/` and `core/skills/ship/` as canonical examples.

## Skill authoring and review (handover rules)

Required reading any time you are asked to **generate a new skill, review an existing skill, or recheck skills for accuracy**.

### Source-of-truth rule (anti-hallucination)

Skills must be grounded in real, current sources. You are not allowed to invent API names, function signatures, package names, version numbers, sponsor program details, RPC methods, contract addresses, or behavior.

Before writing or editing any technical claim in a skill:

1. The author provides the source (URL, pasted docs, GitHub repo path, or a file in this repo).
2. You read or fetch that source. If a URL is provided and you can fetch it, fetch it. Pasted text is canonical for the turn.
3. You only write claims the source explicitly supports. If the source does not cover a claim, drop the claim or ask.
4. If the author has not yet given a source for a topic the skill needs, **stop and ask**. Sui, Walrus, DeepBook, Scallop, zkLogin, Seal, Nautilus and similar topics drift fast; outdated training data is the most common source of bad skills.
5. Prefer canonical sources: official docs, official GitHub README, official reference documentation. Avoid third-party tutorials or AI-generated summaries as primary references.

If a source contradicts an earlier-saved memory, the source wins.

### Cross-check workflow when handed material

1. Restate, in one or two sentences, what you understood the skill is supposed to do and which source covers what. Confirm with the author before generating.
2. Skim the source for the specific facts the skill needs (function names, flags, addresses, fees, network endpoints, configuration steps).
3. Draft the skill. Every load-bearing technical claim must trace back to a line you can point to in the source.
4. Self-review: read each technical sentence and ask "where in the source did this come from?". If you can't answer, delete the sentence or flag it.
5. List any unverified claims at the bottom of your reply (not in the skill file) so the author knows what still needs a source.

If the pasted doc is huge, do not copy it into the skill. Reference the URL, extract the minimum the skill needs.

### Context-efficiency rules

Skills load into a coding agent's context window. They compete with the user's actual code for tokens.

- **Length target**: ~80 to 250 lines for most skills. ~400 lines is a hard ceiling.
- **Link, don't inline**: prefer `See https://docs.sui.io/...` or a sibling `references/<file>.md` over pasting docs.
- **No verbose preambles**: frontmatter `description` covers discovery; the body goes straight to operating instructions.
- **No filler**: cut "in this section we will", "it is important to note that", "as a best practice", and similar.
- **One example beats five**: pick the most representative example. Edge cases belong in references.
- **Tables and lists over prose** for enumerations.
- **No marketing copy**: the skill teaches the agent what to do, not why Sui is great.

If a skill needs deep reference material, put it in `<skill>/references/*.md` and have the skill body say "fetch X for full details".

### Format and structure (must match)

Every skill follows the canonical shape. Before submitting any skill, verify:

- Frontmatter is valid (Anthropic skill spec compliant) and `description` triggers cleanly.
- Skill lives under the correct phase directory (`learn/`, `idea/`, `build/`, `ship/`, `grow/`).
- No code generation lives inside the skill (we generate files via the CLI / agent, not via skill text).
- Naming is kebab-case, matches the catalog id in `core/cli/data/sui-skills.json`.
- Voice matches the brand rules (senior-friend, no banned phrases, no em-dashes, no emojis).
- Hand-off context, if the skill writes one, follows the phase-handoff spec under `core/skills/data/specs/`.

### Common mistakes to avoid

- **Inventing function names or APIs** that sound plausible but do not exist. Especially with Sui SDK methods, Move stdlib, Walrus / DeepBook / Scallop calls. Always verify against source.
- **Stale package names or versions** (`@mysten/sui.js` is old, current is `@mysten/sui`).
- **Confusing Sui Move with Aptos Move or Core Move**. Dialects diverge.
- **Outdated sponsor program details** (track names, prize structure, judging criteria, deadlines).
- **Pasting full doc pages into the skill body** instead of linking.
- **Adding "best practices" that are actually opinions**, not sourced.
- **Marketing voice creeping in** ("seamlessly", "powerful", "robust", "leverage"). Cut on sight.
- **Em-dashes** (project-wide ban).
- **Hand-waving the unknown**: if you do not know, say "ask the author" or "fetch X at runtime", do not fill the gap with confident guesses.

### When to push back on the author

Be a critical thinker, not a sycophant. Push back if:

- The proposed skill duplicates an existing skill.
- The skill is too narrow to deserve its own file (fold into a related skill instead).
- The author's pasted source contradicts the official docs you can verify.
- The skill is asking you to write code-generation logic that should live in the CLI, not in skill markdown.
- The trigger phrase collides with an existing skill.

### Intent-loop convention (for non-trivial build skills)

Suiperpower has a three-skill intent loop wrapping the build phase:

- `clarify-intent` writes `.suiperpower/intent.md` with Sui-specific scope (Objects, capabilities, sponsor posture, target network, upgrade authority) before any code.
- `plan-before-code` writes `.suiperpower/build-plan.md` with forced Move decisions (ability rationale, capability holders, PTB shape, package layout, upgrade strategy, per-sponsor verification commitments) before any code.
- `verify-against-intent` reads disk after a build session and checks drift.

When authoring or reviewing a **non-trivial build skill** (touches more than one Move module, includes a sponsor integration, or composes a multi-step PTB):

1. **Closing handoff step**: end the Workflow with a step that recommends `verify-against-intent` as the next skill when `.suiperpower/intent.md` exists. If `intent.md` is absent and the session was non-trivial, surface the gap once and offer `clarify-intent` to backfill. The user opts in. Canonical shape: `core/skills/build/build-with-move/SKILL.md` workflow step 7.
2. **Optional intent reading**: list `.suiperpower/intent.md` and `.suiperpower/build-plan.md` in the Inputs section as optional. If present, tailor the work to the recorded scope.
3. **Router fallback**: in-skill handoffs are preferred because they survive agents that skip the router (`core/skills/SKILL_ROUTER.md`).

Trivial skills (single-function tweaks, debug, review, design taste, idea-phase skills) skip this convention. The intent loop is for build sessions that produce new Move surface or a new sponsor integration.

## Mid-build steering

If you discover something during implementation that should be a durable rule for all future work on this codebase, raise it via a GitHub Discussion or PR comment so it can be folded into `CLAUDE.md` and `AGENTS.md`.

Commit rule (project-wide): Kelvin is the sole committer. Never add a `Co-Authored-By` line to any commit, ever.

## What this project is NOT

- Not a webapp. The CLI is the product.
- Not a Sui Foundation product. Independent, MIT, no endorsement claimed.
- Not a paid product. Open source, free, no premium tier in v1.
- Not a hackathon-only tool. Built for production Sui product builders long-term.

## Where to ask questions

- GitHub Issues for bugs or skill requests
- GitHub Discussions for RFCs / roadmap input
- Sui Overflow Telegram for hackathon-specific questions (https://go.sui.io/suioverflow2026-tg)
