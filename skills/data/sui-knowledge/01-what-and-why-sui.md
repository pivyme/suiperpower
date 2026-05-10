# 01. What Sui is and why it exists

> Audience: someone deciding whether Sui is the right substrate for the thing they want to build. This is the honest pitch, not the marketing one.

## What Sui is, in one paragraph

Sui is a layer-1 blockchain built around an object-centric data model and parallel transaction execution. Smart contracts are written in Move, a resource-oriented language originally designed at Meta for the Diem project and substantially rewritten for Sui. State on Sui is not a flat key-value table; it is a graph of typed Objects, each owned by an address, a parent Object, or marked as shared. The execution layer parallelizes transactions whose Object access sets do not collide. The validator set runs Mysticeti consensus, a DAG-based protocol that achieves sub-second finality under normal load. Mainnet launched in May 2023.

## Why Sui exists

Two design problems shaped Sui:

1. **State contention is the bottleneck on monolithic chains.** Most EVM L1s and L2s serialize transactions and pay throughput cost when traffic spikes on hot contracts. Sui's object model lets the scheduler see, ahead of execution, exactly which Objects a transaction touches. Independent transactions execute in parallel without coordination.
2. **Custody and permissions are awkward in account-based models.** On EVM and Solana, "ownership" is implicit. A token is yours because a contract's storage maps your address to a balance. Sui flips this: the token is a typed Object whose owner field is your address. Move's resource semantics enforce non-duplication and non-loss at the type-system level. You cannot accidentally double-spend a Sui Object; the language refuses to compile.

The trade-off Sui made is that you carry a different mental model. Object-oriented thinking transfers cleanly from OO programming languages, but EVM and Solana developers will have to relearn how state is laid out.

## When Sui is the right pick

Pick Sui when:

- **The product is asset-centric.** NFTs, in-game items, tickets, real-world-asset tokenization. Sui's Object model treats each asset as a first-class citizen with typed metadata and explicit owner.
- **You want consumer UX as a feature.** Sponsored transactions remove gas fees from the user's first interaction. zkLogin lets users log in with Google, Apple, or other OIDC providers and get a Sui address derived from their credential, no seed phrase required.
- **Parallel throughput matters.** Apps with many independent users acting simultaneously (gaming, marketplaces, social) benefit from Sui's parallel execution. Hot single-shared-Object contracts do not.
- **You want a typed Move package.** Move's strict typing catches whole classes of bugs at compile time that Solidity and Rust catch at runtime, if they catch them at all. For high-stakes value flows, the upfront cost of learning Move pays off.
- **DeepBook fits your design.** If you are building a CLOB-based exchange or a market-making product, DeepBook is a native shared central limit orderbook. There is no equivalent on EVM.
- **Walrus storage is load-bearing.** If your app stores large blobs (datasets, images, audio) and wants verifiable retrieval tied to on-chain commitments, Walrus is the only chain-native option that fits cleanly.

## When Sui is the wrong pick

Be honest:

- **EVM ecosystem reach is the dominant constraint.** If your users live in MetaMask and Rabby, if your product needs deep integration with existing EVM DeFi, if you depend on bridges to Ethereum stablecoin liquidity, the integration cost on Sui is real. Bridged USDC and Wormhole exist, but DeFi composability with Aave and Uniswap clones is not the same as composability with native EVM versions.
- **You are forking an existing EVM project.** Solidity to Move is not a port, it is a rewrite. Estimate accordingly.
- **Your team has zero crypto experience and your product does not need crypto.** Sui will not save you here. The Move learning curve matters.
- **Solana's parallel-transaction model already serves you.** Sui's parallelism is not magically better than Solana's; the underlying advantage is mostly the Object model, not the throughput numbers. If you have a Solana product that works, the case to migrate is weak unless you specifically need Move's type system or one of Sui's unique primitives (Walrus, DeepBook, Kiosk).
- **You need maximum decentralization at validator level today.** Sui has a strong validator set, but the chain is younger than Ethereum. If validator-count-and-stake-distribution is a procurement gate, do that diligence.

## Status check (network health)

Check current network state before staking design decisions on it:

- **Mainnet block time and finality**: target sub-second; verify against `https://status.sui.io` and Mysten's public dashboards.
- **Validator count**: typically 100+ active. Mysten Labs runs a subset; the rest are independent.
- **Active addresses and tx volume**: visible on Suiscan and Mysten's analytics. Use trends, not snapshots.
- **Stablecoin TVL on Sui**: USDC is native via Circle; USDT was bridged at the time of writing. Check the live numbers if your product depends on stablecoin depth.

## Where to go next

- For the deeper "what makes it different" walk: `02-what-makes-sui-unique.md`.
- For the Move primer: `03-move-and-objects.md`.
- For protocol and SDK choices when you build: `04-protocols-and-sdks.md`.

Last updated: 2026-05-10. Targeting Sui mainnet stable, current Sui CLI 1.x.
