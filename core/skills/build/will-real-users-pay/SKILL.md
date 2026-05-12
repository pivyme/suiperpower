---
name: will-real-users-pay
description: Use when stress-testing pricing on a Sui product, running a cheap willingness-to-pay experiment, or validating that anyone will pay.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track will-real-users-pay build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track will-real-users-pay build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Designs and ships a cheap, fast experiment that puts a price in front of real candidate users and measures whether they convert on intent. The point is to force the user to talk to people who are not their friends, before claiming "users will pay this". The signal is small (5 to 10 candidate users) but it is real, not imagined.

This is not a market study. It is a smoke test. It costs less than a day of building. The output either confirms a pricing assumption or kills it before mainnet.

## When to use it

- After `validate-business-model` returns `partial` or `no`, when Q1 to Q3 are the open questions.
- Before claiming "users will pay" in a pitch deck, grant application, or hackathon submission.
- When pricing is a guess and the user is about to commit engineering effort to billing infrastructure.

## When NOT to use it

- When the product is free forever (treasury-funded public goods, infra subsidized by the protocol). Document why instead.
- When the payer is already validated by an existing comparable product the user has shipped.
- For pre-idea exploration. Run `find-next-sui-idea` first.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md` for the chosen idea and target user.
- `.suiperpower/business-model.md` if it exists, for the candidate price point and payer type.
- The user's available outreach channels (Twitter, Telegram, LinkedIn, in-person, existing list).

## Outputs

A `.suiperpower/will-pay.md` with the experiment design and the captured signal:

```markdown
## Will real users pay, <timestamp>

### Hypothesis
- payer: <user | developer | partner | treasury | advertiser>
- price point: <number with currency and cadence>
- value claim: <one sentence, what the payer gets for the price>

### Experiment
- format: <landing page + waitlist | DM outreach | poll | concierge offer | pre-order>
- channel: <where you reach the candidate users>
- sample target: <number of candidate users you intend to ask, 5 to 10>
- success threshold: <number, e.g. "3 of 10 say yes at this price">
- kill threshold: <number, e.g. "0 of 10 say yes">
- runtime: <number of days, max 14>
- start date: <yyyy-mm-dd>
- end date: <yyyy-mm-dd>

### Signal captured
- candidates asked: <number>
- yes (would pay at price): <number>
- no (would not pay): <number>
- conditional yes (would pay if X): <number, list conditions>
- raw notes: <bulleted, anonymized>

### Verdict
- pass | fail | inconclusive
- if pass: cite which candidates back the claim
- if fail: name the price level or value claim that needs to change
- if inconclusive: name the missing data and a follow-up plan
```

## Workflow

1. **Read context**
   - Pull idea, target user, candidate price from `business-model.md`.
   - If no candidate price exists, force the user to pick one before continuing. A pricing experiment without a price is not an experiment.

2. **Pick the experiment format**
   - Landing page + waitlist: best for B2C, requires a live page.
   - DM outreach: best for B2B / pro user, 1 to 1, scriptable.
   - Poll: lowest cost, least signal. Use only when paired with a follow-up DM.
   - Concierge offer: most signal. Offer to do the work manually for the price. If anyone pays, the signal is conclusive.
   - Pre-order: live payment page, refundable. Strongest commitment signal.
   - See `references/experiment-formats.md`.

3. **Set thresholds**
   - Success and kill thresholds must be set before the experiment runs, in writing.
   - Threshold rule: if 30% or more of intent-targeted candidates respond yes at the asked price, it is a pass. Less than 10% is a fail. In between is inconclusive.
   - Reject "let's see what happens". The whole point is a pre-committed bar.

4. **Identify the channel and sample**
   - Where does the target user already gather? Twitter, Telegram groups, Discord, Farcaster, in-person events, existing email list.
   - Reject "I'll post on my Twitter". Friends are not candidate users. The candidates must be intent-targeted: solving the problem the product solves.

5. **Write the script**
   - Short, direct, concrete. One sentence on the problem. One sentence on the offer. One sentence with the price. One question: "would you pay this?"
   - Reject scripts that hedge or hide the price. The price is the test.
   - See `references/outreach-script-template.md`.

6. **Run the experiment**
   - Time-box to 14 days max.
   - Capture every response. Even non-responses are signal.
   - Anonymize notes. Do not store PII in `.suiperpower/will-pay.md`.

7. **Score and write**
   - Tally yes / no / conditional yes.
   - Apply the pre-committed thresholds.
   - Write the verdict honestly. Do not soften a fail.

8. **Hand off**
   - If `pass`, the user can claim "users will pay" with a citation.
   - If `fail`, route to `validate-business-model` to revise Q1 to Q3.
   - If `inconclusive`, run a second iteration with a corrected channel or sample size.

## Quality gate (anti-slop)

Before reporting done:

- Were thresholds set in writing before the experiment ran? (Post-hoc thresholds invalidate the test.)
- Was the sample intent-targeted, not friends? Can the user point at a specific channel where the candidates already discuss this problem?
- Did the script include the actual price? (No price means no test.)
- Was the runtime bounded to 14 days or less?
- Is the verdict backed by the tally, not by a feeling?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/experiment-formats.md`: Five formats with cost, signal strength, and when to pick each.
- `references/outreach-script-template.md`: Short, direct DM and landing page copy templates.

## Use in your agent

- Claude Code: `claude "/suiper:will-real-users-pay <your message>"`
- Codex: `codex "/will-real-users-pay <your message>"`
- Cursor: paste a chat message that includes a phrase like "will users pay", or load `~/.cursor/rules/will-real-users-pay.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
