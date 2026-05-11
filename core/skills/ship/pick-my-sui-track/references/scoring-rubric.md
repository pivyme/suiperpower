# Scoring rubric per track

Evidence-based scoring. The score is a claim about the codebase and demo flow, not about intent or marketing copy.

The four tracks scored here are the official Sui Overflow 2026 tracks. If the page at https://overflow.sui.io changes mid-cycle, re-verify before recommending.

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

## How to assign a score

For each track, do all three:

1. Read the demo flow end to end. Identify the user-visible value.
2. For Walrus / DeepBook tracks: search the codebase for imports and call sites. Trace which calls run in the demo path.
3. For Agentic Web / DeFi & Payments tracks: trace what actually happens on chain in the demo. Score on what runs, not what the README claims.

When in doubt, score lower. The cost of overstating a score is a track recommendation that does not match what the judges will see in the demo.

## Edge case: project fits two tracks at 3

Per the official policy, only one track can be selected. Use `idea-context.md` to find the user-visible value and pick the track that matches that value. The other track is mentioned in the writeup as a strong secondary fit, but the user is told they must choose one.

## Edge case: no track scores 3

Name the highest-scoring track and the concrete change needed to upgrade it to 3. Do not bless a 2 as a submission-ready pick. The user can still submit under the team-prerogative policy; the skill is opinionated about what counts as a real fit, not a gate on the submission button.
