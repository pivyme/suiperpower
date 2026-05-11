---
name: create-pitch-deck
description: Draft a 10-slide pitch deck grounded in the project's actual context files (idea, business model, retention loop, deploy artifacts), pick a structure based on audience (judges, investors, grant program), and refuse to claim a metric the source files do not back. Use when the user says "create a pitch deck", "investor deck", "draft my deck", "pitch deck", "make a deck", "deck for hackathon", "deck for grant", or "deck for VCs". Reads .suiperpower/idea-context.md, .suiperpower/business-model.md, .suiperpower/retention-loop.md, .suiperpower/deploy-context.md, writes .suiperpower/pitch-deck.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track create-pitch-deck ship completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track create-pitch-deck ship started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Drafts a 10-slide pitch deck outline plus per-slide copy, grounded strictly in the project's context files. Picks a structure depending on the audience (hackathon judges, investors, or grant program reviewers). Refuses to claim any metric that the source files do not support.

The output is a written deck plan in `.suiperpower/pitch-deck.md` that the user can render in any deck tool (Keynote, Pitch, Figma, Tome). The skill does not produce slide images.

## When to use it

- Before submitting to Sui Overflow alongside `submit-to-sui-overflow`.
- For a Sui Foundation grant application alongside `apply-grant`.
- For an investor meeting where the user has 10 slides to make a case.

## When NOT to use it

- When the project has no validated context yet. Run `find-next-sui-idea` and `validate-business-model` first.
- For a one-page summary or a leave-behind document. Different format.
- For marketing copy aimed at end users. Route to a marketing skill.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The audience: `judges`, `investors`, or `grant`. The structure changes per audience.
- `.suiperpower/idea-context.md`, `.suiperpower/business-model.md`, `.suiperpower/retention-loop.md`, `.suiperpower/deploy-context.md`, `.suiperpower/track-pick.md` if present.
- Optional: a recent `roast.md` or `product-review.md` so the deck addresses known weaknesses.

## Outputs

A `.suiperpower/pitch-deck.md` with a 10-slide outline. Each slide has a title, a one-line claim, and the copy or visual reference per the audience structure:

```markdown
## Pitch deck, <timestamp>

### Audience
- type: <judges | investors | grant>
- length target: <minutes for live pitch, or read-time for leave-behind>

### Slides

#### Slide 1, <title>
- claim: <one sentence>
- copy: <on-slide text>
- visual: <what to show, optional>

#### Slide 2, <title>
- ...

(through slide 10)

### Backup slides (if relevant)
- <appendix slide 1>
- <appendix slide 2>

### Notes
- <facts cited from context files>
- <claims that needed downgrading because the source did not support them>
```

## Workflow

1. **Pick the audience structure**
   - Judges: hook, problem, solution, demo, why-Sui, traction (if any), team, business, ask, close.
   - Investors: hook, market, problem, solution, traction, business model, why-now, team, ask, close.
   - Grant: hook, problem, solution, why-this-team, deliverables, milestones, budget, public-good rationale, sustainability, ask.
   - Reference `references/deck-structures.md` for the per-slide rules.

2. **Read context files**
   - Pull problem statement, target user, solution from `idea-context.md`.
   - Pull business model from `business-model.md`. If the file is missing or the verdict is `no`, do not claim a model on the deck; the slide acknowledges it as open.
   - Pull retention loop from `retention-loop.md`. Same rule.
   - Pull package id and load-bearing track from `deploy-context.md` and `track-pick.md`.

3. **Draft each slide**
   - One claim per slide. The claim must be a single sentence that survives outside the deck.
   - On-slide copy is short. The narrator carries the rest.
   - Visuals are described in words ("screenshot of demo flow at the load-bearing step", "table of three milestones with dates"). The skill does not produce images.

4. **Apply the no-fake-metrics rule**
   - Any number on the deck must be cited to a source: a measurement, a public benchmark, or a committed forecast labeled as a forecast.
   - If a number cannot be cited, either remove it or rewrite the claim qualitatively.
   - Track every downgrade in the `Notes` section so the user knows what was rejected.

5. **Stress-test against the audience**
   - Judges deck: does the demo slide actually carry the load-bearing flow?
   - Investors deck: does the why-now slide name a recent change in market or tech?
   - Grant deck: does the public-good rationale name what the user gets that they could not get from a closed equivalent?

6. **Writeback**
   - Append `.suiperpower/pitch-deck.md` with the timestamped block.

7. **Hand off**
   - Recommend `roast-my-product` if the user has not yet stress-tested the deck.
   - Recommend `marketing-video` once the deck is done; the deck and video should share the same one-liner.

## Quality gate (anti-slop)

Before reporting done:

- Did the audience get picked explicitly, and the right structure applied?
- Was every metric cited or removed? (No "millions of users" without a source.)
- Did the claim sentence on every slide survive outside the deck?
- Did the demo slide name the load-bearing flow, not a feature list?
- Did the deck avoid banned words and em-dashes?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/deck-structures.md`: Three audience-specific 10-slide structures.
- `references/no-fake-metrics.md`: How to cite or downgrade numerical claims.

## Use in your agent

- Claude Code: `claude "/suiper:create-pitch-deck <your message>"`
- Codex: `codex "/create-pitch-deck <your message>"`
- Cursor: paste a chat message that includes a phrase like "create a pitch deck", or load `~/.cursor/rules/create-pitch-deck.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
