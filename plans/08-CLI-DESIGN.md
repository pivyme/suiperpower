# 08. CLI design

## Philosophy

The CLI is a thin shell. Its only jobs:

1. Install / refresh skills to all detected agent dirs.
2. Surface the ecosystem catalog so users can browse without leaving the terminal.
3. Run health checks.
4. Submit feedback / telemetry.

It does not do build automation, deployments, or anything a skill could do better. Skills are where the intelligence lives.

## Commands

```
suiperpower                       # interactive onboarding TUI if no subcommand
suiperpower init                  # install / refresh skills
suiperpower init --vendor         # vendor skills into the current project
suiperpower doctor                # environment health check
suiperpower update                # pull latest, re-init
suiperpower uninstall             # remove skills + config
suiperpower skills                # list installed skills (TUI, filterable)
suiperpower skills --json         # machine-readable
suiperpower repos                 # list ecosystem repos (TUI)
suiperpower mcps                  # list MCP servers (TUI)
suiperpower ideas                 # browse curated ideas (TUI)
suiperpower search <query>        # search across skills + repos + mcps + ideas
suiperpower feedback              # submit feedback (interactive)
suiperpower journey               # walk a guided journey TUI (idea → build → ship)
suiperpower --version
suiperpower --help
suiperpower completion bash|zsh   # print shell completion script
```

## File responsibilities

```
cli/
  index.ts                  Command dispatcher. Reads argv, routes to command file. ~150 LOC.
  branding.ts               Single source of truth for brand strings (PRODUCT_NAME, INSTALL_URL, GH_REPO, NPM_PKG, CONFIG_DIR, etc.). Anywhere else that needs a brand string imports from here.
  banner.ts                 ASCII banner shown by `init` and on first interactive run.
  colors.ts                 Terminal color helpers (chalk-free, raw ANSI to keep deps zero).
  init.ts                   Implements `suiperpower init` and `--vendor`. Writes to ~/.claude, ~/.codex, ~/.cursor.
  doctor.ts                 Implements `suiperpower doctor`. Never exits non-zero.
  uninstall.ts              Reads ~/.suiperpower/skills-installed.json, removes those files.
  update-check.ts           On every command, async-checks npm for a newer version, prints a one-liner if available.
  feedback.ts               Implements `suiperpower feedback`. Prompts for skill, rating, free-text, sends to Convex.
  telemetry.ts              Tiny helper used by CLI commands (skills do their own telemetry from bash preamble).
  repos.ts                  `suiperpower repos`. Reads cli/data/clonable-repos.json, renders TUI.
  agent-cli.ts              Detect / install Claude Code, Codex, Cursor CLIs. Used by init.ts.
  copilot-auth.ts           Optional. GitHub Copilot integration if user wants it (post-v1).
  copilot-client.ts         ↑ HTTP client (post-v1).
  workspace-setup.ts        Bootstrap a project workspace (create .suiperpower/, README, .env.example).
  completion.ts             Print shell completion scripts.
  interactive-onboarding.ts First-run TUI when user types `suiperpower` with no args.
  interactive-search.ts     `suiperpower search` TUI.
  interactive-skills.ts     `suiperpower skills` TUI.
  interactive-mcps.ts       `suiperpower mcps` TUI.
  interactive-journey.ts    `suiperpower journey` TUI.
  interactive-universal.ts  Shared TUI primitives (list picker, fuzzy-find, keyboard nav).
  data/
    clonable-repos.json
    sui-skills.json
    sui-mcps.json
    sui-ideas.json
```

## branding.ts

```typescript
export const BRAND = {
  PRODUCT_NAME: "suiperpower",
  PRODUCT_NAME_TITLE: "Suiperpower",
  TAGLINE: "build Sui that ships.",
  INSTALL_URL: "https://suiperpower.dev/setup.sh",
  WEBSITE_URL: "https://suiperpower.dev",
  GH_REPO: "<your-handle>/suiperpower",
  GH_URL: "https://github.com/<your-handle>/suiperpower",
  NPM_PKG: "suiperpower",
  CONFIG_DIR: ".suiperpower",
  CONVEX_URL_DEFAULT: "<convex-url-placeholder>",
  TELEGRAM_URL: "https://go.sui.io/suioverflow2026-tg",
  HACKATHON_URL: "https://overflow.sui.io",
  SUBMISSION_URL: "https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf",
} as const;
```

Every other file imports from here. Never hardcode a brand string elsewhere. This is the file Kelvin updates first when the GitHub handle is decided.

## index.ts dispatcher pattern

```typescript
const handlers: Record<string, () => Promise<void>> = {
  init: () => import("./init.js").then(m => m.run(args)),
  doctor: () => import("./doctor.js").then(m => m.run(args)),
  update: () => import("./update.js").then(m => m.run(args)),
  uninstall: () => import("./uninstall.js").then(m => m.run(args)),
  skills: () => import("./interactive-skills.js").then(m => m.run(args)),
  repos: () => import("./repos.js").then(m => m.run(args)),
  mcps: () => import("./interactive-mcps.js").then(m => m.run(args)),
  ideas: () => import("./interactive-search.js").then(m => m.runIdeas(args)),
  search: () => import("./interactive-search.js").then(m => m.run(args)),
  feedback: () => import("./feedback.js").then(m => m.run(args)),
  journey: () => import("./interactive-journey.js").then(m => m.run(args)),
  completion: () => import("./completion.js").then(m => m.run(args)),
};
```

Dynamic imports keep startup fast: a `suiperpower --version` invocation only loads `branding.ts` and `package.json`, not all 15 commands.

## Onboarding TUI (no-args invocation)

When the user types `suiperpower` with no args, run `interactive-onboarding.ts`:

```
┌──────────────────────────────────────────────┐
│  suiperpower                                 │
│  build Sui that ships.                       │
│                                              │
│  What do you want to do?                     │
│                                              │
│  > Find an idea to build                     │
│    Scaffold a project                        │
│    Build with Claude / Codex / Cursor        │
│    Deploy to testnet / mainnet               │
│    Submit to Sui Overflow 2026               │
│    Browse the catalog                        │
│    Run health check                          │
│    Update suiperpower                        │
│                                              │
│  ↑↓ to navigate, enter to select, q to quit  │
└──────────────────────────────────────────────┘
```

Each option prints the agent command the user should run, e.g. selecting "Find an idea to build" prints:

```
Run this in your agent:

  claude "/find-next-sui-idea what should I build?"

(or in Codex / Cursor; same skill activates by name)
```

We do not invoke the agent CLI ourselves. The user copies and runs. This avoids subprocess complexity and gives the user control.

## doctor output

```
suiperpower doctor

  Environment
  ✓ Node.js v20.x
  ✓ npm 10.x
  ✓ git installed

  Agents
  ✓ Claude Code 1.x
  ⚠ Codex not installed         install: npm i -g @openai/codex
  ⚠ Cursor not detected         install: https://cursor.com

  Sui
  ✓ Sui CLI 1.x (active env: devnet)
  ⚠ No active address          run: sui client new-address ed25519
  ⚠ Sui devnet faucet not requested in 24h

  suiperpower
  ✓ ~/.suiperpower/config.json present, telemetry: anonymous
  ✓ Skills installed: 32
  ✓ Catalog: 47 repos, 18 mcps, 11 ecosystem skills, 220 ideas
  ⚠ Newer version available: v0.2.1 (you: v0.2.0)  run: suiperpower update
```

Doctor never exits non-zero. Even with all warnings, a user can still use the tool. This is by design.

## Search behavior

`suiperpower search <query>` searches across:

1. Installed skill names + descriptions
2. Ecosystem repos (name, description, tags)
3. MCPs (name, description, useCases)
4. Ideas (title, summary, category)

Fuzzy match (string-similarity), top 10 results, grouped by source, each with the right command to act on it (e.g. for a skill: "run: claude '/<skill> <query>'").

## Telemetry from the CLI

CLI commands (init, doctor, update, search, etc.) emit telemetry with the same schema skills use, namespace `cli` instead of `skill`. Same opt-in flow: nothing sent if tier is `off`.

Schema in `13-CONVEX-BACKEND.md`.

## Update check on every command

Every CLI invocation (post-init) async-checks `npm view suiperpower version` against the local version. Result is cached for 24h in `~/.suiperpower/.update-check`. If a newer version exists, append a one-liner to the bottom of the command output:

```
suiperpower v0.2.1 available (you have v0.2.0). Run `suiperpower update`.
```

Never blocks the command in progress.

## Vendoring (per-project install)

```
suiperpower init --vendor
```

Behavior:

1. Detect current project root (look for `.git`, `package.json`, `Move.toml`, in that order).
2. Copy skills to `<project>/.claude/skills/suiperpower/`, `<project>/.codex/skills/suiperpower/`, `<project>/.cursor/rules/suiperpower/`.
3. Add a one-liner to the project's README explaining that teammates get skills automatically when they clone.
4. Optionally write `.gitignore` exclusions if user wants per-developer install instead (default: keep skills committed for distribution).

Use case: a team lead vendors suiperpower into the team monorepo. Teammates clone the repo and immediately have all skills available without running curl.

## Help text shape

```
suiperpower --help

  suiperpower v0.2.0
  build Sui that ships.

  Commands

    init [--vendor]      Install or refresh skills (default: ~/.claude, ~/.codex, ~/.cursor)
    doctor               Run environment health check
    update               Update suiperpower and refresh skills
    uninstall            Remove skills and config

    skills               Browse installed skills
    repos                Browse ecosystem repos
    mcps                 Browse MCP servers
    ideas                Browse curated startup ideas
    search <query>       Search across all of the above

    journey              Guided journey TUI (idea → build → ship)
    feedback             Send feedback to the team

    completion <shell>   Print shell completion script

  Options

    --version            Print version and exit
    --json               Print machine-readable output where supported
    --help               Print this help

  Docs              https://suiperpower.dev
  Source            https://github.com/<your-handle>/suiperpower
  Sui Overflow 2026 https://overflow.sui.io
```

## Color and TUI library choice

- ANSI color via raw escape codes in `colors.ts` (no chalk dependency).
- TUI via raw stdin readline (no ink, no blessed). The TUIs are simple list pickers, not full apps.
- Banner uses Unicode box-drawing characters and ANSI bold / cyan.

Why no UI library: keeps the dependency surface at zero runtime deps (Convex client is the only exception). Faster install, easier audit, no version churn from ecosystem libraries.

## Performance budget

- `suiperpower --version`: under 100ms cold.
- `suiperpower doctor`: under 1 second (synchronous prereq check, async update check fires-and-forgets).
- `suiperpower init` first run: under 5 seconds (network-bound for skill download).
- `suiperpower init` re-run: under 2 seconds.

## Error UX

- Every fatal error has a one-line cause and a one-line action.
- Stack traces only printed with `SUIPERPOWER_DEBUG=1`.
- Exit codes: 0 success, 1 user error (bad args), 2 environment error (network down, perms), 3 internal bug.

Example:

```
suiperpower init
  ✗ Cannot write to ~/.claude/skills/ (permission denied)
    fix: chmod u+w ~/.claude/skills/   or run with appropriate permissions
```

Not:

```
Error: EACCES: permission denied, mkdir '/Users/.../skills'
    at Object.mkdirSync (node:fs:1361:3)
    ...
```
