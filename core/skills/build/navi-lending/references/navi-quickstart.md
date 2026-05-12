# NAVI lending quickstart

Minimal recipes for `@naviprotocol/lending` v1.4.3. The old `navi-sdk` package is deprecated; do not use it.

## Install

```bash
npm install @naviprotocol/lending @mysten/sui
# Peer dependency: @mysten/sui >=1.25.0
# Do NOT use @mysten/sui.js (old package name)
```

## Architecture

There is no standalone client class. All lending operations are PTB (Programmable Transaction Block) functions. You build a `Transaction`, call async PTB helpers to add Move calls, then sign and execute.

AssetIdentifier: a coin type string (e.g., `'0x2::sui::SUI'`), a `Pool` object, or a numeric asset ID. Coin type strings are the most portable.

## Query pools

```typescript
import { getPools, getPool, getStats } from '@naviprotocol/lending'

const allPools = await getPools()
// Pool data includes: rates, capacity, LTV, oracle prices, APY, liquidation params

const suiPool = await getPool('0x2::sui::SUI')

const stats = await getStats()
```

## Deposit

```typescript
import { depositCoinPTB, getCoins, mergeCoinsPTB } from '@naviprotocol/lending'
import { Transaction } from '@mysten/sui/transactions'

const tx = new Transaction()
const coins = await getCoins('0xYourAddress', { coinType: '0x2::sui::SUI' })
const mergedCoin = mergeCoinsPTB(tx, coins, { balance: 1_000_000_000, useGasCoin: true })
await depositCoinPTB(tx, '0x2::sui::SUI', mergedCoin, { amount: 1_000_000_000 })
// Sign and execute tx
```

For non-SUI tokens, omit `useGasCoin`:

```typescript
const usdcType = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
const coins = await getCoins('0xYourAddress', { coinType: usdcType })
const mergedCoin = mergeCoinsPTB(tx, coins, { balance: 100_000_000 })
await depositCoinPTB(tx, usdcType, mergedCoin, { amount: 100_000_000 })
```

## Borrow

```typescript
import { borrowCoinPTB } from '@naviprotocol/lending'
import { Transaction } from '@mysten/sui/transactions'

const tx = new Transaction()
await borrowCoinPTB(
  tx,
  '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  100_000_000 // 100 USDC (6 decimals)
)
// Must have sufficient collateral deposited first
// 0.3% borrow fee applied at borrow time
```

## Repay

```typescript
import { repayCoinPTB, getCoins, mergeCoinsPTB } from '@naviprotocol/lending'
import { Transaction } from '@mysten/sui/transactions'

const usdcType = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
const tx = new Transaction()
const coins = await getCoins('0xYourAddress', { coinType: usdcType })
const mergedCoin = mergeCoinsPTB(tx, coins, { balance: 100_000_000 })
await repayCoinPTB(tx, usdcType, mergedCoin, { amount: 100_000_000 })
```

Interest accrues continuously. Query the live owed amount via `getLendingState()` before repaying. Repaying the original borrow amount leaves dust debt.

## Withdraw

```typescript
import { withdrawCoinPTB } from '@naviprotocol/lending'
import { Transaction } from '@mysten/sui/transactions'

const tx = new Transaction()
await withdrawCoinPTB(tx, '0x2::sui::SUI', 500_000_000)
// Fails if withdrawal would push health factor below 1.0
```

## Health factor

```typescript
import { getHealthFactor, getSimulatedHealthFactor, PoolOperator } from '@naviprotocol/lending'

// Current health factor
const hf = await getHealthFactor('0xYourAddress')
console.log('Health Factor:', hf) // > 1 is safe, < 1 triggers liquidation

// Simulate impact of a new borrow before submitting
const simulatedHf = await getSimulatedHealthFactor(
  '0xYourAddress',
  '0x2::sui::SUI',
  [{ type: PoolOperator.Borrow, amount: 1_000_000_000 }]
)
// Refuse to submit if simulatedHf < 1.5
```

For on-chain health factor check within a PTB:

```typescript
import { getHealthFactorPTB } from '@naviprotocol/lending'

const hfResult = await getHealthFactorPTB(tx, '0xYourAddress')
```

## Flash loan

Borrow and repay must occur in the same PTB. If the transaction fails, the flash loan reverts.

