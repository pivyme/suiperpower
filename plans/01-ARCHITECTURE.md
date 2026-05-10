# 01. Architecture

## System shape

Suiperpower has six layers. Each layer is independent and can ship without the others, but together they form the user experience promised on the landing page.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 6  Website         suiperpower.dev (install + catalog browse)│
├─────────────────────────────────────────────────────────────────────┤
│  Layer 5  Backend         Convex (opt-in telemetry + feedback)      │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 4  CLI             suiperpower (init, doctor, search, update)│
├─────────────────────────────────────────────────────────────────────┤
│  Layer 3  Agent installs  ~/.claude  ~/.codex  ~/.cursor (skills)   │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 2  Skills + KB     skills/ (journey skills, knowledge, data) │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 1  Source repo     github.com/<your-handle>/suiperpower      │
└─────────────────────────────────────────────────────────────────────┘
```

## Install flow (end-to-end)

```
user terminal
   │
   │  curl -fsSL https://suiperpower.dev/setup.sh | bash
   ▼
suiperpower.dev/setup.sh
   │
   │  1. check Node 20+, git
   │  2. npm install -g suiperpower
   │  3. detect / install Claude Code, Codex, Cursor CLIs
   │  4. run `suiperpower init`
   ▼
suiperpower init
   │
   │  fetches latest skills from github
   │  copies to ~/.claude/skills/, ~/.codex/skills/, ~/.cursor/rules/
   │  writes ~/.suiperpower/config.json (telemetry tier prompt)
   │  prints quickstart
   ▼
user
   │
   │  claude "/find-next-sui-idea what should I build?"
   ▼
Claude Code
   │
   │  loads skill from ~/.claude/skills/find-next-sui-idea/SKILL.md
   │  walks user through discovery
   │  writes .suiperpower/idea-context.md to project
   ▼
next skill in journey
   │
   │  reads .suiperpower/idea-context.md
   │  continues from there
```

Detailed install design lives in `03-INSTALL-FLOW.md`.

## Layer 1: Source repo

Single GitHub repo, monorepo, pnpm workspaces. Hosts everything: CLI source, skills (markdown), knowledge base, ecosystem catalog, Convex backend, install script, website. Versioned together so a `suiperpower update` upgrades all of them in lock-step.

Why monorepo: the CLI and the skill catalog reference each other constantly (CLI search reads catalog JSON, skills reference knowledge base files by relative path). Splitting them adds release-coordination cost for zero benefit.

Detailed structure in `02-PROJECT-STRUCTURE.md`.

## Layer 2: Skills and knowledge base

Skills are markdown prompts following Anthropic's Skill spec. Each skill is a directory with:

- `SKILL.md`, the prompt and workflow (frontmatter declares name, description, trigger phrases)
- `references/`, optional supporting markdown chunks the skill loads on demand
- `agents/openai.yaml`, the Codex-compatible variant (frontmatter equivalent)

Knowledge base is plain markdown, six core docs covering the Sui ecosystem from chain primitives to app layer. Skills reference knowledge docs by path.

Skill format spec in `05-SKILL-FORMAT.md`. Knowledge base spec in `06-SUI-KNOWLEDGE-BASE.md`.

## Layer 3: Agent installs

Each agent has its own skills directory:

| Agent | Install path | Format |
|---|---|---|
| Claude Code | `~/.claude/skills/<skill-name>/SKILL.md` | Anthropic skill spec, native |
| Codex | `~/.codex/skills/<skill-name>/SKILL.md` | Anthropic spec + `agents/openai.yaml` |
| Cursor | `~/.cursor/rules/<skill-name>.mdc` | Cursor rules format, generated from SKILL.md |

`suiperpower init` writes to all three. If an agent CLI is not detected, the corresponding directory is still populated so that installing the agent later picks up the skills. Detail in `09-MULTI-AGENT-PARITY.md`.

## Layer 4: CLI

`suiperpower` is the command-line entry point. Commands:

- `suiperpower init`, install / refresh skills to all detected agent dirs
- `suiperpower doctor`, environment health check (Node, Sui CLI, agent CLIs, network)
- `suiperpower update`, pull latest skills + catalog
- `suiperpower search <query>`, search the ecosystem catalog
- `suiperpower skills`, list installed skills with one-line descriptions
- `suiperpower mcps`, list available Sui MCP servers
- `suiperpower repos`, list clonable Sui repos
- `suiperpower ideas`, browse curated ideas
- `suiperpower uninstall`, remove from all agent dirs and config
- `suiperpower feedback`, submit feedback to the Convex backend
- `suiperpower --version`

CLI is intentionally thin. Skills do the heavy work. CLI exists to install skills, surface the catalog, and run health checks. Detail in `08-CLI-DESIGN.md`.

## Layer 5: Backend (Convex)

Two tables: `telemetry` and `feedback`. Telemetry is opt-in, three tiers:

- `off`, no events sent (still tracked locally in `~/.suiperpower/telemetry.jsonl` for the user's own use)
- `anonymous` (default after install if user picks anonymous), skill name + duration + success/fail + platform string. No code, no file paths, no PII.
- `community`, anonymous events plus self-declared category (e.g. "DeFi builder", "first-timer") so the catalog can prioritize what people actually use

Feedback is opt-in, per-skill, prompted at the end of journeys.

Detail in `13-CONVEX-BACKEND.md`.

## Layer 6: Website

`suiperpower.dev` is a content site, not a webapp. Three jobs:

1. Host `setup.sh` (the install script).
2. Render the install command above the fold.
3. Browse the skill catalog and ecosystem catalog (read-only views over the same JSON files the CLI uses).

No login, no dashboard, no signup. The CLI is the product.

Detail in `14-WEBSITE-STRUCTURE.md`.

## Data flow between phases

Suiperpower journey skills hand off context via a `.suiperpower/` folder inside the user's project:

```
.suiperpower/
  idea-context.md        written by find-next-sui-idea, validate-idea
  build-context.md       written by scaffold-project, build-with-claude
  deploy-context.md      written by deploy-to-testnet, deploy-to-mainnet
  submission-context.md  written by submit-to-sui-overflow
  learnings.md           written by learn skill across sessions
