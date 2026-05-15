# 04, Design System

The faucet looks like a thoughtfully built dev tool. Dark-only, glass surfaces over an animated grain gradient, Google Sans family, no chrome, no marketing words. The whole product fits in one screen.

## Reference inspirations

- **suiperpower.dev** (parent project), take the full-bleed grain-gradient backdrop, glass surfaces, white pill primaries, fade-in-blur entrance. Visual language only. Never reference Suiperpower by name in shipped copy.
- **vercel.com/dashboard**, take the table density and the "no chrome" feeling. Do not take the multi-column layout.
- **stripe.com/docs**, take the calm and the careful spacing. Do not take the illustration heaviness.

Avoid the generic "DEX clone" look: no neon glows, no gradient buttons, no card-stacking depth, no fake activity feeds.

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

Dark-only. The page sits on a pure-black background with a full-bleed animated `GrainGradient` from `@paper-design/shaders-react`. Surfaces are glass on top of that backdrop. The primary CTA is a solid white pill.

```css
:root, html, body {
  --bg:           #000000;                       /* page */
  --fg:           #ffffff;                       /* primary text */
  --fg-muted:     rgba(255, 255, 255, 0.5);      /* secondary text */
  --fg-quiet:     rgba(255, 255, 255, 0.4);      /* footnotes */

  /* glass surfaces, applied via Tailwind classes */
  --surface:      rgba(255, 255, 255, 0.05);     /* card idle */
  --surface-elev: rgba(255, 255, 255, 0.10);     /* card hover */
  --border:       rgba(255, 255, 255, 0.10);     /* hairlines */
  --border-soft:  rgba(255, 255, 255, 0.06);

  /* primary action, white pill */
  --accent:       #ffffff;
  --accent-hover: rgba(255, 255, 255, 0.90);
  --accent-fg:    #000000;

  /* semantic, kept slightly muted to read on black */
  --success:      theme("colors.emerald.400");
  --warning:      theme("colors.amber.300");
  --danger:       theme("colors.red.400");
}
```

`GrainGradient` config (matches the Suiperpower hero, do not deviate):

```ts
{
  colors: ["#155dfc", "#bedbff"],
  colorBack: "#000000",
  softness: 0.5,
  intensity: 0.1,
  noise: 0.07,
  shape: "wave",
  speed: 0.2,
  scale: 1.5,
  offsetY: 0.3,
  offsetX: 1,
}
```

Rendered once at the route level, wrapped in `motion.div` fading from opacity 0 to 0.9 over 1.2s with a 1.5s delay, `absolute inset-0` underneath the page body.

State pairs:

| Token | Idle | Hover | Active | Disabled |
| --- | --- | --- | --- | --- |
| Primary button bg | `bg-white` | `bg-white/90` | `bg-white/90` | `bg-white/30` |
| Primary button fg | `text-black` | `text-black` | `text-black` | `text-black/60` |
| Secondary button bg | `bg-white/5` | `bg-white/10` | `bg-white/10` | `bg-white/5` |
| Secondary button border | `border-white/10` | `border-white/10` | `border-white/10` | `border-white/5` |
| Input bg | `bg-white/5` | `bg-white/5` | `bg-white/10` | `bg-white/5` |
| Input border | `border-white/10` | `border-white/10` | `border-white/30` | `border-white/5` |
| Tab inactive | `transparent` | `bg-white/5` | `bg-white/5` | n/a |
| Tab active | `bg-white/10` | `bg-white/10` | `bg-white/10` | n/a |

## Spacing scale

Tailwind defaults (4/8/12/16/20/24/32/40/48/64). No arbitrary values. If you find yourself reaching for `p-[13px]`, stop, pick the closest token.

Vertical rhythm:
- Section spacing: 64px between hero, stats, card, how-it-works, credit
- Card internal padding: 24px
- Form field gap: 16px
- Inline label-to-input: 8px

## Radius / shadow / border

- Radius `rounded-xl` (12px) for inputs, buttons, glass tab bars
- Radius `rounded-2xl` (16px) for the main card and stat cards
- No shadows. Depth comes from glass + the grain backdrop.
- All borders `1px solid rgba(255,255,255,0.10)`. No double borders.
- All glass surfaces use `backdrop-blur-md`.

## Component primitives

### Button

Two variants: `primary` (white pill, used for the CTA), `secondary` (glass pill, used for wallet, refill secondary actions).

