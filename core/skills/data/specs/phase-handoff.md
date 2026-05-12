# Phase handoff spec

> Contract for the markdown context files Suiperpower skills write to `.suiperpower/` in the user's project workspace. Skill authors read this before authoring any skill that produces or consumes phase context.

Spec version: `1.0`
Last updated: 2026-05-10

## Why this spec exists

Skills do not pass state through global memory or a database. They pass it through plain markdown files on the user's filesystem. The user can read, edit, and version-control these files. The AI agent can read them across sessions. New skills can plug into the same files without coordination.

This spec defines:

- The five context files and their canonical sections
- The append-only and non-deletion rules every writing skill follows
- The bootstrap rules that let any skill create a missing context file without forcing the user through a sequence
- The merge rules for re-runs

## File locations

```
<project-root>/
  .suiperpower/
    idea-context.md           Written by Idea-phase skills
    build-context.md          Written by Build-phase skills
    deploy-context.md         Written by Ship-phase deploy skills
    submission-context.md     Written by submit-to-sui-overflow
    learnings.md              Written by /learn across sessions
```

The folder is gitignored by default (the user's project ships `.gitignore` excluding `.suiperpower/`). Teams that want to commit context for collaboration can opt in by removing the rule.

## Canonical section headers

Every skill that writes to a context file uses these exact headers (no rewording, no synonym substitution). Other skills detect existence and append by header match.

### idea-context.md

```
## Chosen Idea
## Scores
## MVP Checklist
## Go-to-Market
## Validation
## Landscape
## Business Model
## Retention Loop
## Source Reports
```

Written by: `find-next-sui-idea`, `validate-idea`, `competitive-landscape`, `deepbook-research`, `walrus-research`, `validate-business-model`, `retention-loop`, `will-real-users-pay`.

### build-context.md

```
## Stack
## Move Package
## Frontend
## Sponsor Integrations
## Build Status
## Milestones
## Review
```

Written by: `scaffold-project`, `build-with-claude`, `build-with-move`, `walrus-storage`, `deepbook-orderbook`, `scallop-money-market`, `sui-zk-login`, `sponsored-transactions`, `kiosk-marketplace`, `build-mobile-sui`, `launch-coin`, `review-move`.

### deploy-context.md

```
## Deploy
## Verification
```

Written by: `deploy-to-testnet`, `deploy-to-mainnet`.

### submission-context.md

```
## Submission
## Assets
## Preflight
## Confirmation
```

Written by: `submit-to-sui-overflow`.

### learnings.md

```
## What we tried
## What worked
## What did not work
## Open questions
## Decisions
```

Written by: `learn`.

## Field rules

Per file:

### idea-context.md

- **Chosen Idea** (required): slug, name, one-liner, why-Sui, completed-at timestamp. Scalar fields, overwrite on re-run with the latest values.
- **Scores** (1-3 each): founder fit, MVP speed, distribution clarity, market pull, revenue path. Scalar, overwrite.
- **MVP Checklist**: bulleted checklist, the smallest version that delivers value. Append on re-run, do not delete prior items unless the user explicitly asks.
- **Go-to-Market**: wedge, first ten users, distribution channel. Scalar, overwrite.
- **Validation** (optional): go/no-go, confidence, demand signals, risks, next steps. Scalar fields overwritten on re-run by the same skill.
- **Landscape** (optional): crowdedness rating, moat type, differentiation paragraph, substitutes table.
- **Business Model** (optional): who pays, how much, why they keep paying, unit economics, smallest-plausible-business sentence.
- **Retention Loop** (optional): Day 1, Day 2, Day 7, Day 30 anchors plus a single-paragraph loop description.
- **Source Reports** (accumulating list): filenames or paths of artifacts produced (e.g. `docs/idea/competitive-landscape.md`). Append-only.

### build-context.md

- **Stack** (required): template, architecture pattern, completed-at, skills installed, MCPs configured, repos cloned. Scalar, overwrite.
- **Move Package**: per-module breakdown. Module name, public functions, capabilities, `Move.toml` summary. List, accumulating per module added.
- **Frontend** (if applicable): stack chosen (Next.js + dapp-kit, etc.), key routes, auth method (zkLogin / wallet adapter / both). Scalar, overwrite.
- **Sponsor Integrations**: each sponsor (Walrus, DeepBook, Scallop, OpenZeppelin Sui, OtterSec) as its own subsection. Append a subsection when first integrated; update fields scalar within.
- **Build Status** table: MVP complete, tests passing, devnet deployed, testnet deployed, mainnet deployed, package id (per network), deployment date, RPC provider. Scalar fields overwrite.
- **Milestones**: timestamped checklist. Append-only.
- **Review** (optional): security score, quality score, ready-for-mainnet flag, findings table. Scalar overwrite by `review-move`.

### deploy-context.md

- **Deploy**: one entry per deploy event, accumulating. Network, package id, deployer address, upgrade capability id (or `burned`), deployed-at timestamp, build hash. Append-only, never overwrite earlier deploys.
- **Verification**: results of post-deploy checks per deploy. Mirrors the deploy entry id; append-only.

### submission-context.md

- **Submission**: per-submission record. Submission timestamp, project name, primary track, secondary tags, network, package id, live URL, demo video URL. Append-only (in case of re-submission).
- **Assets**: file paths to logo / media / descriptions / scripts. Scalar overwrite, latest paths win.
- **Preflight**: checklist results from the day-of preflight gate (live URL check, package verified on chain, media at spec, demo video plays). Scalar overwrite per run.
- **Confirmation**: deepsurge confirmation screenshot path, Telegram post link, tweet link. Scalar overwrite.

### learnings.md

Free-form, encouraged shape: bullet lists per section. All sections accumulating. The `learn` skill writes new entries with date prefixes, never deletes prior entries.

## Append-only rule

Every list-shaped field is append-only across re-runs. Skills must:

1. Read the current file.
2. Locate the section by exact header match.
3. Append new bullets or rows.
4. Never delete or rewrite prior bullets unless the user explicitly asks.

Scalar fields (single value per field, e.g. score, status, package id within a `Submission`) are overwritten with the latest value when the same skill re-runs. Different skills do not overwrite each other's scalars; they update their own and leave others alone.

## Non-deletion rule

A skill must not delete a section written by another skill. Example: `validate-idea` writes the **Validation** section. `competitive-landscape` writing the **Landscape** section must leave Validation intact.

If a skill detects a section that contradicts what it is about to write (e.g. a stale Business Model written before the user pivoted), it appends a new dated entry under the same section and notes the conflict, rather than overwriting.

## Timestamp rule

Every section has a `Updated at: YYYY-MM-DDTHH:MM:SSZ` line near the top of the section. Skills update this when they write or modify the section. The bootstrap-creating skill writes `Created at:` at the top of the file with the same UTC ISO 8601 format.

Use UTC, not local time.

## Bootstrap rule

Any skill can create a context file if it does not exist yet. The user may invoke skills in any order; they do not need to follow Learn → Idea → Build → Ship sequence.

When a skill needs a context file that does not exist:

1. Proceed immediately. Ask the user directly for the information needed for the section the skill is about to write.
2. Create the file. Write the canonical headers for sections the skill knows about, fill in only what was asked, leave optional sections out.
3. Do NOT redirect the user to run other commands first.
4. Do NOT print dependency chains or warn about missing files.

The bootstrap rule is the difference between Suiperpower feeling like a flexible toolkit and a brittle pipeline. Skills cooperate; they do not gate each other.

## Merging rules

When a skill updates an existing context file:

1. Read the entire file first. Parse by header.
2. For sections the skill writes: update or append per the field rules.
3. For sections the skill does not write: leave untouched.
4. Update the section's `Updated at:` timestamp.
5. Write the file back atomically (write to a temp, then rename).

## Why markdown and not JSON

- Human-readable; users can read their own context without tooling
- Skills compose easily by writing to specific sections
- Diff-friendly for git
- AI agents read markdown context naturally
- Versioning is just adding a new section if the schema evolves; no migration

The trade-off is that parsing markdown is fuzzier than parsing JSON. We accept this; skills do not parse machine-precisely, they read context to inform conversation.

## Example: idea-context.md after a full Idea-phase walk

```markdown
# .suiperpower/idea-context.md

Created at: 2026-05-10T14:22:11Z
Updated at: 2026-05-10T15:10:42Z

## Chosen Idea
Updated at: 2026-05-10T14:22:11Z

- slug: walrus-archive
- name: Walrus Archive
- one-liner: durable, cheap archive for high-resolution scientific datasets, with verifiable retrieval proofs
- why-sui: Walrus blob storage with deterministic retrieval is unique to Sui; no parity on other chains today
- completed-at: 2026-05-10T14:22:11Z

## Scores
Updated at: 2026-05-10T14:22:11Z

- founder fit: 3
- MVP speed: 2
- distribution clarity: 2
- market pull: 3
- revenue path: 2

## MVP Checklist
Updated at: 2026-05-10T14:22:11Z

- [ ] CLI tool that uploads a directory tree to Walrus
- [ ] retrieval verifier that proves a blob exists at epoch N
- [ ] simple web UI to browse uploaded archives by user

## Go-to-Market
Updated at: 2026-05-10T14:22:11Z

- wedge: science labs needing audit-trail-friendly archive for raw data
- first ten users: post in r/datacurator, two academic Discords, one targeted Show HN
- distribution channel: organic + targeted academic communities

## Validation
Updated at: 2026-05-10T15:10:42Z

- go/no-go: go
- confidence: medium
- demand signals: two academic discords confirmed pain, three respondents asked when MVP ships
- risks: pricing for long-term Walrus epochs unclear; users may want a fixed multi-year quote
- next steps: build CLI MVP, run a one-week pilot with one of the discord respondents

## Source Reports
- docs/idea/walrus-research.md
- docs/idea/competitive-landscape.md
```

## Migration policy

When this spec changes:

1. Update this file first. Bump the spec version in the header.
2. Update every skill that writes to the affected file.
3. Update `21-TESTING-STRATEGY.md` if a new validation test is needed.
4. Add a changelog entry below noting the breaking change (if any).

Skills are forward-compatible by default: they ignore unknown sections.

## Changelog

- **1.0** (2026-05-10): Initial spec. Five context files (idea, build, deploy, submission, learnings). Append-only and non-deletion rules. Bootstrap rule. UTC timestamps.
