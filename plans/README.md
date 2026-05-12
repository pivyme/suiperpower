# Plans index

This folder is the source of truth for what Suiperpower is and how it ships. 31 plan docs (00-30) plus this index.

If you are an AI agent picking up work, **read this file first**. Every other doc is depth-on-demand.

## Reading paths

| Goal | Read in order |
|---|---|
| Get the thesis in 5 minutes | 00 → 04 → 12 |
| Understand the system shape (10 min) | 00 → 01 → 02 → 18 |
| Feel what users actually experience (15 min) | 00 → 26 → 24 → 04 |
| Author a new skill | 05 → 22 → 23 → 29 |
| Add a catalog row | 07 → 20 → 29 |
| Update a knowledge or sponsor doc | 06 → 11 → 29 |
| Implement a CLI command | 08 → 02 → 21 |
| Implement install / setup | 03 → 09 → 25 |
| Wire up Convex backend | 13 → 25 → 21 |
| Build the website | 14 → 15 → 24 → 29 |
| Plan the launch | 17 → 18 → 11 → 27 |
| Resolve an unresolved decision | 19 |
| Onboard a new maintainer | 27 → 20 → 28 → this list |
| Pre-publish security check | 25 → 21 → 13 |
| Author a shared guide or phase-handoff spec | 30 → 29 |

## All plan docs

### Foundation (read first)

| File | Purpose |
|---|---|
| [00-OVERVIEW.md](00-OVERVIEW.md) | Thesis, audience, anti-slop framing, what ships in v1 |
| [01-ARCHITECTURE.md](01-ARCHITECTURE.md) | Six-layer system shape, install flow, data flow |
| [02-PROJECT-STRUCTURE.md](02-PROJECT-STRUCTURE.md) | Full directory tree, conventions, naming rules |
| [18-ROADMAP.md](18-ROADMAP.md) | v0.1 through v2.0, what each version ships |

### Distribution & install

| File | Purpose |
|---|---|
| [03-INSTALL-FLOW.md](03-INSTALL-FLOW.md) | curl one-liner, install.sh logic, doctor, telemetry opt-in |
| [09-MULTI-AGENT-PARITY.md](09-MULTI-AGENT-PARITY.md) | Claude / Codex / Cursor install paths, format conversion |
| [25-SECURITY-POSTURE.md](25-SECURITY-POSTURE.md) | Trust model, threats, mitigations, incident response |

### Skills

| File | Purpose |
|---|---|
| [04-SKILLS-CATALOG.md](04-SKILLS-CATALOG.md) | All ~38 skills, trigger phrases, phase grouping |
| [05-SKILL-FORMAT.md](05-SKILL-FORMAT.md) | SKILL.md spec, telemetry preamble, agents/openai.yaml, MDC |
| [22-SAMPLE-SKILL.md](22-SAMPLE-SKILL.md) | Canonical fully-written reference skill (build-with-move) |
| [23-SKILL-ROUTER-SPEC.md](23-SKILL-ROUTER-SPEC.md) | Per-row routing table, every v1 skill, common confusions |

### Knowledge & catalog

| File | Purpose |
|---|---|
| [06-SUI-KNOWLEDGE-BASE.md](06-SUI-KNOWLEDGE-BASE.md) | Knowledge doc outlines (6 core + cookbook + sponsor) |
| [07-ECOSYSTEM-CATALOG.md](07-ECOSYSTEM-CATALOG.md) | JSON schemas for repos / skills / mcps / ideas |
| [16-CONTENT-PLAN.md](16-CONTENT-PLAN.md) | Idea source corpus, schema, Sui-native gaps |
| [30-SHARED-GUIDES-SPEC.md](30-SHARED-GUIDES-SPEC.md) | Procedural guides + phase-handoff context-file contracts |

### Sponsors & hackathon

| File | Purpose |
|---|---|
| [10-HACKATHON-SUBMISSION.md](10-HACKATHON-SUBMISSION.md) | /submit-to-sui-overflow workflow, deepsurge.xyz integration |
| [11-SPONSOR-INTEGRATION.md](11-SPONSOR-INTEGRATION.md) | Walrus / DeepBook / OpenZeppelin / OtterSec / Scallop |
| [12-ANTI-SLOP-FRAMEWORK.md](12-ANTI-SLOP-FRAMEWORK.md) | Quality bar, gates, anti-slop skills |
| [24-OVERFLOW-2026-PLAYBOOK.md](24-OVERFLOW-2026-PLAYBOOK.md) | Participant-facing journey, source for /overflow page |

### CLI & backend

| File | Purpose |
|---|---|
| [08-CLI-DESIGN.md](08-CLI-DESIGN.md) | CLI commands, branding.ts, file responsibilities, TUI |
| [13-CONVEX-BACKEND.md](13-CONVEX-BACKEND.md) | Schema, mutations, tier model, privacy posture |

### Web & brand

| File | Purpose |
|---|---|
| [14-WEBSITE-STRUCTURE.md](14-WEBSITE-STRUCTURE.md) | Routes + section outlines (no styling) |
| [15-BRAND.md](15-BRAND.md) | Name, tagline, voice, do-not-use phrases, logo direction |
| [29-DOCS-AUTHORING-STANDARDS.md](29-DOCS-AUTHORING-STANDARDS.md) | Style sheet for all markdown / JSON / CLI output |

