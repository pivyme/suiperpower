# 28. Competitive landscape

## Why this doc exists

Suiperpower is not the only thing serving Sui developers. Honest positioning requires understanding what else exists, where we overlap, where we differentiate, and where we should cooperate instead of compete.

This doc surveys the landscape as of mid-2026. It is updated when significant new entrants emerge.

## Categories of "competitors"

Sui dev tooling falls into several categories. Suiperpower sits in one (CLI + skills bundle), but adjacent categories matter for positioning.

| Category | Examples | Our overlap |
|---|---|---|
| Sui Foundation tooling | sui CLI, dapp-kit, examples | None (we recommend their tools, do not replace) |
| Project scaffolds | Mysten templates, individual project starters | Light overlap on scaffolding intent |
| AI coding agents | Claude Code, Codex, Cursor, Aider | We sit on top of these, do not replace |
| Skill marketplaces | Anthropic skills, Cursor rules library | Light overlap; we ship Sui-specific skills |
| Hackathon helpers | Generic Devpost guides, AI-as-a-tool tutorials | Heavy overlap on hackathon prep specifically |
| Web3-focused dev tools | Foundry (EVM), Anchor (Solana), Solana Agent Kit | Conceptual cousin for Sui |
| Sponsor SDKs | Walrus SDK, DeepBook SDK, Scallop SDK | We integrate, do not replace |
| Knowledge bases | Sui docs, Move book, sponsor docs | We distill for AI consumption, do not replace |

## Direct comparisons

### vs solana-new (the inspiration)

solana-new is the closest analog. We are explicit about that.

| Dimension | solana-new | Suiperpower |
|---|---|---|
| Chain | Solana | Sui |
| Primitives focus | Account model, PDAs, Anchor | Object model, capabilities, PTBs, Move |
| Storage default | None / IPFS opt-in | Walrus first-class |
| Auth | Wallet adapter | zkLogin, sponsored tx |
| Marketplace | Custom programs | Kiosk standard |
| Anti-slop | Implicit (roast-my-product, product-review) | Explicit, gates baked into every build skill |
| Hackathon submission | Generic /submit-to-hackathon | /submit-to-sui-overflow with deepsurge.xyz integration, package-id capture, sponsor-track recommender |
| Multi-agent | Claude + Codex | Claude + Codex + Cursor |
| Backend | Convex telemetry + feedback | Convex telemetry + feedback (same shape) |
| Origin | SendAI / Superteam | Independent maintainer |

We adopted the format and the discipline; we built the content from the chain up. Suiperpower is not a fork.

Cooperation: we credit solana-new in our README. If solana-new ships a feature that fits Sui, we adapt it. If we ship a feature that fits Solana, we cross-PR.

### vs Sui Foundation tooling

Sui Foundation ships:

- The Sui CLI (`sui`)
- Mysten dapp-kit
- Official examples
- docs.sui.io
- Sui Mobile SDK

We do NOT compete with any of these. We:

- Tell users to install the Sui CLI
- Use dapp-kit by default in our scaffold
- Reference Mysten examples in our catalog
- Link to docs.sui.io throughout our knowledge base
- Use the Sui Mobile SDK in our `build-mobile-sui` skill

If the Sui Foundation later ships their own opinionated CLI for builders, we do one of two things:

1. Integrate (theirs is the layer below ours; we add the journey on top)
2. Defer (if theirs covers what we cover, we narrow scope to what is left)

We do not pre-announce a competition with Foundation tooling. We wait, see what they ship, and adapt.

### vs project scaffolds (Mysten templates, individual starters)

Mysten ships scaffolds (e.g. `mystenlabs/sui-examples`). Many community projects also have starter repos.

We do NOT replace scaffolds. We recommend them. `scaffold-project` skill picks from our catalog of clonable repos (which includes Mysten and community starters), then adds the Suiperpower-specific journey context on top.

A user can use scaffolds without us. A user using us still benefits from scaffolds.

### vs AI coding agents

Claude Code, Codex, Cursor, Aider, Goose, Continue.dev. These are the platforms we sit on top of.

We do NOT replace them. We extend them with Sui-specific skills.

If a new agent emerges, we add support (per `09-MULTI-AGENT-PARITY.md`).

We do not become an agent. We do not host LLMs. We are a content package, the user brings the agent.

### vs skill marketplaces (Anthropic skills, Cursor rules library)

Anthropic ships some default skills. Cursor users share rules informally.

