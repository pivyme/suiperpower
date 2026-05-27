---
name: retention-loop
description: Articulate a day 1 / day 7 / day 30 retention loop for a Sui product. Use when the user wants to define retention, stickiness, or engagement loop.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track retention-loop build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track retention-loop build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Forces the user to say, in one paragraph, what their user does on day 1, day 2, day 7, and day 30, and what specifically pulls the user back at each anchor. If the loop does not exist or is hand-waved, the skill names that and refuses to declare a loop.

`deploy-to-mainnet` reads this skill's output. A product without a retention loop launching to mainnet is a slot-machine bet on novelty alone.

## When to use it

- Pre-mainnet, when the project is about to face real users.
- During pitch prep when "retention" is being claimed.
- Before applying for a grant where retention metrics will be expected at the next milestone.

## When NOT to use it

- Pre-MVP, before the product is built.
- For utility infra where retention is not the right metric (e.g. an indexer, a one-time-use tool). Document instead.
- For pitch documents only, route to pitch-deck skills.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md` for context.
- `.suiperpower/business-model.md` if it exists, to align loop with payer.

## Outputs

A single paragraph describing the loop, plus the anchor table, written to `.suiperpower/retention-loop.md`:

```markdown
## Retention loop, <timestamp>

### Loop paragraph
<one paragraph, 4-7 sentences, that describes what brings the user back, in plain language>

### Anchors
- day 1: <user does what, sees what, feels what>
- day 2: <what brings them back the next day, or "none, this is a weekly cadence product">
- day 7: <what is the week-1 anchor>
- day 30: <what is the month-1 anchor>

### Loop type
<habit-driven | event-driven | reward-driven | social-driven | utility-driven>

### Falsifying signal
<what you would observe (or not observe) in the first 100 users that would tell you the loop is broken>

### Verdict
- has loop: <yes | partial | no>
- if partial or no: which anchors are missing
```

## Workflow

1. **Read context**
   - Pull idea, target user, sponsor track if any.

2. **Ask the day-1 question**
   - "What does a user do on their first session, in concrete steps? What value do they get out before closing the tab?"
   - Reject "they explore the dashboard" or similar non-action answers.

3. **Ask the day-2 question**
   - "What pulls them back tomorrow? A notification? A reward? A new piece of content? A check-in?"
   - If the product is weekly or monthly cadence, accept "none" but force the user to pick the right anchor (e.g. weekly digest = day 7).

4. **Ask the day-7 question**
   - "What is the moment in week 1 where the user feels they got real value? Is it a quantifiable outcome?"
   - Reject "they would feel productive". Force a specific outcome.

5. **Ask the day-30 question**
   - "What does the product look like for a user 30 days in? More features unlocked? Compounding history? A community connection?"
   - The answer should compose with day 1 and day 2 (the hooks should ladder).

6. **Identify the loop type**
   - Habit-driven: daily check-in, like email or social feed.
   - Event-driven: triggered by external events (price moves, transactions, partner activity).
   - Reward-driven: explicit rewards for return visits (loyalty, streaks).
   - Social-driven: other users' actions pull this user back (mentions, replies, asks).
   - Utility-driven: a real workflow need (e.g. portfolio rebalancing, billing, monitoring).

7. **Falsifying signal**
   - "What would you see in the first 100 users that would tell you the loop is NOT working?"
   - Force a specific, observable signal.

8. **Verdict**
   - All four anchors articulated specifically = `yes`.
   - 1-2 anchors missing or vague = `partial`.
   - 3+ missing = `no`.

9. **Writeback**
   - Write the file. Single paragraph + anchor table + verdict.

## Quality gate (anti-slop)

Before reporting done:

- Does the paragraph describe a real loop, with cause and effect, or is it a list of features?
- Are all four anchors specific (verb + object + outcome), not "users engage with the product"?
- Is the loop type one of the five named types, or is it "all of the above"? "All of the above" is a sign no loop is dominant.
- Is the falsifying signal specific enough that the user could test it next week?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/loop-anti-patterns.md`: Common fake loops to reject.
- `references/anchor-examples.md`: Real-world examples of each anchor type from successful products.

## Use in your agent

- Claude Code: `claude "/suiper:retention-loop <your message>"`
- Codex: `codex "/retention-loop <your message>"`
- Grok Build: run `grok`, then `/retention-loop <your message>` in the session
- Cursor: paste a chat message that includes a phrase like "retention loop", or load `~/.cursor/rules/retention-loop.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
