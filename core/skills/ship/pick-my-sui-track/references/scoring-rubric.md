# Scoring rubric per track

Evidence-based scoring. The score is a claim about the codebase and demo flow, not about intent or marketing copy.

The eleven tracks scored here are the official Sui Overflow 2026 tracks (3 core, 8 specialized). If the page at https://overflow.sui.io changes mid-cycle, re-verify before recommending.

## Agentic Web

The track is "autonomous AI agents that can act, transact, and coordinate using Sui's object model and composability."

- 0: no agent in the project. A chatbot UI on top of static logic does not count.
- 1: an agent exists but only generates text or makes off-chain suggestions. No on-chain action.
- 2: the agent triggers at least one on-chain action in the demo, but the action is a single one-shot call, not a loop. The agent layer is real but secondary to the main feature.
- 3: the agent autonomously plans, acts, and re-acts on chain in the demo. Sui's object model and composability are used (e.g. agent-owned objects, capabilities passed between agents, agent-to-agent coordination via PTBs). Removing the agent loop removes the product.

Edge case: a project where "AI agents are a real but secondary feature, with the core being verifiable decentralized storage" is a 2 on Agentic Web and likely a 3 on Walrus. Per the organizers' guidance, that project is welcome to submit under Walrus.

## DeFi & Payments

The track is "financial primitives or payment rails on Sui that are fast, seamless, and usable in real-world scenarios."

- 0: no financial primitive, no payment flow.
- 1: a payment field in a form, but no real on-chain value movement. Or a yield number displayed from a static source.
- 2: value moves on chain in the demo, but the project is a thin wrapper over an existing primitive without a real composition or new use case.
- 3: the demo executes a non-trivial financial flow end to end (lending, AMM swap, payment with settlement, RWA transfer, etc.) and the project's reason to exist is that flow. The flow uses real Sui mechanics (Coin, Object, capabilities), not just stablecoin transfers.

Edge case: a project that uses Coin transfers as a side feature (e.g. a tipping button on a content app) is not DeFi & Payments; it scores 1 here at most.

## Walrus

The track is "applications that handle large, off-chain, or verifiable data" via Walrus.

- 0: no `walrus` imports, no SDK calls, no blob ids in the project.
- 1: a `walrus` reference in a README or `Move.toml`, but no calls.
- 2: at least one store or read call exists, but the demo would still work without it (e.g. images served from a CDN with Walrus as a fallback).
- 3: a stored blob is retrieved and rendered in the user-visible demo flow. Removing Walrus breaks the demo. The data being stored is non-trivial (real media, real verifiable artifacts), not a placeholder JSON blob.

## DeepBook

The track is "trading or liquidity applications powered by DeepBook's on-chain orderbook."

- 0: no DeepBook imports, no SDK calls.
- 1: a DeepBook reference in docs, no calls.
- 2: an order is placed but never settled in the demo, or DeepBook is used for read-only price discovery only.
- 3: at least one real testnet order is placed and settled in the demo, and the project's value depends on it (a market maker, a derivative venue, a routing layer, etc.).

## Infra & DevX

The track is "improve the builder experience: tooling, SDKs, indexers, and infrastructure that make Sui easier to build on."

- 0: the project is an application, not a tool or infrastructure component.
- 1: the project has a CLI or library but it wraps a single RPC call with no added value over the raw SDK.
- 2: a real developer tool exists (indexer, SDK extension, testing framework, deployment pipeline), but it duplicates existing Sui tooling without a meaningful improvement.
- 3: the project is a developer tool, SDK, indexer, or infrastructure component that solves a real builder pain point. Removing it means other developers lose a capability they cannot easily replicate with existing tools. The demo shows another developer (or the team itself) using the tool in a real workflow.

Edge case: a project that builds a DeFi app and also publishes a small utility library is not Infra & DevX. The utility is a byproduct, not the product. Score 1 at most.

## ONE Championship

The track is "consumer-facing apps in sports, entertainment, fan engagement, gaming, or NFTs, with a focus on ONE Championship and combat sports."

- 0: no sports, entertainment, or fan engagement component.
- 1: a vague "sports" label in the README with no real fan-facing feature.
- 2: a real fan engagement, ticketing, collectible, or sports data feature exists, but it is generic and not tied to ONE Championship's ecosystem or combat sports.
- 3: the demo shows a working fan engagement, collectible, prediction, or sports media experience. The project is designed for the ONE Championship audience or combat sports fans. Removing the sports/fan layer removes the product.

Edge case: a generic NFT marketplace that includes "sports collectibles" as one of many categories is a 1 here. The project must be built around sports or entertainment as its core value.

## EVE Frontier

The track is "Smart Assembly mods, tools, or experiences for EVE Frontier."

- 0: no connection to EVE Frontier.
- 1: mentions EVE in docs but no actual Smart Assembly integration or EVE-specific code.
- 2: some EVE Frontier interaction exists (reads game state, uses Smart Assemblies), but the project would work as a standalone tool without EVE context.
- 3: the project is a Smart Assembly mod, an EVE Frontier game tool, or an experience that only makes sense inside the EVE Frontier ecosystem. Removing EVE Frontier removes the product.