```typescript
import { flashloanPTB, repayFlashLoanPTB, getAllFlashLoanAssets } from '@naviprotocol/lending'
import { Transaction } from '@mysten/sui/transactions'

// Check which assets support flash loans
const flashAssets = await getAllFlashLoanAssets()

const tx = new Transaction()
const [balance, receipt] = await flashloanPTB(tx, '0x2::sui::SUI', 1_000_000_000, { env: 'prod' })
// ... use borrowed funds (arbitrage, liquidation, etc.) ...
await repayFlashLoanPTB(tx, '0x2::sui::SUI', receipt, balance, { env: 'prod' })
// Sign and execute. Both borrow + repay must be in the same PTB.
```

Fee is asset-dependent, available in the `flashloanFee` field from `getAllFlashLoanAssets()`.

## Account cap

Some operations require an account cap. Create one if needed:

```typescript
import { createAccountCapPTB } from '@naviprotocol/lending'

const tx = new Transaction()
const accountCap = await createAccountCapPTB(tx, { env: 'prod' })
// Pass accountCap in options: { accountCap }
```

## Lending state and positions

```typescript
import { getLendingState, getLendingPositions } from '@naviprotocol/lending'

// Returns: assetId, borrowBalance, supplyBalance, market, emodeId
// Balance precision: 9 decimal places (standardized)
const state = await getLendingState('0xYourAddress')

// Returns positions with USD values pre-calculated
// Amounts use token-native decimals
const positions = await getLendingPositions('0xYourAddress')
```

## Key contract addresses (mainnet)

| Component | Address |
|-----------|---------|
| Protocol Package | `0xee0041239b89564ce870a7dec5ddc5d114367ab94a1137e90aa0633cb76518e0` |
| Storage | `0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe` |
| Incentive V3 | `0x62982dad27fb10bb314b3384d5de8d2ac2d72ab2dbeae5d801dbdb9efa816c80` |
| Price Oracle | `0x1568865ed9a0b5ec414220e8f79b3d04c77acc82358f6e5ae4635687392ffbef` |

The SDK fetches config dynamically from `https://open-api.naviprotocol.io/api/navi/config`. These addresses are for reference only.

## Supported assets (top 10 by TVL)

| Asset | Coin Type | LTV | Liq. Threshold |
|-------|-----------|-----|----------------|
| SUI | `0x2::sui::SUI` | 75% | 80% |
| USDC (native) | `0xdba34672e...::usdc::USDC` | 80% | 85% |
| USDT (Wormhole) | `0xc060006111...::coin::COIN` | 80% | 75% |
| WETH | `0xaf8cd5edc1...::coin::COIN` | 75% | 80% |
| CETUS | `0x06864a6f92...::cetus::CETUS` | 50% | 55% |
| haSUI | `0xbde4ba4c2e...::hasui::HASUI` | 75% | 80% |
| NAVX | `0xa99b8952d4...::navx::NAVX` | 45% | 55% |
| WBTC | `0x027792d9fe...::coin::COIN` | 40% | 45% |
| DEEP | `0xdeeb7a4662...::deep::DEEP` | 47% | 50% |
| WAL | `0x356a26eb9e...::wal::WAL` | 60% | 65% |

Full coin type addresses: see the NAVI SDK docs or query `getPools()` at runtime.

## Common pitfalls

1. **Wrong SDK**: Use `@naviprotocol/lending`, not `navi-sdk` (deprecated).
2. **Wrong Sui package**: Requires `@mysten/sui >=1.25.0`. The old `@mysten/sui.js` will not work.
3. **No coin constants**: The new SDK does not export pre-imported coin constants. Use full coin type strings.
4. **Balance precision mismatch**: `getLendingState()` returns 9-decimal precision. `getLendingPositions()` uses token-native decimals.
5. **Oracle staleness**: Prices valid for 15 seconds. Call `updateOraclePricesPTB()` before time-sensitive operations.
6. **Flash loan atomicity**: `flashloanPTB()` and `repayFlashLoanPTB()` MUST be in the same PTB.
7. **Borrow fee**: 0.3% applied at borrow time, on top of the interest rate.
8. **Market parameter**: Default market is `'main'` (id: 0). Ember market (id: 1) has different pools and parameters.
9. **Dynamic config**: The SDK fetches contract addresses from an API at init time. Requires network access.
10. **E-Mode restrictions**: E-Mode only works for specific correlated asset pairs (e.g., vSUI/SUI: 90% LTV). Check availability via `getUserEModeCaps()`.

Last updated: 2026-05-12.
