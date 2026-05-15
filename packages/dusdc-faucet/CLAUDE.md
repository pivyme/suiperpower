# CLAUDE.md, DUSDC Faucet

Context for any AI agent (Claude Code, Codex, Cursor) working on the DUSDC Faucet inside this monorepo. The faucet is a standalone product in `packages/dusdc-faucet/`; it has no dependency on, and makes no reference to, the surrounding Suiperpower project.

## What this is

A self-serve DUSDC faucet for the DeepBook Predict testnet. Builders trade testnet SUI for DUSDC at a fixed 100:1 rate, can swap back any time, and anyone can refill the on-chain vault. Replaces the existing manual Tally form (`https://tally.so/r/Xx102L`).

Win for builders: no form, tokens in 5 seconds.
Win for DeepBook: zero ops, refill when low.

## Tech stack

| Layer | Tech | Path |
| --- | --- | --- |
| Move contract | Sui Move, edition 2024.beta | `contracts/faucet`, `contracts/test-dusdc` |
| Backend API | Bun + Fastify + Prisma + Postgres | `backend/` (port 3700) |
| Frontend | TanStack Start + React 19 + HeroUI v3 + Tailwind v4 | `web/` (port 3200) |
| Wallet | @mysten/dapp-kit | testnet only |
| Bot gate | Cloudflare Turnstile | siteverify endpoint |

Package manager is **bun** everywhere. Runtime is Bun for the backend, Node-equivalent via Vite for the web build.

## Project structure

```
packages/dusdc-faucet/
├── CLAUDE.md                  (this file)
├── README.md                  user-facing run instructions + demo arc
├── .env.example               full env shape, no values
├── .env.local-stub            runnable dev defaults (auto-copied to .env by orchestrator)
├── bigdev/                    planning + autonomous build loop tooling
│   ├── plans/                 source of truth for every implementation decision
│   ├── TODO.md                phased build steps, drive by the orchestrator
│   ├── autobuild              one-word launcher (./bigdev/autobuild)
│   └── claude/
│       ├── orchestrator-prompt.md
│       ├── build-prompt.md
│       ├── validate-prompt.md
│       ├── requirements-log.md
│       ├── demo-script.md
│       ├── preflight.md
│       └── auto-build-logs/   per-iteration return summaries (gitignored)
├── contracts/
│   ├── faucet/                shared Faucet object + AdminCap, generic over T
│   └── test-dusdc/            throwaway rehearsal coin
├── backend/                   Bun + Fastify (existing starter, adapted)
├── web/                       TanStack Start (existing starter, adapted)
└── scripts/
    ├── deploy.ts              publish + create_faucet + refill helper
    ├── e2e-rehearsal.ts       end-to-end testnet rehearsal
    ├── seed-demo-vault.ts     mint test DUSDC + refill for demo
    └── reset-demo-state.ts    restore vault to 1,000 starting balance
```

## Plans folder reference

The plans in `bigdev/plans/` are the source of truth. The build loop reads them, not this file.

| File | What it covers |
| --- | --- |
| `bigdev/plans/00-ARCHITECTURE.md` | System overview, module breakdown, Postgres schema, dependency list, testing strategy |
| `bigdev/plans/01-MOVE-CONTRACT.md` | Faucet struct, AdminCap, error codes, events, every entry function with full Move source |
| `bigdev/plans/02-BACKEND.md` | Fastify routes (`/verify`, `/stats`, `/tx-hint`, `/event/claim`), Turnstile wrapper, rate-limit logic, stats cache worker |
| `bigdev/plans/03-FRONTEND.md` | Page layout, provider wiring, PTB builders, components, error states |
| `bigdev/plans/04-DESIGN-SYSTEM.md` | Typography, palette, spacing, component primitives, verbatim demo copy |
| `bigdev/plans/05-DEMO-FLOW.md` | 2-minute arc, pre-staged seed data, fallback paths, recording plan |
| `bigdev/plans/06-DEPLOY-AND-ADMIN.md` | Publish flow, AdminCap operations, rollback, deploy targets |
| `bigdev/plans/07-TEST-PLAN.md` | Move tests, backend tests, e2e rehearsal, manual checklist |
| `bigdev/plans/08-ENV-AND-SECRETS.md` | Every env var, validation, secret handling rules |

When a phase touches UI, the build loop MUST also read `04-DESIGN-SYSTEM.md` and `05-DEMO-FLOW.md`. Treat them as binding.

## Build and run commands

From `packages/dusdc-faucet/`:

```bash
# Backend
cd backend && bun install && bun run db:push && bun dev      # http://localhost:3700

# Frontend (in a second terminal)
cd web && bun install && bun dev                              # http://localhost:3200

# Move tests
cd contracts/faucet && sui move test
cd contracts/test-dusdc && sui move test                     # passes by default, no logic

# Deploy (interactive)
bun run scripts/deploy.ts

# End-to-end rehearsal
bun run scripts/e2e-rehearsal.ts
```

Build / lint / typecheck per sub-package follows the starter scripts already wired in `backend/package.json` and `web/package.json`.

Validate the full stack with:

```bash
cd backend && bun test && bun run lint
cd web && bun run build && bun test
cd contracts/faucet && sui move test
```

## Key design decisions and why

- **Move package is generic over the quote coin type**. Publish once with the test DUSDC during rehearsal, again with the real DUSDC for the live demo. Same source, two deployments. No upgrade authority retained.
- **AdminCap is bound to a specific Faucet object id**. Stolen caps cannot control other deployments.
- **Contract is permissionless even when backend is down**. Backend Turnstile + IP/fingerprint limits are convenience; on-chain per-wallet daily cap is the actual security floor.
- **Stats cache, not chain-on-every-request**. A 15-second poll worker keeps `/stats` cheap. Cache stales after 60s, then refetches inline. If the cache is unavailable, frontend falls back to direct chain reads.
- **Postgres for rate limits, not Redis**. Backend starter already has Prisma + Postgres wired, no new infra. Testnet volume does not justify Redis.
- **dapp-kit, not Suiet**. Official Mysten SDK, broadest wallet support.
- **Dark-only, glass surfaces on an animated grain backdrop**. Black background, full-bleed `GrainGradient` (`@paper-design/shaders-react`) with the Suiperpower hero config, white text with `text-white/50` secondaries, `bg-white/5 + border-white/10 + backdrop-blur-md` glass cards, solid white pill primary. `motion/react` fade-in-blur entrance on first-fold elements. Visual language matches the Suiperpower hero; the page never mentions Suiperpower.

## Quality bar reference

- `bigdev/plans/04-DESIGN-SYSTEM.md`, every visible string + state, verbatim.
- `bigdev/plans/05-DEMO-FLOW.md`, the 2-minute arc the demo must hit.
- No Lorem ipsum, no `<placeholder>`, no `TODO:` in shipped code.
- Every screen with data renders empty, loading, error, skeleton, populated.
- Real fixture data for any list view.
- No marketing copy. No banned phrases (leverage, seamless, powerful, robust, cutting-edge). No em-dashes anywhere.
- No emojis in product copy.

## Mid-build steering

- Durable rules live in `bigdev/claude/requirements-log.md` (committed, read every iteration). Add with `./bigdev/autobuild say "your rule"`.
- One-shot transient corrections live in `bigdev/claude/inject.md` (gitignored, archived after use). Add with `./bigdev/autobuild fix "your message"`.
- If a durable rule belongs in this file or in a plan, the builder promotes it and appends `(promoted → <path>)` to the log entry.

## Credit and ownership

Footer reads: `made by Kelvin Adithya` with the name linking to `https://klvn.dev`. No other branding.

AdminCap stays in Kelvin's wallet until DeepBook accepts the handover, then is transferred via `faucet::transfer_admin`.

## What this project is NOT

- Not a webapp framework demo.
- Not a Sui Foundation product.
- Not associated with the surrounding Suiperpower project from a user-facing perspective; the page makes no reference to Suiperpower.
- Not a paid product. Open source, MIT.

## Cross-cutting rules

- Package manager is bun for backend and web. No npm, no yarn, no pnpm.
- Postgres: never run destructive Prisma commands. Tell the user to run `bun run db:push` themselves.
- Solana / EVM scaffolding from the bootstrap is removed in Phase 1; do not reintroduce.
- Tailwind v4 only (`@import "tailwindcss"`). Tailwind config v3 patterns will not work.
- HeroUI v3 only. Use the `@/ui/*` wrappers in `web/src/ui/` where available; fetch HeroUI v3 mdx docs directly before authoring against any HeroUI component without a wrapper.
- Commit author is Kelvin. Never add a `Co-Authored-By` line to any commit.

## Sub-project CLAUDE.md files

- `backend/CLAUDE.md`, Fastify routes, error handler, worker patterns
- `web/CLAUDE.md`, TanStack Start, HeroUI wrappers, env validation

Defer to those when working inside their respective folders.
