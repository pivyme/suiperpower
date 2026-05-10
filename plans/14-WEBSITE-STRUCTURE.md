# 14. Website structure

## Scope of this doc

Information architecture, copy outline, and structural constraints for `suiperpower.dev`. No styling, no design system, no component implementation. Visual decisions happen later, in the build phase, against the constraints recorded here.

If you are reading this to build the site: every section below has copy you can paste, plus a short "constraints" block telling you what not to do. If a constraint is unclear, treat the constraint as load-bearing and ask before relaxing it.

## What the website is, in one paragraph

`suiperpower.dev` is a **single-page** content site. It exists to convert a visitor into someone who has run the install command. Everything on the page either drives that conversion or earns the trust that makes that conversion likely. The site is not the product. The CLI is the product. Skill catalog, docs, contributing guide, release notes, and sponsor pages all live on GitHub, where they already render for free.

Two operational jobs:

1. Host `/setup.sh` (the curl install target).
2. Show the install command above the fold, with enough scroll-context that a visitor knows what they are installing and why.

If a future feature does not serve one of those two jobs, it does not belong on the site.

## Reference, not template

`solana.new` is a structural reference for the **install hero** only. The terminal-style code block, the install command as the visual centerpiece, is a pattern that works and we use it.

Everything else (sections, copy, ordering, narrative spine) is Suiperpower-specific. The site should not feel like a Sui re-skin of solana.new to anyone who has seen both. The single most important rule of this entire doc: **we are a Sui-native product, not a port.**

What we do **not** copy from solana.new:

- The "build useful and tasteful crypto apps" left-rail skill table on the landing
- The "founder mode ON" pillar layout
- The "Your Agents are ready. Are you?" purple CTA
- The dark gradient hero treatment

The full do-not-use phrase list lives in `plans/15-BRAND.md`. Read it before writing any copy.

## The narrative spine

The page answers the visitor's questions in order. If a section does not answer one of these, it does not belong on the page.

| Scroll depth | Visitor question | Section |
|---|---|---|
| Hero | "What is this and how do I install?" | 1. Hero |
| First scroll | "What do I actually get?" | 2. What this gives you |
| Mid-scroll | "How does this work?" | 3. The journey |
| Mid-scroll | "Why should I care?" | 4. Why anti-slop matters |
| Trust-building | "Who is this person, and have they done this before?" | 5. From the builder |
| Trust-building | "Who validates this?" | 6. Built with Sui sponsors |
| Conversion | "OK, how do I install again?" | 7. Final CTA |
| Tail | "Who actually built it?" | 8. Made by |

Two conversion checkpoints we design for:

- **Hero-only visitor**: someone who lands, reads the headline, sees the install command, and leaves. They should have everything they need to install. The hero is self-sufficient.
- **Mid-scroll visitor**: someone who scrolls to "why anti-slop matters" and bounces. They should have enough context to remember the project and come back. The middle of the page reinforces the hero, it does not replace it.

## Stack and routes

Tech is deliberately boring, because the page is small.

- Next.js (App Router) on Vercel, single page at `/`
- Static export
- No CMS, no MDX, no catalog rendering on the site

Routes:

```
/                       The landing page (the only real route)
/setup.sh               The bash install script (from /public/setup.sh)
/og-image.png           Open Graph card
/sitemap.xml            One-entry sitemap (just /)
/robots.txt             Allow all
```

That is the entire website. **No** `/install`, `/skills`, `/repos`, `/mcps`, `/ideas`, `/docs`, `/sponsors`, `/overflow`, `/changelog`, `/privacy`, or `/terms`. All of that lives in the GitHub repo as markdown.

If we ever need a privacy notice or terms link for compliance, we add them later as static pages. They are not blocking launch.

---

## Landing page sections

Eight sections and a footer. No more. Order matters.

For each section: copy you can paste, then a constraints block telling you what not to do.

### 1. Hero

The visitor's first 3 seconds decide whether they install. Every element earns its space.

**Top bar** (one line, full-width):

- Left: wordmark "suiperpower" (lowercase, small)
- Right: GitHub link with star count, that is it. No menu, no nav, no theme toggle.

**Hero block** (centered):

- **Headline**: `build Sui that ships.`
- **Subhead** (one sentence): "Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor."
- **Install block** (terminal-style, copy button on hover or always visible):
  ```
  curl -fsSL https://suiperpower.dev/setup.sh | bash
  ```
- **Below install** (small, one line): "30+ Sui-native skills, knowledge base, ecosystem catalog. One install. Three agents."
- **Agent badges** (3 small icons, inline, below the install block): Claude Code, Codex, Cursor.

**Constraints**:

