# 04. Skills catalog

## Phase model

Five phases. Skills auto-route by user intent, the user does not need to memorize phase names.

```
LEARN          IDEA                    BUILD                          SHIP                       GROW
─────          ──────                  ──────                         ──────                     ──────
sui-beginner   find-next-sui-idea      scaffold-project               deploy-to-testnet          analytics-baseline
learn          validate-idea           build-with-claude              deploy-to-mainnet          retention-instrumentation
               competitive-landscape   virtual-sui-incubator          pick-my-sui-track          partnership-outreach
               deepbook-research       build-with-move                submit-to-sui-overflow     community-launch
               walrus-research         ptb-composer                   create-pitch-deck
               overflow-copilot        object-model-design            marketing-video
                                       walrus-storage                 video-craft
                                       deepbook-orderbook             apply-grant
                                       scallop-money-market
                                       sui-zk-login
                                       sponsored-transactions
                                       kiosk-marketplace
                                       build-mobile-sui
                                       launch-coin
                                       debug-move
                                       review-move
                                       ottersec-prep
                                       openzeppelin-sui-libs
                                       brand-design
                                       frontend-design-guidelines
                                       number-formatting
                                       page-load-animations
                                       design-taste
                                       product-review
                                       roast-my-product
                                       validate-business-model
                                       retention-loop
                                       will-real-users-pay
                                       navigate-skills
```

Total v1 target: ~38 skills. Split: Learn 2, Idea 6, Build 24, Ship 8, Grow 4 (Grow ships v1.1 unless schedule allows).

## Trigger phrases

Each skill's `SKILL.md` `description:` field includes the phrases below so Claude / Codex / Cursor route correctly. The `SKILL_ROUTER.md` shared table allows the AI to auto-correct if the wrong skill activates.

### Learn

| Skill | Trigger phrases |
|---|---|
| `sui-beginner` | "I'm new to Sui, teach me", "explain Sui to me", "I'm coming from Solana / EVM, what's different on Sui" |
| `learn` | "what have we learned", "review my learnings", "save what we figured out" |

### Idea

| Skill | Trigger phrases |
|---|---|
| `find-next-sui-idea` | "what should I build on Sui", "give me a Sui startup idea", "what's a good Sui Overflow project" |
| `validate-idea` | "validate this idea", "is this a good idea", "stress-test my idea" |
| `competitive-landscape` | "who are my competitors", "what already exists for X on Sui", "is this whitespace" |
| `deepbook-research` | "what trading volume on DeepBook", "research orderbook activity", "find a market niche" |
| `walrus-research` | "what kinds of apps use Walrus", "show me Walrus storage examples" |
| `overflow-copilot` | "search Sui Overflow / past hackathon projects", "what won at last Sui Overflow" |

### Build

| Skill | Trigger phrases |
|---|---|
| `scaffold-project` | "scaffold my project", "set up my workspace", "what stack should I use on Sui" |
| `build-with-claude` | "help me build the MVP", "guide me through building this" |
| `virtual-sui-incubator` | "deep dive into Sui and Move", "teach me Sui internals" |
| `build-with-move` | "build a Move module", "write a Move package" |
| `ptb-composer` | "compose a programmable transaction", "build a PTB" |
| `object-model-design` | "design the object schema", "owned vs shared object", "capability pattern for X" |
| `walrus-storage` | "store files on Walrus", "integrate Walrus blob storage" |
| `deepbook-orderbook` | "build on DeepBook", "create a market on DeepBook" |
| `scallop-money-market` | "integrate Scallop", "borrow / lend on Sui" |
| `sui-zk-login` | "add zkLogin", "enable Google / Apple sign-in for Sui" |
| `sponsored-transactions` | "sponsor user gas", "gasless transactions on Sui" |
| `kiosk-marketplace` | "build a marketplace", "use the kiosk standard" |
| `build-mobile-sui` | "build a mobile Sui app", "Sui Mobile SDK" |
| `launch-coin` | "launch a coin on Sui", "create a Sui token", "tokenomics" |
| `debug-move` | "my Move package fails", "debug this Move error" |
| `review-move` | "review my Move code", "audit my Move package" |
| `ottersec-prep` | "prepare for OtterSec audit", "audit-ready checklist" |
| `openzeppelin-sui-libs` | "use OpenZeppelin Sui libraries", "secure primitives for Sui" |
| `brand-design` | "pick brand colors", "name my product" |
| `frontend-design-guidelines` | "build a frontend", "design taste check" |
| `number-formatting` | "format numbers in my UI" |
| `page-load-animations` | "fix my loading animations" |
| `design-taste` | "this looks generic / not premium" |
| `product-review` | "review my product UX" |
| `roast-my-product` | "roast my product", "be brutal" |
| `validate-business-model` | "what's my business model", "how will this make money" |
| `retention-loop` | "what's my retention loop", "why will users come back" |
| `will-real-users-pay` | "will users pay for this", "willingness to pay check" |
| `navigate-skills` | "what skills are available", "list skills" |

### Ship

