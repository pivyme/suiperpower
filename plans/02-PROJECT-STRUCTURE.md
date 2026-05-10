# 02. Project structure

## Repo layout

Single GitHub repo, pnpm workspace. The shape mirrors solana-new where the patterns transfer directly, diverges where Sui needs different content.

```
suiperpower/
├── README.md                       GitHub-facing readme
├── CLAUDE.md                       AI agent context for working on Suiperpower itself
├── AGENTS.md                       Codex / generic-agent context
├── LICENSE                         MIT
├── CONTRIBUTING.md                 How to add a skill, repo, MCP, knowledge entry
├── package.json                    Workspace root, name "suiperpower" (npm bin)
├── pnpm-workspace.yaml             Lists cli/, convex/ as workspaces
├── pnpm-lock.yaml
├── tsconfig.json                   Shared TS config (strict, ESM, NodeNext)
├── vercel.json                     Website deployment (host setup.sh + catalog browser)
├── .env.example                    CONVEX_URL placeholder
├── .gitignore                      node_modules, dist, .env, .suiperpower/
├── .npmignore                      excludes website assets, dev configs
├── setup                           First-time install convenience (calls install.sh)
├── install.sh                      The bash script users curl
├── suiperpower-pass.sh             Local dev helper, mirrors solana-pass.sh
├── skills-lock.json                Manifest of installed skill versions for `update`
│
├── cli/                            CLI source, TypeScript ESM
│   ├── index.ts                    Command dispatcher, main entry
│   ├── branding.ts                 Single source of truth for all brand strings
│   ├── init.ts                     Auto-install skills to all detected agent dirs
│   ├── doctor.ts                   Environment health check
│   ├── update-check.ts             Version drift warning on every command
│   ├── uninstall.ts                Remove skills + config
│   ├── feedback.ts                 Submit feedback via Convex
│   ├── telemetry.ts                Skill usage tracking (Convex + local jsonl)
│   ├── repos.ts                    `suiperpower repos` command
│   ├── completion.ts               Shell completion for bash/zsh
│   ├── colors.ts                   Terminal color helpers
│   ├── banner.ts                   ASCII banner (suiperpower ascii art)
│   ├── interactive-onboarding.ts   First-run onboarding TUI
│   ├── interactive-search.ts       `suiperpower search` TUI
│   ├── interactive-skills.ts       `suiperpower skills` TUI
│   ├── interactive-mcps.ts         `suiperpower mcps` TUI
│   ├── interactive-journey.ts      Guided journey walker
│   ├── interactive-universal.ts    Shared TUI primitives
│   ├── workspace-setup.ts          Project workspace bootstrap
│   ├── agent-cli.ts                Detect / install Claude / Codex / Cursor CLIs
│   ├── copilot-auth.ts             Optional, GH Copilot integration if user wants it
│   ├── copilot-client.ts           ↑ HTTP client
│   └── data/                       Catalog data (read by skills + CLI)
│       ├── clonable-repos.json     Sui ecosystem repos with one-line desc, license, tags
│       ├── sui-skills.json         Sui ecosystem-published skills (Walrus, DeepBook, etc.)
│       ├── sui-mcps.json           MCP servers usable for Sui dev
│       └── sui-ideas.json          Curated idea pool (sources in 16-CONTENT-PLAN.md)
│
├── skills/                         All journey skills + shared data, plain markdown
│   ├── README.md                   Catalog overview
│   ├── SKILL_ROUTER.md             Shared routing table for AI to auto-correct skill picks
│   ├── learn/                      Learn phase
│   │   ├── sui-beginner/
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   └── agents/openai.yaml
│   │   └── learn/
│   ├── idea/                       Idea phase
│   │   ├── find-next-sui-idea/
│   │   ├── validate-idea/
│   │   ├── competitive-landscape/
│   │   ├── deepbook-research/
│   │   ├── walrus-research/
│   │   └── overflow-copilot/
│   ├── build/                      Build phase
│   │   ├── scaffold-project/
│   │   ├── build-with-claude/
│   │   ├── virtual-sui-incubator/
│   │   ├── build-with-move/
│   │   ├── ptb-composer/
│   │   ├── object-model-design/
│   │   ├── walrus-storage/
│   │   ├── deepbook-orderbook/
│   │   ├── scallop-money-market/
│   │   ├── sui-zk-login/
│   │   ├── sponsored-transactions/
│   │   ├── kiosk-marketplace/
│   │   ├── build-mobile-sui/
│   │   ├── launch-coin/
│   │   ├── debug-move/
│   │   ├── review-move/
│   │   ├── ottersec-prep/
│   │   ├── openzeppelin-sui-libs/
│   │   ├── brand-design/
│   │   ├── frontend-design-guidelines/
│   │   ├── number-formatting/
│   │   ├── page-load-animations/
│   │   ├── design-taste/
│   │   ├── product-review/
│   │   ├── roast-my-product/
│   │   ├── validate-business-model/
│   │   ├── retention-loop/
│   │   ├── will-real-users-pay/
│   │   └── navigate-skills/
│   ├── ship/                       Ship phase
│   │   ├── deploy-to-testnet/
│   │   ├── deploy-to-mainnet/
│   │   ├── pick-my-sui-track/
│   │   ├── submit-to-sui-overflow/
│   │   ├── create-pitch-deck/
│   │   ├── marketing-video/
│   │   ├── video-craft/
│   │   └── apply-grant/
│   ├── grow/                       Grow phase, post-launch
│   │   ├── analytics-baseline/
│   │   ├── retention-instrumentation/
│   │   ├── partnership-outreach/
│   │   └── community-launch/
│   └── data/                       Shared data (knowledge, guides, ideas, specs)
│       ├── sui-knowledge/
│       │   ├── 01-what-and-why-sui.md
│       │   ├── 02-what-makes-sui-unique.md
│       │   ├── 03-move-and-objects.md
│       │   ├── 04-protocols-and-sdks.md
│       │   ├── 05-app-layer-and-consumer.md
│       │   ├── 06-opensource-research.md
│       │   ├── cookbook-index.md
│       │   └── sponsor-docs/
│       │       ├── walrus.md
│       │       ├── deepbook.md
│       │       ├── scallop.md
│       │       ├── openzeppelin-sui.md
│       │       └── ottersec-checklist.md
│       ├── guides/
│       │   ├── rpc-wallet-guide.md
│       │   ├── deploy-runbook.md
│       │   ├── security-checklist.md
│       │   ├── package-id-capture.md
│       │   └── deepsurge-submission.md
│       ├── ideas/
│       │   ├── a16z-state-of-crypto-2026.json
│       │   ├── yc-rfs-crypto.json
│       │   ├── alliance-ideas.json
│       │   └── sui-native-gaps.json     (curated by us, see 16-CONTENT-PLAN.md)
│       └── specs/
│           └── phase-handoff.md          contract for .suiperpower/<phase>-context.md
│
├── convex/                         Backend (telemetry + feedback)
│   ├── schema.ts
│   ├── telemetry.ts                track mutation + queries
│   └── feedback.ts                 submit mutation
│
├── public/                         Static assets served by Vercel
│   ├── setup.sh                    The install script (curl target)
│   ├── suiperpower-logo.svg
│   └── og-image.png
│
├── scripts/                        Build / release tooling
│   ├── publish.ts                  Pre-publish checks, version sync
│   └── generate-cursor-rules.ts    Convert SKILL.md → .mdc for Cursor install
│
└── plans/                          (this folder, source-of-truth planning docs)
    ├── 00-OVERVIEW.md
    ├── 01-ARCHITECTURE.md
    ├── 02-PROJECT-STRUCTURE.md     ← you are here
    └── ...
```

