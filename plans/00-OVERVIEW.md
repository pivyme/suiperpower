# 00. Overview

## What is Suiperpower

Suiperpower is the open platform behind [suiperpower.dev](https://suiperpower.dev). One install gives any AI coding agent (Claude Code, Codex, Cursor) the skills, knowledge, ecosystem catalog, and CLI it needs to take a developer from "what should I build on Sui" to a deployed, sustainable product, with a hackathon submission generated for free if the user wants one.

It is the Sui-network counterpart to [solana-new](https://solana.new), but built around an explicit anti-slop thesis (see below) and tuned for the realities of Sui: Move, the object model, Programmable Transaction Blocks, Walrus storage, DeepBook, Scallop, OtterSec audits, OpenZeppelin libraries, zkLogin, sponsored transactions, kiosks.

One-line install:

```bash
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

Installs to `~/.claude/skills/`, `~/.codex/skills/`, and `~/.cursor/rules/`. Nothing touches your PATH or runs in the background.

## Tagline

**Build something meaningful, on Sui**

A single inviting line. "Meaningful" is the load-bearing word: it covers real users, real traction, real revenue, products their builders are proud of, all in one term. Inclusive of any builder, hackathon participant or not, since Suiperpower is built for production Sui projects long-term, not just Overflow 2026.

## Who it is for

1. **Sui Overflow 2026 participants** who want to ship one or two high-quality submissions instead of five forgettable ones.
2. **Solo builders and small teams** outside the hackathon who want to bias their first Sui product toward something a real user will pay for.
3. **EVM, Solana, or other-chain devs migrating to Sui** who need an opinionated, current path through Move, the object model, PTBs, and the most-used ecosystem packages.
4. **Sponsors of Sui Overflow 2026** (Walrus, DeepBook, OpenZeppelin, OtterSec, Scallop) who want their tech surfaced as a default integration option, not an afterthought.

Suiperpower is not for someone who wants to ship a token rugpull, a clone of an existing dApp with no differentiation, or a one-screen demo that breaks if you click the wrong button. The tool actively pushes back on those.

## The anti-slop thesis

Most hackathon submissions are slop. They are one-off products that die the moment the prize is paid. They have no clear business model, no retention, no real users, and were built to maximize the chance of winning a track, not to maximize the chance of becoming a startup.

The Sui team confirmed this matters in their 2026 message:

> Teams that dedicate more time toward refining usability, functionality, and long-term value will generally be more competitive than teams spreading their efforts across multiple submissions.

> Judging criteria place much stronger emphasis on product quality, real-world application, technical execution, and overall polish.

Suiperpower is built around five anti-slop defaults:

1. **Every build skill includes a "will this survive past the hackathon" gate.** Validation is not optional or a separate phase, it is woven into the build flow.
2. **Idea phase pulls from real venture-backed signal** (a16z, YC, Alliance, Sui-native gap analyses), not the user's first hunch.
3. **Submission generator demands real assets** (working live URL, demo video, package-id from an actual deploy, screenshots that match the product). Skill refuses to draft a submission against placeholder content.
4. **Sponsor integration is real, not cosmetic.** If a project claims a Walrus / DeepBook / Scallop track, the relevant package must actually be a runtime dependency and the integration must be reachable from the live demo.
5. **Tone is direct.** /roast-my-product is in the build phase, not the launch phase. The earlier the dev hears "this is generic", the more time they have to fix it.

## How it differs from solana-new

| Dimension | solana-new | Suiperpower |
|---|---|---|
| Chain primitives | Account model, PDAs, Anchor | Object model, capabilities, PTBs, Move |
| Storage default | None / IPFS opt-in | Walrus first-class |
| DeFi integration defaults | Jupiter, Orca, Kamino | DeepBook orderbook, Scallop money market |
| Auth defaults | Wallet adapter, Privy | zkLogin, sponsored transactions |
| Marketplace pattern | Custom programs | Kiosk standard |
| Anti-slop framing | Implicit (roast-my-product, product-review) | Explicit, gates baked into every build skill |
| Hackathon submission | Generic /submit-to-hackathon | /submit-to-sui-overflow with deepsurge.xyz integration, package-id capture, sponsor-track recommender |
| Multi-agent support | Claude + Codex | Claude + Codex + Cursor (parity goal) |
| Knowledge base | Solana docs + Cookbook + ecosystem | Sui docs (docs.sui.io) + Move book + sponsor docs + ecosystem |
| Backend | Convex telemetry + feedback | Convex telemetry + feedback (same shape) |

Suiperpower is **not** a fork of solana-new. The shape is similar because the journey shape is similar, but skill content, knowledge base, ecosystem catalog, and integration defaults are Sui-native from the first byte.

## What ships in v1

See `plans/18-ROADMAP.md` for the full roadmap. v1 (the Sui Overflow 2026 launch milestone) ships:

- One-line installer (curl-based) that works on macOS and Linux, supports Claude Code + Codex + Cursor.
- ~30 journey skills across Learn / Idea / Build / Ship / Grow phases (full list in `plans/04-SKILLS-CATALOG.md`).
- Sui knowledge base, six core docs covering Move, objects, PTBs, app layer, ecosystem, security (full spec in `plans/06-SUI-KNOWLEDGE-BASE.md`).
- Ecosystem catalog: clonable repos, MCP servers, ecosystem skills, curated ideas (spec in `plans/07-ECOSYSTEM-CATALOG.md`).
- Sponsor integrations: Walrus, DeepBook, Scallop with first-class skills, OpenZeppelin and OtterSec referenced in security flows (spec in `plans/11-SPONSOR-INTEGRATION.md`).
- Hackathon submission generator: /submit-to-sui-overflow (spec in `plans/10-HACKATHON-SUBMISSION.md`).
- Anti-slop quality gates wired into every build skill (spec in `plans/12-ANTI-SLOP-FRAMEWORK.md`).
- Convex backend for opt-in telemetry and feedback (spec in `plans/13-CONVEX-BACKEND.md`).
- Landing page at suiperpower.dev: install command, skill catalog, ecosystem catalog, no marketing fluff (spec in `plans/14-WEBSITE-STRUCTURE.md`).

## Reading order for these plans

For navigation across all 31 plan docs, start at `plans/README.md` (the index).

If you only have 10 minutes, read in this order:

1. This file (00-OVERVIEW)
2. `01-ARCHITECTURE.md`, the system shape
3. `04-SKILLS-CATALOG.md`, what users actually invoke
4. `12-ANTI-SLOP-FRAMEWORK.md`, the differentiating thesis
5. `18-ROADMAP.md`, what ships when

If you have 30 minutes, then add:

6. `26-EXAMPLE-USER-JOURNEY.md`, worked walkthrough that makes everything above concrete
7. `22-SAMPLE-SKILL.md`, what a real SKILL.md looks like end to end
8. `24-OVERFLOW-2026-PLAYBOOK.md`, the user-facing pitch and journey

Before writing or shipping anything: read `20-CONTRIBUTING-PLAN.md`, `21-TESTING-STRATEGY.md`, and `29-DOCS-AUTHORING-STANDARDS.md`. Before authoring any shared guide or phase-handoff context-file, read `30-SHARED-GUIDES-SPEC.md`.

Everything else is depth-on-demand.

## Open assumptions to validate

Tracked in `plans/19-OPEN-QUESTIONS.md`. The biggest ones:

- Domain `suiperpower.dev` availability (likely fine, .dev is open registration via Google Domains / Cloudflare).
- npm package name `suiperpower` availability.
- GitHub handle / org for the canonical repo.
- Existence of usable Sui MCP servers (vs. needing to build wrappers around Sui RPC).
- Whether Walrus / DeepBook / Scallop teams want to co-author the integration skills (better content, free distribution for them, slower for us).
