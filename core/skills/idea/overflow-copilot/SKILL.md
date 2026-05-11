---
name: overflow-copilot
description: Search past Sui Overflow hackathon projects to find what has been built, what won, and where the gaps are. Use when the user says "Sui Overflow past projects", "what won at Sui Overflow", "search Sui hackathon archives", "has anyone built X for Overflow", "Overflow research", "past Sui hackathons", or "Sui Overflow copilot". Reads skills/data/sui-knowledge/06-opensource-research.md and points at deepsurge.xyz archives.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track overflow-copilot idea completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track overflow-copilot idea started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Searches the Sui Overflow archive (deepsurge.xyz, the official submission and judging platform) for past hackathon projects relevant to a candidate idea. Returns a summary of what has been tried, what won, what failed, and where gaps remain. Helps the user position their candidate against history rather than reinventing it.

This is the Sui-specific analog of a "past hackathon copilot". It only covers Sui Overflow; for ecosystem-wide research, route to `competitive-landscape`.

## When to use it

- The user is preparing for Sui Overflow 2026 and wants to learn from past entries.
- The user has a candidate idea and wants to confirm no past Overflow team has built it (or, if so, what happened next).
- The user is browsing for inspiration in the past archive.

## When NOT to use it

- The user wants ecosystem-wide competitor research, route to `competitive-landscape`.
- The user wants to submit to Sui Overflow, route to `submit-to-sui-overflow`.
- The user wants to pick a sponsor track, route to `pick-my-sui-track`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's candidate category or specific idea.
- Optional: the Overflow edition the user is targeting (current is 2026; past editions exist).

## Outputs

A research note appended to `.suiperpower/idea-context.md` (or a new file if no idea is chosen yet):

```markdown
## Sui Overflow archive research, <timestamp>

### Past projects in this category
- <project>: <Overflow edition>, <track>, <one-line summary>, <outcome (winner / finalist / submitted / withdrew)>
- ...

### What worked
- <pattern>: cited project examples

### What did not work
- <pattern>: cited project examples, why

### What is missing
- <gap>: <evidence>

### Implications for the candidate
- <one paragraph: how the user should position relative to history>

### Citations
- <deepsurge.xyz links, project repos, demo videos>
```

## Workflow

1. **Confirm the search query**
   - The candidate idea in one sentence.
   - The category and any sponsor track relevant.

2. **Search the archive**
   - Visit deepsurge.xyz (the official Sui Overflow archive when published).
   - Filter by category, sponsor track, year.
   - Note the projects that match.

3. **For each match, capture**
   - Project name, Overflow edition, track, team size if visible.
   - One-line summary of what they built.
   - Outcome: winner / finalist / submitted / withdrew / abandoned.
   - Where applicable, the post-Overflow trajectory (live product, dead, pivoted).

4. **Pattern-match**
   - **What worked**: which projects from this category went on to ship and grow? What did they have in common?
   - **What did not work**: which submitted but failed to ship? What was the failure mode (technical, market, team)?
   - **What is missing**: what category-of-project has NOT been attempted, despite obvious surface area?

5. **Implications**
   - Position the candidate relative to past entries.
   - Identify whether the candidate is "novel relative to past Overflow" (good if differentiation exists) or "previously attempted" (needs angle).
   - Suggest specific lessons to apply (e.g. a past winner's distribution strategy, a past failure's avoided mistake).

6. **Writeback**
   - Append to the chosen output file.

## Quality gate (anti-slop)

Before reporting done:

- Did the search query at least one archive source, with a citation? (Not "I assume there were N projects".)
- Are project names cited verbatim, with deepsurge.xyz links?
- Are outcomes (winner / abandoned / etc.) recorded honestly, not inferred from the project name?
- Did the analysis include "what is missing"? Most archive research stops at "what exists"; the gap is the most useful output.
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/archive-search-patterns.md`: How to query the deepsurge.xyz archive efficiently.
- `references/post-overflow-tracking.md`: How to check whether a past project shipped, pivoted, or died.

Knowledge docs:

- `skills/data/sui-knowledge/06-opensource-research.md`: Open-source research workflow, also useful here.
- `skills/data/guides/deepsurge-submission.md`: Submission flow for the current Overflow.

## Use in your agent

- Claude Code: `claude "/suiper:overflow-copilot <your message>"`
- Codex: `codex "/overflow-copilot <your message>"`
- Cursor: paste a chat message that includes a phrase like "search Sui hackathon archives", or load `~/.cursor/rules/overflow-copilot.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
