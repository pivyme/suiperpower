---
name: design-taste
description: Diagnose why a Sui dapp looks generic, AI-generated, or "not premium", and produce a specific list of moves to fix it. Use when the user says "this looks generic", "looks AI-generated", "not premium", "it feels cheap", "design taste", "make this look intentional", "design looks off", or "what is wrong with my UI". Reads .suiperpower/brand.md and .suiperpower/build-context.md if present.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when you finish this skill, run the matching completion command:
#   suiperpower track design-taste build completed
# Or use "failed" / "aborted" if it ended that way. This closes the loop so the
# user's local project log and the maintainer's stats reflect real outcomes.
command -v suiperpower >/dev/null 2>&1 && suiperpower track design-taste build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Names the specific reasons a UI looks generic, AI-generated, or unfinished, and prescribes the smallest set of moves that would fix each. This is the skill the user activates when their gut says "something is off" but they cannot point at what. The output is a numbered list of concrete edits, ranked by impact.

This skill exists because most "generic" UIs are not generic from one big mistake; they are generic from a stack of small defaults nobody overrode. Removing the stack is what taste looks like.

## When to use it

- The user says "it looks generic" or "looks AI-generated" or "not premium" or "feels cheap".
- A page is technically functional and accessible, but lacks character.
- The user wants taste-level feedback, not accessibility audit, not brand exercise.

## When NOT to use it

- The brand has not been picked, run `brand-design` first.
- The user wants a rage-critique, route to `roast-my-product`.
- The user wants component-level rules (button shapes, spacing), route to `frontend-design-guidelines`.
- The product itself is the issue (broken flow, unclear value), route to `product-review`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The page or screenshot under review.
- The user's gut reaction (what feels off, even if vague).
- Optional: a brand the user admires for taste reference.

## Outputs

A ranked list, top to bottom by impact:

```markdown
## design-taste, <page name>, <timestamp>

1. **<finding name>** (impact: high)
   - what is happening: <observation>
   - why it reads as generic: <one sentence>
   - fix: <concrete change>

2. **<finding name>** (impact: medium)
   ...
```

A single most-important move at the top: the one change that will move the page furthest in 30 minutes of work.

## Workflow

1. **First-glance read**
   - Look at the page for 3 seconds. Note the first three things that catch the eye.
   - Note the first thing that does NOT catch the eye but should (the actual product action).
   - The mismatch (what is loud vs what is important) is the lead finding 80% of the time.

2. **Run the markers checklist**
   - Walk `references/generic-markers.md`. Note each marker that fires.
   - Three or more markers means generic; the markers are the ranked list.

3. **Run the AI-generated checklist**
   - Walk `references/ai-generated-markers.md`. AI-generated copy and AI-generated visuals each have their own tells.
   - These overlap with generic but are distinct (AI-generated often looks polished but soulless; generic often looks unfinished).

4. **Find one specific move**
   - The single change that, if applied first, would shift the page most.
   - Usually one of: a new H1 with specific copy, replacing a stock visual with a real screenshot, or swapping the default purple-gradient hero for a single-asset hero.

5. **Rank the rest**
   - 3 to 7 follow-up findings, each with the (impact: high / medium / low) tag.
   - Each finding has a concrete fix, not abstract advice.

6. **Reference adjacent**
   - If a finding belongs to a sibling skill (component shape -> `frontend-design-guidelines`, brand colors -> `brand-design`, performance feel -> `page-load-animations`), reference the skill in the fix.

## Quality gate (anti-slop)

Before reporting done:

- Is there one clear "do this first" move at the top?
- Is every finding tied to a concrete edit (file:line or a specific component) instead of vague advice ("make it more polished")?
- Did I avoid the phrase "make it pop" or any close cousin?
- Is the ranked list 4-8 items? (Fewer is too thin, more is unread.)
- Does each finding name what is generic (specifically), not just label it generic?
- Did I avoid recommending generic remedies that would just trade one template look for another?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/generic-markers.md`: The taxonomy of generic markers (color, type, layout, copy).
- `references/ai-generated-markers.md`: Distinct markers for AI-generated copy and visuals.
- `references/the-one-move.md`: Library of "single highest-impact moves" by page type.

## Use in your agent

- Claude Code: `claude "/suiper:design-taste <your message>"`
- Codex: `codex "/design-taste <your message>"`
- Cursor: paste a chat message that includes a phrase like "this looks generic", or load `~/.cursor/rules/design-taste.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
