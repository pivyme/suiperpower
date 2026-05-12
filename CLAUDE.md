# CLAUDE.md, Suiperpower

Context for any AI agent (Claude Code, Codex, Cursor) working on the Suiperpower codebase itself.

## What this project is

Suiperpower is the open platform behind https://suiperpower.dev. It packages skills, knowledge, ecosystem catalog, and a CLI so an AI coding agent can take a developer from "what should I build on Sui" to a deployed, sustainable product. Distributed via curl one-liner. Built around an explicit anti-slop quality bar so projects survive past hackathons, not just win them.

Tagline: **Build something meaningful, on Sui**

The launch occasion is Sui Overflow 2026, but Suiperpower is built as a long-lived production tool, not a hackathon helper.

## What exists today (quick orientation)

The repo is mid-build. As of the most recent commits (phase 29 + monorepo refactor):

- **Monorepo layout**: pnpm workspaces with three packages, `core/` (the publishable `suiperpower` npm package), `convex/` (`@suiperpower/convex` backend), `web/` (`@suiperpower/web` website). Root `package.json` proxies common scripts to `core` via `pnpm -F suiperpower`.
- **CLI scaffold** is real under `core/cli/`: `index.ts` plus `banner`, `branding`, `doctor`, `init`, `feedback`, `telemetry`, `update`, `update-check`, `uninstall`, `repos`, `completion`, `workspace-setup`, `agent-cli`, `interactive-onboarding`, `interactive-skills`, `interactive-mcps`, `interactive-search`, `interactive-journey`, `interactive-universal`, `colors`. Run with `pnpm dev` from the repo root.
- **Skills tree** is partially populated under `core/skills/`: `learn/`, `idea/`, `build/`, `ship/` directories with phase content; `SKILL_ROUTER.md` and `skills/README.md` catalog overview committed. `grow/` not yet on disk. Build phase now includes the three intent-loop gates (`clarify-intent`, `plan-before-code`, `verify-against-intent`) that wrap technical build skills, see the "Intent-loop convention" section below.
- **Scripts** under `core/scripts/`: `inject-preamble.ts`, `lint-skills.ts`, `lint-catalog.ts`, `generate-skills-index.ts`, `generate-skills-lock.ts`, `generate-cursor-rules.ts`, `package-skills.sh`, `test-install.sh`, `publish.ts`.
- **Install + setup** wired: `core/install.sh` (curl one-liner target), `core/setup`, `core/suiperpower-pass.sh`, `core/skills-lock.json`, `web/public/setup.sh`, `web/vercel.json`.
- **Convex backend** scaffolded: `convex/schema.ts`, `convex/telemetry.ts`, `convex/feedback.ts`.
- **Top-level docs landed**: `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `LICENSE`.
- **Planning** is fully drafted: 31 docs in `plans/`, indexed by `plans/README.md`.
- **Tracking**: `TODO.md` (project-wide), `MANUAL-TODO.md` (manual checklist). The autonomous build loop now lives under `scratchpads/bigdev/` (gitignored, local-only).

Check `git log --oneline | head -20` before assuming a phase is done. CLAUDE.md updates lag commits.

## Tech stack

- **Language**: TypeScript (strict, ESM, NodeNext)
- **Runtime**: Node.js 20+
- **Package manager**: pnpm workspaces
- **CLI**: zero runtime deps. The Convex backend owns its own package dependencies.
- **Backend**: Convex (telemetry + feedback only)
- **Website**: Next.js 14+ App Router, deployed on Vercel
- **Skills**: plain markdown (Anthropic skill spec) with optional `references/` and `agents/openai.yaml`
- **Knowledge base**: plain markdown
- **Ecosystem catalog**: plain JSON
- **Install**: bash script hosted at suiperpower.dev/setup.sh, npm package `suiperpower`

## Project structure

See `plans/02-PROJECT-STRUCTURE.md` for the full target tree (note: that doc still describes the pre-monorepo layout; the actual repo shape is below). Current state on disk (May 2026):

```
suiperpower/
├── README.md, CLAUDE.md, TODO.md, MANUAL-TODO.md   # planning + tracking
├── AGENTS.md, CONTRIBUTING.md, LICENSE             # contributor + legal docs
├── .claude-plugin/marketplace.json                 # Claude Code plugin marketplace (generated)
├── package.json, pnpm-workspace.yaml               # monorepo root (workspaces: core, convex, web)
├── core/                                           # published npm package "suiperpower"
│   ├── package.json, tsconfig.json
│   ├── cli/                CLI source (index, banner, branding, doctor, init,
│   │                       feedback, telemetry, update, update-check, uninstall,
│   │                       repos, completion, workspace-setup, agent-cli,
│   │                       interactive-*, colors) + cli/data/
│   ├── skills/             SKILL_ROUTER.md + README.md + phase folders (learn,
│   │                       idea, build, ship) + skills/data/
│   ├── scripts/            inject-preamble, lint-skills, lint-catalog,
│   │                       generate-skills-index, generate-skills-lock,
│   │                       generate-cursor-rules, package-skills.sh,
│   │                       test-install.sh, publish.ts
│   ├── install.sh          curl one-liner entrypoint
│   ├── setup, suiperpower-pass.sh
│   ├── skills-lock.json    generated, content-addressed skill manifest
│   └── dist/               build output (gitignored)
├── convex/                                         # @suiperpower/convex backend
│   ├── package.json
│   ├── schema.ts, telemetry.ts, feedback.ts
├── web/                                            # @suiperpower/web website
│   ├── package.json, vercel.json
│   └── public/             setup.sh (mirrored to suiperpower.dev/setup.sh) + assets
├── plans/                  Source-of-truth planning docs (31 files + README index)
├── reference/              Vendored solana-new-main for pattern reference only
└── scratchpads/            Local-only, gitignored (autonomous build loop, ephemeral notes)
```

Planned but not yet on disk: a Next.js app under `web/` (today `web/` is static assets + `vercel.json` only), a `grow/` skill phase under `core/skills/`.

Skills live under `core/skills/<phase>/<name>/SKILL.md`. Phases: `learn/`, `idea/`, `build/`, `ship/`, `grow/`. As of today `learn/`, `idea/`, `build/`, `ship/` exist; `grow/` is planned.

## Key design decisions and why

- **Single npm package**: easiest install, easiest versioning, lowest cognitive cost for users. Validated by solana-new's adoption.
- **Claude Code skills ship as a plugin, not a flat copy**: `.claude-plugin/marketplace.json` at the repo root declares one plugin named `suiper`. Users install via `/plugin marketplace add pivyme/suiperpower` then `/plugin install suiper@suiperpower`. Skills auto-namespace as `/suiper:scaffold-project` etc, so installing alongside solana-new or any other pack causes zero collision. Codex and Cursor still receive flat copies because neither has a plugin/namespacing model today. Regenerate after adding or renaming a skill: `pnpm marketplace:gen`.
- **Skills as plain markdown**: transparent, audit-friendly, anyone can read or fork.
- **Multi-agent parity from v1**: Claude Code + Codex + Cursor. Excluding any leaves users on the table for a few hundred lines of conversion code.
- **Convex backend**: zero-ops, free tier sufficient, same pattern as solana-new.
- **Anti-slop quality gates as first-class skills**: see `plans/12-ANTI-SLOP-FRAMEWORK.md`. Every build / ship skill embeds a gate. This is the differentiator.
- **Sponsor integrations are real**: Walrus / DeepBook / Scallop have first-class skills, knowledge docs, catalog entries. /pick-my-sui-track refuses to recommend a sponsor track unless the integration is load-bearing (see `plans/11-SPONSOR-INTEGRATION.md`).
- **No webapp, no signup, no dashboard in v1**: the CLI is the product. Website is content-only (catalog browsing + install).
- **Skills handoff via filesystem** (`.suiperpower/<phase>-context.md`, plus intent-loop artifacts `intent.md` and `build-plan.md`): no global state, no DB on the user critical path. Schemas in `plans/30-SHARED-GUIDES-SPEC.md`.
- **Telemetry opt-in, anonymous default**: documented prominently. Source is public.

## Plans folder reference

| File | What it covers |
|---|---|
| `plans/00-OVERVIEW.md` | Thesis, who it is for, anti-slop framing, what ships in v1 |
| `plans/01-ARCHITECTURE.md` | Six-layer system shape, install flow, data flow |
| `plans/02-PROJECT-STRUCTURE.md` | Full directory tree, conventions, naming rules |
| `plans/03-INSTALL-FLOW.md` | curl one-liner, install.sh logic, multi-agent install paths, doctor |
| `plans/04-SKILLS-CATALOG.md` | All ~38 skills, trigger phrases, phase grouping |
| `plans/05-SKILL-FORMAT.md` | SKILL.md spec, telemetry preamble, agents/openai.yaml, .mdc rendering |
| `plans/06-SUI-KNOWLEDGE-BASE.md` | Knowledge doc outlines (6 core docs + cookbook + sponsor docs) |
| `plans/07-ECOSYSTEM-CATALOG.md` | JSON schemas for repos / skills / mcps / ideas catalogs |
| `plans/08-CLI-DESIGN.md` | CLI commands, branding.ts, file responsibilities |
| `plans/09-MULTI-AGENT-PARITY.md` | Claude / Codex / Cursor install + format details |
| `plans/10-HACKATHON-SUBMISSION.md` | /submit-to-sui-overflow workflow, deepsurge.xyz integration |
| `plans/11-SPONSOR-INTEGRATION.md` | Walrus / DeepBook / OZ / OtterSec / Scallop integration details |
| `plans/12-ANTI-SLOP-FRAMEWORK.md` | Quality bar, gates, anti-slop skills |
| `plans/13-CONVEX-BACKEND.md` | Schema, mutations, tier model, privacy posture |
| `plans/14-WEBSITE-STRUCTURE.md` | Routes + section outlines (no styling) |
| `plans/15-BRAND.md` | Name, tagline, voice, do-not-use phrases |
| `plans/16-CONTENT-PLAN.md` | Curated idea sources, schema, Sui-native gaps list |
| `plans/17-LAUNCH-PLAN.md` | T-4w to T+12w plan, sponsor outreach, launch day |
| `plans/18-ROADMAP.md` | v0.1 → v2.0 versioning |
| `plans/19-OPEN-QUESTIONS.md` | Live tracker for unresolved decisions |
| `plans/20-CONTRIBUTING-PLAN.md` | PR shapes, supply-chain rules, reviewer checklists, code of conduct outline |
| `plans/21-TESTING-STRATEGY.md` | Test layers, CI matrix, multi-agent install testing, smoke tests |
| `plans/22-SAMPLE-SKILL.md` | Canonical fully-written reference skill (build-with-move) for authors to clone |
| `plans/23-SKILL-ROUTER-SPEC.md` | Per-row routing table covering every v1 skill and common-wrong-pick patterns |
| `plans/24-OVERFLOW-2026-PLAYBOOK.md` | Participant-facing playbook, source for the website /overflow page |
| `plans/25-SECURITY-POSTURE.md` | Trust model, threat model, mitigations, incident response, public commitments |
| `plans/26-EXAMPLE-USER-JOURNEY.md` | Worked walkthrough of a fictional builder from install to submission |
| `plans/27-GOVERNANCE-AND-SUSTAINABILITY.md` | Maintainer model, decision authority, conflict of interest, post-launch maintenance |
| `plans/28-COMPETITIVE-LANDSCAPE.md` | Sui dev tooling landscape, positioning, differentiators, cooperation strategy |
| `plans/29-DOCS-AUTHORING-STANDARDS.md` | Structural and mechanical rules for all markdown / JSON / CLI output |
| `plans/30-SHARED-GUIDES-SPEC.md` | Sui-native rpc-wallet / deploy-runbook / security / package-id / deepsurge guides + phase-handoff spec |

For navigation across all 31 plan docs, **start at `plans/README.md`**, the top-level index. It groups docs by category (foundation, skills, sponsors, ops, etc.), gives reading paths for common scenarios, and lists which docs pair together.

If you are a coding agent picking up work and skipping the index: read 00 → 04 → 12 → 02 first. Then 22 (sample skill) and 26 (example journey) for concreteness, then 20 (contributing) and 21 (testing) before authoring anything that ships. 30 is required reading before authoring any shared guide or phase-handoff context-file. Everything else is on demand.

## Build commands

Run from the repo root. The root `package.json` proxies to `core` via `pnpm -F suiperpower`; you can also `cd core/` and invoke scripts directly.

Real today (defined in `package.json` + `core/package.json`):

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
pnpm skills:watch             # watch core/skills/** and re-run package:skills on save (debounced)
pnpm skills:lock              # regenerate core/skills-lock.json
pnpm marketplace:gen          # regenerate .claude-plugin/marketplace.json from skills tree
pnpm web:dev                  # run the website dev server (auto-runs package:skills first)
pnpm web:build                # build the website for prod (auto-runs package:skills first)
pnpm lint                     # ESLint on core/cli/ and core/scripts/
pnpm format                   # Prettier check on core/cli/ and core/scripts/
pnpm format:fix               # Prettier write on core/cli/ and core/scripts/
pnpm test                     # typecheck + lint + lint:skills + lint:catalog + preamble:check
pnpm test:install             # exercise install flow via core/scripts/test-install.sh
pnpm publish:dry              # core/scripts/publish.ts gated pre-publish check
```

