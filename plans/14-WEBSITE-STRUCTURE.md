# 14. Website structure

## Scope of this doc

Information architecture, routes, sections, copy outline. No styling. No design system. No component implementation. The web team or Kelvin handles styling later.

## What the website is

`suiperpower.dev` is a content site. Three jobs:

1. Host `/setup.sh` (the curl install target).
2. Show the install command above the fold so a visitor can install in under 30 seconds.
3. Browse the catalog (skills, repos, MCPs, ideas) without leaving the browser.

Not a webapp. No login. No dashboard. No signup. The CLI is the product.

## Stack (proposed, not styled)

- Next.js (App Router) on Vercel
- File-based routes
- Catalog pages render at build time from `cli/data/*.json`
- Static export where possible
- MDX for the docs section

## Routes

```
/                       Landing
/install                Install instructions (also linked from landing)
/skills                 Catalog browser, skills (filterable)
/skills/<skill-name>    Individual skill page (renders SKILL.md)
/repos                  Catalog browser, ecosystem repos
/mcps                   Catalog browser, MCP servers
/ideas                  Catalog browser, curated ideas
/docs                   Docs index
/docs/<doc-name>        Individual doc page (renders skills/data/sui-knowledge/*.md)
/sponsors               Sponsor list (Walrus, DeepBook, OpenZeppelin, OtterSec, Scallop)
/overflow               Sui Overflow 2026 landing (for Overflow participants specifically)
/changelog              Release notes
/privacy                Privacy / telemetry policy
/terms                  Terms of use
/setup.sh               The bash install script (rewritten to /public/setup.sh)
```

## Landing page (`/`) section list

Copy outline only. Order matters.

1. **Hero**
   - Title: "Suiperpower"
   - Tagline: "think. build. ship."
   - Subtitle: "Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor."
   - Install command in a code block (one-line, copyable)
   - Link to "What it is" (anchor) and "Browse skills" (route)

2. **Install command (repeated, callout)**
   ```
   curl -fsSL https://suiperpower.dev/setup.sh | bash
   ```
   With a one-liner: "Installs to ~/.claude/skills/, ~/.codex/skills/, ~/.cursor/rules/. Nothing touches your PATH."

3. **What you get** (4-up grid, no styling)
   - 30+ skills across Learn / Idea / Build / Ship
   - Sui knowledge base (Move, objects, PTBs, Walrus, DeepBook, Scallop)
   - Ecosystem catalog (40+ clonable repos, MCPs, curated ideas)
   - Anti-slop quality gates baked into every build skill

4. **Quickstart**
   - Three example commands a user can run after install:
     - `claude "/find-next-sui-idea what should I build for Sui Overflow?"`
     - `claude "/scaffold-project escrow with Walrus storage"`
     - `claude "/submit-to-sui-overflow"`
   - One-liner: "Skills auto-route by intent. No memorization needed."

5. **Why it exists**
   - Two paragraphs:
     - "Most hackathon submissions are slop. They die when the prize is paid."
     - "Sui Overflow 2026 explicitly rewards polish, real-world application, and sustainability. Suiperpower is built around that bar. Every build skill includes a 'will this survive past the hackathon' gate."

6. **Sui Overflow 2026 callout**
   - Box with Overflow logo / link to overflow.sui.io
   - Text: "Made for Sui Overflow 2026 participants. Free, open-source, no signup. Sponsors: Walrus, DeepBook, OpenZeppelin, OtterSec, Scallop."
   - Link to /overflow page

7. **How it works** (3 steps)
   - Step 1: Install (curl one-liner)
   - Step 2: Open your AI agent (Claude Code, Codex, Cursor)
   - Step 3: Ask. Skills route by intent. Outputs flow phase to phase.

8. **Skill catalog preview** (table, top 12 skills)
   - Two columns: skill name, what it does
   - Link: "Browse all skills →"

9. **Ecosystem catalog preview** (table, 8 repos)
   - Two columns: repo, what it is
   - Link: "Browse all repos →"

10. **Built for**
    - "Sui Overflow 2026 participants"
    - "Solo Sui builders past the hackathon"
    - "EVM / Solana devs migrating to Sui"
    - "Sui ecosystem teams who want a default integration story"

11. **Sponsors band**
    - Five logos: Walrus, DeepBook, OpenZeppelin, OtterSec, Scallop
    - One-liner per sponsor with link to their integration skill page

12. **Open source**
    - Link to GitHub repo
    - "Skills are markdown. Read every one. Audit-friendly by design."
    - License (MIT)
    - Contributing pointer

13. **Footer**
    - Privacy / Terms / Changelog / Telegram / Twitter / GitHub
    - Built by [your handle / Kwek Labs]
    - No copyright marketing fluff

