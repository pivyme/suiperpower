# 09. Multi-agent parity

## Goal

A user with Claude Code, Codex, or Cursor gets the same skills, the same trigger phrases, the same outputs. We ship a single source-of-truth (`SKILL.md`) and adapt at install time for each agent's native format.

## Why parity matters

Sui Overflow 2026 participants will not all use the same agent. Cursor has a large web2-to-web3 onboarding pool, Codex is the OpenAI default, Claude Code is dominant in skill-driven workflows. Excluding any of them in v1 leaves users on the table for a few hundred lines of conversion code.

## Source-of-truth model

```
skills/<phase>/<skill-name>/
  SKILL.md           ← canonical, hand-authored
  references/        ← canonical
  agents/openai.yaml ← hand-authored YAML mirror for Codex
```

At install time, `suiperpower init`:

1. Copies the canonical files to `~/.claude/skills/<skill-name>/` as-is. Claude Code reads SKILL.md natively.
2. Copies the same to `~/.codex/skills/<skill-name>/`. Codex reads `agents/openai.yaml` first, falls back to SKILL.md frontmatter.
3. Generates a single `~/.cursor/rules/<skill-name>.mdc` per skill via `scripts/generate-cursor-rules.ts`. Cursor's rule format inlines references.

## Per-agent details

### Claude Code

**Install path**: `~/.claude/skills/<skill-name>/SKILL.md`

**How activation works**: User types `/<skill-name>` or types a natural-language message containing trigger phrases from the skill's `description:`. Claude auto-activates.

**On-demand reference loading**: Yes, Claude reads `references/*.md` lazily.

**No conversion needed**: SKILL.md is the native format.

**Caveats**: Skills must have unique names within `~/.claude/skills/`. We prefix nothing (the skill folder names themselves are unique enough: `find-next-sui-idea`, etc.). If a user has installed a conflicting skill from another source, our `init` warns and offers to namespace under `~/.claude/skills/suiperpower/`.

### Codex (OpenAI)

**Install path**: `~/.codex/skills/<skill-name>/`

**How activation works**: Same trigger phrase model. Codex reads `agents/openai.yaml` for metadata, then loads `prompt_path` (which points back to `../SKILL.md`).

**On-demand reference loading**: Yes if specified in the YAML's `references:` list. Codex loads them when the AI determines they are needed.

**Conversion needed**: Authors hand-write `agents/openai.yaml` alongside `SKILL.md`. They share content but different formats. A lint script (`scripts/check-skill-consistency.ts`) verifies the YAML's `description:` matches the SKILL.md frontmatter `description:` to within minor edits.

**Caveats**: Codex skill activation is less robust than Claude's at the time of writing. We accept that Codex users may need to type `/<skill-name>` explicitly more often.

### Cursor

**Install path**: `~/.cursor/rules/<skill-name>.mdc`

**How activation works**: Cursor uses MDC rules with frontmatter. Rules with `alwaysApply: false` only activate when the AI determines the rule is relevant (description-matching). Rules with `globs:` apply to specific file patterns.

**On-demand reference loading**: No native support. We inline references at generation time.

**Conversion needed**: Yes, via `scripts/generate-cursor-rules.ts`.

**MDC shape**:

```mdc
---
description: <copied from SKILL.md description>
globs:
alwaysApply: false
---

# <skill-name>

<full body of SKILL.md, telemetry preamble omitted (see "Cursor and telemetry" below)>

## References (inlined)

### references/<filename>.md

<full content of that reference>

### references/<filename2>.md

<full content of that reference>
```

**Cursor and telemetry**: The bash preamble that fires telemetry from SKILL.md does not run inside Cursor (Cursor does not execute bash blocks the way Claude Code does). For Cursor users, telemetry is captured by the CLI on `init` / `update` / `search` only. Per-skill telemetry from Cursor is missing in v1, accepted gap.

**Cursor and `globs:`**: For some skills it makes sense to scope to file patterns, e.g. `build-with-move` could glob `**/*.move` to auto-suggest itself. v1 leaves `globs:` empty for all skills (description-only activation). v1.1 considers per-skill glob hints.

### Other agents (post-v1)

Targets for v1.1:

- Continue.dev (VS Code agent)
- Aider
- Goose

Same pattern: a generator script per agent, fed by the canonical SKILL.md.