Convex backend scripts live in `convex/package.json` (run from `convex/` or via `pnpm -F @suiperpower/convex <script>`):

```bash
pnpm -F @suiperpower/convex convex:dev      # Convex dev backend
pnpm -F @suiperpower/convex convex:deploy   # Convex deploy to prod
```

Planned (will land as the relevant phase ships, do not invoke before then):

```bash
pnpm publish                  # actual npm publish (gated, not yet wired at root)
```

Update this file as scripts are added so future agents do not invoke commands that do not exist.

### Skills artifact pipeline (keep this in sync, easy to forget)

The website consumes generated artifacts at `web/public/skills/*.tar.gz`, `web/public/skills/index.json`, and a checked-in mirror at `web/app/data/skills-index.json`. They are all written by `pnpm package:skills` (which runs `core/scripts/package-skills.sh` then `core/scripts/generate-skills-index.ts`).

Two automatic safety nets so you do not ship a stale `/skills` page:

1. **Web auto-regen**: `web/package.json` declares `predev` and `prebuild` that invoke `pnpm -F suiperpower package:skills` first. So `pnpm web:dev` and `pnpm web:build` always rebuild artifacts before the React Router app boots or builds. Vercel deploys get fresh data without manual steps.
2. **Active-author watcher**: `pnpm skills:watch` (root or `core/`) recursively watches `core/skills/**`, debounces saves at 400ms, and re-runs `package:skills` per change. Use this in a side terminal when editing skills so the running dev server picks up new tarballs and index entries automatically.