| Skill | Trigger phrases |
|---|---|
| `deploy-to-testnet` | "deploy to testnet", "publish to Sui testnet" |
| `deploy-to-mainnet` | "deploy to mainnet", "ship it to production" |
| `pick-my-sui-track` | "which Overflow track fits", "which sponsor track should I pick" |
| `submit-to-sui-overflow` | "submit to Sui Overflow", "prepare hackathon submission" |
| `create-pitch-deck` | "create a pitch deck", "investor deck" |
| `marketing-video` | "make a marketing video", "create a promo video" |
| `video-craft` | "improve my video frames", "polish my demo video" |
| `apply-grant` | "apply for a Sui Foundation grant" |

### Grow (v1.1, post-hackathon polish)

| Skill | Trigger phrases |
|---|---|
| `analytics-baseline` | "set up analytics", "measure user behavior" |
| `retention-instrumentation` | "instrument retention", "track returning users" |
| `partnership-outreach` | "reach out to partners", "warm intro to other Sui projects" |
| `community-launch` | "launch in community", "post on X / Twitter / Sui Discord" |

## Sui-unique skills, the differentiating set

These are the skills that do not 1:1 port from solana-new. They define why Suiperpower is not just a fork.

| Skill | Why Sui-only |
|---|---|
| `build-with-move` | Move is Sui's contract language, fundamentally different from Anchor / Rust accounts |
| `ptb-composer` | PTBs are a Sui-native execution primitive with no Solana analog |
| `object-model-design` | Sui's object model (owned vs shared, capabilities) replaces Solana's account model |
| `walrus-storage` | Walrus is Sui's native blob storage, the headline sponsor of Overflow 2026 |
| `deepbook-orderbook` | DeepBook is Sui's native CLOB, an Overflow track sponsor |
| `scallop-money-market` | Scallop is the largest Sui money market, university award sponsor |
| `sui-zk-login` | zkLogin is Sui's social login primitive, no Solana equivalent |
| `sponsored-transactions` | Sui's sponsored tx pattern, no native Solana equivalent |
| `kiosk-marketplace` | Sui's standard marketplace primitive, replaces custom programs on Solana |
| `ottersec-prep` | OtterSec is an Overflow prize sponsor, audit-prep checklist they care about |
| `openzeppelin-sui-libs` | OpenZeppelin's Sui libraries (separate from their EVM/Solana work), prize sponsor |
| `pick-my-sui-track` | Maps a project to one of Overflow's tracks (sponsor + thematic) |
| `submit-to-sui-overflow` | Auto-fills deepsurge.xyz submission with package-id, media, copy |
| `overflow-copilot` | Past Sui hackathon winner pattern search (analog to colosseum-copilot) |

## Anti-slop quality skills

These exist specifically to push back on slop. They are first-class build-phase skills, not optional after-thoughts.

| Skill | Mechanism |
|---|---|
| `validate-business-model` | Walks user through revenue model, unit economics, why-real-users-pay |
| `retention-loop` | Forces user to articulate the loop that brings users back week 2 |
| `will-real-users-pay` | Pricing experiments, willingness-to-pay interview script |
| `roast-my-product` | Brutal critique, finds the obvious flaws before users do |
| `product-review` | Balanced UX evaluation with concrete next-step roadmap |
| `review-move` | Code review for Move quality, security, production readiness |

Every build skill embeds a "survives-past-hackathon" gate that links to one or more of these. Detail in `12-ANTI-SLOP-FRAMEWORK.md`.

## Hackathon submission skills

| Skill | Output |
|---|---|
| `pick-my-sui-track` | Recommends a single track based on what the project actually does, with reasoning. Tags secondary track if applicable. |
| `submit-to-sui-overflow` | Captures package-id from `sui client publish`, validates 1280x1280 logo, generates 1920x1080 media set, drafts deepsurge.xyz form copy, generates demo video script, runs day-of preflight |

Detail in `10-HACKATHON-SUBMISSION.md`.

## Frontend / design skills

These mirror solana-new's design skills (which are framework-agnostic) but get Sui examples in their references.

| Skill | What it does |
|---|---|
| `brand-design` | Picks colors, typography, name |
| `frontend-design-guidelines` | Tasteful frontend defaults |
| `number-formatting` | Token amount, USD, percentage formatting (Sui-native helpers) |
| `page-load-animations` | First-paint and skeleton animations |
| `design-taste` | Critique and fix when something looks generic |

## Skill-to-knowledge-base routing

Skills reference knowledge docs under `skills/data/sui-knowledge/` by relative path. Convention:

- `build-with-move` references `03-move-and-objects.md`
- `walrus-storage` references `sponsor-docs/walrus.md`
- `deepbook-orderbook` references `sponsor-docs/deepbook.md`
- `ottersec-prep` references `sponsor-docs/ottersec-checklist.md` and `guides/security-checklist.md`

This keeps skill prompts short while giving the AI rich context on demand.

## Catalog format on the website

`suiperpower.dev/skills/` renders the table above grouped by phase, each row links to the skill's `SKILL.md` source on GitHub. Same pattern as solana-new's catalog page. Spec in `14-WEBSITE-STRUCTURE.md`.

## Skills NOT in v1

Explicitly out of scope for v1 to keep launch tight:

- `build-data-pipeline` (indexer-specific, niche, ship in v1.1)
- `verify-humanity-poh` (no Sui equivalent of POH service today)
- `cso` (security audit), folded into `review-move` + `ottersec-prep` for v1
- `solana-beginner` (obvious)

These are tracked in `18-ROADMAP.md` for v1.1 / v2 consideration.