- Hero must fit in the viewport on a 13-inch laptop and on an iPhone 15. If it does not, cut copy until it does.
- No carousel.
- No gradient hero animation, no looping background video, no particle field.
- No Sui Overflow 2026 co-branding in the hero. The hero is for install conversion, not partnership announcements.
- No "watch demo" video CTA. The install command is the demo.

### 2. What this gives you

Three benefits, three columns. One sentence each. No icons unless they are tasteful, restrained, and the same family.

| Benefit | Copy |
|---|---|
| **Skills that route by intent** | "Type what you want to do. The right skill loads. No flag memorization, no doc spelunking." |
| **A Sui knowledge base your agent can read** | "Move, objects, PTBs, Walrus, DeepBook, Scallop. The agent uses it before it writes a line." |
| **Anti-slop quality gates** | "Every build skill ends with a 'will this survive past the hackathon' check. Slop fails the gate." |

**Constraints**:

- Three columns at desktop width, stacked at mobile width.
- Headlines bold, body regular weight. No fancy treatments.
- Do not add a fourth column to make it "more complete". The third column (anti-slop) is the differentiator and three columns hits visual balance. Four columns dilutes.

### 3. The journey

The single section that visually distinguishes us from solana.new. Solana.new shows four pillars. We show a five-phase pipeline because Suiperpower is opinionated about handoff between phases, that is the actual product story.

**Visual**: a horizontal flow of five labels, connected by arrows or chevrons.

```
Learn → Idea → Build → Ship → Grow
```

Under each label, two or three real trigger phrases from the catalog. Examples (build phase picks the final set from `plans/04-SKILLS-CATALOG.md`):

- **Learn**: "I'm new to Sui, teach me", "I'm coming from Solana, what's different"
- **Idea**: "what should I build on Sui", "stress-test this idea"
- **Build**: "scaffold my project", "build a Move module", "integrate Walrus"
- **Ship**: "deploy to mainnet", "submit to Sui Overflow"
- **Grow**: "set up analytics", "launch in community"

**Explainer** (one short paragraph below the flow):

> "Skills hand off through the filesystem. The idea phase writes a brief, the build phase reads it, the ship phase reads what build produced. No retyping, no re-prompting your agent's memory."

**Constraints**:

- Five phases is the count. Not four (we lose the "Grow" anti-slop continuation), not six (the Sui-Overflow-specific bits dilute Build).
- The arrows must imply continuation, not strict gating. Skills can be invoked standalone too; the diagram should not suggest you must traverse left-to-right.
- Mobile: the five phases stack vertically with arrows pointing down. Do not hide phases behind a "see more" toggle.

### 4. Why anti-slop matters

The differentiator section. The two paragraphs that earn the click to GitHub.

**Copy**:

> "Most hackathon submissions are slop. Polished landing page, broken flow, no path to a second user. They die when the prize is paid out."
>
> "Sui Overflow 2026 explicitly judges on real-world application, polish, and sustainability. Suiperpower is built around that bar. Build skills run a checklist before they call themselves done. Ship skills refuse to fake telemetry, fake users, or fake code coverage. The bar is in the markdown, public, auditable."

**CTA below the second paragraph**: a single text link reading "Read the quality bar →", linking to `github.com/<org>/suiperpower/blob/main/plans/12-ANTI-SLOP-FRAMEWORK.md`.

**Constraints**:

- Two paragraphs. Not three. Not one. The first establishes the problem, the second establishes our answer. A third paragraph would weaken both.
- No statistics ("78% of hackathon projects ..."). We do not have credible source data and faking it would itself be slop.
- The CTA is text. No button styling. The visitor reading this section is here for substance, not buttons.

### 5. From the builder

A pull-quote with attribution. Sets a face and credentials behind the abstract anti-slop argument above.

**Copy**:

