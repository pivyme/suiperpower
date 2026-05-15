# 04, Design System

The faucet looks like a thoughtfully built dev tool, not a hackathon submission. Dark by default, neutral palette, Google Sans family, no chrome, no marketing words. The whole product fits in one screen.

## Reference inspirations

- **suiperpower.dev** (parent project), take the typographic restraint, the warm neutral background, the wordmark-only header. Do not take any wording.
- **vercel.com/dashboard**, take the table density and the "no chrome" feeling. Do not take the multi-column layout.
- **stripe.com/docs**, take the calm and the careful spacing. Do not take the illustration heaviness.

Avoid the generic "DEX clone" look: no neon glows, no gradient buttons, no animated background particles, no card-stacking depth.

## Typography

```css
@theme {
  --font-sans: "Google Sans Flex", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Inter", system-ui, sans-serif;
  --font-mono: "Google Sans Code", "JetBrains Mono", "Fira Code", source-code-pro, monospace;
}
```

Fonts loaded via Google Fonts in `__root.tsx` head (replace the existing Inter Variable link). Variable axes used: weight 300-700.

Scale:

| Token | Size | Line height | Weight | Use |
| --- | --- | --- | --- | --- |
| `text-display` | 44px desktop / 32px mobile | 1.1 | 600 | Hero title only |
| `text-2xl` | 28px | 1.2 | 600 | Card section headers |
| `text-xl` | 22px | 1.3 | 500 | Tab labels, big amounts |
| `text-base` | 16px | 1.5 | 400 | Body |
| `text-sm` | 14px | 1.5 | 400 | Captions, hints |
| `text-xs` | 12px | 1.4 | 500 | Chips, footnotes |
| `text-mono-lg` | 22px | 1.3 | 500 | mono | Vault stat numbers |
| `text-mono-sm` | 13px | 1.4 | 400 | mono | Code/addresses |

Letter-spacing: default. Avoid all-caps. Title case only for buttons and tab labels.

## Color palette

We use the neutral scale almost exclusively. One accent only.

```css
:root, .dark {
  /* surfaces, dark by default */
  --bg:           theme("colors.neutral.950");   /* page */
  --surface:      theme("colors.neutral.900");   /* card */
  --surface-elev: theme("colors.neutral.800");   /* hover */
  --border:       theme("colors.neutral.800");   /* hairlines */
  --border-soft:  theme("colors.neutral.900");

  /* text */
  --fg:           theme("colors.neutral.50");
  --fg-muted:     theme("colors.neutral.400");
  --fg-quiet:     theme("colors.neutral.500");

  /* one accent: amber 400, matches suiperpower */
  --accent:       theme("colors.amber.400");
  --accent-hover: theme("colors.amber.300");
  --accent-fg:    theme("colors.neutral.950");

  /* semantic */
  --success:      theme("colors.emerald.400");
  --warning:      theme("colors.amber.300");
  --danger:       theme("colors.red.400");
}

.light {
  --bg:           theme("colors.neutral.50");
  --surface:      theme("colors.white");
  --surface-elev: theme("colors.neutral.100");
  --border:       theme("colors.neutral.200");
  --border-soft:  theme("colors.neutral.100");
  --fg:           theme("colors.neutral.900");
  --fg-muted:     theme("colors.neutral.600");
  --fg-quiet:     theme("colors.neutral.500");
  --accent:       theme("colors.amber.500");
  --accent-hover: theme("colors.amber.600");
  --accent-fg:    theme("colors.white");
  --success:      theme("colors.emerald.600");
  --warning:      theme("colors.amber.600");
  --danger:       theme("colors.red.600");
}
```

Light mode is supported (the starter already has the toggle) but the demo runs in dark mode. The accent stays consistent across themes.

State pairs:

| Token | Idle | Hover | Active | Disabled |
| --- | --- | --- | --- | --- |
| Primary button bg | `accent` | `accent-hover` | `amber-500` | `neutral-800` |
| Primary button fg | `accent-fg` | `accent-fg` | `accent-fg` | `neutral-600` |
| Secondary button bg | `transparent` | `surface-elev` | `neutral-700` | `transparent` |
| Secondary button border | `border` | `border` | `border` | `border-soft` |
| Input border | `border` | `border` | `accent` | `border-soft` |
| Tab inactive | `transparent` | `surface-elev` | `surface-elev` | n/a |
| Tab active | `surface-elev` | `surface-elev` | `surface-elev` | n/a |

