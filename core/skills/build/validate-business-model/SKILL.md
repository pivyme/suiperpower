---
name: validate-business-model
description: Force the user to answer five concrete questions about who pays, how much, and why, and refuse to claim a business model exists if they cannot. Use when the user says "validate my business model", "who pays for this", "how do I make money", "monetization", "pricing", "business model", or "is this profitable". Reads .suiperpower/idea-context.md and writes the answer to .suiperpower/business-model.md.
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
  _TEL_EVENT='{"skill":"validate-business-model","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"validate-business-model","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
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

Walks the user through five concrete questions about how the project makes money. Refuses to write a "validated business model" output if any answer is hand-wavy or speculative. The point is to force the user to either commit to a real answer or accept that they have not yet validated this dimension. Both outcomes are useful; pretending to validate when nothing is validated is the slop.

`deploy-to-mainnet` reads this skill's output and refuses to deploy if no business-model output exists.

## When to use it

- Pre-mainnet, when the project is about to be exposed to real users.
- During pitch prep when the user is about to claim a business model in front of investors or judges.
- Before applying for grants or hackathon prizes.

## When NOT to use it

- Pre-MVP, when the product is not built. Defer until there is a working v1.
- For research-only projects that the user has explicitly framed as non-commercial.
- For pre-validated existing products being ported to Sui (the model already exists; document it instead).

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md` for context.
- The current product state (early build, MVP, near-launch).
- Whether the user has talked to any prospective payers.

## Outputs

A `.suiperpower/business-model.md` with explicit answers to all five questions, or an explicit `unvalidated` marker on each unanswered question. Format:

```markdown
## Business model, <timestamp>

### Q1, who pays?
- answer: <user | developer | partner | treasury | advertiser | unvalidated>
- evidence: <one sentence with citation>
- confidence: <high | medium | low>

### Q2, how much?
- pricing model: <per-tx | per-month | per-feature | per-volume | one-time | unvalidated>
- price point: <number with currency>
- evidence: <one sentence>
- confidence: <high | medium | low>

### Q3, why would they pay you instead of an alternative?
- alternative: <named competitor or status quo>
- our advantage: <one sentence>
- evidence: <one sentence>
- confidence: <high | medium | low>

### Q4, what is the unit economic at one paying user?
- revenue per user per month: <number>
- variable cost per user per month: <number including Walrus / DeepBook / RPC / hosting>
- gross margin: <percent>
- confidence: <high | medium | low>

### Q5, what test could falsify this in the next two weeks?
- test: <one sentence>
- success threshold: <number, e.g. "5 paying users at $X">
- planned date: <yyyy-mm-dd>

### Verdict
- validated: <yes | partial | no>
- if partial or no: which questions are open
```

## Workflow

1. **Read idea-context.md**
   - Pull the chosen idea, target user, sponsor track if any.

2. **Ask Q1**
   - "Who specifically pays you? Pick one of: user, developer, partner, treasury, advertiser. If multiple, pick the largest."
   - Reject "everyone" and "depends".

3. **Ask Q2**
   - "Concretely, how much? Per transaction in basis points? Per month subscription? One-time?"
   - Reject ranges that span more than 2x.

4. **Ask Q3**
   - "Why would the payer pay you instead of <named alternative>?"
   - Reject "we are better" and "we are cheaper" without specifics.

5. **Ask Q4**
   - "If you had ONE paying user at the price in Q2, what is your monthly margin?"
   - Force the math. Variable costs include any sponsor protocol fees the product passes through.

6. **Ask Q5**
   - "What experiment, runnable in two weeks, would tell you if Q1-Q3 are right?"
   - Reject "build the product and see". The test must be cheaper than building.

7. **Score and write**
   - For each question, mark high / medium / low confidence.
   - For each question with no concrete answer, mark `unvalidated`.
   - Write the verdict honestly. Two or more `unvalidated` = `no`. One = `partial`. Zero = `yes`.

8. **Hand off**
   - If `validated: yes`, the user is cleared for `deploy-to-mainnet` (combined with the other gates).
   - If `partial` or `no`, recommend `will-real-users-pay` to run the cheap experiment.

## Quality gate (anti-slop)

Before reporting done:

- Did every question get a concrete answer or an explicit `unvalidated`? (Hand-wavy answers count as `unvalidated`.)
- Is Q4 backed by actual math, not "should be profitable"?
- Is Q5 a test that costs less than building the product, with a date and a threshold?
- Did the writeback happen?
- If the verdict is `yes`, can the skill point at the evidence in each question?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/payer-types.md`: Definitions and examples of each payer type.
- `references/cost-checklist.md`: Variable costs to include in Q4 (sponsor protocol fees, RPC, hosting, support).

## Use in your agent

- Claude Code: `claude "/validate-business-model <your message>"`
- Codex: `codex "/validate-business-model <your message>"`
- Cursor: paste a chat message that includes a phrase like "validate my business model", or load `~/.cursor/rules/validate-business-model.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