> "Most Sui hackathon submissions stop the day the prize lands. They were built for the hackathon, not for users. I built Suiperpower because that is the trap I want the next batch of builders to skip. Build a Sui product that earns real users, real traction, and eventually, real funding."
>
> Kelvin Adithya, co-founder of [PIVY](https://pivy.me), 1st place at Sui Overflow 2025 (Payment and Wallets track)

**Constraints**:

- Reads as a quote, not as a marketing testimonial. Plain text, left-aligned, with a thin vertical accent or a leading quotation mark, nothing more.
- Attribution one line below, smaller, with the role and Overflow 2025 win as the credibility anchor.
- No headshot in v1. Words carry the weight, not a face. (Headshot already lives later in section 8.)
- Link "PIVY" to pivy.me. Do not link "Sui Overflow 2025" anywhere; the year + track does the work.

### 6. Built with Sui sponsors

Single horizontal band of five logos. This is social proof, not a sponsor billboard.

**Copy** (one sentence above the logos):

> "First-class integration skills, knowledge docs, and clonable patterns for the Sui Overflow 2026 sponsors. The recommender refuses sponsor tracks the project does not actually use."

**Logos**, in this order, equal sizing:

**Walrus · DeepBook · OpenZeppelin · OtterSec · Scallop**

Each logo links to the corresponding skill on GitHub:

- Walrus → `skills/build/walrus-storage/SKILL.md`
- DeepBook → `skills/build/deepbook-orderbook/SKILL.md`
- OpenZeppelin → `skills/build/openzeppelin-sui-libs/SKILL.md`
- OtterSec → `skills/build/ottersec-prep/SKILL.md`
- Scallop → `skills/build/scallop-money-market/SKILL.md`

**Constraints**:

- Logos in grayscale or single-color treatment, not full-color. Full-color sponsor logos read as advertising; grayscale reads as social proof.
- No sponsor descriptions on hover. Visitors who want detail click through.
- No internal sponsor page. We deliberately do not have one.
- Order is **Walrus first** (headline partner), then alphabetical for the rest. If a sponsor disengages, drop their logo, do not rearrange and pretend.

### 7. Final CTA

Mirror of the hero install block. The visitor has now read the full case for installing. Give them the command again, in the same shape, so muscle memory takes over.

**Copy** (one line above):

> "Install once. Use it on every Sui project, not just one hackathon."

**Install block**:

```
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

**Two text links below the block**:

- "Browse skills on GitHub →" → `github.com/<org>/suiperpower/tree/main/skills`
- "Contributions welcome →" → `github.com/<org>/suiperpower/blob/main/CONTRIBUTING.md`

**Constraints**:

- Identical visual treatment to the hero install block. Same font, same width, same copy button behavior. Repetition is the point.
- No "Get started in 30 seconds" headline. The install command is the get-started.
- Two links below, not three. A third dilutes the conversion choice.

### 8. Made by

Three visual tiers, top to bottom. The team section earns its trust by being specific and personal, not generic.

**Tier 1, founders** (equal weight, side by side):

- **Kelvin Adithya** → https://klvn.dev
- **Febi Mettasari** → https://www.instagram.com/febimettasari

**Tier 2, intern** (smaller, single line under the founders):

- with help from our intern, **Louis Arvin** → https://www.linkedin.com/in/louis-arvin-8a8488268

**Tier 3, website credit** (smallest, visually separated by a thin divider or extra spacing):

- site by **Tengku Farhan** → https://hanebox.xyz

**Constraints**:

- Each person has a real photo. Round or square crop, all the same shape and aspect ratio across the row.
- Same eye-line across all photos in a row, so the row reads as a row, not as floating heads.
- Founder photos larger than the intern photo. Tengku's photo same size as the intern's, on its own row.
- Names below photos, linked to the URL listed. **No** role labels under tier 1 names ("Kelvin Adithya" only, not "Kelvin Adithya, co-founder"). Roles only appear in the connector copy ("with help from our intern, ...").
- Photos must be real, not avatars. Missing photo means a clean placeholder, never a generic avatar fallback.
- No social-icon clutter. One link per person, the one listed. Add Twitter / GitHub icons only if the person specifically asks.
- Consistent contrast and crop. Mismatched lighting tells visitors the team is not a real team.

### Footer

One line, left-aligned. That is it.

- Wordmark
- GitHub
- X / Twitter
- Telegram (Sui Overflow Telegram link)
- MIT license

No copyright marketing fluff. No "all rights reserved". No "made with love". No newsletter signup. No "back to top" arrow.

---

## Section completion criteria

Use this when reviewing each section before launch. A section is `done` when every box checks.

| Section | Copy locked | Links resolve | Mobile-tested | A11y-tested |
|---|---|---|---|---|
| 1. Hero | ☐ | ☐ | ☐ | ☐ |
| 2. What this gives you | ☐ | ☐ | ☐ | ☐ |
| 3. The journey | ☐ | ☐ | ☐ | ☐ |
| 4. Why anti-slop matters | ☐ | ☐ | ☐ | ☐ |
| 5. From the builder | ☐ | ☐ | ☐ | ☐ |
| 6. Sponsors | ☐ | ☐ | ☐ | ☐ |
| 7. Final CTA | ☐ | ☐ | ☐ | ☐ |
| 8. Made by | ☐ | ☐ (and consent confirmed) | ☐ | ☐ |

---

## Cross-cutting constraints

These apply to the whole page, not any one section.

### Mobile-first

The site must work, look composed, and convert on a phone before it earns a desktop polish pass. Real-world traffic from X / Twitter shares is mobile-heavy. Build for a 390-pixel viewport first, then scale up.

- Hero install block must remain copyable with one tap on mobile.
- The five-phase journey diagram stacks vertically on mobile, no horizontal scroll.
- Sponsor logos wrap to two rows on mobile. They never horizontal-scroll.

### Performance budget

A single static page with no third-party scripts should load in under one second on a fast 4G connection. Hard limits:

- Lighthouse Performance score: 95 or above.
- Total JavaScript on the page: under 100 KB compressed.
- No third-party scripts except Plausible or Vercel Analytics (privacy-friendly only, per `plans/19` row 20).
- No web fonts above two families. One sans + one mono is the budget.
- Images optimized through Next.js `<Image>`. No raw `<img>` tags.

### Accessibility floor

WCAG AA, no exceptions.

- All text passes contrast against its background at AA contrast.
- Every interactive element is keyboard-reachable in tab order.
- Photos in section 8 have descriptive `alt` text including the person's name and role.
- Sponsor logos have `alt` text naming the sponsor.
- The install code block is a real `<pre><code>` element, screen-reader reads it as code, not as decoration.
- No `outline: none` on focus. Focus rings stay visible.

### Open Graph card

`/public/og-image.png` ships with the launch.

- Dimensions: 1200 × 630.
- Content: wordmark + tagline + the install command as the visual centerpiece.
- Dark background to match the hero.
- No team photos, no sponsor logos. The OG card is for the install command.
- Tested on Twitter / X, Telegram, Slack, and Discord before launch.

---

## What is intentionally NOT on the website

This is the load-bearing exclusion list. Anything here that gets re-added in v1 reverts the design intent.

- Signup flow
- Dashboard
- "Submit your project for review" form (use deepsurge.xyz)
- Blog
- Catalog browser pages (skills, repos, MCPs, ideas live on GitHub)
- Skill detail pages (read SKILL.md on GitHub)
- Sponsor detail pages
- Sui Overflow 2026 dedicated landing page (the participant playbook is in `plans/24`, the website does not need it)
- Changelog page (use GitHub Releases)
- Privacy page (link to repo's `PRIVACY.md` if needed)
- Terms page (MIT license is the terms)
- "Compare suiperpower vs solana-new" framing
- Pricing page (free, open source, no paid tier)
- Docs site (markdown on GitHub is the docs)
- "Powered by AI" badges anywhere
- "As featured in" press strip (we have no press)
- Newsletter signup
- Live chat widget

If a future contributor wants to add any of the above, they justify it in `plans/19-OPEN-QUESTIONS.md` first. No silent additions.

---

## SEO and metadata

Basic only. The CLI is the product, not the website. SEO traffic to a one-page site is a vanity metric, but bad metadata still loses real installs from social shares.

- Meta title: "Suiperpower, build Sui that ships."
- Meta description: "Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor."
- Open Graph image at `/public/og-image.png` (spec above)
- Sitemap with one entry, `/`
- robots.txt allowing all
- Structured data: a single `Organization` JSON-LD block, no more

## Build and deploy

- Vercel deployment from the GitHub repo's `main` branch
- Single static page, builds in seconds
- `setup.sh` served from `/public/setup.sh` via Vercel rewrite, content-type `text/x-shellscript`
- Cache `/setup.sh` short (5 minutes) so a fix to install logic ships fast
- Cache the page itself with stale-while-revalidate so updates propagate fast without a flash of stale content

## Routing implementation

- App Router (Next.js 14+)
- `app/page.tsx`, the landing (the only page component)
- `app/layout.tsx`, root layout with meta tags + JSON-LD
- `public/setup.sh`, raw text install script
- `public/og-image.png`, OG card
- `app/sitemap.ts`, programmatic sitemap, single entry
- `app/robots.ts`, programmatic robots.txt

No `(marketing)` group, no `[slug]` routes, no `generateStaticParams`. Single static page, intentionally.

---

## Future expansion (deliberately deferred)

If post-launch traffic and signal justify it, add in this order. Not before.

1. `/skills` and `/skills/<name>`, only if visitors are demonstrably searching for individual skills (signal: high bounce on hero with referrer matching `?skill=<name>` or similar).
2. `/docs`, only if the GitHub markdown is repeatedly cited as too hard to navigate by non-developer visitors.
3. `/blog`, only if there is a real content cadence, not "we should have a blog because everyone has a blog."

None of this ships in v1. The single-page site is the bet, and the bet is that the install command, not website content, is what converts.

---

## Quick reference: what changed from previous versions of this doc

For anyone reading this doc with stale expectations:

- Multi-page architecture (`/skills`, `/docs`, `/sponsors`, `/overflow`, `/changelog`, `/privacy`, `/terms`) was removed. The site is single-page.
- "From the builder" quote section (5) was added.
- "Made by" team section (8) was added.
- Narrative spine, mobile-first, performance budget, accessibility floor, OG card spec, and section completion criteria were added in the audit pass.
- Voice was tightened across all sections to match `plans/15-BRAND.md`.
