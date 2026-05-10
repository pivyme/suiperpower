---
name: roast-my-product
description: Play the harshest investor in the room and produce a numbered list of every weakness in the product, positioning, demo, and brand, so the user can fix the top three before submitting or pitching. Use when the user says "roast my product", "be brutal", "what are the weaknesses", "investor critique", "harsh feedback", "what would a VC say", "tear apart my pitch", or "roast my pitch". Reads .suiperpower/idea-context.md, .suiperpower/business-model.md, and .suiperpower/retention-loop.md if present, writes .suiperpower/roast.md.
---

## Preamble (run first)

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
  _TEL_EVENT='{"skill":"roast-my-product","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"roast-my-product","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Plays the harshest investor in the room. Produces a numbered list of weaknesses across seven dimensions: positioning, value claim, demo, moat, pricing, tech load-bearing, and brand. The user picks the top three to fix before submitting or pitching.

The voice is direct and unsparing. No softening, no false balance. The point is to give the user the same critique loop a well-funded startup gets from advisors, before judges or investors do it for them.

## When to use it

- Before submitting a hackathon project, when the demo is built and the pitch is drafted.
- Before a pitch meeting with a grant program or investor.
- When the user is too close to the work and wants a real outside read.

## When NOT to use it

- Pre-MVP, before there is something concrete to critique. Roasting an idea is unfair.
- For projects the user wants to ship privately to a known buyer (the buyer's feedback is the only feedback that matters).
- For morale support. This is not motivational; it is critical. If the user wants validation, route to `product-review` for a more balanced read.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md` for the chosen idea and target user.
- `.suiperpower/business-model.md` if it exists.
- `.suiperpower/retention-loop.md` if it exists.
- The product itself: live URL, demo video, pitch deck, README. The user provides whatever exists.
- The user's chosen positioning sentence ("we are the X for Y").

## Outputs

A `.suiperpower/roast.md` with a numbered list of weaknesses across the seven dimensions, each with a one-sentence diagnosis and a one-sentence fix:

```markdown
## Roast, <timestamp>

### Inputs reviewed
- positioning: <one-sentence positioning>
- demo: <link or "not provided">
- deck: <link or "not provided">
- live product: <link or "not provided">

### Weaknesses (numbered, ranked by severity)

1. <dimension>: <diagnosis in one sentence>
   fix: <one sentence>
2. <dimension>: <diagnosis>
   fix: <one sentence>
3. ...

### Top 3 to fix before submitting
- <number> from above, with rationale for ranking

### What is actually working
- <one to three concrete strengths the user should not lose while fixing>
```

## Workflow

1. **Read context and inputs**
   - Pull the idea, the positioning, the business model, the retention loop, and any provided demo, deck, or live link.
   - If the user has not provided a positioning sentence, demand one. "We are the X for Y" or equivalent. Refuse to roast without it.

2. **Walk the seven dimensions in order**
   - Use `references/seven-dimensions.md` as the rubric. For each dimension, write the diagnosis if there is a real weakness. Skip dimensions where the work is already strong; do not invent weaknesses to fill the list.

3. **Generic positioning**
   - Is the positioning sentence interchangeable with five other Sui projects? "Decentralized X on Sui" is generic. Force a specific named user, a specific named pain, and a specific named alternative.

4. **Unclear value**
   - Within 10 seconds of seeing the product, can a stranger say what it does and why they would care? If not, name the line that should be top of the page or first slide.

5. **Demo theater**
   - Is the demo a recorded happy path that hides where the product breaks? Are loading states fake? Is data hand-curated? Demo theater fools no one who has shipped before.

6. **Missing competitive moat**
   - Why won't the next builder copy this in two weekends? If the answer is "they could", the moat is the team or the speed of execution, both of which need to be named.

7. **Pricing that does not make sense**
   - If pricing exists, does the math support a sustainable margin? Does the price match the payer's stated willingness from `business-model.md` or `will-pay.md`? Is the cadence (per month, per tx) appropriate for the value?

8. **Tech that is not load-bearing**
   - Is Sui doing real work for this product, or is it a sticker on top of a Web2 app? Specifically: would the product still work if you swapped Sui for any other chain or for no chain? If yes, the tech is decoration, not foundation. Same question for Walrus, DeepBook, Scallop, zkLogin if used.

9. **Brand that is forgettable**
   - Does the name help or hurt? Is the visual identity distinguishable from the next 10 Sui projects? Does the homepage render the same as a generic Vercel template?

10. **Rank by severity**
    - Severity = blast radius if a judge or investor sees it first. Generic positioning is high severity (it kills attention). Demo theater is high severity (it kills credibility). Forgettable brand is medium (it loses recall but is recoverable). Be honest about ranking.

11. **Pick the top 3**
    - Three is the cap. Five is too many to fix before submission. The user can run another roast after fixing.

12. **Name what is working**
    - One to three concrete strengths. Not "you have momentum"; cite the actual strength (e.g. "the onboarding flow puts a user in front of a working transaction in 30 seconds, which is rare").

13. **Writeback**
    - Write `.suiperpower/roast.md` and surface the top 3 to the user.

## Quality gate (anti-slop)

Before reporting done:

- Is every diagnosis specific? "Positioning is weak" fails; "the positioning sentence reads as 'decentralized social on Sui' which fits 12 other projects in the catalog" passes.
- Is every fix actionable in 24 hours? Fixes that need a quarter of work are too big for a hackathon roast.
- Is the top 3 actually the top 3 by severity, or is it the easiest 3 to fix? The skill picks by severity.
- Did the roast cite at least one strength? A skill that returns only weaknesses is a sycophant in reverse.
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/seven-dimensions.md`: The seven roast dimensions with diagnostic questions and example diagnoses.
- `references/severity-rubric.md`: How to rank weaknesses by blast radius, not by the user's emotional weight.

## Use in your agent

- Claude Code: `claude "/roast-my-product <your message>"`
- Codex: `codex "/roast-my-product <your message>"`
- Cursor: paste a chat message that includes a phrase like "roast my product", or load `~/.cursor/rules/roast-my-product.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