## Spacing scale

Tailwind defaults (4/8/12/16/20/24/32/40/48/64). No arbitrary values. If you find yourself reaching for `p-[13px]`, stop, pick the closest token.

Vertical rhythm:
- Section spacing: 64px between hero, stats, card, how-it-works, credit
- Card internal padding: 24px
- Form field gap: 16px
- Inline label-to-input: 8px

## Radius / shadow / border

- Radius `rounded-lg` (8px) for inputs, buttons
- Radius `rounded-2xl` (16px) for the main card and stat cards
- No shadows in dark mode. In light mode, `shadow-sm` only.
- All borders `1px solid var(--border)`. No double borders.

## Component primitives

### Button

Three variants: `primary`, `secondary`, `ghost`. One size for actions, smaller variant for the wallet button.

```tsx
// Primary (the CTA, used for Claim/Return/Refill submit)
<button className="
  h-11 px-5 rounded-lg font-medium text-sm
  bg-amber-400 text-neutral-950
  hover:bg-amber-300 active:bg-amber-500
  disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed
  transition-colors
">Claim</button>
```

States required: idle, hover, focus (ring), active, disabled, loading (small spinner + label "Claiming..."), error (one-shot red flash for 600ms after a failed submission, then back to idle).

### Input (AmountInput)

```tsx
<div className="
  flex items-center gap-3 px-4 h-14 rounded-lg
  bg-neutral-950 border border-neutral-800
  focus-within:border-amber-400 transition-colors
">
  <input className="
    flex-1 bg-transparent text-xl font-mono text-neutral-50
    placeholder:text-neutral-600 outline-none
    [appearance:textfield] [-moz-appearance:textfield]
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
  " />
  <span className="text-sm text-neutral-400">SUI</span>
  <button className="text-xs text-amber-400 hover:text-amber-300">MAX</button>
</div>
```

States: idle, focus, error (border red-400), disabled (opacity 50, no caret).

### Card

Standard:

```tsx
<div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
  ...
</div>
```

Elevated (used inside the card for the swap preview):

```tsx
<div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
  ...
</div>
```

### Tab bar

```tsx
<div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-neutral-950 border border-neutral-800">
  <button role="tab" aria-selected={active} className={`
    h-9 rounded-md text-sm transition-colors
    ${active ? 'bg-neutral-800 text-neutral-50' : 'text-neutral-400 hover:text-neutral-200'}
  `}>Get DUSDC</button>
  ...
</div>
```

### Toast

react-hot-toast, configured in `__root.tsx`. Already has the right styling for the suiperpower vibe (mono font, neutral palette). One thing to adjust: success icon color to amber, not green.

### Chip / Badge

```tsx
<span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-xs
  bg-amber-400/10 text-amber-300 border border-amber-400/20">
  testnet
</span>
```

Variants: `info` (amber), `warning` (amber, brighter), `danger` (red), `neutral` (neutral-400/10).

### Skeleton

```tsx
<div className="h-7 w-32 rounded bg-neutral-800 animate-pulse" />
```

## Page-level state patterns

Every screen handles:

1. **Empty state**, applies to ReturnTab when user has no DUSDC, RefillTab never (always actionable), ClaimTab when vault is dry.
   - Visual: 80px tall block, neutral-400 icon (Lucide `Inbox` or `AlertCircle`), one line of copy, one primary CTA when applicable.
2. **Loading state**, applied to VaultStats, the address-resolved tx-hint, the user's coin list when switching to Return/Refill.
   - Visual: skeleton rectangles matching the populated layout.
3. **Error state**, when `/stats` or chain reads fail. Replace VaultStats with `<div className="text-sm text-neutral-500">stats unavailable, claim still works</div>`. Inline form errors are red-400 text below the input.
4. **Success state**, post-tx toast with explorer link.
5. **Disabled state**, button greyed when validation fails. The reason appears in plain text below the input, never only in a tooltip.

## Iconography

Lucide React, already in the dep list. Default size 16px inside text, 20px inside buttons. Color inherits from text. Do not import the full bundle, import per-icon (`import { Wallet } from 'lucide-react'`).

Icon use:
- `Wallet`, wallet button
- `Droplet`, hero accent (optional)
- `AlertCircle`, error states
- `Inbox`, empty states
- `Loader2`, button loading (animated `animate-spin`)
- `ExternalLink`, explorer links in toasts
- `Moon` / `Sun`, theme toggle

