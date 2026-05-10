# CLAUDE.md, Suiperpower

Context for any AI agent (Claude Code, Codex, Cursor) working on the Suiperpower codebase itself.

## What this project is

Suiperpower is the open platform behind https://suiperpower.dev. It packages skills, knowledge, ecosystem catalog, and a CLI so an AI coding agent can take a developer from "what should I build on Sui" to a deployed, sustainable product. Distributed via curl one-liner. Built around an explicit anti-slop quality bar so projects survive past hackathons, not just win them.

Tagline: **think. build. ship.**

The launch occasion is Sui Overflow 2026, but Suiperpower is built as a long-lived production tool, not a hackathon helper.

## Tech stack

- **Language**: TypeScript (strict, ESM, NodeNext)
- **Runtime**: Node.js 20+
- **Package manager**: pnpm workspaces
- **CLI**: zero runtime deps (Convex client is the only exception)
- **Backend**: Convex (telemetry + feedback only)
- **Website**: Next.js 14+ App Router, deployed on Vercel
- **Skills**: plain markdown (Anthropic skill spec) with optional `references/` and `agents/openai.yaml`
- **Knowledge base**: plain markdown
- **Ecosystem catalog**: plain JSON
- **Install**: bash script hosted at suiperpower.dev/setup.sh, npm package `suiperpower`

## Project structure

See `plans/02-PROJECT-STRUCTURE.md` for the full tree. Summary:

```
suiperpower/
├── README.md, CLAUDE.md, AGENTS.md, LICENSE, CONTRIBUTING.md
├── package.json, pnpm-workspace.yaml, tsconfig.json, vercel.json
├── install.sh, setup, suiperpower-pass.sh
├── cli/                CLI source + catalog data
├── skills/             All journey skills + knowledge base + shared data
├── convex/             Backend (telemetry + feedback)
├── public/             setup.sh, logo, og-image
├── scripts/            Build / release tooling (cursor-rules generator, preamble injector)
└── plans/              Source-of-truth planning docs (this folder)
```

Skills live under `skills/<phase>/<name>/SKILL.md`. Phases: `learn/`, `idea/`, `build/`, `ship/`, `grow/`.

## Key design decisions and why

- **Single npm package**: easiest install, easiest versioning, lowest cognitive cost for users. Validated by solana-new's adoption.
- **Skills as plain markdown**: transparent, audit-friendly, anyone can read or fork.
- **Multi-agent parity from v1**: Claude Code + Codex + Cursor. Excluding any leaves users on the table for a few hundred lines of conversion code.
- **Convex backend**: zero-ops, free tier sufficient, same pattern as solana-new.
- **Anti-slop quality gates as first-class skills**: see `plans/12-ANTI-SLOP-FRAMEWORK.md`. Every build / ship skill embeds a gate. This is the differentiator.
- **Sponsor integrations are real**: Walrus / DeepBook / Scallop have first-class skills, knowledge docs, catalog entries. /pick-my-sui-track refuses to recommend a sponsor track unless the integration is load-bearing (see `plans/11-SPONSOR-INTEGRATION.md`).
- **No webapp, no signup, no dashboard in v1**: the CLI is the product. Website is content-only (catalog browsing + install).
- **Skills handoff via filesystem** (`.suiperpower/<phase>-context.md`): no global state, no DB on the user critical path.
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

If you are a coding agent picking up work, read 00 → 04 → 12 → 02 first. Everything else is on demand.

## Build commands (once code exists)

```bash
pnpm install                  # install workspace deps
pnpm dev                      # run CLI locally with hot reload
pnpm build                    # build CLI to dist/
pnpm test                     # run unit + integration tests
pnpm test:install             # CI test the install flow in a fresh container
pnpm lint                     # ESLint + Prettier check
pnpm typecheck                # tsc --noEmit
pnpm publish:dry              # npm pack + verify contents
pnpm publish                  # actual npm publish (gated)
pnpm convex:dev               # Convex dev backend
pnpm convex:deploy            # Convex deploy to prod
pnpm web:dev                  # Next.js website dev server
pnpm web:build                # Next.js production build
```

(Exact commands finalized in build phase. CLAUDE.md updates when scripts are real.)

## Quality bar reference

When implementing a skill or adding catalog content, hold to:

- `plans/12-ANTI-SLOP-FRAMEWORK.md`, the quality bar this project embodies
- `plans/15-BRAND.md`, the voice of every user-facing string
- `plans/05-SKILL-FORMAT.md`, the structure every SKILL.md follows

Skills should be in the senior-friend voice (direct, not condescending, no marketing-speak). No em-dashes anywhere (Kelvin's project rule). Comments concise and direct.

## Conventions

- ESM only (`.js` extensions in imports under NodeNext).
- Strict TypeScript, no implicit any.
- Single source of truth for branding strings: `cli/branding.ts`.
- Skills are plain markdown, no code generation in skills.
- Catalog data is JSON, sorted alphabetically by id.
- Naming: kebab-case for skills / files / folders / catalog ids.
- No emojis in product copy unless explicitly part of an output the user asked for.
- No em-dashes (commas / periods instead).
- No "leverage" / "cutting-edge" / "world-class" / "revolutionary" / "AI-powered" / "Web3".
- Capitalize Sui-specific terms: Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin.

## Mid-build steering

If you (an AI agent) discover something during implementation that should be a durable rule for all future work on this codebase, add it to `plans/19-OPEN-QUESTIONS.md` as a `decided:` entry with a date, then propagate to the relevant plan doc.

If you are inside an autonomous build loop, durable rules go to `bigdev/claude/requirements-log.md` (committed, read every iteration). One-shot transient corrections go to `bigdev/claude/inject.md` (gitignored). Both wired up if and when the build loop is initialized.

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
