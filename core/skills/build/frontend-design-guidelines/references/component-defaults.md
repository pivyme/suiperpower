# Component defaults

Opinionated specs for the components every Sui dapp ships. Use as a starting point, not a final answer.

## Button

- Primary: solid fill in brand primary, white or near-white text, 6px or 8px radius (not pill, not square).
- Padding: 8px 16px (sm), 10px 20px (md), 12px 28px (lg).
- Hover: brightness +5% or shift one step toward primary-hover token. NO glow shadow.
- Active: brightness -5%.
- Focus-visible: 2px ring in primary at 50% opacity, offset 2px.
- Disabled: 40% opacity, no pointer cursor.
- Loading: spinner inline left of label, label text greyed but readable.

## Input

- Background: surface color (slightly different from page background).
- Border: 1px in border token, 6px radius.
- Padding: 10px 12px.
- Focus: border in primary, ring at 25% opacity.
- Error: border in error token, error message below in same color.
- Placeholder: text-muted token, never the same color as filled value.

## Card

- Background: surface token.
- Border: 1px in border token, 8px radius. NO drop shadow on dark backgrounds.
- Padding: 20px on mobile, 24px on desktop.
- Header / body / footer rhythm: 12px between groups, 4px within a group.

## Modal / Dialog

- Backdrop: 60% opacity black, blur 8px. NO 100% opacity.
- Container: surface color, 12px radius, 24px padding.
- Close button: top-right, X icon, focus-visible ring.
- Body content: respects 600px max-width on desktop, 95vw on mobile.
- Animation: 150ms slide-up from 20px below + fade-in. NOT a 300ms fade alone.

## Toast / Notification

- Position: bottom-right desktop, top-center mobile.
- Background: solid surface color, NOT a transparent or glass effect.
- Auto-dismiss: 5s for info, 8s for error, manual-dismiss-only for action-required.
- Icon left, text middle, dismiss right.
- Stack max 3 visible; older toasts collapse.

## Empty state

- Centered in the empty container.
- Title: one short sentence naming what is missing.
- Body: one sentence explaining why and what to do.
- CTA: the next action the user should take, not a generic "Refresh".
- Optional illustration, but NEVER a generic stock illustration. Skip if no custom one exists.

## Error state

- Title: what failed, in plain language.
- Body: the error reason if useful, hidden behind a "Show details" disclosure if technical.
- CTAs: retry (if retryable), contact / report, navigate elsewhere.
- For Sui transaction errors: include the digest, link to SuiVision.

## Loading state

- Skeleton with the shape of the final content. Same dimensions, same layout.
- Shimmer animation at 1500ms cycle, NOT 800ms (too anxious) or 3000ms (looks broken).
- Spinner only as a last resort, and only inside buttons or short-lived flows.
- No loading state for sub-100ms operations.

## Accessibility defaults across all components

- Hit area minimum 44x44px on touch.
- Focus ring visible on every interactive element.
- `aria-label` on every icon-only control.
- `aria-live="polite"` on toasts and async status.
- Tab order matches visual order.
- ESC closes modals and dropdowns.
