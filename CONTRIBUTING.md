# Contributing to Suiperpower

Suiperpower is a community asset. Most of its long-term value comes from people other than the original maintainer adding skills, catalog entries, knowledge updates, and bug fixes. This doc is the source-of-truth for how that happens.

## Who can contribute

Anyone with a GitHub account. We do not require contributors to be Sui Foundation, sponsor employees, or part of any team. We do require contributions to meet the quality bar in this doc and the brand voice rules in the "Voice and style" section below.

## What you can contribute

Five primary types. Each has a different PR shape and reviewer checklist.

| Type | Surface | Time-to-merge target |
|---|---|---|
| Catalog row | one row added to a `cli/data/*.json` file | under 48h |
| New skill | new folder under `skills/<phase>/<name>/` | under one week |
| Knowledge doc edit | one `skills/data/sui-knowledge/*.md` updated | 3-5 days |
| CLI / backend code change | `cli/`, `convex/`, `scripts/` | 3-7 days |
| Bug fix | targeted, with reproduction | under 48h |

Mixing types in one PR is allowed only if the changes are coupled (e.g. a skill that requires a new knowledge doc).

## Catalog row PR

Smallest contribution. One JSON row added to one of the four catalog files in `cli/data/`.

Branch name: `catalog/<file>-<short-id>`
Files touched: `clonable-repos.json`, `sui-skills.json`, `sui-mcps.json`, or `sui-ideas.json`. Append your row, keep ids sorted alphabetically, set `lastChecked` to today.

PR description: link to the upstream resource plus one-line "why this belongs in the catalog".

Reviewer checks:

- URL is reachable (returns 200)
- License is permissive (MIT, Apache-2.0, BSD, ISC); GPL is flagged for discussion
- Description in our voice, not pasted marketing copy
- Category is from the controlled vocabulary used by existing rows in the same file
- For MCPs: install command works, MCP responds to tool list, no surprising network calls
- Sorted alphabetically by id

Local check: `pnpm lint:catalog`.

## New skill PR

Adds a new journey skill under `skills/<phase>/<name>/`.

Branch: `skill/<phase>-<name>`. New folder contains:

- `SKILL.md` following the Anthropic skill spec; clone shape from an existing skill under `core/skills/`
- `agents/openai.yaml` mirroring the frontmatter
- Optional `references/` files

You also update:

- `skills/SKILL_ROUTER.md` if the new skill is confusable with nearby ones
- `skills/README.md` adding the new row
- `cli/data/sui-skills.json` if the skill should appear in the ecosystem catalog

Reviewer checks:

- Folder name equals frontmatter `name:`
- Telemetry preamble byte-identical (run `pnpm preamble:check`)
- Description packs trigger phrases real users would actually say
- Workflow is numbered, ends with a writeback to `.suiperpower/<phase>-context.md` so the next phase can pick up state
- Quality gate (anti-slop) section is non-trivial: every build / ship skill must end with a real "will this survive past the hackathon" check, not a checkbox
- Voice matches the "Voice and style" rules below (no em-dashes, no banned words)
- References are real and reachable
- Manual test in Claude Code on a fresh container

Local check: `pnpm lint:skills` (also `pnpm test`).

## Knowledge doc PR

Updates `skills/data/sui-knowledge/*.md` or `sponsor-docs/*.md`.

Branch: `kb/<doc-name>`. One doc updated, `Last updated:` footer bumped, source citations added or refreshed for any new factual claim. Code snippets compile against the SDK / CLI version stated at the top of the doc.

Reviewer checks:

- Every new factual claim has a source link
- Code blocks tagged with the language
- Sui-specific terms capitalized (Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin)
- No em-dashes
- Length stays tight: under ~400 lines per doc, link out for deep reference material
- For sponsor docs: sponsor team pinged for accuracy review (or a reason logged)

## CLI / backend code PR

Adds or modifies code in `cli/`, `convex/`, `scripts/`.

Branch: `cli/<area>`, `convex/<area>`, or `scripts/<area>`. Tests added or updated where applicable. `pnpm typecheck`, `pnpm lint:skills`, `pnpm lint:catalog`, and `pnpm test` all pass locally.