When you add or edit a SKILL.md, both `web/public/skills/index.json` and `web/app/data/skills-index.json` must regenerate. If you see a skill missing from the website list, the cause is almost always a stale index. Run `pnpm package:skills` once and reload.

Do not commit `web/public/skills/*.tar.gz` or the two index JSONs without first running `pnpm package:skills`. CI does not currently regenerate them, so a stale commit ships a stale website.

### Autonomous build loop (local-only)

The autobuild loop lives at `scratchpads/bigdev/` and is gitignored (see `.gitignore`: `scratchpads/`). It is a local-only working tool, not part of the published package. Day-to-day, if the directory exists on your machine:

```bash
./scratchpads/bigdev/autobuild              # start / continue the build loop
./scratchpads/bigdev/autobuild say "rule"   # add durable rule (requirements-log.md)
./scratchpads/bigdev/autobuild fix "msg"    # one-shot transient correction (inject.md)
```

Because the loop is gitignored, do not reference `scratchpads/bigdev/*` paths in committed code or skills.

## Quality bar reference

When implementing a skill or adding catalog content, hold to:

- `plans/12-ANTI-SLOP-FRAMEWORK.md`, the quality bar this project embodies
- `plans/15-BRAND.md`, the voice of every user-facing string
- `plans/05-SKILL-FORMAT.md`, the structure every SKILL.md follows

