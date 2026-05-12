# Skill Router

If the user asked X, the right skill is Y. If your skill activated and the user actually wants something else, find the right row below and hand off.

The router is the bridge between the user's natural-language intent and the skill catalog. Use it when:

- You are uncertain which skill should activate.
- The user explicitly says "this is the wrong skill, what should I be using".
- A skill's "When NOT to use" section pointed you here.

Format: each row is a piece of intent in the user's voice, the canonical right skill, and the skills the AI commonly mis-picks for that intent.

## Learn

| User said | Right skill | Common wrong picks |
|---|---|---|
| "I'm new to Sui, teach me" | sui-beginner | virtual-sui-incubator |
| "I'm coming from EVM, what's different on Sui" | sui-beginner | virtual-sui-incubator, find-next-sui-idea |
| "I'm coming from Solana, what's different on Sui" | sui-beginner | virtual-sui-incubator |
| "what have we figured out across this project" | learn | navigate-skills |
| "save what we learned today" | learn | navigate-skills |
| "wrap up this session" | learn | navigate-skills |

## Idea

| User said | Right skill | Common wrong picks |
|---|---|---|
| "what should I build on Sui" | find-next-sui-idea | validate-idea, scaffold-project |
| "give me a Sui startup idea" | find-next-sui-idea | validate-idea |
| "what's a good Sui Overflow project" | find-next-sui-idea | overflow-copilot, pick-my-sui-track |
| "I have an idea, is it good" | validate-idea | find-next-sui-idea, will-real-users-pay |
| "stress-test my idea" | validate-idea | roast-my-product |
| "who are my competitors" | competitive-landscape | validate-idea |
| "what already exists for X on Sui" | competitive-landscape | find-next-sui-idea |
| "what's trading on DeepBook" | deepbook-research | deepbook-orderbook |
| "find a Sui DeFi market gap" | deepbook-research | competitive-landscape |
| "what kinds of apps use Walrus" | walrus-research | walrus-storage |
| "search past Sui Overflow projects" | overflow-copilot | find-next-sui-idea |
| "what won at Sui Overflow last year" | overflow-copilot | find-next-sui-idea |
| "DeFi research on Sui" | defillama-sui | competitive-landscape |
| "Sui TVL analysis" | defillama-sui | competitive-landscape |
| "what DeFi to build on Sui" | defillama-sui | find-next-sui-idea |
| "DefiLlama data" | defillama-sui | competitive-landscape |

## Build, scaffold and pair-build

| User said | Right skill | Common wrong picks |
|---|---|---|
| "scaffold my project" | scaffold-project | build-with-claude, build-with-move |
| "set up my workspace" | scaffold-project | build-with-claude |
| "what stack should I use" | scaffold-project | build-with-claude |
| "help me build the MVP" | build-with-claude | build-with-move, scaffold-project |
| "guide me through building this" | build-with-claude | scaffold-project |
| "deep dive into Sui internals" | virtual-sui-incubator | sui-beginner |
| "teach me Move and the object model" | virtual-sui-incubator | sui-beginner, build-with-move |

## Build, Move + objects + PTB

| User said | Right skill | Common wrong picks |
|---|---|---|
| "write a Move module" | build-with-move | scaffold-project |
| "add a function to my contract" | build-with-move | review-move |
| "compose a programmable transaction" | ptb-composer | build-with-move |
| "build a PTB" | ptb-composer | build-with-move |
| "design the object schema" | object-model-design | build-with-move |
| "owned vs shared object" | object-model-design | build-with-move |
| "capability pattern for X" | object-model-design | build-with-move |

## Build, sponsor integrations