```

Context handoff is **optional**, not a gate. Any skill can be invoked standalone, in which case it interviews the user directly to get what it needs. This matches solana-new's pattern.

The handoff contract for each context file is defined in `skills/data/specs/phase-handoff.md` (to be authored during build phase).

## Versioning

Single semver version across CLI, skills, catalog, and website. Bumping the npm package bumps everything. Skills carry no individual versions, you get the version that shipped with the CLI you have.

Why: keeps the support matrix at one dimension. A user reporting a bug just shares `suiperpower --version` and we know exactly what they have.

## Update path

`suiperpower update` runs `npm install -g suiperpower@latest` then re-runs `suiperpower init`, overwriting any skill files in `~/.claude/skills/`, `~/.codex/skills/`, `~/.cursor/rules/` that came from us. User-authored skills in those directories are left alone (we only manage files matching `suiperpower-*` prefix or recorded in our manifest).

Detail in `08-CLI-DESIGN.md`.

## Failure modes and degradation

- **No internet during install**: install.sh fails clean with a single retry suggestion. No half-installed state.
- **Agent CLI missing**: skills still install to that agent's expected directory. User installs agent later, skills are already there.
- **Convex unreachable**: telemetry buffers to `~/.suiperpower/telemetry.jsonl` and retries on next CLI invocation. Never blocks the user.
- **Sui CLI missing**: `doctor` flags it but does not block. Skills that need `sui client` will prompt the user to install.
- **A skill fails mid-journey**: `.suiperpower/` context is preserved. User can re-invoke the skill or jump to the next one manually.

## Why these choices

- **Single npm package**: easiest install path, easiest versioning, lowest user-side cognitive cost. Same choice solana-new made, validated by their adoption.
- **Skills as plain markdown in a public repo**: any user can read, fork, audit. No black-box prompts. Transparent supply chain.
- **Convex over self-hosted**: zero-ops backend, generous free tier, real-time queries we will not actually need but get for free, pattern is already proven by solana-new.
- **Cursor parity from day one**: Cursor has a non-trivial Sui-curious developer base. Excluding them in v1 leaves users on the table for no engineering benefit.
- **No webapp**: the CLI is the product. A webapp creates a fake second product to maintain.
