# AGENTS.md, Suiperpower

Context for any AI coding agent (Codex, Cursor, generic LLM tools) working on the Suiperpower codebase itself. Mirrors `CLAUDE.md`. If you are running as Claude Code, read `CLAUDE.md`; everything else, read this file.

## What this project is

Suiperpower is the open platform behind https://suiperpower.dev. Skills, knowledge, ecosystem catalog, and a CLI for shipping production Sui products. Distributed via curl one-liner. Built around an explicit anti-slop quality bar so projects survive past hackathons, not just win them.

Tagline: **Build something meaningful, on Sui**

The launch occasion is Sui Overflow 2026, but Suiperpower is a long-lived production tool, not a hackathon helper.

## Tech stack

- **Language**: TypeScript (strict, ESM, NodeNext)
- **Runtime**: Node.js 20+
- **Package manager**: pnpm workspaces
- **CLI**: zero runtime deps (Convex client is the only exception)
- **Backend**: Convex (telemetry + feedback only)
- **Website**: static setup assets today, full site is separate from the core CLI work
- **Skills**: plain markdown (Anthropic skill spec) with optional `references/` and `agents/openai.yaml`
- **Knowledge base**: plain markdown
- **Ecosystem catalog**: plain JSON
- **Install**: bash script hosted at suiperpower.dev/setup.sh, npm package `suiperpower`

## Project structure

Source-of-truth tree: `plans/02-PROJECT-STRUCTURE.md`. On-disk shape today:

```
suiperpower/
├── README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, LICENSE
├── package.json, pnpm-workspace.yaml
├── core/               publishable npm package "suiperpower"
│   ├── cli/            CLI source + cli/data/ ecosystem catalog
│   ├── skills/         SKILL_ROUTER.md + per-phase skill folders + skills/data/
│   ├── scripts/        release tooling (preamble injector, lint, package)
│   ├── install.sh      curl one-liner bootstrap
│   └── skills-lock.json
├── convex/             telemetry + feedback backend
├── web/                static setup assets + website shell
├── scratchpads/        local-only build loop and notes, gitignored
├── plans/              source-of-truth planning docs (31 files)
└── reference/          vendored solana-new-main for pattern reference only
```

Skills live under `core/skills/<phase>/<name>/SKILL.md`. Phases: `learn/`, `idea/`, `build/`, `ship/`, `grow/`. As of today `learn/`, `idea/`, `build/`, `ship/` exist; `grow/` is planned.

## Plans index

`plans/README.md` is the index. Categories: foundation (00-03), skills authoring (04-05, 22-23, 29-30), knowledge / sponsors (06, 11), catalog (07), CLI (08), multi-agent (09), hackathon (10), anti-slop (12), backend (13), website (14, deferred), brand (15), content (16), launch (17), roadmap (18), open questions (19), contributing (20), testing (21), security (25), governance (27), competitive landscape (28).

If you are picking up work cold: read 00 → 04 → 12 → 02 → 22 → 26 in that order. 30 is required reading before authoring any shared guide.

## Build commands

Real today:

```bash
pnpm install                  # install workspace deps
pnpm dev                      # run CLI locally via tsx (core/cli/index.ts)
pnpm build                    # tsc to core/dist/ + chmod +x dist/cli/index.js
pnpm typecheck                # tsc --noEmit
pnpm preamble:check           # verify the telemetry preamble in every SKILL.md
pnpm package:skills           # build per-skill tarballs and index.json under web/public/skills/
pnpm lint:skills              # validate every core/skills/**/SKILL.md against plans/05 + plans/15
pnpm lint:catalog             # validate every core/cli/data/*.json against plans/07
pnpm test                     # typecheck + lint:skills + lint:catalog + preamble:check
pnpm test:install             # CLI smoke test (build, version, doctor, vendor-mode init)
pnpm setup                    # run ./setup local-dev convenience
```

For the autonomous build loop, use `./scratchpads/bigdev/autobuild` if it exists locally. `scratchpads/` is gitignored, so do not reference those paths from committed code or skills.

## Conventions

- ESM only (`.js` extensions in imports under NodeNext).
- Strict TypeScript, no implicit any.
- Single source of truth for branding strings: `core/cli/branding.ts`.
- Skills are plain markdown, no code generation in skills.
- Catalog data is JSON, sorted alphabetically by id.
- Naming: kebab-case for skills, files, folders, catalog ids.
- No emojis in product copy.
- No em-dashes anywhere. Use commas or periods.
- No banned words: "leverage", "cutting-edge", "world-class", "revolutionary", "AI-powered", "Web3".
- Capitalize Sui-specific terms: Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin.

## Quality bar

When implementing a skill or adding catalog content, hold to:

- `plans/12-ANTI-SLOP-FRAMEWORK.md`, the quality bar this project embodies
- `plans/15-BRAND.md`, the voice of every user-facing string
- `plans/05-SKILL-FORMAT.md`, the structure every SKILL.md follows
- `plans/29-DOCS-AUTHORING-STANDARDS.md`, the mechanical rules for all markdown / JSON / CLI output

Every build / ship skill ends with a non-trivial Quality gate (anti-slop). Examples in `plans/12`.

## Skill authoring (must read before touching skills/)

CLAUDE.md has the full skill authoring section. The short version:

1. **Source-of-truth rule**: every technical claim must trace to a real, current source. The author provides URLs or pasted docs. You read or fetch them. You write only what the source supports. If the source does not cover a claim, drop the claim or ask. Sui, Walrus, DeepBook, Scallop, zkLogin and similar topics drift fast; outdated training data is the most common source of bad skills.

2. **Context-efficiency**: skills compete with the user's code for tokens. Length target ~80 to 250 lines, hard ceiling ~400. Link, do not inline. No verbose preambles. No marketing copy. One example beats five.

3. **Format**: frontmatter valid (`name:` matches folder, `description:` packs trigger phrases), required sections present (Preamble, What this skill does, When to use it, When NOT to use it, Inputs, Outputs, Workflow, Quality gate, References, Use in your agent), telemetry preamble byte-identical (run `pnpm preamble:check`), router-handoff line at the end.

Common failures: inventing function names, stale package names (`@mysten/sui.js` is old, current is `@mysten/sui`), confusing Sui Move with Aptos / Core Move, outdated sponsor program details, marketing voice creeping in.

If unsure, ask. A delay is cheaper than a wrong skill shipped to thousands of agents.

## Mid-build steering

If you discover something during implementation that should be a durable rule for all future work on this codebase, add it to `plans/19-OPEN-QUESTIONS.md` as a `decided:` entry with a date, then propagate to the relevant plan doc.

If you are inside the autonomous build loop, durable rules go to `bigdev/claude/requirements-log.md` (committed). One-shot transient corrections go to `bigdev/claude/inject.md` (gitignored). Drive both via the launcher: `./bigdev/autobuild say "rule"` for durable, `./bigdev/autobuild fix "msg"` for one-shot.

Commit rule (project-wide, including the build loop): Kelvin is the sole committer. Never add a `Co-Authored-By` line to any commit, ever.

## What this project is NOT

- Not a fork of solana-new. Format inspired by it, content is Sui-native from the first byte.
- Not a webapp. The CLI is the product.
- Not a Sui Foundation product. Independent, MIT, no endorsement claimed.
- Not a paid product. Open source, free, no premium tier in v1.
- Not a hackathon-only tool. Built for production Sui product builders long-term.

## Where to ask questions

- GitHub Issues for bugs and skill requests
- GitHub Discussions for RFCs and roadmap input
- Sui Overflow Telegram: https://go.sui.io/suioverflow2026-tg