```tsx
// Primary, Claim / Return / Refill submit
<button className="
  h-11 px-5 rounded-xl font-medium text-sm
  bg-white text-black
  hover:bg-white/90
  disabled:opacity-60 disabled:cursor-not-allowed
  transition-colors
">Claim</button>

// Secondary, wallet / how-to / ancillary
<button className="
  h-10 px-4 rounded-xl text-sm font-medium
  bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md
  text-white/80 hover:text-white
  transition-colors
">Connect wallet</button>
```

States required: idle, hover, focus (`ring-1 ring-white/30`), active, disabled, loading (small spinner + label "Claiming..."), error (one-shot toast).

### Input (AmountInput)

```tsx
<div className="
  flex items-center gap-3 px-4 h-14 rounded-xl
  bg-white/5 border border-white/10 backdrop-blur-md
  focus-within:ring-1 focus-within:ring-white/30 transition-shadow
">
  <input className="
    flex-1 bg-transparent text-xl font-mono text-white
    placeholder:text-white/30 outline-none
  " />
  <span className="text-sm text-white/50">SUI</span>
  <button className="text-xs text-white hover:text-white/80">MAX</button>
</div>
```

States: idle, focus (white ring), error (border red-400/60), disabled (opacity 50, no caret).

### Card

Standard glass:

```tsx
<div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-6">
  ...
</div>
```

Inner surface (swap preview):

```tsx
<div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4">
  ...
</div>
```

### Tab bar

```tsx
<div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
  <button role="tab" aria-selected={active} className={`
    h-9 rounded-lg text-sm transition-colors
    ${active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}
  `}>Get DUSDC</button>
  ...
</div>
```

### Toast

react-hot-toast, configured in `__root.tsx`. Glass background, white text, white success icon.

### Chip / Badge

```tsx
<span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-xs
  bg-white/5 text-white/80 border border-white/10 backdrop-blur-md">
  testnet
</span>
```

### Skeleton

```tsx
<div className="h-7 w-32 rounded bg-white/10 animate-pulse" />
```

## Page-level state patterns

Every screen handles:

1. **Empty state**, applies to ReturnTab when user has no DUSDC, RefillTab never (always actionable), ClaimTab when vault is dry.
   - Visual: 80px tall block, `text-white/40` icon (Lucide `Inbox` or `AlertCircle`), one line of copy, one primary CTA when applicable.
2. **Loading state**, applied to VaultStats, the address-resolved tx-hint, the user's coin list when switching to Return/Refill.
   - Visual: `bg-white/10 animate-pulse` skeleton rectangles matching the populated layout.
3. **Error state**, when `/stats` or chain reads fail. Replace VaultStats with `<div className="text-sm text-white/50">stats unavailable, claim still works</div>`. Inline form errors are `text-red-400/80` below the input.
4. **Success state**, post-tx toast with explorer link.
5. **Disabled state**, button stays white with reduced opacity when validation fails. The reason appears in plain text below the input, never only in a tooltip.

## Iconography

Lucide React, already in the dep list. Default size 16px inside text, 20px inside buttons. Color inherits from text. Do not import the full bundle, import per-icon (`import { Wallet } from 'lucide-react'`).

Icon use:
- `Wallet`, wallet button
- `Droplet`, hero accent (optional)
- `AlertCircle`, error states
- `Inbox`, empty states
- `Loader2`, button loading (animated `animate-spin`)
- `ExternalLink`, explorer links in toasts

## Motion

Use `motion/react` (Motion One) only. Do not use GSAP `AnimateComponent` on this page.

- Backdrop: `GrainGradient` wrapped in `motion.div` fading from opacity 0 to 0.9 over 1.2s with 1.5s delay.
- First-fold elements (hero title, subtitle, stats card, faucet card, how-it-works, credit): fade-in-blur entrance, staggered.

```ts
const fadeIn = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.8, delay, ease: "easeOut" as const },
})
```

Delays: hero 0.1, subtitle 0.2, vault stats 0.3, faucet card 0.4, how-it-works 0.5, credit 0.6.

- Tab switch: instant. No fade.
- Button hover: 120ms color transition. Easing `ease-out`.
- Toast: default react-hot-toast.
- Skeleton: `animate-pulse` (Tailwind default, 2s).

`motion` honors `useReducedMotion()` automatically; no manual handling needed.

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

- No light mode. The page is dark-only.
- No floating elements (sticky CTAs, chat bubbles, cookie banners, anything fixed except the header).
- No carousels.
- No metrics that aren't actually live ("100k+ developers" type).
- No "Powered by Sui" badge. The token type tells you everything.
- No animated charts, no token tickers, no fake activity feeds.
- No Suiperpower mentions anywhere in the rendered page. The shared piece is visual language only.
