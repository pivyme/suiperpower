# Non-Sui-native rejection list

Idea shapes that are better fits for EVM or Solana than for Sui. Reject (or downgrade to score 2 or below on Sui-native fit) unless the user has a specific reason to insist.

## EVM is the better home

- Generic "ERC-20 utility token + dapp" plays. Sui's coin standard is excellent, but the network effects, infrastructure, exchange listings, and tooling depth around EVM ERC-20 still dominate. Pick Sui only if the product needs Sui-specific primitives.
- Account-abstraction-heavy infra. Sui's account model is different (Object-centric) and AA-style abstractions on Sui look different from EVM patterns. Building "an EVM AA smart wallet on Sui" usually means fighting the model.
- Cross-EVM aggregator products. Sui is one chain among many; the aggregator-of-EVMs lives on EVM rails.
- Permit / EIP-2612 / signature-meta-transaction infra. The mental model maps poorly onto Sui's transaction structure.
- Rollup or L2 plays. Sui is a monolithic L1; nothing about it is "rollup-shaped".

## Solana is the better home

- Ultra-high-frequency trading bots that depend on extremely tight RPC latency to a small set of validators. Sui has good performance, but the trading-bot ecosystem and infrastructure depth on Solana is the moat there.
- Compressed NFT mass-mint use cases that depend on Solana's compressed-NFT primitive. Sui's Object model is different and competes with Display + Kiosk; cNFT-equivalent designs need a redesign.
- Memecoin launchpads. Solana has the venue and the audience; Sui builders should pick more durable consumer plays.
- Wallet UX experiments that depend on Solana-specific signing patterns (e.g. some SQF / RTL-mev integrations). Sui has its own signing model.
- Realtime feed products that depend on Solana's slot model.

## Off-chain is the better home

- Pure non-blockchain SaaS with a "decentralization" sticker. If the on-chain logic is a vestigial token contract, ship without the chain.
- Identity and KYC products that need server-side custody by default. Sui has zkLogin which fits some flows, but full KYC stacks still need centralized vendors and custody; the "on Sui" framing adds complexity without value.
- Database-replacement plays. Walrus is for blob storage with availability guarantees, not "decentralized Postgres". Pitch carefully.
- Generic "on-chain analytics dashboard". Better as a centralized indexer that reads Sui RPC and serves a website.

## What this list is NOT

This is not a "Sui cannot do X" list. Sui can technically do most of the above. It is a "Sui is not the smart bet for X" list. New builders compete on bets where the chain choice creates an advantage; do not start by fighting against the chain's strengths.

## Override conditions

A candidate from the rejection list can still be the right pick when:

- The user has a specific Sui-native angle (e.g. they want to build a memecoin launchpad on Sui because they will use Walrus for media and Kiosk for transferable allocations, both Sui-native primitives).
- The user is migrating an existing product from EVM or Solana to Sui for a real reason (existing audience moving, regulatory, partnership).
- The user is the rare builder whose competitive moat is taste and execution, not technical fit.

In all override cases, ask the user to name the angle in one sentence. If they cannot, the rejection stands.
