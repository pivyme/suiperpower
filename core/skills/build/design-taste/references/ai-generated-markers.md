# AI-generated markers

A subset of generic markers that specifically signal "an LLM wrote this" or "an image model rendered this". These are worth calling out separately because they are recoverable with a one-pass human edit.

## Copy

- Bullet lists where every bullet has the same syntactic shape (verb-noun, parallel length, no rhythm variation).
- "Whether you are a beginner or a seasoned X" framing.
- "Imagine a world where..." opener.
- "Empowering users to..." or "Unleash the power of..."
- "In today's fast-paced world, ..."
- Triplet patterns ("fast, simple, powerful") used in section headings.
- Closing-sentence calls to action that summarize the section.
- Paragraphs that hedge constantly ("can help", "may enable", "is designed to").
- Numbered lists where the numbers add no information.

Recovery: rewrite each section in the user's actual voice. Ask "how would you say this on a podcast in one sentence?". Use that sentence.

## Visuals

- Stock-illustration style with smooth gradients and rounded shapes.
- Three or six identical-style icons, each in a circle with a gradient.
- Hero illustrations of figures with no distinguishing features, in a "tech-purple" environment.
- Product mockups in a generic browser frame.
- Background patterns of particles, dots, or wavy lines.

Recovery: replace one illustration with a real screenshot of the product, even if the product is rough. A real screenshot beats a polished illustration every time.

## Code-as-output markers

When agents author code or copy, certain tells leak into the output:

- Variable / class names like `MainSection`, `FeatureBlock`, `HeroPanel` (generic, not domain-specific).
- Comment density that explains every line.
- Try / catch wrappers around code that does not throw.
- Excessive prop drilling for trivial state.
- Pattern names that mirror tutorial pages ("React-Page-Component-with-State").

Recovery: rename to domain-specific names (`PriceTicker`, `WalletBalance`, `SponsorBanner`), remove the explain-the-obvious comments, simplify the wrappers.

## What to look for first

When auditing a page that "looks AI-generated":

1. Read the H1 aloud. If it sounds like a marketing intern wrote it for any product, that is the first fix.
2. Look at the hero visual. If it could swap into a different startup's site without notice, replace it.
3. Read three random body sentences. If they all hedge ("can", "may", "designed to"), rewrite for confidence.
4. Look at the icons. If they all share a circular gradient style, swap two for asymmetric or distinctive marks.

## Prompt the user for voice

If the user is not sure what their voice should be, ask three questions:

- What is one product whose copy you admire?
- What is one sentence you would use to describe your product to a friend at a bar?
- What is one thing your competitors say that you would never say?

The answers are the voice. Edit the copy to match.
