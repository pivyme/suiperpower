# 05. Skill format

## Anatomy of a skill

Each skill is a directory under `skills/<phase>/<skill-name>/`:

```
skills/build/build-with-move/
  SKILL.md                     primary prompt + workflow (Claude/Cursor canonical entry)
  references/                  optional supporting files loaded on demand
    move-syntax-cheatsheet.md
    common-move-pitfalls.md
    package-manifest-example.md
  agents/
    openai.yaml                Codex-friendly metadata (mirrors SKILL.md frontmatter)
```

## SKILL.md frontmatter

```markdown
---
name: build-with-move
description: Author Sui Move modules and packages with a senior Move dev as your pair. Use when a user says "build a Move module", "write a Move package", "help me with Move", "add a function to my contract". Reads .suiperpower/build-context.md if present. Leverages skills/data/sui-knowledge/03-move-and-objects.md and skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md.
---
```

Rules:

- `name:` must equal the folder name. Used by the AI to register the slash command (`/build-with-move`).
- `description:` is the single most important field. The AI uses it to decide whether to activate this skill on a user message. Pack it with trigger phrases the user is likely to say verbatim.
- Description ends with what the skill **reads** (context files) and **leverages** (knowledge docs, references). This helps cross-skill chaining.

## SKILL.md body sections

The body has a fixed shape so users and reviewers know what to expect.

```markdown
## Preamble (run first)

<bash block, telemetry preamble, see "Telemetry preamble" below>

If `TEL_PROMPTED` is `no`: <opt-in prompt logic>

## What this skill does

<2-4 sentences, what the user gets at the end>

## When to use it

<bullet list of trigger conditions>

## When NOT to use it

<bullet list of skills that are a better fit for nearby intents>

## Inputs

<what the skill expects, e.g. an existing project, a Sui Move package, a deployed package id>

## Outputs

<what the skill writes to disk, e.g. .suiperpower/build-context.md, src/move/sources/*.move>

## Workflow

<numbered steps the AI must follow>
1. Read .suiperpower/build-context.md if present, else interview the user
2. Confirm the user's intent and scope
3. ...
N. Write the next-phase context file

## Quality gate (anti-slop)

<question or check the skill must run before reporting done>

## References

<paths to references/ and skills/data/ files this skill loads on demand>
```

## Telemetry preamble

Every skill starts with the same bash preamble. It mirrors solana-new's telemetry block, branded for suiperpower. The block:

1. Reads `~/.suiperpower/config.json` for telemetry tier.
2. Records start time and a session id.
3. If tier is not `off`, writes a started event to `~/.suiperpower/telemetry.jsonl` and fires an async POST to Convex.
4. Skips entirely if tier is `off`.

Verbatim shape (placeholder values, build phase will finalize):

```bash
_TEL_TIER=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.suiperpower/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.suiperpower
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
  _TEL_EVENT='{"skill":"<skill-name>","phase":"<phase>","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"<skill-name>","phase":"<phase>","status":"started","version":"<version>","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

A code-gen step (`scripts/inject-preamble.ts`) keeps the preamble identical across all skill files, replacing `<skill-name>`, `<phase>`, `<version>`. Hand-editing the preamble in a single skill is forbidden, only the script writes it.

## Telemetry opt-in flow inside a skill

If `TEL_PROMPTED` is `no`, the skill (before doing real work) asks the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

If A: write tier `anonymous`, write `.telemetry-prompted`.
If B: write tier `off`, write `.telemetry-prompted`.

Then proceed with the skill workflow. Asked once, never again.

## agents/openai.yaml

Codex prefers a YAML manifest. Same fields as the markdown frontmatter, plus a pointer back to the SKILL.md body for the prompt:

```yaml
name: build-with-move
version: 1
phase: build
description: |
  Author Sui Move modules and packages with a senior Move dev as your pair.
  Use when a user says "build a Move module", "write a Move package", "help me with Move".
  Reads .suiperpower/build-context.md if present.
prompt_path: ../SKILL.md
references:
  - ../references/move-syntax-cheatsheet.md
  - ../references/common-move-pitfalls.md
  - ../references/package-manifest-example.md
knowledge:
  - skills/data/sui-knowledge/03-move-and-objects.md
  - skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md
