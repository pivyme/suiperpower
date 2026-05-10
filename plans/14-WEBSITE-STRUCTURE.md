# 14. Website structure

A single-page site at `suiperpower.dev`. This doc is the build spec for the frontend engineer. Each section block has **layout**, **copy** (paste verbatim), **assets**, **links**, and **behavior**. Skip the appendix at the bottom unless you want context on why a constraint exists.

## Pending decisions (resolve before final copy lock)

| What | Status | Where it lands |
|---|---|---|
| Final tagline | **Pending Kelvin's pick.** Current placeholder: `build Sui that ships.` (do not ship this verbatim, Kelvin flagged it as off). See alternatives in chat history. | Section 1 headline, meta title, OG card |
| GitHub org / handle for repo URL | Pending, see `plans/19` row 1 | All `<org>` placeholders below |
| OG image final art | Not yet produced | `/public/og-image.png` |
| Team photos (4) | Not yet collected, see `MANUAL-TODO.md` A14 | `/public/team/*.jpg` |
| Telegram URL for footer | `https://go.sui.io/suioverflow2026-tg` for now (Sui Overflow Telegram, we don't run our own) | Footer |

---

## Page map

```
┌─────────────────────────────────────────────────┐
│ TOP BAR        wordmark · GitHub stars          │
├─────────────────────────────────────────────────┤
│ 1. HERO        headline + install + agent badges│
├─────────────────────────────────────────────────┤
│ 2. WHAT YOU GET    3 columns of benefits        │
├─────────────────────────────────────────────────┤
│ 3. THE JOURNEY     5-phase flow + one-paragraph │
├─────────────────────────────────────────────────┤
│ 4. ANTI-SLOP       2 paragraphs + text link     │
├─────────────────────────────────────────────────┤
│ 5. FROM THE BUILDER  Kelvin's quote + attribution│
├─────────────────────────────────────────────────┤
│ 6. OVERFLOW READY  sponsors + submission tools  │
├─────────────────────────────────────────────────┤
│ 7. FINAL CTA       install block + 2 text links │
├─────────────────────────────────────────────────┤
│ 8. MADE BY         founders, intern, site credit│
├─────────────────────────────────────────────────┤
│ FOOTER         one line                         │
└─────────────────────────────────────────────────┘
```

Eight sections + top bar + footer. Render in this order on every viewport.

---

## Top bar

**Layout**: full-width row, fixed height, sticky on desktop, static on mobile.

**Left**: wordmark `suiperpower` (lowercase, plain text or SVG).

**Right**: single GitHub link with live star count.

**Copy**:
- Wordmark text: `suiperpower`
- GitHub link label: `GitHub` (with star count appended, e.g. `GitHub · 132`)

**Links**:
- Wordmark → `/` (anchor to top)
- GitHub link → `https://github.com/<org>/suiperpower`

**Behavior**:
- Star count fetched at build time from GitHub API. If fetch fails, render the label without the number (no "0", no "—").
- No mobile menu (there's nothing to put in it).

---

## Section 1: Hero

**Layout**: centered column. Fits in viewport on a 13-inch laptop and on iPhone 15.

**Structure**:
```
[ headline ]
[ subhead ]
[ install code block (full-width on mobile, max-width 640px on desktop) ]
[ small line under install ]
[ 3 agent badges in a row ]
```

**Copy**:

| Element | Text |
|---|---|
| Headline (H1) | `<TAGLINE>` (placeholder until Kelvin locks; current draft `build Sui that ships.`) |
| Subhead | Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor. |
| Install command (in a `<pre><code>` block) | `curl -fsSL https://suiperpower.dev/setup.sh \| bash` |
| Below install (small) | 30+ Sui-native skills, knowledge base, ecosystem catalog. One install. Three agents. |
| Agent badges | `Claude Code`  ·  `Codex`  ·  `Cursor` |

**Assets**:
- Three small agent logos for the badges. Source from each agent's brand assets page.

**Links**:
- None. The hero only has the install command (which is meant to be copied, not clicked).
- Agent badges are non-interactive labels.

**Behavior**:
- Install code block has a copy button (icon-only, top-right of the block). On click, copy the full command to clipboard. Show a brief "copied" state for 1.5s.
- The pipe character (`|`) must render correctly inside the code block (no smart-quote replacement, no markdown escaping).

**Do not**:
- Add a "watch demo" button.
- Add a carousel.
- Add Sui Overflow co-branding.
- Add a hero illustration.
- Use a gradient background.

---

## Section 2: What you get

**Layout**: 3 columns at desktop (≥768px), stacked at mobile.

**Structure** (per column):
```
[ small heading ]
[ one-sentence body ]
```

**Copy**:

| Column 1 | Column 2 | Column 3 |
|---|---|---|
| **Skills that route by intent** | **A Sui knowledge base your agent can read** | **Anti-slop quality gates** |
| Type what you want to do. The right skill loads. No flag memorization, no doc spelunking. | Move, objects, PTBs, Walrus, DeepBook, Scallop. The agent uses it before it writes a line. | Every build skill ends with a "will this survive past the hackathon" check. Slop fails the gate. |

**Assets**: none.

**Links**: none.

**Behavior**: static.

**Do not**: add a fourth column. Add icons unless they are restrained, monochrome, and from the same family.

---

## Section 3: The journey

**Layout**: horizontal flow on desktop, vertical stack on mobile.

**Structure**:
```
[ Learn ]  →  [ Idea ]  →  [ Build ]  →  [ Ship ]  →  [ Grow ]
   ·            ·             ·             ·            ·
[ phrase ]  [ phrase ]    [ phrase ]    [ phrase ]   [ phrase ]
[ phrase ]  [ phrase ]    [ phrase ]    [ phrase ]   [ phrase ]

[ one-paragraph explainer below the flow ]
```

**Copy**:

| Phase | Label | Trigger phrases (italic, smaller text) |
|---|---|---|
| 1 | Learn | "I'm new to Sui, teach me" / "I'm coming from Solana, what's different" |
| 2 | Idea | "what should I build on Sui" / "stress-test this idea" |
| 3 | Build | "scaffold my project" / "build a Move module" / "integrate Walrus" |
| 4 | Ship | "deploy to mainnet" / "submit to Sui Overflow" |
| 5 | Grow | "set up analytics" / "launch in community" |

**Explainer paragraph** (below the flow, max-width readable):

> Skills hand off through the filesystem. The idea phase writes a brief, the build phase reads it, the ship phase reads what build produced. No retyping, no re-prompting your agent's memory.

**Assets**: none. Phase nodes are styled text + arrow glyphs (no custom icons).

**Links**: none.

**Behavior**: static. No hover animations on phase nodes.

**Do not**: add a sixth phase. Hide phases behind a "see more" toggle on mobile.

---

## Section 4: Why anti-slop matters

**Layout**: single column, max-width readable (~640px).

**Structure**:
```
[ section heading ]
[ paragraph 1 ]
[ paragraph 2 ]
[ text link ]
```

**Copy**:

| Element | Text |
|---|---|
| Heading | Why anti-slop matters |
| Paragraph 1 | Most hackathon submissions are slop. Polished landing page, broken flow, no path to a second user. They die when the prize is paid out. |
| Paragraph 2 | Sui Overflow 2026 explicitly judges on real-world application, polish, and sustainability. Suiperpower is built around that bar. Build skills run a checklist before they call themselves done. Ship skills refuse to fake telemetry, fake users, or fake code coverage. The bar is in the markdown, public, auditable. |
| Text link | Read the quality bar → |

**Links**:
- "Read the quality bar →" → `https://github.com/<org>/suiperpower/blob/main/plans/12-ANTI-SLOP-FRAMEWORK.md`

**Assets**: none.

**Behavior**: static.

**Do not**: add a third paragraph, add statistics, style the link as a button.

---

## Section 5: From the builder

**Layout**: single column, max-width readable. Blockquote treatment.

**Structure**:
```
[ pull-quote, paragraph ]
[ attribution line, smaller, below ]
```

**Copy**:

> Most Sui hackathon submissions stop the day the prize lands. They were built for the hackathon, not for users. I built Suiperpower because that is the trap I want the next batch of builders to skip. Build a Sui product that earns real users, real traction, and eventually, real funding.

**Attribution** (smaller, single line):
Kelvin Adithya, co-founder of [PIVY](https://pivy.me), 1st place at Sui Overflow 2025 (Payment and Wallets track)

**Assets**: none in v1 (no headshot here, the headshot is in section 8).

**Links**:
- "PIVY" → `https://pivy.me`
- "Sui Overflow 2025" → no link

**Behavior**: static.

**Do not**: add a headshot here, link the Overflow 2025 mention, add a "read more" expansion.

---

## Section 6: Sui Overflow 2026 ready

This section positions Suiperpower as the tool that gets you ready to submit a real, competitive Overflow 2026 entry. Sponsors are part of that readiness, not the headline.

**Layout**: stacked, top to bottom.

**Structure**:
```
[ section heading ]
[ one-sentence intro ]

[ sponsor band: Walrus · DeepBook · OpenZeppelin · OtterSec · Scallop ]

[ small label: "with first-class skills for every track" ]

[ 3-bullet "what you get for Overflow" list ]
```

**Copy**:

| Element | Text |
|---|---|
| Heading | Sui Overflow 2026 ready |
| Intro (one sentence under heading) | First-class integration skills for every sponsor track, plus a submission generator that refuses to ship fakes. |
| Label under sponsor band | with first-class skills for every track |
| Bullet 1 | **Track recommender that pushes back.** `/pick-my-sui-track` refuses to recommend a sponsor track unless your project actually uses the sponsor's tech. No padding the application. |
| Bullet 2 | **Submission generator with teeth.** `/submit-to-sui-overflow` captures your package-id, validates media dimensions, drafts deepsurge.xyz form copy, and refuses to package against placeholder content. |
| Bullet 3 | **Real sponsor integrations, not stickers.** Walrus storage, DeepBook orderbook, Scallop money-market, OpenZeppelin Sui libs, OtterSec audit prep. Each one is its own skill with knowledge docs and clonable patterns. |

**Assets** (5 sponsor logos, in this order, equal sizing):

| Order | Sponsor | Logo source |
|---|---|---|
| 1 | Walrus | walrus.site brand assets |
| 2 | DeepBook | deepbook.tech brand assets |
| 3 | OpenZeppelin | openzeppelin.com brand assets |
| 4 | OtterSec | ottersec.io brand assets |
| 5 | Scallop | scallop.io brand assets |

**Links**:

Each logo links to the corresponding skill on GitHub:

| Logo | Link |
|---|---|
| Walrus | `https://github.com/<org>/suiperpower/blob/main/skills/build/walrus-storage/SKILL.md` |
| DeepBook | `https://github.com/<org>/suiperpower/blob/main/skills/build/deepbook-orderbook/SKILL.md` |
| OpenZeppelin | `https://github.com/<org>/suiperpower/blob/main/skills/build/openzeppelin-sui-libs/SKILL.md` |
| OtterSec | `https://github.com/<org>/suiperpower/blob/main/skills/build/ottersec-prep/SKILL.md` |
| Scallop | `https://github.com/<org>/suiperpower/blob/main/skills/build/scallop-money-market/SKILL.md` |

The bullet keywords link to their respective skills:

- "Track recommender" → `https://github.com/<org>/suiperpower/blob/main/skills/ship/pick-my-sui-track/SKILL.md`
- "Submission generator" → `https://github.com/<org>/suiperpower/blob/main/skills/ship/submit-to-sui-overflow/SKILL.md`

**Behavior**:
- Sponsor logos in grayscale or single-color treatment by default. On hover (desktop), can fade to full color.
- Sponsor band wraps to two rows on mobile (Walrus + DeepBook + OpenZeppelin on row 1, OtterSec + Scallop on row 2). Never horizontal-scroll.
- The 3 bullets stack on every viewport (no 3-column treatment, the bullets are dense enough that columns hurt readability).

**Do not**:
- Frame this section as "our partners" or "trusted by". It is not a partner band, it is a readiness statement.
- Add hover tooltips with sponsor descriptions.
- Build an internal sponsor page.
- Rearrange the sponsor order if a sponsor disengages (drop the logo instead).
- Add Sui Foundation logo or any "official" framing. We are independent.

---

## Section 7: Final CTA

**Layout**: centered column. Mirror of the hero install block, same dimensions.

**Structure**:
```
[ one-line above install ]
[ install code block ]
[ 2 text links below, on one line ]
```

**Copy**:

| Element | Text |
|---|---|
| Line above | Install once. Use it on every Sui project, not just one hackathon. |
| Install command | `curl -fsSL https://suiperpower.dev/setup.sh \| bash` |
| Link 1 | Browse skills on GitHub → |
| Link 2 | Contributions welcome → |

**Links**:
- "Browse skills on GitHub →" → `https://github.com/<org>/suiperpower/tree/main/skills`
- "Contributions welcome →" → `https://github.com/<org>/suiperpower/blob/main/CONTRIBUTING.md`

**Assets**: none.

**Behavior**: same copy-button behavior as the hero install block.

**Do not**: add a third link, restyle the install block, add a "you're 30 seconds away" headline.

---

## Section 8: Made by

**Layout**: two stacked rows.

**Structure**:
```
ROW 1 (founders, larger photos, side by side):
  [ photo ]   [ photo ]
  Kelvin      Febi

ROW 2 (intern + site credit, smaller photos, on the same row,
       separated by a divider or extra spacing):
  [ photo ]                |                   [ photo ]
  with help from           |                   site by
  our intern,              |                   Tengku Farhan
  Louis Arvin              |
```

(Mobile: row 2's two photos stack vertically, divider becomes horizontal spacing.)

**People**:

| Group | Name | Link |
|---|---|---|
| Founder | Kelvin Adithya | https://klvn.dev |
| Founder | Febi Mettasari | https://www.instagram.com/febimettasari |
| Intern | Louis Arvin | https://www.linkedin.com/in/louis-arvin-8a8488268 |
| Site credit | Tengku Farhan | https://hanebox.xyz |

**Connector copy**:

- Above the intern photo (small text): `with help from our intern,`
- Above the Tengku photo (small text): `site by`

**Assets** (4 photos):
- `/public/team/kelvin.jpg`
- `/public/team/febi.jpg`
- `/public/team/louis.jpg`
- `/public/team/tengku.jpg`

All four photos: same aspect ratio, same crop style (round or square), consistent lighting.

**Links**: each name links to the URL above.

**Behavior**:
- Founder photos render at one size.
- Intern and Tengku photos render at a smaller size (same as each other).
- No role labels under names. Roles only appear in the connector copy.

**Do not**: use avatar fallbacks if photos are missing (use a clean placeholder), add Twitter / GitHub icons next to names, label Tengku as "smaller" than Louis (they're equal size, just on different visual rows-or-zones).

---

## Footer

**Layout**: one line, left-aligned.

**Copy**: render these as inline text-links separated by middle dots:

```
suiperpower  ·  GitHub  ·  X  ·  Telegram  ·  MIT
```

**Links**:

| Label | URL |
|---|---|
| `suiperpower` (wordmark) | `/` |
| GitHub | `https://github.com/<org>/suiperpower` |
| X | `https://x.com/<handle>` (handle pending, see `plans/19` row 6) |
| Telegram | `https://go.sui.io/suioverflow2026-tg` |
| MIT | `https://github.com/<org>/suiperpower/blob/main/LICENSE` |

**Do not**: add "© 2026 all rights reserved", "made with love", a newsletter signup, a back-to-top arrow.

---

## Global rules

These apply to every section.

### Mobile-first

- Build for 390px viewport first.
- All sections single-column on mobile.
- Hero install block remains one-tap copyable.
- Sponsor logos wrap to two rows, never horizontal-scroll.
- The 5-phase journey stacks vertically on mobile (arrows point down).

### Performance budget

- Lighthouse Performance: 95+.
- Total JS shipped: under 100 KB compressed.
- Web fonts: max 2 families (one sans, one mono).
- Images: Next.js `<Image>` only, no raw `<img>`.
- Third-party scripts: Plausible OR Vercel Analytics, nothing else.

### Accessibility (WCAG AA)

- All text passes AA contrast.
- All interactive elements keyboard-reachable.
- Focus rings visible (no `outline: none` without a replacement).
- Section 8 photos: `alt` text includes name + role.
- Sponsor logos: `alt` text names the sponsor.
- Install code block is a real `<pre><code>`, screen-reader reads it as code.

### Open Graph card

- File: `/public/og-image.png`
- Dimensions: 1200 × 630
- Content: wordmark + tagline + install command (centered)
- Dark background matching the hero
- Test before launch on: X / Twitter, Telegram, Slack, Discord
- No team photos, no sponsor logos on the OG card

### Meta

- Title: `Suiperpower — <TAGLINE>` (placeholder until tagline locks)
- Description: `Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor.`
- Sitemap: one entry, `/`
- robots.txt: allow all
- JSON-LD: a single `Organization` block

---

## Routes and files

```
app/page.tsx          The landing (only page component)
app/layout.tsx        Root layout, meta, JSON-LD
app/sitemap.ts        Programmatic sitemap (single entry)
app/robots.ts         Programmatic robots.txt
public/setup.sh       The install script (raw text, served as text/x-shellscript)
public/og-image.png   OG card
public/team/*.jpg     4 team photos
```

**Routes the site exposes**:

```
/                  Landing
/setup.sh          Install script
/og-image.png      OG card
/sitemap.xml       Sitemap
/robots.txt        Robots
```

**Routes the site does NOT expose**: `/install`, `/skills`, `/repos`, `/mcps`, `/ideas`, `/docs`, `/sponsors`, `/overflow`, `/changelog`, `/privacy`, `/terms`. All of that lives in the GitHub repo.

---

## Build and deploy

- Vercel deployment from `main` branch
- Static export
- `setup.sh` served via Vercel rewrite, `Content-Type: text/x-shellscript`
- `setup.sh` cache: short (5 min), so install fixes propagate fast
- Page cache: stale-while-revalidate

---

## Out of scope (do not build, even if you have time)

- Login / signup / dashboard
- Catalog browser pages
- Skill detail pages
- Sponsor detail pages
- Docs site
- Blog
- Changelog page
- Privacy / Terms pages (compliance-only, deferred)
- Newsletter signup
- Live chat
- "Powered by AI" badges
- "As featured in" press strip

If a feature isn't in this doc, don't build it. If it should be, propose it via `plans/19-OPEN-QUESTIONS.md`.

---

## Appendix: principles (read once, then ignore)

For context only. Do not optimize against these directly; they are the *why* behind the constraints above.

- The CLI is the product. The site exists to convert visitors into people who have run the install command.
- The site is single-page on purpose. The GitHub repo carries everything else.
- We borrow only the install-block hero pattern from solana.new. Everything else is Suiperpower-native. The site should not feel like a Sui re-skin to anyone who has seen both.
- Anti-slop is the product differentiator. Section 4 and section 5 carry that argument; do not water them down.
- Repetition of the install block (hero + final CTA) is intentional. Most visitors install at the hero or at the CTA. The middle sections exist for the visitors who need convincing.

Voice rules live in `plans/15-BRAND.md`. Do-not-use phrase list lives there too.