### Operations

| File | Purpose |
|---|---|
| [17-LAUNCH-PLAN.md](17-LAUNCH-PLAN.md) | T-4w to T+12w plan, sponsor outreach, launch day |
| [31-LAUNCH-VIDEO-CONCEPT.md](31-LAUNCH-VIDEO-CONCEPT.md) | 28 s Remotion motion-graphic spot, locked storyboard + build order |
| [20-CONTRIBUTING-PLAN.md](20-CONTRIBUTING-PLAN.md) | PR shapes, supply-chain rules, reviewer checklists, code of conduct |
| [21-TESTING-STRATEGY.md](21-TESTING-STRATEGY.md) | Six test layers, CI matrix, multi-agent install testing |
| [27-GOVERNANCE-AND-SUSTAINABILITY.md](27-GOVERNANCE-AND-SUSTAINABILITY.md) | Maintainer model, decisions, conflict of interest, RFC process |

### Reference

| File | Purpose |
|---|---|
| [19-OPEN-QUESTIONS.md](19-OPEN-QUESTIONS.md) | Live tracker for unresolved decisions |
| [26-EXAMPLE-USER-JOURNEY.md](26-EXAMPLE-USER-JOURNEY.md) | Worked walkthrough of a fictional builder, idea to submission |
| [28-COMPETITIVE-LANDSCAPE.md](28-COMPETITIVE-LANDSCAPE.md) | Sui dev tooling positioning, differentiators, cooperation |

## How plan docs pair

These are the most-common cross-references when working on a particular thing.

| When working on... | Read together |
|---|---|
| A new skill | 05 (format) + 22 (sample) + 23 (router) + 29 (style) |
| Sponsor integration | 11 (integration) + 06 (sponsor docs) + 12 (gates) |
| Hackathon submission | 10 (skill) + 12 (gates) + 24 (playbook) + 30 (deepsurge guide) |
| Backend schema | 13 (Convex) + 25 (security/privacy) + 21 (testing) |
| Website page | 14 (structure) + 15 (brand) + 29 (style) |
| Catalog | 07 (schemas) + 20 (supply-chain rules) + 16 (content) |
| Install / setup | 03 (flow) + 09 (multi-agent) + 25 (security) |
| Anti-slop gate | 12 (framework) + 22 (sample skill gate) + 26 (worked example) |
| Phase handoff between skills | 30 (specs) + 22 (skill that writes/reads it) |
| Launch | 17 (plan) + 11 (sponsor outreach) + 18 (versioning) + 27 (governance) |

## What "depth on demand" means

You do not need to read every plan to do most work. The docs are intentionally redundant where it helps and tightly cross-linked where it does not.

Examples:

- **Author a sample idea entry**: read only 16 (content plan). Schema is referenced in 07.
- **Add a row to clonable-repos.json**: read only 07 + 20.
- **Fix a typo in a skill**: read only 29.
- **Triage a bug report**: read 19, 21, and the relevant phase doc.

Trying to internalize all 30 plans before doing anything is a sign of over-preparation, not thoroughness.

## Stable decisions you do not need to relitigate

Per `19-OPEN-QUESTIONS.md` decided log:

- No project-side Telegram or Discord in v1 (use Sui Overflow channels)
- Self-hosting Convex supported via `convexUrl` override
- Multi-agent set is Claude + Codex + Cursor; other agents post-v1
- Skills install flat, namespace-prompt on conflict
- Never bundle agent API keys
- `--quiet` mode supported
- Privacy-friendly analytics (Plausible / Vercel), no GA
- DCO commits, no CLA
- MIT license, no premium tier in v1

If you find yourself re-deciding any of these, you are off-track. Open a new RFC instead.

## What is intentionally NOT in plans

- Implementation code (skills, CLI source, Convex functions, website components)
- Knowledge doc full content (only outlines; full docs authored in build phase)
- Final logo / color / typography (direction stubs only in 15)
- Specific dates for v1 launch (depends on Overflow 2026 deadline; tracked in 19)

If you need any of those, you are past the planning phase. The build phase produces them, guided by these docs.

## Updating this index

When a new plan doc is added:

1. Add a row in the right category table above
2. Add a row in "How plan docs pair" if it pairs with existing docs
3. Update CLAUDE.md plans table at the repo root
4. Run a sanity check: a new contributor can find what they need from this index alone

When a plan doc is renamed:

- Update every cross-reference (use grep across `plans/`, `CLAUDE.md`, `TODO.md`, `README.md`)
- Use the new filename in the index

When a plan doc is removed:

- Document why in `19-OPEN-QUESTIONS.md` decided log
- Remove from this index, CLAUDE.md, TODO.md
- Leave a redirect note in any doc that previously cross-referenced it

## Last words

Plans are not contracts. They describe intent at a point in time. When implementation reveals the plan was wrong, update the plan, then update the implementation. Never let a stale plan drive a wrong build.

If you are uncertain whether a plan is current, check the most recent commit touching that file (`git log --follow plans/<file>`).
