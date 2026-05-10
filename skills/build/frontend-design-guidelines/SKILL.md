---
name: frontend-design-guidelines
description: Apply tasteful frontend defaults to a Sui dapp, layout, spacing, hierarchy, accessibility, without copying the standard crypto template look. Use when the user says "build a frontend", "design taste check", "review my UI", "frontend defaults", "spacing and typography", "make my dapp look good", or "frontend looks generic". Reads .suiperpower/brand.md and .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/05-app-layer-and-consumer.md.
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
  _TEL_EVENT='{"skill":"frontend-design-guidelines","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"frontend-design-guidelines","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
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

Applies a small set of opinionated frontend defaults to a Sui dapp so it does not look like a template. Covers layout, spacing, type hierarchy, color usage, button states, empty states, error states, accessibility. The output is concrete component-level guidance the user can apply line by line, not a 50-page design system document.

## When to use it

- Frontend exists, looks generic or rough, and the user wants it tightened.
- New page or component being built and the user wants a tasteful starting point.
- Reviewing a dapp UI for the design pass before launch.

## When NOT to use it

- The brand has not been picked yet, run `brand-design` first.
- The user wants a brutal critique, route to `roast-my-product`.
- The user wants accessibility-only review, focus the conversation on the WCAG sections of this skill.
- For Sui-specific number formatting, route to `number-formatting`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The frontend code or screenshots of the current state.
- `.suiperpower/brand.md` if it exists, for color and type tokens.
- The user's stated frustration, if any (e.g. "buttons feel weak", "the page looks empty").

## Outputs

- A list of concrete changes per component, file:line where possible.
- Updated Tailwind config or CSS variables if the brand tokens are missing.
- An empty-state and error-state pass for every async surface.

## Workflow

1. **Establish tokens**
   - If `.suiperpower/brand.md` exists, read tokens. If not, hand off to `brand-design` first.
   - Confirm Tailwind config or CSS variables match the tokens.

2. **Audit hierarchy**
   - One H1 per page. Headings descend without skipping levels.
   - Body text at 16px minimum, line-height 1.5 minimum.
   - Numbers in tabular figures. Always.

3. **Audit spacing**
   - 4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px scale. No off-scale numbers.
   - Section padding consistent across pages.
   - Component padding bigger on touch targets (mobile-first when in doubt).

4. **Audit color usage**
   - Primary color used for primary action only, not for accents and decoration.
   - Text on background and surface both pass 4.5:1.
   - State colors (success / warning / error) used only for state, never decoration.

5. **Audit interactive states**
   - Every button: hover, active, focus-visible, disabled, loading.
   - Every input: focus, error, disabled.
   - Every link: hover, focus-visible. Underline on hover at minimum.

6. **Audit async surfaces**
   - Loading state. Not a generic spinner; a layout-shift-free skeleton or progress.
   - Empty state. Specific to the surface, not a generic "nothing here yet".
   - Error state. Includes the actual error and a recovery action (retry, contact, navigate elsewhere).

7. **Sui-specific surfaces**
   - Wallet connect: clear connect / disconnect, current address visible, network indicator.
   - Address display: ellipsis the middle, copy button adjacent, never display the full 66-char on mobile.
   - Transaction state: signing / pending / success / failed, each with a SuiVision link.
   - Gas / MIST values: route to `number-formatting`.

8. **Accessibility pass**
   - Keyboard nav on every interactive surface.
   - `aria-label` on icon-only buttons.
   - Focus ring visible. Default focus rings are usually disabled in starter templates; restore them.
   - Color contrast at 4.5:1 for body text, 3:1 for large.

9. **Writeback**
   - Append a list of applied fixes to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done:

- Does every async surface have a real loading, empty, AND error state? (Not just two of the three.)
- Did the audit catch the obvious template-look markers from `references/template-look-markers.md`?
- Are all button states implemented, including focus-visible?
- Does the page work with keyboard only, screen reader on?
- Is at least one component still distinct enough that a competitor's screenshot would not be confused with this one?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/template-look-markers.md`: Markers that signal "this is a starter template".
- `references/component-defaults.md`: Default specs for buttons, inputs, cards, modals, toasts.
- `references/sui-frontend-patterns.md`: Wallet connect, address display, tx state surfaces.

Knowledge docs:

- `skills/data/sui-knowledge/05-app-layer-and-consumer.md`: App-layer Sui context.

## Use in your agent

- Claude Code: `claude "/frontend-design-guidelines <your message>"`
- Codex: `codex "/frontend-design-guidelines <your message>"`
- Cursor: paste a chat message that includes a phrase like "design taste check", or load `~/.cursor/rules/frontend-design-guidelines.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
