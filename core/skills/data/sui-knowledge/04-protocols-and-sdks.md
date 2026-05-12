# 04. Protocols and SDKs

> Audience: a dev integrating with the Sui ecosystem. The map of "what is shipping, what is reliable, what to use when."

This is a directory, not deep documentation. For sponsor protocols, see `sponsor-docs/` for the integration brief.

## RPC endpoints

| Network | Endpoint | Notes |
|---|---|---|
| Devnet | `https://fullnode.devnet.sui.io:443` | Reset frequently, free |
| Testnet | `https://fullnode.testnet.sui.io:443` | Stable, primary network for hackathon submissions |
| Mainnet | `https://fullnode.mainnet.sui.io:443` | Free Mysten public, rate-limited; use a paid provider in production |

Production-grade providers:

- **Blockvision**: paid tiers, generous free, indexing add-ons
- **Suiscan**: explorer + RPC
- **Shinami**: paid RPC + sponsored-tx + zkLogin services
- **Self-hosted full node**: official Mysten binaries, requires ops

For high-volume apps, default to Blockvision or Shinami; Mysten public will rate-limit you under load.

## SDK clients

| Language | Package | Use when |
|---|---|---|
| TypeScript | `@mysten/sui` | Web frontends, Node backends, AI agents |
| TypeScript (UI) | `@mysten/dapp-kit-react` / `@mysten/dapp-kit-core` | React frontends (use `-react`), vanilla JS (use `-core`), wallet adapters |
| TypeScript (auth) | `@mysten/enoki` | zkLogin in production, sponsored tx |
| Rust | `sui-sdk` (in mystenlabs/sui repo) | Backend services, indexers, validators, agents |
| Python | `pysui` (community) | Scripts, data analysis, less production-tested than TS |

Defaults:

- Web frontend: `@mysten/dapp-kit-react` + `@tanstack/react-query`. SDK v2.0 uses `SuiGrpcClient` (from `@mysten/sui/grpc`) as the recommended transport; `SuiJsonRpcClient` from `@mysten/sui/jsonRpc` is the legacy fallback.
- Server-side signing or AI agents: `@mysten/sui` Keypair APIs.
- zkLogin or sponsored tx in production: pair `@mysten/sui` with Enoki.
- Heavy backend (indexer, validator-adjacent): Rust SDK.

## Wallets

| Wallet | Type | Notes |
|---|---|---|
| Slush | Mysten official browser + mobile | Default recommendation for end users in 2026 |
| Sui Wallet | Browser extension | Maintained by Mysten, broad compatibility |
| Surf | Browser extension | Multi-chain, popular among power users |
| Phantom (Sui mode) | Browser extension | Crossover Solana users |
| Suiet | Browser extension | Long-running independent wallet |
| Nightly | Browser + mobile | Multi-chain |

`@mysten/dapp-kit-react` (or `dapp-kit-core` for non-React) integrates with most via the standard Wallet Standard. Test against at least Slush and Sui Wallet before launch.

## Indexers

- **Mysten public indexer**: free, handles common queries, rate-limited.
- **Blockvision**: indexing API with broader query shapes (NFT-aware, DeFi-aware), paid tiers.
- **Self-hosted Sui indexer**: open-source, requires ops investment.

If your app needs cursor-paginated query of historical events on a custom Move module, the Mysten public indexer is usually fine. For dashboards and analytics, lean on a third-party.

## DeFi

DEXes and AMMs:

- **DeepBook**: native CLOB, on-chain shared orderbook, Mysten-led. Sponsor of Sui Overflow 2026. See `sponsor-docs/deepbook.md`.
- **Cetus**: concentrated liquidity AMM, Sui-native, mature.
- **Aftermath**: AMM + perps + staking aggregator.
- **Turbos**: concentrated liquidity AMM, good price discovery on long-tail pairs.
- **Bluefin**: perp DEX.
- **Kriya**: AMM + spot + perps.

Money markets:

