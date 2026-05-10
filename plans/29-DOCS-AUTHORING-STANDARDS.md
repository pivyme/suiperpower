# 29. Docs authoring standards

## Why this doc exists

Suiperpower's surface is mostly text. Skills are markdown. Knowledge docs are markdown. Plans are markdown. README is markdown. Catalog rows are JSON, but the descriptions inside are still text.

If the text drifts in voice, structure, or terminology, the project loses coherence even if every individual artifact is correct in isolation. This doc is the style sheet.

It pairs with `15-BRAND.md` (which covers the project's voice and forbidden words) by adding the structural / mechanical rules.

## Where these standards apply

| Surface | Format | Authority |
|---|---|---|
| Plans (this folder) | Markdown | This doc |
| Skills (`skills/**/SKILL.md`) | Markdown | `05-SKILL-FORMAT.md` + this doc |
| Knowledge docs (`skills/data/sui-knowledge/`) | Markdown | This doc |
| Catalog descriptions (in JSON) | Plain text | This doc, abridged |
| README, CLAUDE.md, AGENTS.md, CONTRIBUTING.md | Markdown | This doc |
| Website MDX | Markdown + JSX | This doc + frontend conventions |
| CLI output strings | Plain text | This doc |
| Error messages | Plain text | `15-BRAND.md` |

The two top documents (`05-SKILL-FORMAT.md` for the structural shape of skills, this one for prose / formatting) are read together.

## Voice rules (review)

From `15-BRAND.md` and `20-CONTRIBUTING-PLAN.md`:

- Senior friend tone, direct without being mean
- No marketing-speak (banned: leverage, cutting-edge, world-class, revolutionary, AI-powered, Web3, game-changing, disruptive, the leading X)
- No exclamation marks
- No em-dashes (use commas or periods)
- Active voice, declarative sentences
- No emojis in product copy unless explicitly part of an output the user requested

## Structural rules

### Heading hierarchy

- One `#` H1 per document, at the top, equal to the document title
- `##` H2 for top-level sections
- `###` H3 for subsections
- `####` H4 only when truly necessary (3-deep nesting is usually a sign the section should be split)

Title case for headings. "What this skill does" not "what this skill does".

Exception: subsection headings inside a code block follow the convention of the surrounding code (e.g. shell comments use `# lowercase` style).

### Section ordering

For skills, the canonical order is in `05-SKILL-FORMAT.md`. For knowledge docs:

1. Audience and TL;DR
2. Concepts in dependency order (foundational first)
3. Concrete examples
4. Common pitfalls
5. References / further reading
6. Last updated footer

For plan docs (this doc and siblings):

1. Why this doc exists
2. The substance of the plan
3. Open questions or risks
4. How this doc gets used

The "Why this doc exists" opener is load-bearing. It tells future readers (including future maintainers) what they are reading and why.

### Lists

- Use `-` for bullet lists. Not `*`, not `+`.
- Use `1.` for numbered lists.
- Indent with two spaces for nested lists.
- One space after the marker.
- Lists in skill workflows are numbered (steps must run in order). Lists describing concepts are bulleted.

### Tables

GitHub-flavored markdown tables. Always include a header row and the separator row.

```markdown
| Column 1 | Column 2 |
|---|---|
| value | value |
```

Keep tables narrow when possible. Wider than 4-5 columns means the data should probably be a list or a structured paragraph.

Always include `|---|---|` separator with at least one dash per column. Some renderers (older Markdown) require this.

### Code blocks

Always tag code blocks with the language. Untagged code blocks render without highlighting and signal carelessness.

| Language | Tag |
|---|---|
| Bash / shell | `bash` |
| Move | `move` |
| TypeScript | `typescript` (not `ts`) |
| JavaScript | `javascript` |
| JSON | `json` |
| YAML | `yaml` |
| TOML | `toml` |
| Markdown | `markdown` |
| Plain text / output | (no tag, but use a fenced block with no language for terminal output) |

For a terminal output sample (e.g. `suiperpower doctor` output), use a fenced block with no language.

### Inline code

Use single backticks for:

- File paths: `cli/branding.ts`, `~/.suiperpower/config.json`
- Commands: `pnpm install`, `claude "/find-next-sui-idea"`
- Code identifiers: `BRAND.PRODUCT_NAME`, `walrus::storage::store`
- Filenames in prose: the `SKILL.md` file
- API or schema field names: `telemetryTier`

Do NOT use inline code for:

- Skill names in prose (`scaffold-project` works, but for top-of-paragraph emphasis, use bold instead)
- Prose words that are not literal code (do not write `interesting` to mean "interesting")

### Links

Markdown links: `[link text](url)`. Link text should be the user-readable phrase, not the URL itself.

Bad:

```markdown
See https://overflow.sui.io for hackathon details.
```

Good:

```markdown
See the [Sui Overflow 2026 hackathon site](https://overflow.sui.io) for details.
```

Exception: terminal commands and pure-URL contexts. The install command code block prints the URL literally.

For internal cross-references between plan docs:

```markdown
See `12-ANTI-SLOP-FRAMEWORK.md` for the gate definitions.
```

Backtick the filename. Do not anchor to a section unless that section's identifier is stable.

### Quotations

Use `>` for blockquotes. Common cases:

- Quoting Sui team messages or sponsor copy
- Quoting a user-style example ("a user might say...")
- Calling out an important note in copy that does not deserve its own subsection

### Images and diagrams

For v1, prefer ASCII diagrams over images. Reasons:

- Markdown renders them on every platform without dependencies
- They are diff-friendly
- They cannot rot due to image-hosting issues

For complex diagrams, an SVG checked into the repo is acceptable; reference it via a relative path.

Screenshots: only when the README or a knowledge doc would lose meaning without one. Specifications:

- 1920x1080 or natural aspect ratio
- WebP or PNG
- Path: `docs/screenshots/<descriptive-name>.png`
- Always include alt text

## Sui-specific terminology

Capitalize these terms in instructional content (prose), lowercase in code:

| Term | Prose | Code |
|---|---|---|
| Move | Move | `move`, `move::*` |
| Object | Object (when referring to Sui objects) | `object::*` |
| PTB | PTB or Programmable Transaction Block | `ptb`, `programmable_transaction_block` |
| Walrus | Walrus | `walrus::*` |
| DeepBook | DeepBook | `deepbook::*` |
| Scallop | Scallop | `scallop::*` |
| Kiosk | Kiosk (when the standard) | `kiosk::*` |
| zkLogin | zkLogin | `zk_login`, `zklogin` |
| Sui | Sui | `sui::*` |
| Mysten Labs | Mysten Labs (or Mysten) | n/a |
| OpenZeppelin | OpenZeppelin | `openzeppelin_sui::*` |
| OtterSec | OtterSec | n/a |

When referring to a generic Sui concept (object, transaction, address), lowercase:

> "A user owns one or more objects. Objects can be transferred or shared."

When referring to the specific Sui primitive (Object as defined in the Move standard library), capitalize:

> "Sui's Object model differs from Solana's account model."

Borderline cases default to lowercase. Capitalization should follow the formal definition where one exists, not be sprinkled for emphasis.

## Date format

`YYYY-MM-DD` everywhere. ISO 8601.

Bad: 5/10/2026, May 10 2026, 10 May 26
Good: 2026-05-10

For date+time in catalog `lastChecked` or telemetry `timestamp`: `YYYY-MM-DDTHH:MM:SSZ` (UTC).

For "Last updated" footers in docs:

```markdown
*Last updated: 2026-05-10. Targets Sui mainnet vN.M.*
```

## Path conventions

In prose:

- Repo-relative paths use no prefix: `cli/branding.ts`, `skills/build/build-with-move/SKILL.md`
- User home paths use `~/`: `~/.suiperpower/config.json`, `~/.claude/skills/`
- Project-side paths in user projects use `./` only when the relative-vs-repo distinction matters: `./Move.toml`
- Absolute paths are rare and only when describing system files: `/usr/local/bin/sui`

In code:

- Use `path.join` or `path.resolve` for portability; never hardcode forward slashes when constructing OS paths
- Use forward slashes in repo-relative paths in markdown (the way GitHub renders them)

## Reference / citation rules

Knowledge docs and skill references must source-link factual claims.

For Sui-side claims:

- Link to docs.sui.io or mystenlabs/sui as the canonical source
- Pin a specific page or section, not just the homepage

For sponsor-side claims:

- Link to the sponsor's official docs site
- Indicate the version of the SDK or contract referenced

For market data (idea entries, knowledge doc claims):

- Link to the source (e.g. DefiLlama, a published article, a research report)
- Note the date the data was sampled

When in doubt, over-cite. A reader who clicks one link and finds the source is gold; a reader who reads a claim and cannot find the source loses trust.

## Last-updated footer

Time-sensitive docs (knowledge docs, sponsor docs, idea entries) include:

```markdown
*Last updated: YYYY-MM-DD. Targets Sui mainnet vN.M and <sponsor> SDK vN.M.*
```

Authors update this when they edit the doc. Reviewer checklist includes confirming the footer is current.

Plans, skills, and brand-stable content do not need a footer (they are intentionally durable).

## Cross-linking

Within the plans folder, link by filename:

```markdown
See `12-ANTI-SLOP-FRAMEWORK.md` for gate definitions.
```

When linking from a skill to a knowledge doc:

```markdown
See `skills/data/sui-knowledge/03-move-and-objects.md` for the full Move + object model reference.
```

When linking from a knowledge doc to docs.sui.io:

```markdown
See [the official Sui Move book](https://docs.sui.io/concepts/sui-move-concepts) for the definitive reference.
```

Never link to a hash anchor that is not stable. Section IDs in markdown auto-generate from headings; renaming a heading breaks the anchor.

## Length targets

| Doc type | Target | Notes |
|---|---|---|
| Plan docs | 7-12k chars | Match existing plans (this folder) |
| Skill SKILL.md | 2-5k chars | Long skills should split content into references/ |
| Skill reference file | 1-3k chars | Loaded on-demand, kept tight |
| Knowledge doc | varies, see `06-SUI-KNOWLEDGE-BASE.md` | Per-doc length targets defined there |
| Sponsor doc | 1.5-3k chars | Concise; deep stuff lives at the sponsor's docs |
| Catalog row description | 100-250 chars | One-liner in our voice |
| README.md | 5-10k chars | Skim-first, deep-link the rest |
| CLAUDE.md | 3-7k chars | AI-agent-readable; concise |

Going beyond a target is fine if the content needs it; going under usually means the doc is incomplete. Use targets as sanity checks, not hard limits.

## Frontmatter

Plans and knowledge docs do NOT use frontmatter (we keep them plain).

Skills (`SKILL.md`) DO use frontmatter; format in `05-SKILL-FORMAT.md`.

Website MDX files (when we add them) use frontmatter for routing metadata; format defined in build phase.

## Voice for skill outputs

Skills produce output the user reads. The voice in skill outputs follows the brand voice (see `15-BRAND.md`).

Examples of right voice in skill outputs:

> "Your retention loop says 'users will keep coming back to check their dashboard.' That is not a loop, that is a hope. What would actually pull them back?"

> "DeepBook is a strong fit for this idea. Cetus and Aftermath are alternatives if you decide an AMM matches better."

> "I cannot recommend the Walrus track. Your project imports walrus but never calls a Walrus function. Either go deeper or pick a different track."

Examples of wrong voice:

> "Your retention strategy could potentially benefit from further refinement." (too soft, marketing-speak)

> "DeepBook is the best choice for any DeFi project on Sui." (overstated, sponsor-favored)

> "Walrus integration could be enhanced." (too soft, does not convey the issue)

Use AI's natural inclination toward hedging only when hedging is genuinely correct. Default to clear, direct, and accountable claims.

## Markdown lint

We will adopt `markdownlint` with a custom config in CI:

- `MD001`: heading levels increment by one
- `MD003`: ATX-style headings (`# Title`)
- `MD004`: dash bullets
- `MD007`: 2-space list indent
- `MD009`: no trailing spaces
- `MD010`: no hard tabs
- `MD012`: no consecutive blank lines
- `MD025`: single H1 per document
- `MD040`: code blocks must have language tag
- Custom: no em-dashes, no banned words

Lint runs on every PR.

## JSON style for catalog

```json
{
  "id": "kebab-case-id",
  "name": "Title Case Name",
  "description": "One-line description in our voice. No marketing copy. Ends with period.",
  "url": "https://...",
  "lastChecked": "2026-05-10"
}
```

Two-space indent. Keys sorted by file convention (id first for catalog files). No trailing commas. UTF-8.

## Error message format

Per `15-BRAND.md`:

```
✗ Cannot write to ~/.claude/skills/ (permission denied)
  fix: chmod u+w ~/.claude/skills/   or run with appropriate permissions
```

Cause first, fix second. No stack traces unless `SUIPERPOWER_DEBUG=1`. No "please contact support."

## CLI output

- Banner appears on `init` and on no-args invocation (the onboarding TUI). Suppressed by `--quiet` or non-TTY contexts.
- Status checks use `✓`, `⚠`, `✗` prefixes.
- Indentation: two spaces for sub-items.
- Color: cyan for info, yellow for warnings, red for errors, green for success. Disabled when stdout is not a TTY.

## Translation / internationalization

For v1, English only.

For v1.1+, we will revisit. Sui has significant Asia-region community; Japanese and Korean translations of the README and the Overflow playbook would be high-value. Skills are harder to translate because the AI's effective language is English.

If we add translations:

- Translations live under `locales/<lang>/` mirroring the `plans/` structure
- The English version remains canonical
- Translators are credited in `CONTRIBUTORS.md`
- Translations are reviewed for technical accuracy by a Sui-native speaker

## Accessibility

For the website:

- Alt text on every non-decorative image
- Sufficient color contrast (WCAG AA at minimum)
- Keyboard navigability
- Semantic HTML (correct heading hierarchy, list elements, landmark roles)

For the CLI:

- All decoration (banner, colors) is optional and disabled in non-TTY contexts
- Plain-text fallback for users with screen readers
- No reliance on emoji or special Unicode for meaning

## Versioning of docs

Docs themselves are not versioned individually. They live in the repo and reflect the current state.

When a doc describes time-sensitive content (e.g. a sponsor's SDK at version X), the doc carries a "Last updated" footer and the version it targets. When the upstream changes, the footer updates too.

We do not maintain old versions of plans (e.g. "the v0.2 architecture doc"). The plans folder describes the current architecture. Historical state is in git history.

## How additions get reviewed

A PR that touches docs is reviewed for:

- Voice fit (against `15-BRAND.md`)
- Structural fit (against this doc)
- Source citations (for knowledge / sponsor docs)
- No banned words
- No em-dashes
- No broken cross-references
- Length sanity check

These checks are mostly automated by markdown lint plus a couple of custom checks. Reviewer attention covers the rest.

## How this doc gets used

- Required reading for new skill authors and knowledge contributors
- Linked from `CONTRIBUTING.md`
- Updated when patterns emerge that the rules did not cover
- Source for the markdown lint config

If something here is unclear or wrong, open an issue tagged `meta-style`. We update this doc when patterns emerge.

## Origin acknowledgment

These standards take from solana-new's CONTRIBUTING.md (consistent voice in skills), Anthropic's writing guidelines (clarity over performance), and Mysten's docs voice (technical and direct). The em-dash ban is Kelvin's project rule. The banned-word list is Suiperpower-specific.