Skills should be in the senior-friend voice (direct, not condescending, no marketing-speak). No em-dashes anywhere (Kelvin's project rule). Comments concise and direct.

## Skill authoring and review (handover rules)

This section is required reading any time you are asked to **generate a new skill, review an existing skill, or recheck skills for accuracy**. Read it fully before touching any file in `skills/`.

### Source-of-truth rule (anti-hallucination)

Skills must be grounded in real, current sources. You are not allowed to invent API names, function signatures, package names, version numbers, sponsor program details, RPC methods, contract addresses, or behavior.

Before writing or editing any technical claim in a skill:

1. The author (Kelvin or contributor) provides the source. This can be a URL, a pasted block of docs, a GitHub repo path, or a specific file in this repo.
2. You read or fetch that source. If a URL is provided and you can fetch it, fetch it. If text is pasted, treat the pasted text as the canonical reference for this turn.
3. You only write claims that the source explicitly supports. If the source does not cover a claim you want to make, either drop the claim or ask the author for a source.
4. If the author has not yet given a source for a topic the skill needs, **stop and ask**. Do not guess from training data. Sui, Walrus, DeepBook, Scallop, zkLogin, Seal, Nautilus and similar topics drift fast; outdated training data is the most common source of bad skills.
5. When fetching a URL, prefer the canonical source: official docs site, official GitHub README, or the project's reference documentation. Avoid third-party tutorials, blog posts, or AI-generated summaries as primary references.

If a source contradicts an earlier-saved memory or an older plan doc, the source wins. Update the memory or the plan doc, do not paper over it.

### Cross-check workflow when handed material

When the author gives you a link, a pasted doc dump, or both, do this in order:

1. Restate, in one or two sentences, what you understood the skill is supposed to do and which source covers what. Confirm with the author before generating.
2. Skim the source for the specific facts the skill needs (function names, flags, addresses, fees, network endpoints, configuration steps). Quote them mentally; do not paraphrase loosely.
3. Draft the skill. Every load-bearing technical claim must trace back to a line you can point to in the source.
4. After drafting, do a self-review pass: read each technical sentence in the skill and ask "where in the source did this come from?". If you can't answer, delete the sentence or flag it for the author.
5. List any unverified claims at the bottom of your reply (not in the skill file) so the author knows what still needs a source.

If the pasted doc is huge, do not copy it into the skill. Reference the URL, extract the minimum the skill needs, and rely on the user's agent fetching the link at runtime if deeper detail is needed.

### Context-efficiency rules

Skills are loaded into a coding agent's context window. They compete with the user's actual code for tokens. Optimize ruthlessly.

- **Length target**: ~80 to 250 lines for most skills. ~400 lines is a hard ceiling. If you feel the need to go longer, you are usually duplicating docs. Link instead.
- **Link, don't inline**: prefer `See https://docs.sui.io/...` or `See skills/build/<name>/references/<file>.md` over pasting docs into the skill body. Reference material that rarely changes can live in a sibling `references/` file; the skill body covers when and how to use it.
- **No verbose preambles**: do not restate what the skill is in three different ways. Frontmatter `description` covers discovery; the body goes straight to operating instructions.
- **No filler**: cut "in this section we will", "it is important to note that", "as a best practice", and similar. Direct voice only.
- **One example beats five**: pick the most representative example and ship it. Edge-case examples belong in references, not the main skill body.
- **Tables and lists over prose** for enumerations (commands, flags, decision rules).
- **No marketing copy**: the skill teaches the agent what to do, not why Sui is great.

If a skill needs deep reference material (full RPC method list, full Move stdlib reference, full sponsor program rules), put it in `<skill>/references/*.md` and have the skill body say "fetch X for full details". This keeps the load-time footprint small while giving the agent a path to drill in.

### Format and structure (must match)

Every skill follows the contract in `plans/05-SKILL-FORMAT.md` and clones from `plans/22-SAMPLE-SKILL.md` for shape. Before submitting any skill, verify:

- Frontmatter is valid (Anthropic skill spec compliant) and `description` triggers cleanly via `plans/23-SKILL-ROUTER-SPEC.md`.
- Skill lives under the correct phase directory (`learn/`, `idea/`, `build/`, `ship/`, `grow/`).
- No code generation lives inside the skill (we generate files via the CLI / agent, not via skill text).
- Naming is kebab-case, matches the catalog id in `cli/`.
- Voice matches `plans/15-BRAND.md` (senior-friend, no banned phrases, no em-dashes, no emojis in product copy).
- Hand-off context, if the skill writes one, follows the spec in `plans/30-SHARED-GUIDES-SPEC.md`.

### Common mistakes to avoid

These are the recurring failure modes in skill authoring. Catch them in your own self-review before handing back to the author:

- **Inventing function names or APIs** that sound plausible but do not exist. Especially common with Sui SDK methods, Move stdlib functions, Walrus / DeepBook / Scallop calls. Always verify against source.
- **Stale package names or versions** (`@mysten/sui.js` is the old name, current is `@mysten/sui`). Always confirm the current published name from the official source the day you write.
- **Confusing Sui Move with Aptos Move or Core Move**. The dialects diverge. Capabilities, abilities, object model, and stdlib differ. Source-check anything Move-specific.
- **Outdated sponsor program details** (track names, prize structure, judging criteria, deadlines). These change per Overflow cycle. Always reference the current Overflow source given by the author.
- **Pasting full doc pages into the skill body** instead of linking. Wastes context, goes stale, hard to maintain.
- **Adding "best practices" that are actually opinions**, not sourced. If the author or canonical docs do not say it, do not assert it.
- **Skipping the trigger-phrase check** in `plans/23-SKILL-ROUTER-SPEC.md`. A skill that triggers on the wrong prompts is worse than no skill.
- **Marketing voice creeping in** ("seamlessly", "powerful", "robust", "leverage"). Cut on sight.
- **Em-dashes** (project-wide ban). Use commas or periods.
- **Forgetting the senior-friend voice**: skills should sound like a senior engineer giving a junior a clear instruction, not a tutorial site.
- **Hand-waving the unknown**: if you do not know, say "ask the author" or "fetch X at runtime", do not fill the gap with confident guesses.

### When to push back on the author

Be a critical thinker, not a sycophant. Push back if:

- The proposed skill duplicates an existing skill (check `plans/04-SKILLS-CATALOG.md` and `skills/` first).
- The skill is too narrow to deserve its own file (fold into a related skill instead).
- The author's pasted source contradicts the official docs you can verify.
- The skill is asking you to write code generation logic that should live in the CLI, not in skill markdown.
- The trigger phrase collides with an existing skill's router entry.

### Quick handover checklist

When the author says "review this skill" or "generate a skill for X", run this loop:

1. Confirm scope and source: "Is the canonical source [link] or do you have a different one?"
2. Read the source (fetch URL or read pasted text).
3. Confirm the skill's trigger phrases and phase placement against `plans/23-SKILL-ROUTER-SPEC.md`.
4. Draft or review against `plans/22-SAMPLE-SKILL.md` shape and `plans/05-SKILL-FORMAT.md` rules.
5. Self-review: every technical claim traces to a source line, length is within target, voice matches brand.
6. Report back: file diff plus a short list of any unverified claims and any open questions for the author.

If at any point you are unsure about a fact, **ask before writing**. A delay is cheaper than a wrong skill shipped to thousands of agents.

### Intent-loop convention (for new and reviewed build skills)

Suiperpower has a three-skill intent loop wrapping the build phase:

- `clarify-intent` writes `.suiperpower/intent.md` with Sui-specific scope (Objects, capabilities, sponsor posture, target network, upgrade authority) before any code.
- `plan-before-code` writes `.suiperpower/build-plan.md` with forced Move decisions (ability rationale, capability holders, PTB shape, package layout, upgrade strategy, per-sponsor verification commitments) before any code.
- `verify-against-intent` reads disk after a build session and checks drift: Object abilities, capability holders at init, sponsor load-bearing tests, `sui move build` pass, `Move.toml` pinning, per-network deploy state.

When authoring or reviewing a **non-trivial build skill** (touches more than one Move module, includes a sponsor integration, or composes a multi-step PTB), apply this convention:

1. **Closing handoff step**: end the Workflow with a step that recommends `verify-against-intent` as the next skill when `.suiperpower/intent.md` exists. If `intent.md` is absent and the session was non-trivial, surface the gap once and offer `clarify-intent` to backfill. Do not force either; the user opts in. The canonical shape is `core/skills/build/build-with-move/SKILL.md` workflow step 7.
2. **Optional intent reading**: list `.suiperpower/intent.md` and `.suiperpower/build-plan.md` in the Inputs section as optional. If present, tailor the work to the recorded scope. If absent, proceed without blocking.
3. **Router fallback**: the "Intent-loop closing gate" section in `core/skills/SKILL_ROUTER.md` covers routing behavior, but in-skill handoffs are preferred because they survive agents that skip the router.

Trivial skills (single-function tweaks, debug, review, design taste, idea-phase skills) skip this convention. The intent loop is for build sessions that produce new Move surface or a new sponsor integration. When in doubt: if the skill writes to `build-context.md`, it probably qualifies; if not, it does not.

Schema reference for `intent.md` and `build-plan.md`: `plans/30-SHARED-GUIDES-SPEC.md`.

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

## Mid-build steering

If you (an AI agent) discover something during implementation that should be a durable rule for all future work on this codebase, add it to `plans/19-OPEN-QUESTIONS.md` as a `decided:` entry with a date, then propagate to the relevant plan doc.

If you are inside the local autonomous build loop (`scratchpads/bigdev/`, gitignored), durable rules go to `scratchpads/bigdev/claude/requirements-log.md` (local-only, read every iteration). One-shot transient corrections go to `scratchpads/bigdev/claude/inject.md`. Drive both via the launcher: `./scratchpads/bigdev/autobuild say "rule"` for durable, `./scratchpads/bigdev/autobuild fix "msg"` for one-shot. The loop reads `scratchpads/bigdev/TODO.md` and works through phases referencing `plans/`. None of these paths are committed, so do not reference them from anything in `core/` or `plans/`.

Commit rule (project-wide, including the build loop): Kelvin is the sole committer. Never add a `Co-Authored-By` line to any commit, ever.

## What this project is NOT

- Not a fork of solana-new. Format inspired by it, content is Sui-native from the first byte.
- Not a webapp. The CLI is the product.
- Not a Sui Foundation product. Independent, MIT, no endorsement claimed.
- Not a paid product. Open source, free, no premium tier in v1.
- Not a hackathon-only tool. Built for production Sui product builders long-term.

## Where to ask questions

- GitHub Issues for bugs or skill requests
- GitHub Discussions for RFCs / roadmap input
- Sui Overflow Telegram for hackathon-specific questions (https://go.sui.io/suioverflow2026-tg)
