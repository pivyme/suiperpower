# 23. Skill router spec

## Why a router exists

Suiperpower has ~38 skills in v1. The AI picks one based on the user's natural-language message and the skill's `description:` frontmatter. That is mostly enough. It fails in three cases:

1. **Two skills overlap**, the AI picks the wrong one (e.g. `find-next-sui-idea` vs `validate-idea` when the user says "what should I build, validate this idea I have").
2. **The user used ambiguous wording** (e.g. "build" could mean scaffold, build-with-claude, or build-with-move).
3. **The skill that activated is too low-level** for the user's intent (e.g. `build-with-move` activated when the user actually wants `scaffold-project` because they have nothing yet).

The router is a shared file (`skills/SKILL_ROUTER.md`) every skill references at the bottom of its SKILL.md. The AI reads the router when:

- It is uncertain which skill to activate.
- The user explicitly says "this is the wrong skill, what should I be using."
- A skill's "When NOT to use" section points to the router.

## File location

`skills/SKILL_ROUTER.md`. Sits next to the phase folders. Loaded by every Claude / Codex / Cursor install through `~/.claude/skills/SKILL_ROUTER.md`, etc.

## Format

```markdown
# Skill Router

If the user asked X, the right skill is Y.

| User said | Right skill | Common wrong picks |
|---|---|---|
| "what should I build" | find-next-sui-idea | validate-idea, scaffold-project |
| "is this idea good" | validate-idea | find-next-sui-idea |
| ... | ... | ... |
```

Each row is a one-line piece of intent, the canonical correct skill, and the skills that the AI commonly mis-picks for that intent.

## Authoring rules

- Phrase intents in user voice ("I want to ship to mainnet", not "deployment intent").
- Right skill is exactly one (the primary). If two are equally correct, the row is ambiguous and needs splitting.
- Common wrong picks list 1-3 skills that the AI might pick instead. Keep it short.
- Add a row only when there is a real, observed routing failure (or a strong predicted one).
- Sort by phase (Learn → Idea → Build → Ship → Grow), then alphabetically within phase.
- Update when a skill is added that confuses an existing row.

## Full v1 router seed

The seed below covers every v1 skill at least once and addresses the most likely confusions. This is the file that ships with v1.

### Learn

| User said | Right skill | Common wrong picks |
|---|---|---|
| "I'm new to Sui, teach me" | sui-beginner | virtual-sui-incubator |
| "I'm coming from EVM, what's different on Sui" | sui-beginner | virtual-sui-incubator, find-next-sui-idea |
| "what have we figured out across this project" | learn | navigate-skills |
| "save what we learned today" | learn | navigate-skills |

### Idea

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

### Build (scaffold + build pair)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "scaffold my project" | scaffold-project | build-with-claude, build-with-move |
| "set up my workspace" | scaffold-project | build-with-claude |
| "what stack should I use" | scaffold-project | build-with-claude |
| "help me build the MVP" | build-with-claude | build-with-move, scaffold-project |
| "guide me through building this" | build-with-claude | scaffold-project |
| "deep dive into Sui internals" | virtual-sui-incubator | sui-beginner |
| "teach me Move and the object model" | virtual-sui-incubator | sui-beginner, build-with-move |

### Build (Move + objects + PTB)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "write a Move module" | build-with-move | scaffold-project |
| "add a function to my contract" | build-with-move | review-move |
| "compose a programmable transaction" | ptb-composer | build-with-move |
| "build a PTB" | ptb-composer | build-with-move |
| "design the object schema" | object-model-design | build-with-move |
| "owned vs shared object" | object-model-design | build-with-move |
| "capability pattern for X" | object-model-design | build-with-move |

### Build (sponsor integrations)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "store files on Walrus" | walrus-storage | scaffold-project |
| "integrate Walrus blob storage" | walrus-storage | walrus-research |
| "build on DeepBook" | deepbook-orderbook | deepbook-research |
| "create a market on DeepBook" | deepbook-orderbook | scaffold-project |
| "integrate Scallop" | scallop-money-market | scaffold-project |
| "borrow / lend on Sui" | scallop-money-market | scaffold-project |
| "use OpenZeppelin Sui libs" | openzeppelin-sui-libs | build-with-move |
| "secure primitives for Sui" | openzeppelin-sui-libs | review-move |
| "prepare for an audit" | ottersec-prep | review-move |
| "audit-ready checklist" | ottersec-prep | review-move |

### Build (auth + UX)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "add zkLogin" | sui-zk-login | scaffold-project |
| "Google / Apple sign-in for Sui" | sui-zk-login | scaffold-project |
| "sponsor user gas" | sponsored-transactions | sui-zk-login |
| "gasless transactions" | sponsored-transactions | sui-zk-login |
| "build a marketplace" | kiosk-marketplace | scaffold-project |
| "use the kiosk standard" | kiosk-marketplace | scaffold-project |
| "build a mobile Sui app" | build-mobile-sui | scaffold-project |
| "Sui Mobile SDK" | build-mobile-sui | scaffold-project |
| "launch a coin on Sui" | launch-coin | build-with-move |
| "create a Sui token" | launch-coin | build-with-move |
| "tokenomics" | launch-coin | validate-business-model |

