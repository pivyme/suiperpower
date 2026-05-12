---
name: virtual-sui-incubator
description: Use when teaching Sui internals deeply, consensus, Object model, Move execution, gas, upgrades, or indexer architecture.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track virtual-sui-incubator build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track virtual-sui-incubator build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Runs an extended teaching session on Sui: consensus shape, object model semantics, gas and storage costs, Move execution model, upgrade flow, indexer and event architecture. Aims to leave the user able to design and reason about Sui systems without needing the same explanation again. Outputs a written learnings file the user can revisit.

## When to use it

- The user wants depth, not just a recipe.
- Migrating from another chain (EVM, Solana) and needing the right mental model.
- Preparing to design a non-trivial Sui system.

## When NOT to use it

- Quick how-to questions; route to a recipe-style skill.
- Brand-new-to-Sui beginners; use `sui-beginner` for the gentle on-ramp first.
- If the user has a specific build task, route to that build skill.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's current background (chain experience, Move experience, project intent).
- Optional: `.suiperpower/build-context.md` and `.suiperpower/idea-context.md` for tailoring examples.

If unclear, interview the user for:

- Coming from EVM, Solana, neither, or pure web2?
- What is the user about to build?
- Which topic should we start with?

## Outputs

- A written `.suiperpower/learnings.md` with the topics covered and the user's notes.
- A short list of next-step skills.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## virtual-sui-incubator session, <timestamp>
  - topics covered: <list>
  - learnings file: .suiperpower/learnings.md
  - next-step skills: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` and `.suiperpower/idea-context.md` if present.
   - Confirm the user's background and target depth.

2. **Pick the topic**
   - Default order, if the user has no preference: object model, consensus and ordering, Move execution, gas and storage, upgrades, indexers.
   - Skip any the user already knows.

3. **Per topic**
   - Lead with the mental model in one sentence.
   - Walk through the canonical example.
   - Contrast with EVM or Solana (if applicable to the user's background).
   - Surface the common surprises ("I thought X but actually Y").
   - Give a quick exercise the user can try in their dev environment.

4. **Capture learnings**
   - As the user reacts, write down what landed, what is still fuzzy.
   - Update `.suiperpower/learnings.md` after each topic.

5. **Tie back to the project**
   - For each topic, surface where it bites in the user's current project.
   - Reference the relevant build skill for follow-through.

6. **Close out**
   - Recap what was covered.
   - List the next 1 to 3 skills the user should run.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did the session cover at least the object model, Move execution, and one of (consensus, upgrades, indexers)?
- Was each topic grounded in a concrete example, not pure abstraction?
- Did the contrast with EVM or Solana actually land if the user came from there, or was it skipped because the contrast did not apply?
- Did the session produce a written `.suiperpower/learnings.md` the user can revisit?
- Did the session end with a concrete next-step skill chosen, not an open-ended "good luck"?
- Did the user have a chance to ask follow-ups on each topic, not just receive lectures?

If any answer is no, the skill reports the gap and works through it before claiming the session is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/topic-deep-dives.md`: Per-topic outline (object model, consensus, Move execution, gas, upgrades, indexers).
- `references/migrant-on-ramps.md`: Specific contrasts for EVM and Solana migrants.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/02-what-makes-sui-unique.md`: Sui differentiators.
- `skills/data/sui-knowledge/03-move-and-objects.md`: Object model + Move reference.

## Use in your agent

- Claude Code: `claude "/suiper:virtual-sui-incubator <your message>"`
- Codex: `codex "/virtual-sui-incubator <your message>"`
- Cursor: paste a chat message that includes a phrase like "deep dive into Sui internals", or load `~/.cursor/rules/virtual-sui-incubator.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
