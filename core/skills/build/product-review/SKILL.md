---
name: product-review
description: Walk the product as a first-time user would, from first paint through onboarding, empty states, error states, mobile, and time-to-first-value, and produce a prioritized roadmap of UX fixes. Use when the user says "product review", "UX review", "review my UX", "review my product", "review the onboarding", "first impressions", "user experience review", "how is the UX", or "audit my UX". Reads .suiperpower/idea-context.md and writes .suiperpower/product-review.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track product-review build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track product-review build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Walks the product as a first-time user would. Catalogues issues across five dimensions: first-paint experience, onboarding friction, empty / error / loading states, mobile experience, and time-to-first-value. Produces a roadmap of UX fixes ranked by impact divided by effort.

Less brutal than `roast-my-product`, more concrete. Where roast is about whether the project survives a hostile reading, product-review is about whether the user gets to the value with as little drag as possible.

## When to use it

- Before submitting a hackathon project, alongside or after `roast-my-product`.
- After a build sprint, when the user has shipped enough surface area to have a real walkthrough.
- Before a marketing push, when first-time-user friction will determine conversion.

## When NOT to use it

- Pre-MVP, before there are screens to review.
- For internal tools the team uses every day. They will not feel the friction a first-time user feels.
- For pure protocol projects with no app surface. Route to `review-move` for code review or `ottersec-prep` for security.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md` for the chosen idea and target user.
- A live URL for the product, or screenshots / a recorded walkthrough.
- The user's claimed "happy path" for a first-time user (the steps they expect a new user to take).
- If a wallet flow exists: the user's intended wallet (Slush, Suiet, Phantom on Sui, etc.) and whether zkLogin is offered.

## Outputs

A `.suiperpower/product-review.md` with findings across five dimensions and a prioritized roadmap:

```markdown
## Product review, <timestamp>

### Inputs reviewed
- live URL: <link or "not provided">
- claimed happy path: <one paragraph>
- target user: <one sentence>

### First-paint experience
- finding 1: <observation>, <impact>
- finding 2: ...

### Onboarding friction
- finding 1: ...
- finding 2: ...

### Empty / error / loading states
- finding 1: ...
- finding 2: ...

### Mobile experience
- finding 1: ...
- finding 2: ...

### Time-to-first-value
- measured TTFV: <seconds, from landing to first concrete value>
- target TTFV: <seconds, based on category>
- finding 1: ...

### Roadmap (prioritized by impact / effort)
- P0 (high impact, low effort): <numbered list, ship before next demo>
- P1 (high impact, medium effort): <numbered list, ship within a week>
- P2 (medium impact, low effort): <numbered list, ship when time allows>
- defer: <findings that are not worth the effort right now>
```

## Workflow

1. **Read context and inputs**
   - Pull idea, target user, claimed happy path. If no happy path is provided, demand one.
   - Open the live URL in a fresh browser session, no cached state, no logged-in account. If the user has not provided a URL, request screenshots of every page on the path.

2. **First-paint experience**
   - What does a first-time user see in the first 5 seconds?
   - Is the value clear from the headline alone? Is the CTA visible above the fold? Is the typography load free of font-flash?
   - Note any layout shift, missing alt text, hero copy that does not name the user or the outcome.

3. **Onboarding friction**
   - From "first paint" to "first concrete value", count the steps.
   - For each step, note: is it necessary, is the copy clear, is the input format obvious, are there error fallbacks?
   - If the path includes wallet connect, count it as one step. If it includes zkLogin, note the OAuth provider load time.
   - Reject "we use industry-standard wallet flow" as defense; the friction is the friction.

4. **Empty / error / loading states**
   - Visit each state deliberately:
     - Empty: a brand new user with no data. Is the empty state useful or a blank panel?
     - Error: cause an error (network off, invalid input, expired session). Does the message explain what to do?
     - Loading: throttle the network. Are skeletons shown? Does the UI block, or does it stay responsive?
   - Note any state that returns a blank screen, an unstyled error, or an infinite spinner.

5. **Mobile experience**
   - Open on a real phone (or 375 px viewport). Does the layout reflow? Are tap targets at least 44 px? Does the wallet connection complete on mobile, including zkLogin redirects?
   - Note any horizontal scroll, fixed-positioned elements that block content, or buttons that fail off-screen.

6. **Time-to-first-value**
   - Measure: from landing page load to the user receiving the first concrete output (a transaction confirmed, a piece of content rendered, an answer returned).
   - Compare to the category benchmark in `references/ttfv-benchmarks.md`.
   - If TTFV exceeds the benchmark by 2x, this is a P0 finding regardless of cause.

7. **Score and prioritize**
   - Apply the impact / effort matrix from `references/impact-effort-matrix.md`.
   - P0: high impact, low effort. Ship before next demo.
   - P1: high impact, medium effort. Within a week.
   - P2: medium impact, low effort. When time allows.
   - Defer: low impact or high effort with no payoff.

8. **Writeback**
   - Write `.suiperpower/product-review.md`. Surface P0 to the user verbally.

## Quality gate (anti-slop)

Before reporting done:

- Did the review actually walk the live product, not just the deck?
- Was the claimed happy path stress-tested with a fresh browser session, no cached state?
- Are findings specific (page, element, observation), not "the UX feels heavy"?
- Is TTFV a measured number, not a guess?
- Does the roadmap rank by impact / effort, not by what the user wants to fix?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/impact-effort-matrix.md`: How to assign impact and effort scores per finding.
- `references/ttfv-benchmarks.md`: Time-to-first-value targets by product category (DEX, social, indexer, NFT marketplace).

## Use in your agent

- Claude Code: `claude "/suiper:product-review <your message>"`
- Codex: `codex "/product-review <your message>"`
- Cursor: paste a chat message that includes a phrase like "product review", or load `~/.cursor/rules/product-review.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
