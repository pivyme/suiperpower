# Animation timing defaults

Recommended durations and easings for the common animation classes in a Sui dapp.

## UI primitives

| Class | Duration | Easing |
|---|---|---|
| Button hover state | 100ms | ease-out |
| Button active (press) | 50ms | linear |
| Input focus | 150ms | ease-out |
| Tooltip | 100ms in, 50ms out | ease-out |
| Toggle / checkbox state | 150ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Tab switch | 150ms | ease-in-out |

## Containers

| Class | Duration | Easing |
|---|---|---|
| Modal open | 200ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Modal close | 150ms | ease-in |
| Dropdown / menu open | 150ms | ease-out |
| Dropdown / menu close | 100ms | ease-in |
| Toast slide-in | 200ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Toast slide-out | 150ms | ease-in |
| Drawer / sheet | 250ms | cubic-bezier(0.32, 0.72, 0, 1) |

## Page-level

| Class | Duration | Easing |
|---|---|---|
| Route transition (cross-fade) | 200ms | ease-out |
| Skeleton shimmer cycle | 1500ms | ease-in-out |
| Skeleton-to-content fade | 150ms | ease-out |
| Hero image fade-in (first paint) | 300ms | ease-out |

## Sui-specific

| Class | Duration | Easing |
|---|---|---|
| Wallet connect open | 200ms | ease-out |
| Wallet connect close | 150ms | ease-in |
| Transaction state pulse (pending) | 1500ms | ease-in-out, infinite |
| Transaction success check | 300ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Transaction failed shake | 200ms | linear |

## Anti-patterns to remove

- Any animation longer than 300ms for a UI transition.
- Bouncy springs on functional surfaces (modals, toasts). Bounce belongs on celebratory moments only.
- Animations that play on every render (often caused by missing `key` props or re-mounting).
- Multiple chained animations that add up to over 500ms perceived delay.
- Auto-playing hero animations longer than 1.5s on first paint.
- Spinners on surfaces that load in under 100ms.
- Page-level fade-in on first load (makes the page feel slower than it is).

## Reduced motion fallbacks

For each entry above, when `prefers-reduced-motion: reduce`:

- Buttons / inputs / toggles: 0ms (instant).
- Modals / dropdowns / drawers: 50ms cross-fade only, no movement.
- Skeleton shimmer: turn off animation, leave the static skeleton color.
- Transaction states: turn off pulse, use a static indicator.

CSS shape:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

That global override is a safety net. Build the proper instant fallbacks for components that animate state, since silent zero-duration can confuse (e.g. a modal that never appears to open).