Edge case: a general blockchain analytics tool that happens to index EVE Frontier data is a 2 at most. The project must be built for EVE players or the EVE economy.

## Degen

The track covers "meme launches, gamified trading, bonding curves, viral degen culture."

- 0: no meme, gamified trading, or degen culture component.
- 1: the project has a meme token or degen theme in branding only, with no on-chain mechanic.
- 2: a bonding curve, meme token factory, or gamified trading feature exists, but it is a side feature in a broader DeFi product.
- 3: the project's core mechanic is a meme launch, bonding curve, gamified trading experience, or viral social trading loop. The demo shows the degen mechanic working end to end. Removing it removes the product.

Edge case: a serious DeFi protocol with a "fun mode" or meme skin is not Degen. The degen mechanic must be the product, not the wrapper.

## Payments & Wallets

The track is "wallet UX, payment rails, sponsored transactions."

- 0: no wallet or payment infrastructure.
- 1: the project uses a standard wallet connection (e.g. @mysten/dapp-kit) without innovating on wallet UX or payment flow.
- 2: a real wallet feature or payment rail exists (gas sponsorship, payment splitting, paylink), but it is a minor feature in a larger app.
- 3: the project is a wallet, a payment rail, or a transaction sponsorship layer. The demo shows end users paying, receiving, or interacting through the wallet/payment UX. Removing the payment/wallet layer removes the product.

Edge case: a DeFi protocol that accepts payments is not Payments & Wallets. This track is about the payment/wallet infrastructure itself, not apps that accept payments. Note the overlap with DeFi & Payments: if the project is a financial primitive (AMM, lending), score it under DeFi & Payments. If the project is payment infrastructure (wallet, paylink, sponsored tx layer), score it here.

## Entertainment & Culture

The track is "NFTs, gaming, social, consumer culture apps."

- 0: no entertainment, gaming, social, or culture component.
- 1: the project mints NFTs as a side feature (e.g. achievement badges) but is not a consumer entertainment product.
- 2: a real gaming, social, or NFT experience exists, but the on-chain part is thin (e.g. off-chain game with on-chain leaderboard only).
- 3: the project is a game, social app, NFT platform, or cultural experience where Sui is load-bearing in the user flow. The demo shows a consumer interacting with the product in a way that depends on Sui (object ownership, Kiosk, composable NFTs, on-chain game state). Removing the Sui layer removes the experience.

Edge case: overlap with ONE Championship is possible. If the entertainment is specifically sports/combat-sports/fan-engagement, score it under ONE Championship. If it is gaming, social, or cultural entertainment outside of sports, score it here.

## Explorations

The track covers "RWA, DePIN, multi-chain, novel experiments."

- 0: the project fits cleanly into one of the other ten tracks.
- 1: the project mentions RWA, DePIN, or multi-chain in docs but the implementation is standard DeFi or infra.
- 2: a real RWA tokenization, DePIN device integration, or cross-chain bridge exists, but it is proof-of-concept-only and the demo is thin.
- 3: the project is a real-world asset tokenization, DePIN network, cross-chain protocol, or genuinely novel Sui experiment that does not fit the other ten tracks. The demo shows the novel mechanic working end to end.

Edge case: this is the catch-all track. Only recommend it when the project genuinely does not fit any of the ten specific tracks. If a project could plausibly score 3 in another track, that other track is a better fit than Explorations.

## How to assign a score

For each of the eleven tracks, do all three:

1. Read the demo flow end to end. Identify the user-visible value.
2. For integration-specific tracks (Walrus, DeepBook, EVE Frontier, ONE Championship): search the codebase for imports and call sites. Trace which calls run in the demo path.
3. For theme-based tracks (Agentic Web, DeFi & Payments, Infra & DevX, Degen, Payments & Wallets, Entertainment & Culture, Explorations): trace what actually happens on chain in the demo. Score on what runs, not what the README claims.

When in doubt, score lower. The cost of overstating a score is a track recommendation that does not match what the judges will see in the demo.

## Edge case: project fits two tracks at 3

Per the official policy, only one track can be selected. Use `idea-context.md` to find the user-visible value and pick the track that matches that value. The other track is mentioned in the writeup as a strong secondary fit, but the user is told they must choose one.

## Edge case: no track scores 3

Name the highest-scoring track from all eleven and the concrete change needed to upgrade it to 3. Do not bless a 2 as a submission-ready pick. The user can still submit under the team-prerogative policy; the skill is opinionated about what counts as a real fit, not a gate on the submission button.

## Edge case: overlap between specialized tracks

Some projects could plausibly fit multiple specialized tracks (e.g. a payment app could be Payments & Wallets or DeFi & Payments; a sports game could be ONE Championship or Entertainment & Culture). Score all tracks honestly, then recommend the one where the fit is deepest and most specific. A project that fits a narrow track at 3 is better served there than in a broad track where it competes with a wider field.
