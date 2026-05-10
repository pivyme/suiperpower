# Skeleton patterns for Sui dapp surfaces

A skeleton is a placeholder that matches the final content's layout. Done well, the skeleton is invisible to the user (they see content "filling in") rather than a grey blob shimmering. Done poorly, the skeleton is its own UI distraction.

## Principles

- Match dimensions to the final content. Same width, same height, same spacing.
- Use one or two skeleton block widths in a section, not five different sizes (looks busy).
- One shimmer cycle, not multiple fighting for attention.
- Skeleton color should be 5-10% lighter or darker than the surface, NOT high-contrast.
- Replace with content via cross-fade (150ms ease-out), not slide or scale.

## Balance tile

A user's coin balance, e.g. SUI shown in the header.

```
[ICON 32x32] [Coin name 80x16]   [Amount 120x20]
              [Sub-label 60x12]   [Sub-amount 60x14]
```

Skeleton: two row groups with the icon as a circle, name and amount as two rectangles each, sub-labels narrower and shorter. Do NOT skeleton the icon if the coin type is known at render time; just render the real icon over the skeleton row.

## Address list

A list of saved addresses or recent counterparties.

```
[Avatar 32x32] [Name 100x16]              [Amount 80x14]
               [Address 0x12...abcd 12px] [USD value 60x12]
```

Skeleton: 5 to 8 rows with the same layout. Vary the name-block width slightly (90-110px) to look natural. Do NOT vary timing per row; one shimmer cycle for the whole list.

## Transaction history

A timeline-style list of past transactions.

```
[Type icon 24x24]  [Type label 60x14]      [Amount 100x16]
                   [Counterparty 120x12]   [Date 80x12]
                   [Digest 0xabc...def 12px]
```

Skeleton: 6-10 rows. Group icon style by transaction class so the skeleton hints at content variety.

## NFT grid

A grid of NFTs the user owns.

```
[Card 200x240]
[Image 200x200]
[Name 120x16]
[Sub 80x12]
```

Skeleton: 6-12 cards, image as a square skeleton, name and sub as two rectangles below. Maintain grid gap.

## Empty wallet shape

When the wallet has no relevant Objects, the skeleton transitions to an empty state, NOT a "0 results" message. The empty state is its own UI (see `frontend-design-guidelines/references/component-defaults.md`).

## Implementation

A simple Tailwind / CSS shape:

```html
<div class="skeleton" style="width: 120px; height: 16px;"></div>
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-surface-2) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1500ms ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--color-surface-2);
  }
}
```

Where `--color-surface-2` is 5-10% off `--color-surface`.

## When to skip the skeleton

- Operations that resolve in under 100ms: render nothing for the wait, content appears with a fade.
- Operations the user expects to be instant (clicking a tab, opening a settings panel): no skeleton, just the content.
- First-paint of static content (above-the-fold marketing copy): no skeleton, just render.

## When the skeleton should NOT shimmer

- When the user has set `prefers-reduced-motion: reduce`.
- When the surface contains 20+ skeleton elements (the cumulative shimmer is visually noisy).
- When the same surface re-renders frequently (the shimmer becomes a distraction).
