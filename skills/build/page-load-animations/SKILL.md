---
name: page-load-animations
description: Replace janky page-load animations with calm, fast, layout-shift-free transitions in a Sui dapp. Use when the user says "fix my loading animations", "page transition feels slow", "stop the layout shift", "skeleton loader", "remove the spinner", "smooth the page load", or "first paint feels broken". Reads .suiperpower/build-context.md if present.
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
  _TEL_EVENT='{"skill":"page-load-animations","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"page-load-animations","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
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

Audits page-load and transition animations across the dapp and replaces janky patterns with a small set of calm defaults. Removes layout shift, replaces oversized fade-ins, and uses skeleton loaders that match the final content shape. The result is a UI that feels fast even when the network is slow.

## When to use it

- Page load shows an empty white flash, then content snaps in.
- Generic spinners run for any duration, including sub-100ms operations.
- Content layout shifts on first paint (CLS issues).
- Animations are too long, too bouncy, or chained in a way that feels slow.
- Wallet-connect or transaction flows have animation that competes for attention with actual feedback.

## When NOT to use it

- Performance issues are caused by network or JS execution, not animation timing. Profile first.
- The user wants brand-level animation (custom logo intro, marketing landing motion). Route to `marketing-video` or a custom design skill.
- There are no animations yet, route to `frontend-design-guidelines` for component-level state defaults.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The frontend code, especially layout components, route transitions, and async-data containers.
- The user's stated symptom (jank, layout shift, slow feel).
- Optional: a screen recording or a URL to inspect.

## Outputs

- Concrete change list per file: which animation to remove, replace, or shorten.
- Skeleton loader components that match the final layout dimensions.
- Reduced-motion support across the board.

## Workflow

1. **Audit existing animations**
   - Grep for `transition`, `animate-`, `motion.`, `framer-motion`, `keyframes`, custom CSS animations.
   - Note timing values. Anything over 300ms for a UI transition is suspect.

2. **Tighten timings**
   - UI transitions: 150ms to 200ms.
   - Modal / dialog open: 150ms to 200ms.
   - Page transitions: 250ms to 300ms max.
   - Any value over 300ms is a redesign candidate, not a tweak.

3. **Replace spinners with skeletons**
   - For surfaces that load in 200ms or more: use a skeleton with the final layout dimensions.
   - For surfaces that load in under 100ms: no loading state at all (the user will not see it).
   - For surfaces that load in 100-200ms: a delayed spinner (only show after 100ms to avoid flash).

4. **Eliminate layout shift**
   - Reserve space for async content with explicit dimensions or skeletons.
   - Use `aspect-ratio` for images.
   - Set `font-display: swap` and pre-size containers, OR use `font-display: optional` to avoid swap-induced shift.

5. **Add reduced-motion support**
   - Wrap every animation in `@media (prefers-reduced-motion: no-preference)`, or use the JS query.
   - For users who prefer reduced motion, fall back to instant transitions or simple cross-fades under 100ms.

6. **First-paint pass**
   - Inline critical CSS for above-the-fold content.
   - Defer non-critical fonts.
   - Avoid full-page fade-in on first load (it makes the page feel slower than it is).

7. **Sui-specific surfaces**
   - Wallet-connect modal: fast in, fast out. No bouncy spring.
   - Transaction-status surfaces: animate state changes (pending -> success), not the whole container.
   - Faucet response: a single in-out animation, not a chain.

8. **Verification**
   - Open Chrome DevTools Performance tab, record a page load. Look for layout-shift markers.
   - Throttle network to "Slow 3G". The page should still feel intentional, not broken.
   - Toggle `prefers-reduced-motion` on. Confirm the page is usable without animation.

## Quality gate (anti-slop)

Before reporting done:

- Are all UI transitions at or under 200ms?
- Is there zero layout shift on first paint (CLS < 0.1 in Lighthouse)?
- Does `prefers-reduced-motion: reduce` produce a usable, non-jarring experience?
- Are spinners replaced with skeletons or removed where the load is sub-100ms?
- Do skeletons match the final content shape (not generic grey rectangles in random sizes)?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/timing-defaults.md`: Recommended durations and easings per component class.
- `references/skeleton-patterns.md`: Skeleton shapes for common Sui dapp surfaces (balance, address list, transaction history, NFT grid).

## Use in your agent

- Claude Code: `claude "/page-load-animations <your message>"`
- Codex: `codex "/page-load-animations <your message>"`
- Cursor: paste a chat message that includes a phrase like "fix my loading animations", or load `~/.cursor/rules/page-load-animations.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
