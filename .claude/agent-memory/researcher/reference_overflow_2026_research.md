---
name: Sui Overflow 2026 hackathon research
description: Complete research on Sui Overflow 2026 tracks, prizes, sponsors, 2025 winners patterns, ecosystem tools (Seal, Pyth, Nautilus, SuiNS), and skill gap analysis
type: reference
---

## Sui Overflow 2026 Hackathon

**Timeline**: Registration Feb 2025, Submissions close May 23 2026, Demo Days Jun 13-14 2026, Winners end of June 2026.
**Submission portal**: deepsurge.xyz (client-rendered, no public API).
**Total prize pool**: $1M+ across core and specialized tracks.

### Core Tracks (each: 1st $30K, 2nd $15K, 3rd $10K, 4th $7.5K)
1. Agentic Web (AI) - autonomous AI agents that act, transact, coordinate on Sui
2. DeFi & Payments - financial primitives, payment rails
3. Infra & DevX - tooling, SDKs, indexers

### Specialized Tracks
- Walrus: $70K pool
- DeepBook: $70K pool
- EVE Frontier: $50K pool (CCP Games gaming track)
- ONE Championship: $70K pool (consumer apps, gaming, NFTs, sports)
- Degen: memes/viral culture
- Payments & Wallets: payment/wallet infra
- Entertainment & Culture: consumer-facing
- Explorations: multi-chain, RWA, DePIN

### Additional Awards
- University Award: $2.5K x 10 teams (Scallop sponsored)
- Community Award: $25K (Hippo sponsored)
- $250K+ audit credits and support

### Sponsors
Headline: Walrus. Primary: OpenZeppelin, OtterSec, Alibaba Cloud, EVE Frontier, ONE Championship, Scallop, Navi, Exponential Win, Bucket Protocol, Dubhe.

## 2025 Winners Patterns
- 599 submissions, 36 main winners + 10 university
- **AI winners**: data marketplaces (Suithetic, Hyvve), ML verification (OpenGraph), AI trading (RaidenX)
- **DeFi winners**: yield abstraction (Magma), perpetuals (Pismo used Pyth), Bitcoin liquidity (MizuPay), yield trading (Kamo)
- **Crypto winners**: ZK whistleblowing with Seal+Walrus (ZeroLeaks), privacy trading (Shroud), Nautilus+TEE (Sui Sentinel)
- **Infra winners**: decentralized SQL on Walrus (SuiSQL), data streaming (Suipulse)
- **Payments winners**: stealth addresses (PIVY), multisig CLI (Sui Multisig), smart wallet (SeaWallet)
- **Storage winners**: doc signing on Walrus (SuiSign), graph DB (WalGraph), decentralized email (SuiMail), website builder on Walrus (Walpress)
- **Pattern**: Winners used Seal, Walrus, Nautilus, Pyth, DeepBook, zkLogin, Kiosk as load-bearing dependencies, not decorative imports

## New Sui Ecosystem Tools (2025-2026)

### Seal (encryption/access control)
- Threshold encryption + independent key servers, policies as Move smart contracts
- Patterns: membership/allowlist, time-locked, subscription, owner-private (NFT gating), secure voting, bearer tokens
- Integrates with Walrus for ciphertext storage, Nautilus optional
- URL: https://seal.mystenlabs.com/ and https://blog.sui.io/seal-programmable-access-control/

### Nautilus (off-chain trusted computation)
- TEEs (AWS Nitro Enclaves), cryptographic attestations verified by Move contracts
- Mainnet since June 2025
- Use cases: AI inference, private data processing, oracle feeds
- URL: https://docs.sui.io/concepts/cryptography/nautilus

### Pyth on Sui (price oracles)
- 1500+ feeds, 26 sponsored feeds on Sui
- Move package via git dependency, TypeScript SDK @pythnetwork/pyth-sui-js
- Pull model: client fetches price, passes to Move via PTB
- DO NOT hard-code pyth::update_single_price_feed in Move modules
- Testnet Pyth State: 0x243759059f4c3111179da5878c12f68d612c21a8d54d85edc86164bb18be1c7c
- URL: https://docs.pyth.network/price-feeds/core/use-real-time-data/pull-integration/sui

### SuiNS + Move Registry (MVR)
- Name resolution: example.sui to address
- MVR: package naming @suins_name/pkg_name with version support
- SDK and on-chain/off-chain resolution
- URL: https://docs.suins.io/

### Sui Stack Messaging SDK
- Native messaging combining Sui execution + Walrus storage + Seal access control

### Protocol-level 2026 features
- Free stablecoin transfers (planned)
- Private transactions at protocol level (planned)
- Mysticeti v2 consensus: sub-second finality

## Skill Gap Analysis
Suiperpower plans mention these but NO dedicated skill exists:
- Seal encryption/access control (used by 2025 Crypto track winners)
- Nautilus TEE computation (used by Sui Sentinel winner)
- Pyth oracle integration (used by Pismo, DeepMaker winners)
- SuiNS / MVR integration
- AI agent building (new "Agentic Web" core track for 2026)
- EVE Frontier smart assemblies (new $50K specialized track)

Suiperpower plans reference these sponsors but the 2026 roster expanded:
- Navi (now a primary sponsor, was not in original plans)
- Hippo (community award sponsor, new)
- Alibaba Cloud (infra track, new)
- Bucket Protocol, Dubhe (entertainment track, new)
- EVE Frontier, ONE Championship (specialized tracks, new)
