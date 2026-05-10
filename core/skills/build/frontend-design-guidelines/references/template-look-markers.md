# Template-look markers

These are signals that a dapp UI was scaffolded from a starter template and never customized past the boilerplate. Each is a tell. Three or more in a single page means a redesign is overdue.

## Hero markers

- A hero with a headline plus a subhead plus exactly one centered CTA, against a gradient background.
- A "particles" or "waves" canvas behind the hero.
- An emoji as the only visual element.
- A "Get Started" or "Launch App" button with no context next to it.

## Layout markers

- The "three or six features in a grid" section, every card with a circular gradient icon at top-left.
- A "Trusted by" logo wall full of grey desaturated logos.
- A footer that is a banner with another CTA, a single link list, and a logo.
- Section spacing identical across every section (no rhythm).

## Component markers

- Buttons that glow on hover (`box-shadow: 0 0 20px primary`).
- Cards with `border: 1px solid rgba(255, 255, 255, 0.1)` on a dark background, which is the shadcn / Vercel template default.
- Inputs without focus rings.
- Modals that fade in from `opacity: 0` with no other animation, identical timing.

## Type markers

- Headings in default Inter at 700 weight.
- All caps section labels with default tracking.
- No tabular figures on numeric data.
- Body text at 14px or smaller (templates often use 14px to fit more content).

## Color markers

- Tailwind default colors used directly (`bg-blue-500`, `bg-purple-600`).
- Three or more grey values that are all from the same scale (`gray-100` through `gray-900`) without contrast.
- A single accent color used for every primary, secondary, and accent surface.

## Copy markers

- Section headings that are abstract: "Powerful. Simple. Fast."
- Feature descriptions written in third-person passive voice.
- A pricing table where every plan says "Contact us".

## How to escape

Pick one or two opinionated moves per page and commit:

- Replace the gradient hero with a single asset (a screenshot, an illustration, a chart) that is specific to the product.
- Use a serif for the H1 if the body is sans, or vice versa.
- Pick one section that breaks rhythm: bigger padding, off-grid layout, an inline visual.
- Replace the abstract copy with a sentence that names the user's specific problem.

A page that looks "intentional" beats a page that looks "polished". Polish without intention is template.
