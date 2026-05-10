# Generic markers

Visual and structural patterns that signal "starter template" or "ChatGPT-suggested defaults". A page with three or more of these reads generic to anyone with taste.

## Color

- Primary is purple (`#6F00FF`, `#8B5CF6`, near-Coinbase-purple, near-Polygon-purple).
- Background is a black-to-purple radial gradient.
- Accents are neon green or neon cyan.
- Three or more grey values from the same Tailwind scale used as the only content variation.
- Buttons glow (`box-shadow: 0 0 20px primary`).

## Typography

- Heading and body in the same family (no contrast).
- Heading in default Inter at 700.
- All-caps section labels with random letter-spacing.
- Numbers in proportional figures (jiggle on update).
- Body at 14px or smaller.

## Layout

- Hero with headline, subhead, single centered CTA, gradient background, particles canvas behind.
- Three-column or six-column feature grid with circular gradient icons.
- "Trusted by" desaturated logo wall.
- Footer banner that says "Join the future" or similar.
- Identical section padding throughout (no rhythm).

## Components

- shadcn / Vercel template card style (1px white-at-10%-opacity border on dark) used everywhere.
- Buttons that look like every other crypto button (gradient, glow, pill).
- Loading states that are generic spinners regardless of context.
- Empty states that say "Nothing here yet" with no recovery action.

## Copy

- Tagline is "the future of X" or "X reimagined".
- Section headings are abstract ("Powerful. Simple. Fast.").
- Feature paragraphs in third-person passive voice.
- CTA buttons say "Launch app" without context.

## Behavior

- Animations longer than 300ms.
- Multiple chained animations on first load.
- A bouncy spring on a functional surface (modal, toast).
- Auto-playing video hero longer than 1.5s.

## Anti-pattern: solving generic with maximalism

Adding more effects, more color, more motion, more copy does NOT solve generic. It produces a different flavor of generic ("crypto maximalist"). The fix is specificity:

- One specific asset (a real screenshot of the product, an illustration commissioned for this product).
- One specific copy line (a sentence that names the user's actual problem in their words).
- One off-template move (an unusual layout, an asymmetric composition, a font pairing nobody else uses in the space).

Generic = forgettable. Maximalist generic = memorably bad.
