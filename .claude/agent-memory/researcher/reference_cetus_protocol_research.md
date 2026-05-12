---
name: Cetus Protocol deep research
description: Complete Cetus CLMM research: SDK V2 init/methods, contract addresses (mainnet+testnet), fee tiers, swap/liquidity/position APIs, aggregator SDK, error codes, May 2025 exploit details
type: reference
---

Full research written to `/memory/cetus-research.md` on 2026-05-12.

Key facts for quick reference:

**Packages:**
- SDK V2 (current): `@cetusprotocol/sui-clmm-sdk` v1.4.3
- SDK V1 (deprecated): `@cetusprotocol/cetus-sui-clmm-sdk` v5.4.0
- Aggregator: `@cetusprotocol/aggregator-sdk`
- Monorepo: https://github.com/CetusProtocol/cetus-sdk-v2

**Init pattern:** `initCetusSDK({ network: 'mainnet' })`

**CLMM mainnet package:** `0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb`

**Fee tiers:** 16 permissionless: 0.01% to 4%. Tick spacing mapped (2=0.01%, 10=0.05%, 60=0.25%, 200=1%).

**Key API namespaces:** `sdk.Pool.*`, `sdk.Position.*`, `sdk.Swap.*`, `sdk.Rewarder.*`

**May 2025 exploit:** $223M, `checked_shlw` overflow bug. Relaunched June 8, 2025. Fully operational.

**Decision:** Use aggregator for swap UIs (best price across 30+ DEXes). Use CLMM SDK for liquidity/position management.

**Docs:** https://cetus-1.gitbook.io/cetus-developer-docs (use llms-full.txt for bulk fetch)
