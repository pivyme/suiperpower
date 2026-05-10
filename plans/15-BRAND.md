# 15. Brand

## Name

**Suiperpower**, also stylized lowercase as `suiperpower`.

Origin: portmanteau of Sui + superpower. Communicates that the tool gives the user a multiplier, not a replacement for their work. Plays on the chain name without being a literal mash-up like "sui-new" or "sui-stack."

Pronunciation: "soop-er-power" (the "Sui" front blends, the rest reads as "superpower").

## Tagline

**Build something meaningful, on Sui**

A single inviting line. Capital B at the start, comma in the middle, no trailing period. The "meaningful" word does the load-bearing work: it covers real users, real traction, real revenue, products their builders are proud of, all in one inclusive term. Welcoming to hackathon participants and long-term builders both.

Acceptable variants for limited spaces:

- "Build something meaningful, on Sui" (default, full)
- "Build something meaningful" (compact, when the Sui context is already obvious)
- "skills, knowledge, and a CLI for shipping production Sui products" (descriptive long-form)

We deliberately do not use the three-beat structure that solana-new uses ("think. build. ship."). The structure invites direct comparison and we are not a Sui re-skin of solana-new.

## URLs

| Surface | URL |
|---|---|
| Website | https://suiperpower.dev |
| Install | https://suiperpower.dev/setup.sh |
| GitHub | https://github.com/&lt;your-handle&gt;/suiperpower |
| npm | https://www.npmjs.com/package/suiperpower |
| Twitter | TBD (handle to register) |
| Telegram | (none of our own; Sui Overflow Telegram for v1) |

## CLI command

The npm package ships two bin entries that both resolve to the same dispatcher:

- `suiperpower` is the canonical brand form. Always lowercase, always one word. Used in install scripts, error messages, docs where unambiguous identity matters.
- `suiper` is the short alias for daily typing. Same behavior, no flags, no behavioral branching.

Decision rationale: the long form keeps the brand intact (domain, npm package, GitHub repo). The short alias removes typing pain. Pattern matches `kubectl` plus shorter community conventions, and `gh` for the GitHub CLI. No third-letter abbreviation (`sp`, `sui-pp`) is shipped, the alias is the only short form.

When writing docs, prefer `suiper` in install banners and quickstarts where the user has just learned the brand and will type the command often. Use `suiperpower` in error messages, the `--help` header, and anywhere the brand needs to read in full.

## Voice

The voice is "senior friend who has shipped before, who is direct without being mean, who respects your time."

| Yes | No |
|---|---|
| "Your retention loop says 'users will keep coming back to check their dashboard.' That is not a loop, that is a hope." | "Your retention strategy is suboptimal and requires further refinement." |
| "Pick one of the five sponsor tracks. We can recommend based on what you actually built." | "Suiperpower offers comprehensive sponsor track guidance through advanced ML-driven recommendation algorithms." |
| "If your demo video shows things the live URL cannot do, the judges will catch it. Fix the live URL." | "Demo video and live product alignment is a critical success factor for hackathon judging outcomes." |
| "Skills are markdown. Read every one before you trust it." | "Our cutting-edge skill framework leverages industry-leading transparency principles." |

Rules:

