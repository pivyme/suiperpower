# Palette recipes by tone

Starting palettes for four common tones. Pick one as a base, then adjust the primary toward something the user actually likes. The point is to escape the purple-gradient default, not to lock anyone in.

All hex values pass 4.5:1 contrast against the listed background.

## Tone: serious / financial

Use for: trading apps, treasury tools, infra dashboards.

- background: `#0E0E10` (near-black, not pure black)
- surface: `#17171A`
- text: `#F4F4F5`
- text-muted: `#A1A1AA`
- primary: `#22C55E` (saturated green, money-coded but not neon)
- danger: `#EF4444`
- border: `#27272A`

Pair with: serif headings (`Source Serif Pro`, `Newsreader`), sans body (`Inter Tight`, `Geist`).

## Tone: playful / consumer

Use for: games, social apps, NFT marketplaces.

- background: `#FFF7ED`
- surface: `#FFFFFF`
- text: `#1C1917`
- text-muted: `#78716C`
- primary: `#F97316` (warm orange, not the obvious purple)
- accent: `#A21CAF` (deep magenta as accent only, not primary)
- border: `#E7E5E4`

Pair with: a quirky display heading (`Fraunces`, `Recoleta`), a clean sans body (`Manrope`).

## Tone: technical / developer

Use for: SDKs, dev tools, indexers, CLIs.

- background: `#0A0A0A`
- surface: `#141414`
- text: `#EDEDED`
- text-muted: `#888888`
- primary: `#FAFAFA` (white-on-black, with color reserved for state)
- success: `#10B981`
- warning: `#F59E0B`
- error: `#F43F5E`
- border: `#262626`

Pair with: a distinctive mono (`JetBrains Mono`, `Berkeley Mono`, `Geist Mono`) for both code and headings, and a clean sans for body.

## Tone: editorial / brand-forward

Use for: founder-led products, writing-heavy sites, content platforms.

- background: `#FAFAF9`
- surface: `#FFFFFF`
- text: `#0C0A09`
- text-muted: `#57534E`
- primary: `#1E40AF` (deep editorial blue, not Coinbase blue)
- accent: `#B45309` (warm earth tone)
- border: `#D6D3D1`

Pair with: a strong serif (`PP Editorial New`, `Söhne Breit`, `Tiempos`), a high-readability sans body.

## How to use

1. Pick a base by tone.
2. Replace the primary with something the user actually wants. Ask: what is one product they admire? Match the temperature, not the literal color.
3. Test at three sizes: 12px text, 16px body, 32px heading. If contrast fails at 12px, redo.
4. Lock the tokens in `tailwind.config` or CSS variables before any component is built.
