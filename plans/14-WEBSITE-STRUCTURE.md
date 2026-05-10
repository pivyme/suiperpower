# 14. Website structure

## Scope of this doc

Information architecture, sections, copy outline. No styling. No design system. No component implementation. The web team or Kelvin handles styling later.

## What the website is

`suiperpower.dev` is a **single-page** content site. Two jobs:

1. Host `/setup.sh` (the curl install target).
2. Show the install command above the fold so a visitor can install in under 30 seconds, plus enough scroll-context to know what they are installing and why.

Not a webapp. No login. No dashboard. No signup. No catalog browser, no skill detail pages, no docs site, no blog. The CLI is the product. The site exists to convert.

If a user wants the full skill list, knowledge docs, sponsor pages, contributing guide, or release notes, they go to the **GitHub repo**, which already renders all of it. We do not duplicate that on the website.

## Reference, not template

`solana.new` is the structural reference for the install hero (code block, "using in-built N+ skills, MCPs and CLIs" subline). We borrow that pattern because it works. Everything else (sections, copy, ordering, narrative spine) is Suiperpower-specific. The site should not feel like a Sui re-skin of solana.new to anyone who has seen both.

Concretely, the things we do **not** copy:

- The "build useful & tasteful crypto apps" left-rail skill table on the landing
- The "founder mode ON" pillar layout
- The "Your Agents are ready. Are you?" purple CTA
- Their dark gradient hero treatment

We can use a **terminal-style install block in the hero**. That is the only direct lift.

## Stack (proposed, not styled)

- Next.js (App Router) on Vercel, single page at `/`
- Static export
- `setup.sh` served from `/public/setup.sh`
- `og-image.png` served from `/public/og-image.png`
- No CMS, no MDX, no catalog rendering on the site

## Routes

```
/                       The landing page (the only real route)
/setup.sh               The bash install script (from /public/setup.sh)
/og-image.png           Open Graph card
/sitemap.xml            One-entry sitemap (just /)
/robots.txt             Allow all
```

That is the entire website. No `/install`, no `/skills`, no `/repos`, no `/mcps`, no `/ideas`, no `/docs`, no `/sponsors`, no `/overflow`, no `/changelog`, no `/privacy`, no `/terms`. All of that lives in the GitHub repo as markdown.

If we ever need a privacy notice or terms link for compliance, we add them later as static pages. They are not blocking launch.

## Landing page section list

Order matters. Keep it short. Eight sections and a footer. No more.

### 1. Hero

- **Wordmark**: "suiperpower" (lowercase, top-left, small)
- **Top-right nav**: GitHub link with star count, that is it
- **Headline**: `build Sui that ships.`
- **Subhead** (one sentence): "Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor."
- **Install block** (terminal-style, copyable):
  ```
  curl -fsSL https://suiperpower.dev/setup.sh | bash
  ```
- **Below install** (small, one line): "30+ Sui-native skills, knowledge base, ecosystem catalog. One install. Three agents."
- **Agent badges** (3 small icons inline): Claude Code, Codex, Cursor

No carousel. No gradient hero animation. No Overflow co-branding in the hero. The hero is for install conversion, not partnerships.

### 2. What this gives you

Three-column grid. One sentence per column. No icons unless they are tasteful.

- **Skills that route by intent**, "Type what you want to do. The right skill loads. No flag memorization, no doc spelunking."
- **A Sui knowledge base your agent can read**, "Move, objects, PTBs, Walrus, DeepBook, Scallop. The agent uses it before it writes a line."
- **Anti-slop quality gates**, "Every build skill ends with a 'will this survive past the hackathon' check. Slop fails the gate."

### 3. The journey

Visual: a horizontal flow of five labels, **Learn → Idea → Build → Ship → Grow**.

Under each label, two or three example trigger phrases (real ones from the catalog). One short paragraph below the flow:

> "Skills hand off through the filesystem. The idea phase writes a brief, the build phase reads it, the ship phase reads what build produced. No retyping, no re-prompting your agent's memory."

This section is the part that visually distinguishes us from solana.new. They show four pillars. We show a five-phase pipeline because Suiperpower is opinionated about handoff, that is the actual product story.

### 4. Why anti-slop matters

Two short paragraphs. This is the differentiator and the section that earns the click to GitHub.

> "Most hackathon submissions are slop. Polished landing page, broken flow, no path to a second user. They die when the prize is paid out."
>
> "Sui Overflow 2026 explicitly judges on real-world application, polish, and sustainability. Suiperpower is built around that bar. Build skills run a checklist before they call themselves done. Ship skills refuse to fake telemetry, fake users, or fake code coverage. The bar is in the markdown, public, auditable."

CTA below the second paragraph: a single text link to `github.com/<org>/suiperpower/blob/main/plans/12-ANTI-SLOP-FRAMEWORK.md` with text "Read the quality bar."

### 5. From the builder

A single pull-quote with attribution. Sets a face and credentials behind the anti-slop argument above. Kept short, no surrounding paragraphs.

