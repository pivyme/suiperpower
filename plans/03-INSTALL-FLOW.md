# 03. Install flow

## The promise

```bash
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

Under 90 seconds on a fresh machine with Node already installed. Idempotent. Re-running is the supported way to update if `suiperpower update` ever breaks.

## Phases of the install

```
1. Banner + branding              (instant)
2. Prerequisite check             (Node 20+, git)
3. npm install -g suiperpower     (5-30s)
4. Detect / install agent CLIs    (Claude Code, Codex, Cursor)
5. Run `suiperpower init`         (downloads + writes skills)
6. Run `suiperpower doctor`       (warns, never blocks)
7. Telemetry opt-in prompt        (interactive only if TTY)
8. Print quickstart               (skill commands to try)
```

## Prerequisites

Hard requirements (install fails clean if missing):

- **Node.js 20+** with npm. Same threshold as solana-new. Lower than 20 means we cannot use modern ESM features and Convex client constraints.
- **git**, used by `suiperpower init` for cloning repos when the user runs scaffold flows.

Soft requirements (warned by `doctor`, not blocking install):

- **Sui CLI** (`sui`), needed for `sui client publish` and other commands invoked by build / ship skills. We surface install instructions but do not auto-install (Sui CLI is a Rust binary, distribution differs by OS).
- **One of: Claude Code CLI, Codex CLI, Cursor.** If none are detected, we still install skills to all three directories, then print the install commands for each agent.

## install.sh logic (pseudocode)

```
banner()
require node>=20, git, exit-with-message-otherwise

if ! command_exists suiperpower
  npm install -g suiperpower
  fallback to npx if global install fails

# Agent CLIs (best-effort, never block)
detect_or_install claude  → npm i -g @anthropic-ai/claude-code
detect_or_install codex   → npm i -g @openai/codex
detect cursor             → instruct user to install from cursor.com if missing

mkdir -p ~/.claude/skills ~/.codex/skills ~/.cursor/rules

run_ss init   # writes all three dirs

run_ss doctor   # never exits non-zero in the install context

if TTY:
  prompt telemetry tier (off / anonymous / community), default anonymous
  write ~/.suiperpower/config.json
else:
  default to "anonymous" (we will respect a SUIPERPOWER_TELEMETRY env var in v1.1)

print quickstart with 6 example commands
```

The reference implementation pattern is `reference/solana-new-main/install.sh`. We adapt naming, branding, and the agent list (add Cursor).

## What `suiperpower init` writes

```
~/.suiperpower/
  config.json          { telemetryTier, convexUrl, version, installedAt }
  telemetry.jsonl      local-only event log (always written, regardless of tier)
  .telemetry-prompted  presence flag, prevents re-prompting

~/.claude/skills/
  <each skill folder copied from skills/ source>

~/.codex/skills/
  <each skill folder copied from skills/ source>
  (each contains agents/openai.yaml that Codex prefers over SKILL.md frontmatter)

~/.cursor/rules/
  <each skill rendered as a single .mdc file via scripts/generate-cursor-rules.ts>
```

A manifest is written at `~/.suiperpower/skills-installed.json` listing every file we own. `suiperpower update` and `suiperpower uninstall` consult this manifest to avoid touching user-authored skills.

## Telemetry opt-in prompt

The first time the user opens any skill, the skill's bash preamble checks `~/.suiperpower/.telemetry-prompted`. If absent, the skill itself runs an `AskUserQuestion` prompt asking the user to choose. This pattern matches solana-new's behavior and avoids forcing the choice during the curl install (where the user is rushing to get past setup).

The install-script prompt is a separate, optional opt-in shown only when running interactively (TTY). If skipped, the per-skill prompt picks it up later.

## Multi-agent install behavior

| Agent | Detected via | Skill format written | If agent not installed |
|---|---|---|---|
| Claude Code | `command -v claude` | Original `SKILL.md` + `references/` copied as-is | Skills still written to `~/.claude/skills/` for later pickup |
| Codex | `command -v codex` | Same files plus `agents/openai.yaml` is the canonical entry | Same, written to `~/.codex/skills/` |
| Cursor | `command -v cursor` OR existence of `~/.cursor/` | Each skill rendered to a single `.mdc` file via the generator script | Same, written to `~/.cursor/rules/` |

Detail on format conversion in `09-MULTI-AGENT-PARITY.md`.

## Per-project workspace install

Optional: a user can vendor Suiperpower into their project so teammates get skills automatically when they clone the repo.

```
suiperpower init --vendor
```

Copies skills into `<project>/.claude/skills/suiperpower/`, `<project>/.codex/skills/suiperpower/`, and `<project>/.cursor/rules/suiperpower/`. Adds these paths to the project's `.gitignore` if the user opts in (default: keep them committed for teammate distribution).

This mirrors `setup --vendor` in solana-new.

## Doctor checks

`suiperpower doctor` runs every time and prints a status table:

```
suiperpower doctor

  ✓ Node.js v20.x
  ✓ npm 10.x
  ✓ git installed
  ✓ Claude Code 1.x
  ⚠ Codex not installed (skills still written to ~/.codex/skills/, install: npm i -g @openai/codex)
  ⚠ Cursor not detected (skills still written to ~/.cursor/rules/)
  ✓ Sui CLI 1.x (devnet network active)
  ⚠ ~/.suiperpower/config.json missing convexUrl, telemetry will use default
  ✓ skills installed: 32
  ✓ ecosystem catalog: 41 repos, 18 MCPs, 14 ecosystem skills, 220+ ideas