## Conventions

- **ESM only.** All imports use `.js` extensions, NodeNext module resolution.
- **Strict TypeScript.** No implicit any.
- **Zero runtime deps for the CLI.** Only devDependencies (tsx, typescript, @types/node) plus Convex client. The CLI is small, fast to install, audit-friendly.
- **Single source of truth for branding.** Every brand string (name, tagline, install URL, telemetry config dir) lives in `cli/branding.ts`. Never hardcoded elsewhere.
- **Skills are plain markdown.** No code generation. A user can read any skill end-to-end before invoking it. Transparency is part of the trust model.
- **Knowledge base is plain markdown.** Same reason.
- **Catalog data is JSON.** Easy to diff, easy to PR, easy to render on the website.
- **No telemetry on first run.** User must opt in. Default tier on opt-in is `anonymous`.
- **Skills handoff via filesystem.** `.suiperpower/<phase>-context.md` in the user's project. No global state, no DB.

## How additions slot in

| Adding | Touches |
|---|---|
| New skill | `skills/<phase>/<name>/SKILL.md` + optional `references/` + `agents/openai.yaml`, then add row to `skills/README.md` and `cli/data/sui-skills.json` if catalog-listed |
| New ecosystem repo | One row in `cli/data/clonable-repos.json` |
| New MCP | One row in `cli/data/sui-mcps.json` |
| New knowledge doc | New file under `skills/data/sui-knowledge/`, link from `cookbook-index.md` |
| New idea source | New JSON in `skills/data/ideas/`, list in `16-CONTENT-PLAN.md` |
| New CLI command | New file under `cli/`, register in `cli/index.ts` |
| New phase (e.g. `funding/`) | New folder under `skills/`, update `SKILL_ROUTER.md` and `cli/index.ts` help text |

Adding a skill is the most common operation. Target time-to-PR: under 10 minutes for someone who has done it before.

## Naming rules

- Skill folder names: kebab-case, verb-led where possible (`build-with-move`, not `move-builder`).
- Skill IDs in `SKILL.md` frontmatter `name:` field: must equal the folder name.
- Catalog JSON keys: kebab-case for IDs, lowercase for filenames.
- Knowledge docs: numbered prefix `01-`, `02-` for ordering. Sponsor docs un-prefixed under `sponsor-docs/`.
- CLI files: kebab-case TypeScript (`agent-cli.ts`, `interactive-onboarding.ts`).

## Minimum viable repo

If we had to launch with the smallest possible footprint:

- `cli/` (init + doctor + branding only)
- `skills/idea/find-next-sui-idea/`
- `skills/build/scaffold-project/`
- `skills/build/build-with-claude/`
- `skills/build/build-with-move/`
- `skills/ship/deploy-to-testnet/`
- `skills/ship/submit-to-sui-overflow/`
- `skills/data/sui-knowledge/03-move-and-objects.md`
- `skills/data/guides/deploy-runbook.md`
- `skills/data/guides/deepsurge-submission.md`
- `cli/data/clonable-repos.json` (10 entries)
- `install.sh`
- `public/setup.sh`
- `README.md`

That is the seven-day-launch fallback if the full v1 scope slips. The full v1 list (everything in the tree above except `grow/` skills, which are post-hackathon) is the target.
