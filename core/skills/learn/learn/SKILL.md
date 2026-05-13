---
name: learn
description: Capture session learnings and decisions to .suiperpower/learnings.md. Use when the user wants to save what they learned, log decisions, or wrap up a session.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track learn learn completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track learn learn started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Wraps a working session into a short append-only entry in `.suiperpower/learnings.md`, structured under the canonical headers from the phase-handoff spec. The point is a tight, honest record: what was tried, what worked, what did not, what is still open, and what was decided. Future skills (and the user themselves the next morning) read this to avoid relitigating settled decisions or repeating dead ends.

Append-only. Never deletes prior entries. Always dates new ones.

## When to use it

- End of a coding session when the user wants the state captured before closing.
- After a build sprint resolved or got blocked.
- Before stepping away from a project for more than a day.
- Right after a decision was made (architecture, scope, sponsor track) so it does not leak out of context.

## When NOT to use it

- The session was trivial (one-line tweak, README typo). Not everything needs a record.
- The user wants a pitch summary or a public writeup. Route to `create-pitch-deck` or to a marketing skill.
- The user wants to track tasks. Use a TODO file in the project, not the learnings log.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The session: what the user worked on, what came out of it, what got stuck.
- `.suiperpower/idea-context.md` for chosen idea anchoring.
- `.suiperpower/build-context.md` for stack and package state, if applicable.
- `.suiperpower/learnings.md` if it exists, to append rather than overwrite.

## Outputs

An append-only entry written to `.suiperpower/learnings.md` under the canonical headers from `skills/data/specs/phase-handoff.md`:

```markdown
## Learnings, <timestamp>

### What we tried
- <one bullet per concrete attempt, action verb first>

### What worked
- <one bullet per outcome that landed, with the evidence>

### What did not work
- <one bullet per dead end, with the evidence and the conclusion>

### Open questions
- <one bullet per unresolved question, written as a question>

### Decisions
- <one bullet per decision made, with the rationale>
```

## Workflow

1. **Read existing context**
   - Open `.suiperpower/learnings.md` if present. Confirm the file exists and is well-formed.
   - Read `idea-context.md` and `build-context.md` if they exist, to ground the entry in the current state.

2. **Walk the five sections with the user**
   - For each section, ask the user one direct question and capture the answer in their words.
     - "What did you actually try this session, in concrete steps?"
     - "What worked, with the evidence?"
     - "What did not work, and what made you conclude that?"
     - "What is still open?"
     - "What did you decide?"
   - If the user is hand-wavy, push for the specific. "We tried stuff" is not a learning.

3. **Validate against the phase-handoff spec**
   - Section headers must match the spec exactly: `## What we tried`, `## What worked`, `## What did not work`, `## Open questions`, `## Decisions`.
   - Each entry is dated with the session timestamp at the top.
   - Append; never delete prior entries. If the user wants to retract a prior entry, append a follow-up that supersedes it and references the date.

4. **Write the entry**
   - Append to `.suiperpower/learnings.md`. If the file does not exist, create it with a single top-level title.
   - Use bullet lists. No prose paragraphs.
   - Anonymize specifics that should not leave the project (private API keys, candidate user names from `will-real-users-pay`, internal partner names).

5. **Confirm and recommend**
   - Show the user the appended entry.
   - If `What did not work` includes a dead end other skills should know about, recommend `roast-my-product` or `validate-business-model` to stress-test next steps.
   - If `Decisions` includes a stack or sponsor pick, suggest updating `idea-context.md` and `build-context.md` so the decision is reflected in the relevant context file.

## Quality gate (anti-slop)

Before reporting done:

- Did the entry use the exact canonical headers, in the exact order, from the phase-handoff spec?
- Did each bullet name a concrete action, outcome, or claim, not a feeling?
- Was append-only honored? No prior entries deleted or rewritten?
- Did the entry include a timestamp at the top?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/learning-prompts.md`: Sample direct questions the skill can ask to draw out specifics.
- `references/append-only-rules.md`: How to append safely without breaking prior entries.

Canonical:

- `skills/data/specs/phase-handoff.md`: The phase-handoff spec including the `learnings.md` shape.

## Use in your agent

- Claude Code: `claude "/suiper:learn <your message>"`
- Codex: `codex "/learn <your message>"`
- Cursor: paste a chat message that includes a phrase like "save what we figured out", or load `~/.cursor/rules/learn.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