## Motion

- Page enter: no animation. Demo grade > flashy.
- Tab switch: instant. No fade.
- Button hover: 120ms color transition. Easing `ease-out`.
- Toast: default react-hot-toast.
- Skeleton: `animate-pulse` (Tailwind default, 2s).

Do not use the existing GSAP `AnimateComponent` for anything on this page. Reserve animations for the suiperpower marketing site.

## Copywriting tone

Voice: direct, technical, no exclamation marks, no marketing verbs ("seamless", "powerful", "leverage" are banned). One-sentence paragraphs when possible. American spelling.

Do say:
- "Get DUSDC"
- "Return DUSDC"
- "Top up the vault"
- "Claimed 50 DUSDC."
- "Vault is empty, ping the team to refill."
- "Per-wallet cap, 5 SUI / day."

Do not say:
- "Seamlessly swap your tokens"
- "Powered by Sui"
- "Welcome to the future of testnet"
- "🚀 Let's go!"

No emojis anywhere in product copy.

## Verbatim demo strings

These are the exact strings the build loop copies into the UI. Do not paraphrase.

| Slot | String |
| --- | --- |
| Tab title | `DUSDC Faucet · DeepBook Predict Testnet` |
| Hero title | `DUSDC Faucet` |
| Hero subtitle | `Trade testnet SUI for DUSDC at 100 to 1. Swap back any time. No form, no waiting.` |
| Wallet button (disconnected) | `Connect wallet` |
| Wallet button (connected) | `0x12ab…cd34` (shortened, 6 + 4) |
| Vault stat 1 label | `DUSDC available` |
| Vault stat 2 label | `Served today` |
| Vault stat 2 sub | `{n} claims` |
| Vault stat 3 label | `Rate` |
| Vault stat 3 value | `100 DUSDC / 1 SUI` |
| Tab "Get DUSDC" | `Get DUSDC` |
| Tab "Return DUSDC" | `Return DUSDC` |
| Tab "Refill" | `Refill` |
| Claim form label | `You pay` |
| Claim form receive | `You receive` |
| Claim button idle | `Claim` |
| Claim button connecting | `Connect wallet` |
| Claim button loading | `Claiming…` |
| Claim button vault empty | `Vault empty` |
| Return form label | `You return` |
| Return form receive | `You receive` |
| Return button idle | `Return` |
| Return button no balance | `No DUSDC to return` |
| Return button loading | `Returning…` |
| Refill copy | `Anyone can refill. Recommended balance is 1,000 DUSDC or more.` |
| Refill form label | `You deposit` |
| Refill button idle | `Top up vault` |
| Refill button loading | `Refilling…` |
| How it works title | `How it works` |
| How it works 1 | `Connect a testnet wallet, type the amount of SUI you want to trade, sign one transaction. DUSDC arrives in five seconds.` |
| How it works 2 | `Daily cap is 5 SUI per wallet. Per-transaction cap is 1 SUI. Caps live on-chain and apply even if this site goes down.` |
| How it works 3 | `Anyone can top up the vault. Returns swap DUSDC back to SUI at the same rate. No fees, no spread.` |
| Toast claim success | `Claimed {amount} DUSDC` |
| Toast return success | `Returned {amount} DUSDC for {sui} SUI` |
| Toast refill success | `Topped up the vault with {amount} DUSDC. Thanks.` |
| Toast generic error | `Transaction failed. Check the wallet for details.` |
| Vault dry banner | `Vault is empty. Ping @DeepBookFi to refill.` |
| Stats unavailable | `Stats unavailable, claim still works.` |
| Footer credit | `made by Kelvin Adithya` (the name links to https://klvn.dev) |

The footer reads exactly: `made by Kelvin Adithya` with `Kelvin Adithya` as an underlined link to `https://klvn.dev`. No "Suiperpower" anywhere on the page.

## Layout grid

Single column, max width 720px for the hero/stats/card section, centered. How-it-works expands to 880px so three paragraphs sit side by side on desktop. Mobile collapses everything to single column with 24px page padding.

Breakpoint: 768px. Anything below is mobile.

## Don'ts

- No background gradients on the page.
- No floating elements (sticky CTAs, chat bubbles, cookie banners, anything fixed except the header).
- No carousels.
- No metrics that aren't actually live ("100k+ developers" type).
- No "Powered by Sui" badge. The token type tells you everything.
- No animated charts, no token tickers, no fake activity feeds.