| User said | Right skill | Common wrong picks |
|---|---|---|
| "store files on Walrus" | walrus-storage | scaffold-project |
| "integrate Walrus blob storage" | walrus-storage | walrus-research |
| "build on DeepBook" | deepbook-orderbook | deepbook-research |
| "create a market on DeepBook" | deepbook-orderbook | scaffold-project |
| "integrate Scallop" | scallop-money-market | scaffold-project |
| "borrow / lend on Sui" | scallop-money-market | navi-lending |
| "swap on Cetus" | cetus-swap | deepbook-orderbook |
| "Cetus integration" | cetus-swap | deepbook-orderbook |
| "AMM on Sui" | cetus-swap | deepbook-orderbook |
| "concentrated liquidity on Sui" | cetus-swap | deepbook-orderbook |
| "DEX swap on Sui" | cetus-swap | deepbook-orderbook |
| "NAVI lending" | navi-lending | scallop-money-market |
| "borrow on NAVI" | navi-lending | scallop-money-market |
| "lend on NAVI" | navi-lending | scallop-money-market |
| "flash loan on Sui" | navi-lending | scallop-money-market |
| "NAVI Protocol integration" | navi-lending | scallop-money-market |
| "lending protocol on Sui" | navi-lending | scallop-money-market, deepbook-orderbook |
| "encrypt data on Sui" | seal-access-control | build-with-move |
| "access control with Seal" | seal-access-control | build-with-move |
| "threshold encryption" | seal-access-control | build-with-move |
| "add a price feed" | pyth-oracle | build-with-move |
| "integrate Pyth oracle" | pyth-oracle | build-with-move, deepbook-orderbook |
| "get token price on-chain" | pyth-oracle | deepbook-research |
| "build an AI agent on Sui" | build-ai-agent | build-with-claude, scaffold-project |
| "autonomous agent wallet" | build-ai-agent | sui-zk-login, sponsored-transactions |
| "agent with PTBs" | build-ai-agent | ptb-composer |
| "off-chain compute on Sui" | nautilus-offchain | build-with-move |
| "TEE on Sui" | nautilus-offchain | build-ai-agent |
| "Nautilus enclave" | nautilus-offchain | build-with-move |
| "register a .sui name" | suins-integration | scaffold-project |
| "SuiNS name resolution" | suins-integration | scaffold-project |
| "MVR package naming" | suins-integration | build-with-move |
| "host on Walrus" | walrus-sites | walrus-storage |
| "deploy static site to Sui" | walrus-sites | walrus-storage, deploy-to-mainnet |
| "Walrus Sites hosting" | walrus-sites | walrus-storage |
| "use OpenZeppelin Sui libs" | openzeppelin-sui-libs | build-with-move |
| "secure primitives for Sui" | openzeppelin-sui-libs | review-move |
| "prepare for an audit" | ottersec-prep | review-move |
| "audit-ready checklist" | ottersec-prep | review-move |

## Build, auth and UX

| User said | Right skill | Common wrong picks |
|---|---|---|
| "add zkLogin" | sui-zk-login | scaffold-project |
| "Google or Apple sign-in for Sui" | sui-zk-login | scaffold-project |
| "sponsor user gas" | sponsored-transactions | sui-zk-login |
| "gasless transactions" | sponsored-transactions | sui-zk-login |
| "build a marketplace" | kiosk-marketplace | scaffold-project |
| "use the kiosk standard" | kiosk-marketplace | scaffold-project |
| "build a mobile Sui app" | build-mobile-sui | scaffold-project |
| "Sui Mobile SDK" | build-mobile-sui | scaffold-project |
| "launch a coin on Sui" | launch-coin | build-with-move |
| "create a Sui token" | launch-coin | build-with-move |
| "tokenomics" | launch-coin | validate-business-model |

## Build, debug and review

| User said | Right skill | Common wrong picks |
|---|---|---|
| "my Move package fails" | debug-move | build-with-move, review-move |
| "debug this Move error" | debug-move | review-move |
| "review my Move code" | review-move | debug-move, ottersec-prep |
| "audit my Move package" | review-move | ottersec-prep |
| "security audit my app" | cso | review-move, ottersec-prep |
| "infrastructure security" | cso | review-move |
| "OWASP check" | cso | review-move |
| "threat model" | cso | review-move |
| "index Sui data" | build-data-pipeline | build-with-claude |
| "query Sui events" | build-data-pipeline | build-with-move |
| "build an indexer" | build-data-pipeline | build-with-claude |
| "GraphQL on Sui" | build-data-pipeline | build-with-claude |
| "EVE Frontier mod" | eve-frontier | scaffold-project |
| "Smart Assembly" | eve-frontier | build-with-move |
| "EVE hackathon" | eve-frontier | scaffold-project |

## Build, frontend and design

| User said | Right skill | Common wrong picks |
|---|---|---|
| "pick brand colors" | brand-design | design-taste |
| "name my product" | brand-design | find-next-sui-idea |
| "build a frontend" | frontend-design-guidelines | scaffold-project, build-with-claude |
| "design taste check" | design-taste | product-review |
| "this looks generic" | design-taste | product-review, roast-my-product |
| "format numbers in my UI" | number-formatting | frontend-design-guidelines |
| "fix my loading animations" | page-load-animations | frontend-design-guidelines |