```

Codex reads `prompt_path` to load the actual SKILL.md body when invoked. This keeps the prompt source-of-truth in one file, even though Codex prefers YAML for discovery.

## Cursor `.mdc` rendering

Cursor uses a single `.mdc` file per skill, MDC = Markdown with frontmatter, similar to Anthropic's format but with Cursor-specific fields:

```mdc
---
description: <copied from SKILL.md description>
globs:
alwaysApply: false
---

<full body of SKILL.md, with references/ files inlined under "## References (inlined)" section>
```

The renderer is `scripts/generate-cursor-rules.ts`. It runs as part of `suiperpower init` for users who have Cursor installed (or the `~/.cursor/` dir present). References are inlined because Cursor does not have on-demand reference loading.

## SKILL_ROUTER.md

Shared file at `skills/SKILL_ROUTER.md`. It is a routing table the AI consults if it activated the wrong skill or the user's intent is ambiguous.

```markdown
# Skill Router

If the user asked X, the right skill is Y.

| User said | Right skill | Common wrong picks |
|---|---|---|
| "build a token" | launch-coin | scaffold-project, build-with-move |
| "I want to lend on Sui" | scallop-money-market | scaffold-project, build-defi-protocol |
| "store images on Sui" | walrus-storage | scaffold-project |
| "submit my project" | submit-to-sui-overflow | create-pitch-deck |
| "deploy" | deploy-to-testnet (then deploy-to-mainnet if production-ready) | scaffold-project |
| "what should I build" | find-next-sui-idea | validate-idea, scaffold-project |
| "is this idea good" | validate-idea | find-next-sui-idea |
| "audit my code" | review-move (then ottersec-prep if planning a real audit) | cso (does not exist on Sui side) |
| ... | ... | ... |
```

Every skill's SKILL.md ends with: "If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off."

## Naming conventions inside a skill

- Variables in bash: `SCREAMING_SNAKE_CASE` for env-like, `_underscored` for private.
- Section headings: `## Title Case` for top-level, `### Title Case` for sub.
- Code blocks always tagged with language (`bash`, `move`, `typescript`, `json`, `yaml`).
- File paths: relative to repo root unless prefixed with `~/` (home).
- Sui-specific terms: capitalized (Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin).

## Quality gate inside a skill

Every build / ship skill must include a "Quality gate (anti-slop)" section near the end. Examples:

- `build-with-move`: "Before reporting done, ask: is there a non-trivial test for the public functions? If not, write one or push back to the user."
- `walrus-storage`: "Before reporting done, ask: does the demo actually retrieve a stored blob and render it? If not, fix it before claiming integration is done."
- `submit-to-sui-overflow`: "Before reporting done, ask: does the live URL actually work? Has the package-id been confirmed against a public Sui RPC? If not, block and tell the user."

Detail in `12-ANTI-SLOP-FRAMEWORK.md`.

## Versioning

Skills do not have individual versions. The CLI version determines what skills you have. `suiperpower update` is the only sanctioned upgrade path.

If a breaking change to a skill's interface (input / output context file shape) is needed, the version of the spec in `skills/data/specs/phase-handoff.md` bumps and all skills that touch that phase update in lock-step.

## Authoring checklist

When adding a new skill, the author:

1. Reads `22-SAMPLE-SKILL.md` for the canonical reference (build-with-move) and copies its structure.
2. Creates the folder under `skills/<phase>/<name>/`.
3. Writes `SKILL.md` with the section template above.
4. Adds the canonical telemetry preamble via `scripts/inject-preamble.ts <skill-path>`.
5. Adds `agents/openai.yaml` mirroring the frontmatter.
6. Optionally adds `references/` files for on-demand loading.
7. Updates `cli/data/sui-skills.json` if the skill is catalog-listed.
8. Updates `skills/README.md` with a one-line entry.
9. Updates `skills/SKILL_ROUTER.md` if the skill could be confused with a nearby skill (see `23-SKILL-ROUTER-SPEC.md`).
10. Adds an entry to `04-SKILLS-CATALOG.md` (this plan doc).
11. Runs `pnpm lint:skills` locally to catch issues.
12. Runs `suiperpower init` locally to verify install to all three agent dirs.

Time-to-first-PR for an experienced contributor: under 90 minutes once the spec is internalized. Reference `22-SAMPLE-SKILL.md` for the gold-standard skill that authors should pattern-match against.