- No marketing-speak. No "leverage", no "cutting-edge", no "world-class", no "revolutionary".
- No emojis in product copy unless explicitly part of an output the user asked for. CLI banner is the one exception (a single `✦` or unicode box-drawing char is fine).
- No exclamation marks. The product is competent, it does not need to shout.
- No em-dashes (per Kelvin's general rule). Use commas or periods.
- Direct, declarative sentences. Active voice.

## Skill naming

- Verb-led where possible: `build-with-move`, `validate-business-model`, `roast-my-product`.
- Noun-led when the skill is a primitive that the verb is implied: `object-model-design`, `kiosk-marketplace`.
- Kebab-case. Always.
- No version suffixes in the name (`build-with-move-v2` is wrong; we ship one canonical version).
- No marketing words in the name (`smart-build-with-move-pro` is wrong).
- Sui-specific terms allowed in the name (`sui-zk-login`, `walrus-storage`, `deepbook-orderbook`).

## Brand strings (single source of truth)

All brand strings live in `cli/branding.ts`. Anywhere else that needs them imports from there. See `08-CLI-DESIGN.md` for the exact shape.

## What we never say

- "AI-powered" (everything is AI-powered, the phrase is meaningless)
- "Web3" (we say "Sui" or "crypto" depending on context)
- "Game-changing" / "revolutionary" / "disruptive"
- "The leading X" / "The #1 X" (unverifiable)
- "Enterprise-grade" (we are not, and most users do not care)
- "Decentralized" as a value claim (Sui is decentralized; the tool is open-source markdown, not a decentralized system)
- "Powered by AI" in skill outputs (the user knows)

### Phrases borrowed from solana-new (do not use)

To avoid being read as a Sui re-skin of solana-new, never use any of the following phrases verbatim or near-verbatim. They are theirs. Pick our own words.

- "think. build. ship." (their tagline)
- "build useful and tasteful crypto apps" / "useful and tasteful" as a paired phrase
- "founder mode ON" / any "founder mode" framing
- "Your Agents are ready. Are you?" or any near-paraphrase
- "a tasteful and useful crypto app using AI in few hours"

The word "tasteful" alone is fine in normal English. The pairing "useful and tasteful" and the three-beat tagline are the signature lifts to avoid.

## What we always say

- "Sui" not "the Sui blockchain" (redundant)
- "Move" capitalized when referring to the language
- "Object" capitalized when referring to Sui objects in instructional content
- "PTB" or "Programmable Transaction Block" interchangeably
- "Walrus", "DeepBook", "OpenZeppelin", "OtterSec", "Scallop" with each sponsor's preferred capitalization

## Sui Foundation alignment guardrails

Suiperpower is independent. We do not claim Sui Foundation endorsement.

- The website footer states "Independent project, not affiliated with Sui Foundation."
- The README mirrors that statement.
- We never use Sui Foundation logos or marks beyond fair-use citation.
- We do link to docs.sui.io and overflow.sui.io as the authoritative sources.

If the Sui Foundation later wants to formally endorse / co-distribute, we update this section. Until then, we are clear about our status.

## Logo

(Final design out of scope for the planning phase per Kelvin's "no styling" rule.)

Direction stub the build phase can build on:

- Wordmark over a symbol. The product name is the asset; an icon is secondary.
- Lowercase `suiperpower` in a clean modern monospace (e.g. Geist Mono, JetBrains Mono, IBM Plex Mono). Letterforms slightly tightened.
- Optional symbol: a single `✦` or a stylized "S" curve that hints at flow / wave (Sui's chain identity often plays on water and flow). Symbol is optional and never replaces the wordmark.
- Asset deliverables target: SVG (source), PNG 1280x1280 (for hackathon submission usage), PNG 512x512 favicon, dark + light variants.
- Path: `public/suiperpower-logo.svg`, `public/suiperpower-logo-dark.svg`, `public/og-image.png`.

We will not lock the logo in plans. The build phase picks fonts and final marks. The wordmark-first principle is the durable rule.

## Color (deferred)

(Final palette out of scope for the planning phase. Kelvin decides during build.)

Constraints recorded now:

- Avoid colors that read as "official Sui Foundation". Sui's primary blue (`#4DA2FF`) is fine as an accent in moderation; using it as the dominant brand color would conflate us with the Foundation.
- Default mode is dark: terminals are dark, the website's hero is dark by default.
- Conservative palette: one accent color, neutral grays for text + background, sparing use of green / red for CLI status indicators.
- High contrast for accessibility (WCAG AA minimum).

## Typography (deferred)

(Out of scope for the planning phase.)

Constraints recorded now:

- Monospace for the CLI install command on the website (Geist Mono or similar).
- Sans-serif for body copy on the website (Geist Sans or similar; avoid generic-feel choices like Inter unless deliberately wanted).
- CLI banner uses ASCII characters only (no custom fonts in the terminal).
- Code blocks always use the monospace stack with consistent line-height across the site.

## Tone of voice in error messages

Bad:

```
✗ ERROR: command failed
```

Good:

```
✗ Cannot write to ~/.claude/skills/ (permission denied)
  fix: chmod u+w ~/.claude/skills/   or run with appropriate permissions
```

Rules:

- Cause first, fix second.
- No stack traces unless `SUIPERPOWER_DEBUG=1`.
- No "please contact support" (we are not a support org; link to GitHub issues).

## Tone in skill outputs

Skills can be brutal (`/roast-my-product`) or supportive (`/sui-beginner`) depending on the skill's purpose. Within each skill, voice is consistent.

`roast-my-product`:

> Your project is "DeFi for everyone." That is what every project says. Tell me what nobody else is saying. Do that in one sentence or do not submit.

`sui-beginner`:

> Sui's object model is different from accounts on Solana or contracts on Ethereum. The mental model that helped me most: think of objects as files in a filesystem with strict ownership rules. Let me walk you through it.

Both are direct. One is harsh, one is patient. Both are within brand.

## Naming for sub-products (post-v1)

If we ship spin-offs, follow the pattern:

- `suiperpower-mobile` (a mobile-specific extension)
- `suiperpower-grants` (a grant-application sub-tool)

Always prefixed with `suiperpower-`. Never invent a new top-level name without strong reason.

## Contributor brand

Contributors are credited in `CONTRIBUTORS.md` (alphabetical, no rank order). Sponsors are credited on `/sponsors`. No "core team" page in v1 (it would be a team of one or two; not worth the page).

## Reference

When in doubt about voice, read solana-new's CLAUDE.md and CONTRIBUTING.md. They got the senior-friend voice right. We adopt it directly, only changing chain-specific terms.