- **Scallop**: largest TVL money market on Sui, sponsor for the university award. See `sponsor-docs/scallop.md`.
- **NAVI**: money market, growing TVL, audit history with OtterSec.
- **Suilend**: lending protocol, Solend team's Sui product.

Yield aggregators:

- **Aftermath staking**: liquid staking SUI.
- **Volo / Spring SUI**: liquid staking alternatives.
- **Various smaller yield routers**: review TVL trends before integrating.

## Stablecoins on Sui

- **USDC**: native via Circle on Sui. Use this for new integrations.
- **USDT**: bridged; check the live status before depending on it.
- **Native algorithmic stablecoins**: a few exist; do not depend on them for production value flows without due diligence.
- **DAI**: bridged via Wormhole or LayerZero.

For a hackathon, USDC native is the right default.

## NFTs

- **Kiosk standard** (`sui::kiosk`): the protocol-level marketplace primitive. See `02-what-makes-sui-unique.md` and the official Kiosk docs.
- **BlueMove**: NFT marketplace.
- **Tradeport**: multi-chain NFT marketplace with strong Sui support.
- **Clutchy**: NFT-native, gaming focus.

For new NFT projects, build on Kiosk; aggregator marketplaces will pick you up automatically.

## Cross-chain

- **Wormhole**: most widely used cross-chain messaging on Sui. Bridges from Ethereum, Solana, BNB.
- **LayerZero**: also live on Sui; use for OFT (omnichain fungible token) flows.
- **Mayan**: cross-chain swap aggregator.
- **deBridge**: cross-chain swap.

Cross-chain bridging adds risk; review the bridge's audit history and current TVL before routing significant value.

## Oracles

- **Pyth**: low-latency price oracle, native on Sui, broad coverage.
- **Switchboard**: oracle infrastructure with custom feeds and randomness.
- **Supra**: alternative oracle network.

Default to Pyth for price feeds. Switchboard adds randomness and custom data.

## Storage

- **Walrus**: Mysten's decentralized blob storage built on Sui. Headline Sui Overflow 2026 sponsor. See `sponsor-docs/walrus.md`.
- **IPFS gateways**: commodity, use for static asset hosting if you do not need Walrus's verifiable retrieval.
- **Arweave**: permanent storage; some Sui projects use it for NFT metadata, but Walrus is the chain-native fit.

## Auth / identity

- **zkLogin**: protocol-level OIDC-based auth. Use directly for simple flows or via Enoki for production.
- **Enoki**: Mysten's managed zkLogin + sponsored tx + analytics service. Recommended for production consumer apps.
- **Privy**: cross-chain auth provider; Sui support varies by tier.

For consumer-facing apps with social login as the wedge, Enoki is the path of least resistance.

## Gaming

- **Sui Gaming Toolkit**: Mysten reference patterns and SDKs for game integrations.
- **Cosmocadia, SuiGods**: live Sui games; reference architectures.
- **Beamable**: game backend with Sui integration.

## Mobile

- **Sui Mobile SDK**: official, React Native + Expo support.
- **Mysten's Slush mobile wallet**: deep-link integration patterns.

For mobile-first products, see `skills/build/build-mobile-sui/`.

## Quick reference: which RPC / SDK for what

| Use case | RPC | SDK |
|---|---|---|
| Hobby testnet dApp | Mysten public testnet | `@mysten/dapp-kit-react` |
| Production Web dApp | Blockvision / Shinami | `@mysten/dapp-kit-react` + Enoki |
| AI agent | Mysten public mainnet (low volume) or Blockvision | `@mysten/sui` |
| Indexer / analytics backend | Self-hosted indexer | Rust SDK |
| Mobile app | Mysten public + paid fallback | Sui Mobile SDK |

## What is NOT in this doc

- Deep API references (those live in each package's docs at `docs.sui.io` or the GitHub README)
- Pricing / TVL snapshots (snapshots go stale; use live dashboards)
- Project-by-project integration walkthroughs (those live in skills under `skills/build/<protocol>-*`)

Last updated: 2026-05-11. Updated for Sui SDK v2.0 (dapp-kit-react/core split, gRPC transport).