Commit messages in conventional format: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.

Reviewer checks:

- No new runtime dependencies unless explicitly justified. CLI policy is zero deps except Convex client.
- No hardcoded brand strings outside `cli/branding.ts`
- Behavior documented in the relevant plan doc (or a doc-update PR alongside)
- No telemetry events without a privacy review: no code, no file paths, no PII, opt-in anonymous by default

## Bug fix PR

Branch: `fix/<short-description>`. Reproduction steps in the PR description. Fix targets root cause, not the symptom. No opportunistic refactors stuffed in. A regression test is added where possible.

## Voice and style

The hard rules:

| Rule | Example |
|---|---|
| No em-dashes | Use commas or periods. "Suiperpower is for Sui builders, not just hackathon participants." |
| Sui terms capitalized | Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin |
| Kebab-case for skill names, file names, catalog ids | `build-with-move`, `walrus-storage` |
| No marketing-speak | Banned: leverage, cutting-edge, world-class, revolutionary, AI-powered, Web3, game-changing |
| Active voice | "The skill checks the package id." not "It is recommended that the skill should check the package id." |
| Direct in skill outputs | "Your retention loop is a hope, not a loop." not "Your retention strategy could benefit from refinement." |
| Code blocks tagged | ` ```bash`, ` ```move`, ` ```typescript`, ` ```json` |
| Dates | `YYYY-MM-DD` |

`pnpm lint:skills` enforces the banned-words and em-dash rules.

## Supply-chain rules

Suiperpower runs in users' terminals and tells AI agents to run commands. Every external thing we recommend must pass these checks.

- Repos: permissive license, last commit within 12 months, verifiable publisher
- MCPs: public package, tool list documented, no paid-key requirement for basic use, tested in fresh environment
- Ecosystem skills: source readable end to end, no prompt injection, no install-unverified-tools recommendations
- Knowledge docs: every claim source-linked to docs.sui.io, sponsor docs, or peer-reviewed sources
- Ideas: each entry explains why Sui specifically; no rugpull or scam content

## Conflict of interest

Contributors paid by or affiliated with a project being added to the catalog must disclose in the PR description. Examples:

- "I am a Walrus engineer, this PR adds the Walrus quickstart repo to clonable-repos."
- "My company built this MCP, this PR adds it to sui-mcps."

Disclosure does not auto-block the PR. Undisclosed conflicts are grounds for PR closure when discovered.

## Code of conduct

Be direct without being mean. Critique work, not people. No politics, religion, or off-topic disputes in PR threads. No paid-placement requests in catalog PRs. Off-limits: hate speech, harassment, doxxing, sexual content, explicit threats.

Enforcement: maintainer warning, then PR / issue lock, then ban. Public moderation log for transparency.

Adopted from [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) with the additions above.

## Security disclosures

Vulnerabilities should NOT be opened as public issues. Email `security@suiperpower.dev` (mailbox provisioned at launch) or DM the maintainer. We respond within 24 hours. Critical reports (install script compromise, npm package compromise) trigger a same-day patch and a public advisory.

## DCO

Suiperpower uses the [Developer Certificate of Origin](https://developercertificate.org/). Each commit must include a `Signed-off-by:` line, added with `git commit -s`. We do not use a CLA. MIT plus DCO is enough.

## Local development

```bash
pnpm install
pnpm dev                # run CLI locally via tsx
pnpm build              # tsc to dist/
pnpm test               # typecheck + lint:skills + lint:catalog + preamble:check
pnpm test:install       # CLI smoke test (build, version, doctor, vendor-mode init)
pnpm package:skills     # build per-skill tarballs and index.json under public/skills/
```

## Recognition

Contributors are listed in `CONTRIBUTORS.md` (alphabetical, no rank). Contributors who land 5+ merged PRs are noted in the relevant release's changelog. Sustained contributors are invited to maintainer conversations.

## Questions

- GitHub Issues for bugs and skill requests
- GitHub Discussions for RFCs and roadmap input
- Sui Overflow Telegram for hackathon-specific questions: https://go.sui.io/suioverflow2026-tg