We are a curated, opinionated, Sui-specific bundle. The skills you get from Suiperpower are designed to compose, share context, and route to each other. A random Cursor rule from the internet does not have that.

If Anthropic ships an official Sui skills bundle (they have not as of mid-2026), we either:

1. Cooperate (offer ours as an extension)
2. Continue independently (ours is more opinionated, more anti-slop, more Sui-Overflow-aware)

### vs hackathon helpers (generic AI tutorials, Devpost guides)

There are countless "how to win a hackathon with AI" tutorials. Most are generic.

We are Sui-specific, deepsurge.xyz-aware, sponsor-track-aware, and anti-slop-aware. A generic AI tutorial cannot do that.

We do not view generic helpers as competitors; they serve a different audience.

### vs Foundry / Anchor / Solana Agent Kit

These are chain-specific developer toolkits:

- **Foundry** (EVM): a Rust-based test + deploy + script suite
- **Anchor** (Solana): a Rust framework on top of the Solana program model
- **Solana Agent Kit**: AI agent toolkit for Solana

Conceptually, Suiperpower is the Sui equivalent of "the toolkit a serious builder reaches for first." Mechanically, we are different (we ship skills + knowledge + catalog, not a framework).

A Sui equivalent of Anchor (a Move framework) would not compete with us; we would integrate it (recommend it in `scaffold-project`).

### vs sponsor SDKs

Walrus SDK, DeepBook SDK, Scallop SDK, Enoki, etc.

These are upstream of us. We integrate, document, and distribute knowledge about them. We do not replace them.

We expect sponsors to maintain their SDKs; we maintain our knowledge docs that pair with them. Quarterly cadence syncs.

### vs Sui knowledge bases

Sui docs (docs.sui.io), the Move book, individual blog posts and tutorials.

We do NOT replicate these. Our knowledge base is distilled-for-AI: shorter, denser, with explicit pointers to upstream for depth. A user reading Sui docs is closer to mastery than one reading our distillation. A user pairing with an AI is faster with our distillation than with the full docs.

## Adjacent ecosystems

### Aptos and Move ecosystems beyond Sui

Aptos is a Move chain. Some Move skills could conceptually transfer.

We are Sui-specific. Sui Move differs from Aptos Move in non-trivial ways (object model, capabilities, init function semantics). A user trying to use our Move skills on Aptos will hit friction.

Cooperation possibility: cross-credit, point Aptos users to a hypothetical Aptos equivalent if one emerges.

### Cosmos and other parallel-execution chains

Cosmos chains, Monad, Sei, etc. share some architectural ideas with Sui (parallel execution, smart accounts).

We are not competing; different chains, different ecosystems. If a "monad-new" or "sei-new" emerges, we would view it as a sibling project.

## What we are not

- A Sui Foundation product
- A SaaS
- A hosted service
- A token-launch platform
- A grant program
- An accelerator (we facilitate building, we do not invest)

Being clear about what we are not helps positioning conversations.

## Differentiators (sustained advantages)

What separates Suiperpower from anything else, today and ongoing:

1. **Anti-slop framework as a first-class product feature.** Every build skill embeds a quality gate. Other tools ship features; we ship discipline.
2. **Sui-Overflow-aware submission generator.** Built around deepsurge.xyz, package-id verification, sponsor-track integration depth scoring. No other tool does this for Sui.
3. **Multi-agent parity from day one.** Claude + Codex + Cursor at install time. Single-agent tools have a smaller audience.
4. **Sponsor integrations as load-bearing skills.** Walrus / DeepBook / Scallop / OZ / OtterSec all get first-class skills, not a wrapper.
5. **Curated idea corpus tagged for Sui.** 150+ ideas with `fitForSui:` rationales. Generic AI suggestions are not the same.
6. **Markdown skills, transparent.** Anyone can read every skill before invoking. Black-box prompts erode trust over time.
7. **Telemetry opt-in, anonymous, schema public.** Users can verify what we collect.
8. **Free, MIT, no paid tier.** Aligned with how Sui Foundation positions Overflow ("for builders worldwide").

A competitor would have to replicate most of these to displace us. Even one (curated Sui-idea corpus) is several weeks of work to recreate.

## Where we are vulnerable

We are honest about our weak spots:

- **Single-maintainer in v1.** A skilled team could out-ship us in features.
- **No formal Sui Foundation endorsement.** A foundation-backed competing tool would have higher trust.
- **Knowledge base is shallow at v1.** A competitor with deep, authoritative Move documentation could beat us on the educational side.
- **No paid support.** Teams that want SLA support cannot get it from us; they will use a different tool.
- **No hosted dashboard.** Teams that want a web-app experience prefer hosted alternatives.

How we offset:

- We move fast on contributions (catalog rows in 48h, skills in a week)
- We are transparent (the lack of foundation backing is documented openly)
- We grow knowledge base via community PRs and sponsor reviews
- For SLA support, we point to OtterSec / Mysten / sponsor consulting; we are infrastructure, not consultancy
- For dashboards, we say "no, the CLI is the product"; users who insist will fork or move on

## Cooperation strategy

We default to cooperation, not competition.

| If they ship... | We will... |
|---|---|
| A better Move skill | Adopt it (PR welcome), credit them |
| A better Walrus example repo | Add it to our catalog |
| A better Sui Foundation skill bundle | Defer or integrate |
| A competing CLI | Wait and see; if their thing is genuinely better, we narrow scope |
| A paid version of similar tooling | Stay free; our differentiation is integrity |
| A Sui-specific MCP server | Add to our catalog |
| A proprietary fork of us | Fine; we are MIT |

The Sui ecosystem is big enough for multiple tools. We do not need to win the only-tool position; we need to be the default for serious builders.

## Specific named competitors (as of mid-2026)

This list is updated as the landscape evolves. Names below are illustrative and may not exist; the categories are the load-bearing part.

- **Mysten internal AI tooling** (if released): would be authoritative; we would integrate
- **Walrus official skill bundle** (if released): we already coordinate; we would adopt their skills under our `cli/data/sui-skills.json`
- **DeepBook integration kit** (if released): same, we adopt and credit
- **A community-driven "sui-helper" CLI** (hypothetical): we would observe; if it filled a different niche, peace; if it overlapped, see "If they ship a competing CLI" above
- **An EVM-to-Sui translator skill bundle** (likely emerges): orthogonal, we would link reciprocally

## Risk: a Sui Foundation skill bundle launches similar to ours

This is the highest-impact risk because it would have native trust we lack.

Plan:

1. Reach out before they ship if possible (informal channels)
2. Position as complementary if they ship: their bundle is primitives + chain knowledge; ours is journey + anti-slop + hackathon submission
3. Adopt their skills as PRs into ours where they fit
4. Recommend their bundle in our docs if it covers ground we do not
5. If their bundle is comprehensively better, we narrow our scope to the journey + anti-slop layer

We do not view Sui Foundation tooling as a threat in the way a competitor would; their goal and ours are aligned.

## Risk: solana-new pivots to "all chains"

If solana-new generalizes to be a multi-chain skills bundle, they could absorb the Sui niche.

Plan:

1. Stay focused. Sui-native primitives (Move, objects, PTBs, Walrus, etc.) require deep specialization that a multi-chain tool struggles to maintain.
2. Cooperate. We credit them; they credit us; cross-references work.
3. If a Sui builder genuinely uses solana-new for Sui work, we treat that as evidence we have failed and scrutinize.

## Risk: AI agents themselves get better at Sui without skills

Claude / Codex / Cursor improve rapidly. At some point, they may know enough about Sui that a skills bundle is unnecessary.

Plan:

1. Watch the trend. If skill activation rates drop, that is signal.
2. Anti-slop discipline is hard for general-purpose agents to replicate; we keep that the load-bearing differentiator.
3. Our knowledge base is current and Sui-specific; the agent's training data is older and chain-agnostic.
4. If we become unnecessary, we sunset gracefully. We are infrastructure, not a business.

## Positioning summary

Suiperpower is for Sui builders who want to ship products that survive past the hackathon. We sit on top of AI coding agents, integrate sponsor tech as load-bearing skills, distill Sui knowledge for AI consumption, and force quality conversations through anti-slop gates.

We are not the only Sui dev tool. We are the one that takes the journey from idea to submission seriously, end to end, with the discipline that separates a real product from a prize-grabber.

If a builder asks "what should I install on day one to ship for Sui Overflow 2026," we want to be the answer. If a Sui Foundation tool is the right answer instead, we point at it. If both are needed, we coexist.

## How this doc gets used

- Reference for the founder during sponsor and Foundation conversations
- Source for "why Suiperpower vs X" FAQ on the website
- Updated quarterly during the maintainer retro
- Read by new maintainers as part of onboarding