### Build (debug + review)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "my Move package fails" | debug-move | build-with-move, review-move |
| "debug this Move error" | debug-move | review-move |
| "review my Move code" | review-move | debug-move, ottersec-prep |
| "audit my Move package" | review-move | ottersec-prep |

### Build (frontend + design)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "pick brand colors" | brand-design | design-taste |
| "name my product" | brand-design | find-next-sui-idea |
| "build a frontend" | frontend-design-guidelines | scaffold-project, build-with-claude |
| "design taste check" | design-taste | product-review |
| "this looks generic" | design-taste | product-review, roast-my-product |
| "format numbers in my UI" | number-formatting | frontend-design-guidelines |
| "fix my loading animations" | page-load-animations | frontend-design-guidelines |

### Build (anti-slop / quality)

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

### Build (meta)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "what skills are available" | navigate-skills | learn |
| "list skills" | navigate-skills | learn |

### Ship

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

### Grow (v1.1)

| User said | Right skill | Common wrong picks |
|---|---|---|
| "set up analytics" | analytics-baseline | retention-instrumentation |
| "measure user behavior" | analytics-baseline | retention-instrumentation |
| "instrument retention" | retention-instrumentation | analytics-baseline |
| "track returning users" | retention-instrumentation | analytics-baseline |
| "reach out to partners" | partnership-outreach | community-launch |
| "warm intro to other Sui projects" | partnership-outreach | community-launch |
| "launch in community" | community-launch | partnership-outreach |
| "post on X / Twitter / Sui Discord" | community-launch | partnership-outreach |

## Routing edge cases

### When two skills are both correct

Example: user says "build a perpetuals platform on DeepBook." Could fit `build-with-claude`, `deepbook-orderbook`, or `build-with-move`.

Convention: the most specific skill wins. `deepbook-orderbook` is the most specific (DeepBook-targeted), so it wins. After that skill's workflow completes, it can hand off to `build-with-move` if the user needs custom Move code beyond DeepBook integration.

### When no skill matches

Example: user says "explain Sui's consensus mechanism." None of our skills cover this directly.

Convention: the AI says "no skill in suiperpower covers that directly. The Sui knowledge base might have what you need, see `skills/data/sui-knowledge/01-what-and-why-sui.md`. Otherwise check docs.sui.io." Then offer to interview the user to identify a closer skill.

### When a skill activated by mistake

Example: user typed "build a marketplace" and `kiosk-marketplace` activated, but the user wanted to scaffold a marketplace project from scratch.

Convention: `kiosk-marketplace`'s "When NOT to use" section says "if the user has not scaffolded a project yet, use `scaffold-project` first." The skill detects the missing project and hands off.

### When the user references the wrong skill explicitly

Example: user types `/build-with-move` but actually wants to debug a deploy.

Convention: skill activates, but the workflow's "Context gathering" step detects the mismatch and offers to switch. The skill never silently does the wrong thing.

## Maintenance cadence

- **Per skill PR**: if adding a skill that overlaps with existing skills, add at least one router row. PR is rejected if the row is missing.
- **Quarterly**: a maintainer reads telemetry (which skills are invoked the most, which are silent), spot-checks for routing failures, and updates rows.
- **Pre-launch**: the router gets a full pass. Every row tested with a real Claude / Codex prompt to confirm the routing works.

## Telemetry support for the router

Telemetry tracks which skill activated and the user's first message (truncated, no PII; just whether trigger phrases matched). Over time we see:

- Skills that activate too often when the user wanted something else (description too greedy, needs tightening).
- Skills that almost never activate (description too narrow, needs broadening).
- Common user phrasings that the router does not cover yet (rows to add).

In v1.1 we expose a tiny "did this skill match what you wanted?" prompt at end of journeys, which feeds router refinement directly.

## Why a markdown router and not embedded routing logic

Two reasons:

1. **Transparency**. Anyone can read the routing table. Authors and reviewers know exactly when their skill should win.
2. **AI alignment**. The agents (Claude, Codex, Cursor) all read markdown context the same way. A code-based router would not be visible to the AI's decision making.

The downside is that the router can drift from skill descriptions. The lint at `21-TESTING-STRATEGY.md` flags rows that point to skills that do not exist.

## What is intentionally NOT in the router

- Generic "ask the user" fallbacks. The AI already does that without a row.
- Anti-pattern flagging (e.g. "if the user says X, refuse"). That belongs in the skill itself, not the router.
- Routing across phases. The router routes within the skill catalog. Phase progression is handled by `.suiperpower/<phase>-context.md` files.

## Sample skill reference to the router

Every SKILL.md ends with:

```markdown
If you activated this skill and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
```

This is the bridge that makes the router actually consulted.

## Origin and credit

The router pattern is adapted from `reference/solana-new-main/skills/SKILL_ROUTER.md`. Format and convention are directly inspired. The content (skill list, common confusions, sponsor-specific routing) is Sui-native.
