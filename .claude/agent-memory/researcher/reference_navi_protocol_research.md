---
name: NAVI Protocol deep research
description: Complete NAVI lending protocol research on Sui - SDK v1.4.3 (@naviprotocol/lending), 35 assets, method signatures, contract addresses, interest rate model, liquidation mechanics, flash loans, E-Mode, oracle, rewards
type: reference
---

## NAVI Protocol Research (2026-05-12)

Full research written to `/Users/macbookair/Documents/suiperpower/suiperpower-private/memory/navi-research.md`

### Key Facts

- **New SDK**: `@naviprotocol/lending` v1.4.3 (stable), `@naviprotocol/wallet-client` v1.4.9
- **Old SDK deprecated**: `navi-sdk` (v1.5.4, Feb 2025) is deprecated
- **Peer dep**: `@mysten/sui >=1.25.0`
- **Monorepo**: https://github.com/naviprotocol/naviprotocol-monorepo (4 packages: lending, wallet-client, aggregator, bridge)
- **35 supported assets** with full coin type addresses and pool IDs documented
- **Two markets**: Main (id: 0, key: 'main') and Ember (id: 1, key: 'ember')
- **Protocol Package**: `0xee0041239b89564ce870a7dec5ddc5d114367ab94a1137e90aa0633cb76518e0`
- **Storage**: `0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe`
- **Config is dynamic**: SDK fetches from `https://open-api.naviprotocol.io/api/navi/config`
- **Borrow fee**: 0.3% applied at borrow time
- **Close factor**: 35% max per liquidation
- **Flash loan fee**: Asset-dependent, queried via `getAllFlashLoanAssets()`
- **Oracle**: Pyth + Supra, 15-second validity

### Core SDK Methods (all from @naviprotocol/lending)

**Pool Ops**: `depositCoinPTB`, `borrowCoinPTB`, `withdrawCoinPTB`, `repayCoinPTB`
**Queries**: `getPools`, `getPool`, `getStats`, `getBorrowFee`, `getFees`
**Account**: `getLendingState`, `getHealthFactor`, `getSimulatedHealthFactor`, `getCoins`, `getTransactions`, `mergeCoinsPTB`
**Flash Loan**: `flashloanPTB`, `repayFlashLoanPTB`, `getAllFlashLoanAssets`, `getFlashLoanAsset`
**Liquidation**: `liquidatePTB`
**E-Mode**: `enterEModePTB`, `exitEModePTB`, `createEModeCapPTB`, `getUserEModeCaps`
**Oracle**: `getPriceFeeds`, `updateOraclePricesPTB`, `getPythStalePriceFeedId`
**Rewards**: `getUserAvailableLendingRewards`, `claimLendingRewardsPTB`, `summaryLendingRewards`
**Account Cap**: `createAccountCapPTB`, `getAccountCapOwnerPTB`
**Position**: `getLendingPositions`

### SDK Docs
- Main docs: https://sdk.naviprotocol.io/lending
- Migration guide: https://sdk.naviprotocol.io/navi-sdk-migration/lending
- Protocol docs: https://naviprotocol.gitbook.io/navi-protocol-docs
- Full text export: https://naviprotocol.gitbook.io/navi-protocol-docs/llms-full.txt