## Slash command parity

| User types | Claude Code | Codex | Cursor |
|---|---|---|---|
| `/find-next-sui-idea` | activates skill | activates skill | matches MDC description, AI uses rule |
| natural-language with trigger phrase | activates via description match | same | same |
| skill is missing | "I don't know that skill, install via `suiperpower init`" | same | rule simply does not match |

## Init behavior with mixed agent installs

```
suiperpower init
  Detected agents:
    ✓ Claude Code 1.x
    ⚠ Codex not installed (skills written anyway to ~/.codex/skills/)
    ✓ Cursor (via ~/.cursor/)

  Writing skills to:
    ✓ ~/.claude/skills/                  32 skills written
    ✓ ~/.codex/skills/                   32 skills written (Codex install pending)
    ✓ ~/.cursor/rules/                   32 .mdc rules generated

  Manifest written to ~/.suiperpower/skills-installed.json
```

## Conflict handling

If the user has manually authored a skill with the same folder name in `~/.claude/skills/`:

```
suiperpower init
  ⚠ Conflict: ~/.claude/skills/find-next-sui-idea/ exists and was not installed by suiperpower.
    Options:
      a) skip this skill (keep your version)
      b) backup yours to ~/.claude/skills/find-next-sui-idea.backup-<timestamp>/ and install ours
      c) install ours under ~/.claude/skills/suiperpower/find-next-sui-idea/ (namespaced)

  > _
```

Default for non-interactive (`--yes`): option (a), skip.

## Update behavior across agents

`suiperpower update` re-runs init for each agent. Skills with no local edits are overwritten; skills with local edits (detected via hash mismatch against the manifest) prompt the user.

For Cursor specifically, `.mdc` files are always regenerated since they are derived artifacts.

## Testing the multi-agent install

CI runs:

1. Fresh container, install Claude Code only, run `suiperpower init`, assert all skills present in `~/.claude/skills/`.
2. Fresh container, install Codex only, same assertion for `~/.codex/skills/` and `agents/openai.yaml` presence.
3. Fresh container, simulate Cursor presence (just create `~/.cursor/`), assert `.mdc` files generated.
4. Fresh container with all three, assert no conflicts and identical content (modulo format) across all three install paths.

## Known limitations in v1

- Cursor skills do not fire telemetry per invocation. Accepted.
- Cursor skills inline all references at generation time. Larger context per rule, but Cursor's context window handles it.
- Codex's skill activation lags Claude's in robustness. Users may need explicit slash commands more often. Accepted.
- We do not generate Continue.dev / Aider / Goose rules in v1.

## Documentation for users

Each skill's `SKILL.md` ends with a "Use in your agent" section:

```markdown
## Use in your agent

- Claude Code: `claude "/<skill-name> <your message>"`
- Codex: `codex "/<skill-name> <your message>"`
- Cursor: paste a message in chat that includes a trigger phrase from the description, or reference the rule file directly
```

This avoids users having to learn agent-specific quirks.

## Generator script outline

`scripts/generate-cursor-rules.ts` reads each `skills/**/SKILL.md`, parses frontmatter, finds `references/*.md`, and emits one `.mdc` per skill into a build dir. `suiperpower init` copies from this build dir if it exists, else regenerates inline.

Pseudocode:

```typescript
for (const skillPath of glob("skills/**/SKILL.md")) {
  const fm = parseFrontmatter(skillPath);
  const body = stripFrontmatter(skillPath);
  const refs = glob(path.join(dirname(skillPath), "references/*.md"));
  const inlined = refs.map(r => `### ${basename(r)}\n\n${readFile(r)}`).join("\n\n");
  const out = formatMDC(fm.description, body, inlined);
  writeFile(`build/cursor/${fm.name}.mdc`, out);
}
```

The script runs on every `suiperpower init` (idempotent, fast).

## Why we did not pick a "lowest common denominator" format

We could have authored skills in the most-restrictive format (Cursor's MDC) and back-ported. We chose SKILL.md as canonical because:

- It is the most-expressive format (frontmatter + body + on-demand references).
- Claude Code is the most-active skill-driven agent.
- Down-converting to MDC at install is mechanical. Up-converting from MDC would require us to invent on-demand reference semantics that do not exist in the source.

Authoring against the more expressive format keeps optionality open as other agents catch up.