## Build, anti-slop quality

| User said | Right skill | Common wrong picks |
|---|---|---|
| "review my product UX" | product-review | design-taste, roast-my-product |
| "roast my product" | roast-my-product | product-review |
| "be brutal" | roast-my-product | product-review |
| "what's my business model" | validate-business-model | validate-idea |
| "how will this make money" | validate-business-model | will-real-users-pay |
| "what's my retention loop" | retention-loop | validate-business-model |
| "why will users come back" | retention-loop | validate-business-model |
| "will users pay for this" | will-real-users-pay | validate-business-model |
| "willingness to pay check" | will-real-users-pay | validate-business-model |

## Build, meta

| User said | Right skill | Common wrong picks |
|---|---|---|
| "what skills are available" | navigate-skills | learn |
| "list skills" | navigate-skills | learn |

## Ship

| User said | Right skill | Common wrong picks |
|---|---|---|
| "deploy to testnet" | deploy-to-testnet | scaffold-project |
| "publish to Sui testnet" | deploy-to-testnet | scaffold-project |
| "deploy to mainnet" | deploy-to-mainnet | deploy-to-testnet |
| "ship it to production" | deploy-to-mainnet | deploy-to-testnet |
| "which Overflow track fits" | pick-my-sui-track | submit-to-sui-overflow |
| "which sponsor track should I pick" | pick-my-sui-track | submit-to-sui-overflow |
| "submit to Sui Overflow" | submit-to-sui-overflow | pick-my-sui-track, deploy-to-mainnet |
| "prepare hackathon submission" | submit-to-sui-overflow | create-pitch-deck |
| "create a pitch deck" | create-pitch-deck | submit-to-sui-overflow |
| "investor deck" | create-pitch-deck | submit-to-sui-overflow |
| "make a marketing video" | marketing-video | video-craft |
| "create a promo video" | marketing-video | video-craft |
| "improve my video frames" | video-craft | marketing-video |
| "polish my demo video" | video-craft | marketing-video |
| "apply for a Sui Foundation grant" | apply-grant | create-pitch-deck |

## Grow (v1.1)

These skills are not yet shipped in v1. Rows are present so the router does not silently mis-route once the skills land.

| User said | Right skill | Common wrong picks |
|---|---|---|
| "set up analytics" | analytics-baseline | retention-instrumentation |
| "measure user behavior" | analytics-baseline | retention-instrumentation |
| "instrument retention" | retention-instrumentation | analytics-baseline |
| "track returning users" | retention-instrumentation | analytics-baseline |
| "reach out to partners" | partnership-outreach | community-launch |
| "warm intro to other Sui projects" | partnership-outreach | community-launch |
| "launch in community" | community-launch | partnership-outreach |
| "post on X or Sui Discord" | community-launch | partnership-outreach |

## Routing edge cases

### When two skills are both correct

The most specific skill wins. Example: "build a perpetuals platform on DeepBook" fits `build-with-claude`, `deepbook-orderbook`, and `build-with-move`. `deepbook-orderbook` is the most specific (DeepBook-targeted), so it wins. After that skill's workflow completes, it hands off to `build-with-move` for any custom Move code beyond DeepBook integration.

### When no skill matches

If the user's intent does not map to any row, do not pick a "close-enough" skill. Say:

> No skill in suiperpower covers that directly. The Sui knowledge base might have what you need: see `skills/data/sui-knowledge/01-what-and-why-sui.md`. Otherwise check docs.sui.io.

Then offer to interview the user to identify a closer skill.

### When a skill activated by mistake

The skill's "When NOT to use" section flags the case and points back to this router. Hand off cleanly. Do not silently do the wrong thing.

### When the user references the wrong skill explicitly

If the user types `/build-with-move` but actually wants to debug a deploy, the skill activates, then its "Inputs" or "Context gathering" step detects the mismatch and offers to switch. The skill never silently does the wrong thing.

## Maintenance

- Per skill PR: if adding a skill that overlaps with existing skills, add at least one router row. PR is rejected if the row is missing.
- Quarterly: read telemetry, spot-check routing failures, refresh rows.
- Pre-launch: full pass with real Claude / Codex / Cursor prompts confirming routing.

## What is intentionally NOT in the router

- Generic "ask the user" fallbacks. The AI does that without a row.
- Anti-pattern flagging ("if user says X, refuse"). That belongs in the skill itself.
- Phase progression. That is handled by `.suiperpower/<phase>-context.md` files.