## /install page

Step-by-step:

1. Prerequisites (Node 20+, git)
2. The install command
3. Optional: install Claude Code / Codex / Cursor first if you have not
4. What gets installed where
5. How to update (`suiperpower update`)
6. How to uninstall (`suiperpower uninstall`)
7. Telemetry opt-in explanation (link to /privacy)
8. Troubleshooting (common errors and fixes)
9. Next: try a skill (with example commands)

## /skills page

- Phase tabs: Learn / Idea / Build / Ship / Grow
- Filter by phase, by sponsor, by Sui-unique
- Each row: name, one-line description, trigger phrase example, link to detail page

## /skills/<skill-name> page

- Renders the SKILL.md from the GitHub repo (build-time fetch + markdown render)
- Shows: name, description, trigger phrases, what it reads, what it writes, the workflow
- Sidebar: related skills (from SKILL_ROUTER), referenced knowledge docs, agent install snippet

## /repos page

- Filter by category (defi, nft, examples, template, etc.)
- Each row: name, owner, description, license, last-checked date
- Link to GitHub repo

## /mcps page

- Each row: name, publisher, install command, use cases
- Copy-button on the install command

## /ideas page

- Filter by source (a16z, YC, Alliance, Sui-native gaps)
- Filter by category (defi, nft, infra, social, gaming, AI, RWA)
- Filter by difficulty
- Each row: title, summary, source, fit-for-Sui rationale, recommended track

## /docs page

- Index of `skills/data/sui-knowledge/*.md` rendered as nav
- Sections:
  - Sui (01 + 02 + cookbook-index)
  - Move + objects (03)
  - Protocols + SDKs (04)
  - App layer (05)
  - Open source (06)
  - Sponsor docs (Walrus, DeepBook, Scallop, OpenZeppelin, OtterSec)

## /sponsors page

- One section per sponsor:
  - Logo
  - One-paragraph what they do
  - Link to their integration skill (`walrus-storage`, `deepbook-orderbook`, etc.)
  - Link to their knowledge doc
  - Link to their ecosystem repos in our catalog
  - External link to their official docs

## /overflow page

For Sui Overflow 2026 participants specifically.

Sections:

1. Suiperpower for Sui Overflow 2026 (hero, 1 sentence)
2. Why this beats spreading across many submissions (link to Sui team's quality message)
3. The four-step path: install → idea → build → submit
4. Submission generator preview (what `/submit-to-sui-overflow` produces)
5. Sponsor track recommender
6. Anti-slop checklist (the same one in `12-ANTI-SLOP-FRAMEWORK.md`, condensed)
7. Telegram + Twitter links
8. Submit URL: deepsurge.xyz/hackathons/...

## /changelog page

Released versions, top to bottom. One section per release: date, version, what changed (added skills, fixed skills, catalog updates).

## /privacy page

- What we collect (anonymous telemetry, opt-in)
- What we do not collect (file paths, code, prompts, PII)
- Tier model explained
- How to opt out (`telemetryTier: "off"`)
- Convex source link
- Contact for privacy questions

## /terms page

Standard MIT-license-compatible terms. Use of CLI does not transfer ownership of any code the user generates.

## SEO essentials (basic)

- Each route has a meta title and description
- Open Graph image at `/public/og-image.png` (we ship a default, can be improved later)
- Sitemap at `/sitemap.xml`
- robots.txt allowing all

Not optimizing aggressively. The CLI is the product, not the website.

## Build / deploy

- Vercel deployment from the GitHub repo's `main` branch
- Catalog routes prebuild from `cli/data/*.json` at deploy time, so a catalog PR triggers a redeploy
- `setup.sh` served from `/public/setup.sh` via Vercel rewrite

## Routing implementation notes (no styling)

- App Router (Next.js 14+)
- `app/page.tsx` → landing
- `app/install/page.tsx` → install
- `app/skills/page.tsx` → skill list
- `app/skills/[name]/page.tsx` → skill detail (generateStaticParams from skills folder)
- `app/repos/page.tsx`, `app/mcps/page.tsx`, `app/ideas/page.tsx` → from JSON
- `app/docs/[slug]/page.tsx` → from `skills/data/sui-knowledge/`
- `app/(marketing)/sponsors/page.tsx`, `app/overflow/page.tsx`
- `app/changelog/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`
- `public/setup.sh` (raw, served as text)

## What is intentionally not on the website

- A signup flow
- A dashboard
- A "submit your project for review" form (use deepsurge.xyz)
- A blog (in v1, MDX docs cover the educational content; blog can come later)
- A "compare suiperpower vs solana-new" page (not the right framing, we are for Sui)
- A pricing page (free, open source, no commercial offering)