> "Most Sui hackathon submissions stop the day the prize lands. They were built for the hackathon, not for users. I built Suiperpower because that is the trap I want the next batch of builders to skip. Build a Sui product that earns real users, real traction, and eventually, real funding."
>
> Kelvin Adithya, co-founder of [PIVY](https://pivy.me), 1st place at Sui Overflow 2025 (Payment and Wallets track)

Visual treatment notes for the build phase (not styling decisions, just constraints):

- Quote should read as a quote, not a marketing testimonial. Plain text, left-aligned, with a thin vertical accent or a leading quotation mark, nothing more.
- Attribution one line below, smaller, with the role and the Overflow 2025 win as the credibility anchor.
- No headshot in v1. The words carry the weight, not a face. Headshot is optional later if it ships well.
- Link "PIVY" to pivy.me. Do not link "Sui Overflow 2025" anywhere; the year matters more than a link.

### 6. Built with Sui sponsors

Single horizontal band. Five logos: **Walrus, DeepBook, OpenZeppelin, OtterSec, Scallop.**

One sentence above: "First-class integration skills, knowledge docs, and clonable patterns for the Sui Overflow 2026 sponsors. The recommender refuses sponsor tracks the project does not actually use."

Each logo links to the corresponding skill on GitHub (`/skills/build/walrus-storage/SKILL.md` etc). No internal sponsor page.

### 7. Final CTA

Mirror the hero install block. One line above:

> "Install once. Use it on every Sui project, not just one hackathon."

```
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

Two text links below the block:

- "Browse skills on GitHub →" (links to repo `skills/` folder)
- "Contributions welcome →" (links to repo `CONTRIBUTING.md`)

### 8. Made by

A small team section. Three visual tiers, top to bottom.

**Tier 1, founders** (equal weight, side by side):

- **Kelvin Adithya**, https://klvn.dev
- **Febi Mettasari**, https://www.instagram.com/febimettasari

**Tier 2, intern** (smaller, single line under the founders):

- with help from our intern, **Louis Arvin**, https://www.linkedin.com/in/louis-arvin-8a8488268

**Tier 3, website credit** (smallest, visually separated by a thin divider or extra spacing):

- site by **Tengku Farhan**, https://hanebox.xyz

Visual treatment notes for the build phase (constraints, not styling decisions):

- Each person has a photo. Round or square crops, all the same shape and aspect ratio. Same eye-line across the row so the row reads as a row, not as floating heads.
- Founder photos larger than the intern photo. Tengku's photo same size as the intern's, kept on its own row.
- Names below photos, linked to the URL listed above. No role labels under names in tier 1 ("Kelvin Adithya" only, not "Kelvin Adithya, co-founder"). Role only used in the connector copy ("with help from our intern, ...").
- Photos must be real, not avatars. If a photo is missing, leave a clean placeholder rather than shipping an avatar fallback.
- No social-icon clutter. One link per person, the one listed. Do not add Twitter / GitHub icons next to names unless the person explicitly asks for it.
- Contrast and crop should be consistent. Mismatched lighting across photos is a tell that the team is not real.

### Footer

One line. Left-aligned.

- Wordmark
- GitHub
- X / Twitter
- Telegram
- MIT license

That is it. No copyright marketing fluff. No "all rights reserved". No "made with love". No newsletter signup.

## What is intentionally NOT on the website

This is the load-bearing list. Anything here that gets re-added in v1 reverts the design intent of the site.

- Signup flow
- Dashboard
- "Submit your project for review" form (use deepsurge.xyz)
- Blog (v1)
- Catalog browser pages (skills, repos, MCPs, ideas live on GitHub)
- Skill detail pages (read SKILL.md on GitHub)
- Sponsor detail pages
- Sui Overflow 2026 dedicated landing page (the launch playbook is in `plans/24`, the website does not need it)
- Changelog page (use GitHub Releases)
- Privacy page (link to repo's `PRIVACY.md` if needed)
- Terms page (MIT license is the terms)
- "Compare suiperpower vs solana-new" framing
- Pricing page (free, open source, no paid tier)
- Docs site (markdown on GitHub is the docs)

If a future contributor wants to add any of the above, they should justify it in `plans/19-OPEN-QUESTIONS.md` first.

## SEO essentials (basic)

- One meta title: "Suiperpower, build Sui that ships."
- One meta description: "Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor."
- Open Graph image at `/public/og-image.png`
- Sitemap with one entry, `/`
- robots.txt allowing all

Not optimizing aggressively. The CLI is the product, not the website. SEO traffic to a one-page site is a vanity metric.

## Build / deploy

- Vercel deployment from the GitHub repo's `main` branch
- Single static page, builds in seconds
- `setup.sh` served from `/public/setup.sh` via Vercel rewrite, content-type `text/x-shellscript`
- Cache `/setup.sh` short (5 min) so a fix to install logic ships fast

## Routing implementation notes

- App Router (Next.js 14+)
- `app/page.tsx`, the landing (the only page component)
- `app/layout.tsx`, root layout with meta tags
- `public/setup.sh`, raw text install script
- `public/og-image.png`, OG card
- `app/sitemap.ts`, programmatic sitemap, single entry
- `app/robots.ts`, programmatic robots.txt

No `(marketing)` group, no `[slug]` routes, no `generateStaticParams`. Single static page.

## Future expansion (deliberately deferred)

If post-launch traffic and signal justify it, in this order:

1. `/skills` and `/skills/<name>` (catalog browser, only if visitors are clearly searching for individual skills)
2. `/docs` (only if the GitHub markdown is not enough for non-developer visitors)
3. `/blog` (only if there is a real content cadence, not "we should have a blog")

None of this ships in v1. The single-page site is the bet, and the bet is that the CLI install command, not website content, is what converts.
