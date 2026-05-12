---
name: build-with-claude
description: Use when pair-programming an MVP on Sui step by step, breaking work into committable slices with quality gates.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track build-with-claude build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track build-with-claude build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Runs a structured pair-programming loop for building a Sui MVP. Breaks the work into commit-sized slices, applies a quality gate per slice, hands off to specialist skills (`build-with-move`, `ptb-composer`, `walrus-storage`, etc.) at the right moments, and updates `.suiperpower/build-context.md` after each slice.

## When to use it

- Building the first non-trivial slice of a Sui project end to end.
- The user wants a guided loop rather than ad-hoc requests.
- Multi-day or multi-session builds where context can drift between sessions.

## When NOT to use it

- Single, contained tasks; just call the specific build skill (`build-with-move`, `ptb-composer`).
- Pre-scaffold; use `scaffold-project` first.
- Pre-design; use `object-model-design` first if the schema is non-trivial.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A scaffolded Sui project.
- `.suiperpower/build-context.md` (required for this skill; refuse if absent).
- Optional: `.suiperpower/idea-context.md` for product context.

If unclear, interview the user for:

- What is the next sliced goal? (One sentence.)
- What does "done" look like for this slice? (One sentence.)
- Which specialist skill (if any) does this slice need (`build-with-move`, `ptb-composer`, sponsor skill)?

## Outputs

- Code changes for this slice, committed in a clean diff.
- Updated `.suiperpower/build-context.md` reflecting what shipped.
- A handoff note for the next slice.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md`. Refuse to proceed if missing.
   - Confirm the next slice with the user in one sentence.

2. **Slice the work**
   - Break the slice into 3 to 6 small steps, each commit-sized.
   - Walk the breakdown back to the user. Adjust before coding.

3. **Per step**
   - Implement the step.
   - Run the relevant build/test for the affected layer.
   - If a specialist skill is appropriate, hand off to it for that step (e.g. `build-with-move` for Move authoring, `ptb-composer` for client tx composition).
   - Apply the quality gate (see below) before moving on.

4. **Per-slice quality gate**
   - All tests pass.
   - Build is clean.
   - The slice's success criterion (defined in step 1) is demonstrably met.

5. **Commit**
   - Squash to a single commit per slice with a clear message.
   - Append a `## build-with-claude session, <timestamp>` entry to `build-context.md`.

6. **Handoff note**
   - Next slice intent, blockers, open questions.

## Quality gate (anti-slop)

Before reporting the slice done, the skill asks itself the following and refuses to declare success if any answer is no:

- Does the relevant build/test command pass cleanly?
- Has the slice's success criterion been demonstrated, not just asserted?
- Are there leftover `TODO:` comments, commented-out code, or stub functions in the diff? If yes, finish or remove them.
- Has `.suiperpower/build-context.md` been updated?
- For Move slices, was `build-with-move`'s gate run on the affected modules?
- For ship-adjacent slices, has the user been pointed at the next anti-slop skill (`validate-business-model`, `retention-loop`, `roast-my-product`)?

If any answer is no, the skill reports the gap and works through it before claiming the slice is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/slice-shapes.md`: Common slice shapes (Move + test, frontend + connect, sponsor integration, end-to-end demo).
- `references/handoff-rules.md`: When to hand off to a specialist skill vs continue here.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/03-move-and-objects.md`: For Sui-Move-specific decisions inside a slice.

## Use in your agent

- Claude Code: `claude "/suiper:build-with-claude <your message>"`
- Codex: `codex "/build-with-claude <your message>"`
- Cursor: paste a chat message that includes a phrase like "help me build the MVP", or load `~/.cursor/rules/build-with-claude.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