```

Doctor never exits non-zero. The install must be unblockable.

## Update path

```
suiperpower update
```

Steps:

1. `npm install -g suiperpower@latest` (or `npx suiperpower@latest` fallback).
2. Re-run `init` to refresh skill files in all three agent dirs.
3. Print a changelog summary (one-liner per added/changed skill since the user's last version).

The user can also re-curl the install URL at any time. That path is supported and idempotent.

## Uninstall path

```
suiperpower uninstall
```

Steps:

1. Read `~/.suiperpower/skills-installed.json` manifest.
2. Remove every listed file from `~/.claude/skills/`, `~/.codex/skills/`, `~/.cursor/rules/`.
3. Optionally (prompt) remove `~/.suiperpower/` config dir.
4. `npm uninstall -g suiperpower`.

User-authored skills in those directories are untouched.

## Failure modes

| Failure | User-visible behavior |
|---|---|
| Node missing | `fail "Node.js >= 20 required"` with link to nodejs.org |
| Node < 20 | Same |
| `npm install -g` permission denied | Falls back to `npx suiperpower` for the rest of the install, suggests `sudo` or an nvm-style Node setup |
| Network down mid-install | Stops at the failing step, prints retry command, leaves no half-installed state because skill writes happen at the end as one atomic phase |
| Claude / Codex / Cursor install fails | Warning only, install continues |
| Convex URL unreachable during telemetry write | Buffers locally, retries on next CLI invocation |

## Security posture

- The install script is hosted at `suiperpower.dev/setup.sh` and pulled over HTTPS via curl. We will publish a SHA256 of each release on the GitHub releases page so security-conscious users can verify before piping to bash.
- `npm install -g suiperpower` is the only third-party install we initiate without prompting. The CLI does not run as root.
- Skills are read-only files. Nothing in the install starts a background process or modifies PATH outside what `npm install -g` does for the `suiperpower` binary itself.
- Telemetry is opt-in, anonymous by default, and the schema is published in `plans/13-CONVEX-BACKEND.md` and the README.

## Telemetry on first run, full sequence

```
1. install.sh runs interactively (TTY)
   → asks: telemetry off / anonymous / community
   → writes ~/.suiperpower/config.json with the answer
   → writes ~/.suiperpower/.telemetry-prompted

2. install.sh runs non-interactively (curl ... | bash inside CI)
   → no prompt
   → ~/.suiperpower/config.json gets default { telemetryTier: "anonymous" }
   → .telemetry-prompted is NOT written, so the next interactive skill use re-asks

3. First skill invocation, .telemetry-prompted absent
   → skill preamble prompts user via AskUserQuestion
   → user answer overwrites config.json and writes .telemetry-prompted

4. Subsequent invocations
   → no prompt, .telemetry-prompted present
```

This pattern matches solana-new and avoids surprising users who curl-piped without thinking about telemetry.

## What lives at `suiperpower.dev/setup.sh`

The same `install.sh` we ship in the repo, served by Vercel from `public/setup.sh`. Vercel rewrite rule:

```
/setup.sh  →  /public/setup.sh
```

Cache-busting via Vercel's default short-cache headers (we are not the high-traffic site needing CDN tuning).

## Reference implementation

`reference/solana-new-main/install.sh` is the closest working example. Suiperpower's install.sh adapts it with:

- Branding constants changed
- Cursor added to the agent install loop
- Telemetry opt-in copy reworded for the suiperpower brand
- Sui CLI surfacing in doctor (doctor itself stays in `cli/doctor.ts`)
