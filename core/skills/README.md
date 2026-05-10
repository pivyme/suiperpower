# Suiperpower skills

The full v1 skill catalog, grouped by phase. Every entry links to the canonical `SKILL.md`. For routing across overlapping intents, see `SKILL_ROUTER.md`.

Skill format and authoring rules: `plans/05-SKILL-FORMAT.md`. Quality bar: `plans/12-ANTI-SLOP-FRAMEWORK.md`. Voice: `plans/15-BRAND.md`.

## Two install paths

The recommended install is the curl one-liner. It writes every skill to all three agent dirs and sets up doctor / update / uninstall:

```
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

If you only want one or two specific skills, install them a la carte through the [skills.sh](https://skills.sh) CLI. Identifiers resolve as GitHub shorthand:

```
npx skills add kwekKwek/suiperpower/skills/build/build-with-move
```

Both paths land the same SKILL.md plus `references/` and `agents/openai.yaml`. The curl flow additionally installs the `suiperpower` and `suiper` CLI bins, the ecosystem catalog, and the doctor / update commands. See `plans/03-INSTALL-FLOW.md` for details.

## Learn

Orientation skills. Use these first if the user is new to Sui or wants to capture session state.

| Skill | One-liner |
|---|---|
| [sui-beginner](learn/sui-beginner/SKILL.md) | Teach Sui from scratch with explicit EVM and Solana translation passes. |
| [learn](learn/learn/SKILL.md) | Capture session learnings to `.suiperpower/learnings.md` per the phase-handoff spec. |

## Idea

What to build, and is it any good. Run before the build phase to lock the scope.

| Skill | One-liner |
|---|---|
| [find-next-sui-idea](idea/find-next-sui-idea/SKILL.md) | Pick a Sui project to build, scored against the user's fit and the ecosystem gaps. |
| [validate-idea](idea/validate-idea/SKILL.md) | Stress-test an idea with go or no-go output. |
| [competitive-landscape](idea/competitive-landscape/SKILL.md) | Map who already builds something close, with an honest moat read. |
| [deepbook-research](idea/deepbook-research/SKILL.md) | Query DeepBook trading activity to find market niches. |
| [walrus-research](idea/walrus-research/SKILL.md) | Survey what kinds of apps use Walrus and where the gaps are. |
| [overflow-copilot](idea/overflow-copilot/SKILL.md) | Search past Sui Overflow projects for patterns and gaps. |

## Build

Everything from scaffold to debug. Ordered roughly the way a build flows.

### Scaffold and pair-build

| Skill | One-liner |
|---|---|
| [scaffold-project](build/scaffold-project/SKILL.md) | Set up the workspace with the right Sui stack and write the initial `build-context.md`. |
| [build-with-claude](build/build-with-claude/SKILL.md) | Multi-step pair programming with quality gates per sub-step. |
| [virtual-sui-incubator](build/virtual-sui-incubator/SKILL.md) | Deep-dive teaching skill for Sui internals. |

### Move, objects, and PTBs

| Skill | One-liner |
|---|---|
| [build-with-move](build/build-with-move/SKILL.md) | Author a Move module end to end, the canonical sample skill. |
| [ptb-composer](build/ptb-composer/SKILL.md) | Compose a Programmable Transaction Block that compiles and dry-runs. |
| [object-model-design](build/object-model-design/SKILL.md) | Design the object schema, owned vs shared vs immutable, with rationale per object. |

### Sponsor integrations

| Skill | One-liner |
|---|---|
| [walrus-storage](build/walrus-storage/SKILL.md) | Store and retrieve blobs on Walrus, with the demo actually rendering a stored blob. |
| [deepbook-orderbook](build/deepbook-orderbook/SKILL.md) | Build a market on DeepBook, with a real testnet order placed and settled. |
| [scallop-money-market](build/scallop-money-market/SKILL.md) | Deposit, borrow, and repay against a live Scallop pool. |
| [openzeppelin-sui-libs](build/openzeppelin-sui-libs/SKILL.md) | Identify hand-rolled patterns OZ Sui replaces. |
| [ottersec-prep](build/ottersec-prep/SKILL.md) | Walk the OtterSec checklist, every P0 item has a recorded answer. |

### Auth and UX

| Skill | One-liner |
|---|---|
| [sui-zk-login](build/sui-zk-login/SKILL.md) | Add zkLogin with a real OAuth provider end to end. |
| [sponsored-transactions](build/sponsored-transactions/SKILL.md) | Sponsor user gas with a real sponsor flow, not stubbed signing. |
| [kiosk-marketplace](build/kiosk-marketplace/SKILL.md) | Full Kiosk listing and purchase flow. |
| [build-mobile-sui](build/build-mobile-sui/SKILL.md) | Sui Mobile SDK integration grounded in the rpc-wallet guide. |
| [launch-coin](build/launch-coin/SKILL.md) | Launch a Sui Move coin with proper TreasuryCap handling. |

### Debug and review

| Skill | One-liner |
|---|---|
| [debug-move](build/debug-move/SKILL.md) | Debug compile errors, runtime errors, and capability leakage. |
| [review-move](build/review-move/SKILL.md) | P0 to P3 review pass with OZ migration suggestions. |

### Frontend and design

| Skill | One-liner |
|---|---|
| [brand-design](build/brand-design/SKILL.md) | Pick color, typography, and a name that does not blend in. |
| [frontend-design-guidelines](build/frontend-design-guidelines/SKILL.md) | Apply the Suiperpower frontend guidelines to a real component. |
| [number-formatting](build/number-formatting/SKILL.md) | Sui-native number helpers including MIST conversion. |
| [page-load-animations](build/page-load-animations/SKILL.md) | Pacing rules for first-paint and route transition animations. |
| [design-taste](build/design-taste/SKILL.md) | A taste check for "this looks generic". |

### Anti-slop quality

| Skill | One-liner |
|---|---|
| [validate-business-model](build/validate-business-model/SKILL.md) | Force five concrete answers about who pays, how much, and why. |
| [retention-loop](build/retention-loop/SKILL.md) | Day 1, 2, 7, 30 anchors in a single-paragraph loop. |
| [will-real-users-pay](build/will-real-users-pay/SKILL.md) | Run a cheap pricing experiment that produces a real signal. |
| [roast-my-product](build/roast-my-product/SKILL.md) | Brutal critique with a numbered weakness list and top-three to fix. |
| [product-review](build/product-review/SKILL.md) | Balanced UX review with a prioritized roadmap. |

### Meta

| Skill | One-liner |
|---|---|
| [navigate-skills](build/navigate-skills/SKILL.md) | List what is available, reads `cli/data/sui-skills.json`. |

## Ship

Deploy, submit, pitch. Each ship skill has a writeback that downstream skills consume.

| Skill | One-liner |
|---|---|
| [deploy-to-testnet](ship/deploy-to-testnet/SKILL.md) | Publish to testnet, capture package id and upgrade cap, write `deploy-context.md`. |
| [deploy-to-mainnet](ship/deploy-to-mainnet/SKILL.md) | Publish to mainnet only after the anti-slop gates clear. |
| [pick-my-sui-track](ship/pick-my-sui-track/SKILL.md) | Score sponsor integrations 0 to 3, recommend a primary track only at score 3. |
| [submit-to-sui-overflow](ship/submit-to-sui-overflow/SKILL.md) | Drive the deepsurge.xyz submission, day-of preflight included. |
| [create-pitch-deck](ship/create-pitch-deck/SKILL.md) | 10-slide deck draft grounded in the project's context files. |
| [marketing-video](ship/marketing-video/SKILL.md) | Plan a 30 to 60 second product marketing video. |
| [video-craft](ship/video-craft/SKILL.md) | Polish frame-level pacing, captions, color, and audio for a video draft. |
| [apply-grant](ship/apply-grant/SKILL.md) | Draft a Sui Foundation grant with verifiable deliverables and a real sustainability plan. |

## Grow (v1.1)

Post-launch skills are tracked in `plans/04-SKILLS-CATALOG.md` and routed by `SKILL_ROUTER.md`. They ship in v1.1, after the core idea-to-ship loop is validated.

## How skills work together

- The `.suiperpower/` folder in each user project holds context files that skills read and append. The shape is in `skills/data/specs/phase-handoff.md`.
- A skill never overwrites another skill's section. Append-only is enforced by spec.
- Skills hand off via the router (`SKILL_ROUTER.md`) when the user's intent does not match the active skill.
- The shared knowledge base sits under `skills/data/sui-knowledge/`. Shared procedural guides sit under `skills/data/guides/`. Curated idea sources sit under `skills/data/ideas/`.

## Authoring a new skill

1. Read `plans/05-SKILL-FORMAT.md` and `plans/22-SAMPLE-SKILL.md`.
2. Use `scripts/inject-preamble.ts` for the telemetry preamble. Hand-edits to the preamble block are forbidden.
3. End the SKILL.md with: "If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off."
4. Add at least one router row in `SKILL_ROUTER.md` if the new skill overlaps with an existing one.
5. Run `pnpm preamble:check` and (once available) `pnpm lint:skills`.
