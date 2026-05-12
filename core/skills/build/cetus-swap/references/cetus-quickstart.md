# Cetus CLMM quickstart

Minimal recipes for the `@cetusprotocol/sui-clmm-sdk` (SDK V2). The deprecated V1 package is `@cetusprotocol/cetus-sui-clmm-sdk`; do not use it for new projects.

## Install

```bash
npm install @cetusprotocol/sui-clmm-sdk @cetusprotocol/common-sdk
```

## Init

```ts
import { CetusClmmSDK } from '@cetusprotocol/sui-clmm-sdk'

const sdk = CetusClmmSDK.createSDK({ env: 'testnet' })

// With custom RPC and wallet
const sdk = CetusClmmSDK.createSDK({
  env: 'mainnet',
  full_rpc_url: 'https://your-rpc-url',
})
sdk.setSenderAddress('0xYourWalletAddress')
```

Options: `env` (`'mainnet'` | `'testnet'`), `full_rpc_url` (optional string), `sui_client` (optional SuiClient), `simulationAccount` (optional string). Set sender address after init via `sdk.setSenderAddress(wallet)`.

## Query pools

```ts
// By coin types
const pools = await sdk.Pool.getPoolByCoins([coinTypeA, coinTypeB])

// Single pool by ID
const pool = await sdk.Pool.getPool(poolId)

// All pools (paginated)
const allPools = await sdk.Pool.getPoolsWithPage()
```

Coin type ordering: compare ASCII values of both addresses. Higher ASCII = `coin_type_a`. This determines the `a2b` direction flag.

## Swap (full flow)

```ts
import { CetusClmmSDK } from '@cetusprotocol/sui-clmm-sdk'
import { adjustForSlippage, Percentage, d } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'

const sdk = CetusClmmSDK.createSDK({ env: 'testnet' })

const a2b = true                          // coinA -> coinB
const by_amount_in = true                 // fixed input amount
const coin_amount = new BN(120000)        // raw amount (include decimals)
const slippage = Percentage.fromDecimal(d(5)) // 5%

// 1. Fetch pool
const pool = await sdk.Pool.getPool(pool_id)

// 2. Pre-swap estimate (on-chain simulation)
const res = await sdk.Swap.preSwap({
  pool_id: pool.id,
  current_sqrt_price: pool.current_sqrt_price,
  coin_type_a: pool.coin_type_a,
  coin_type_b: pool.coin_type_b,
  decimals_a: 6,
  decimals_b: 8,
  a2b,
  by_amount_in,
  amount: coin_amount,
})

// 3. Slippage limit
const to_amount = by_amount_in ? res.estimated_amount_out : res.estimated_amount_in
const amount_limit = adjustForSlippage(to_amount, slippage, !by_amount_in)

// 4. Build swap payload
const swap_payload = sdk.Swap.createSwapPayload({
  pool_id: pool.id,
  coin_type_a: pool.coin_type_a,
  coin_type_b: pool.coin_type_b,
  a2b,
  by_amount_in,
  amount: res.amount.toString(),
  amount_limit: amount_limit.toString(),
})

// 5. Execute
const swap_txn = await sdk.fullClient.sendTransaction(signer, swap_payload)
console.log('digest:', swap_txn.digest)
```

For PTB composition (swap without auto-transfer), use `sdk.Swap.createSwapWithoutTransferCoinsPayload()` which returns `{ tx, coin_ab_s }`. Then manually transfer the output coins.

## Add liquidity (fixed token amount)

```ts
import { ClmmPoolUtil } from '@cetusprotocol/sui-clmm-sdk'

const pool = await sdk.Pool.getPool(pool_id)
const coin_amount = new BN(500)
const fix_amount_a = true
const slippage = 0.1
const cur_sqrt_price = new BN(pool.current_sqrt_price)

// Estimate required amounts
const liquidity_input = ClmmPoolUtil.estLiquidityAndCoinAmountFromOneAmounts(
  position.tick_lower_index,
  position.tick_upper_index,
  coin_amount,
  fix_amount_a,
  true,
  slippage,
  cur_sqrt_price,
)

const amount_a = fix_amount_a ? coin_amount.toNumber() : Number(liquidity_input.coin_amount_limit_a)
const amount_b = fix_amount_a ? Number(liquidity_input.coin_amount_limit_b) : coin_amount.toNumber()

const payload = await sdk.Position.createAddLiquidityFixTokenPayload({
  coin_type_a: pool.coin_type_a,
  coin_type_b: pool.coin_type_b,
  pool_id: pool.id,
  tick_lower: position.tick_lower_index.toString(),
  tick_upper: position.tick_upper_index.toString(),
  fix_amount_a,
  amount_a,
  amount_b,
  slippage,
  is_open: true,          // true = create new position
  pos_id: '',             // empty for new position
  rewarder_coin_types: [],
  collect_fee: false,
})

const txn = await sdk.fullClient.sendTransaction(signer, payload)
```

Set `is_open: false` and pass an existing `pos_id` to add liquidity to an existing position.

## Contract addresses

| Module | Mainnet | Testnet |
|--------|---------|---------|
| CLMM | `0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb` | `0x5372d555ac734e272659136c2a0cd3227f9b92de67c80dc11250307268af2db8` |
| Limit Orders | `0x533fab9a116080e2cb1c87f1832c1bf4231ab4c32318ced041e75cc28604bba9` | `0xc65bc51d2bc2fdbce8c701f8d812da80fb37dba9cdf97ce38f60ab18c5202b17` |
| DCA | `0x587614620d0d30aed66d86ffd3ba385a661a86aa573a4d579017068f561c6d8f` | `0x484d2be08b58b8dc00a08c0ff8a2a9cd0542c4249ea2d5934ef9b15a10585d88` |
| Vaults | `0xabbd278f738affe762e9df4765b3409bb1e86a355a4f611ad82b278c18108918` | `0x325b7d67276ff809df6b3fa17a2a6fbff6aaa20e467c3cf74d1a1d09b8890bbd` |

## Fee tiers

| Tick Spacing | Fee Rate | Typical use |
|-------------|----------|-------------|
| 2 | 0.01% | Stablecoins (USDC/USDT) |
| 10 | 0.05% | Correlated pairs |
| 20 | 0.1% | Correlated pairs |
| 60 | 0.25% | Standard volatile pairs |
| 200 | 1% | Volatile/exotic |
| 220 | 2% | High-risk pairs |

16 total permissionless fee tiers available (0.01% to 4%). The table above shows the most common ones with their tick spacing values.

## Common pitfalls

1. **Wrong SDK package**: `@cetusprotocol/cetus-sui-clmm-sdk` is V1, deprecated. Use `@cetusprotocol/sui-clmm-sdk`.
2. **Coin type ordering**: Higher ASCII address must be `coin_type_a`. Reversing this causes factory error code 6 ("Invalid coin type sequence").
3. **Skipping pre-swap**: Always call `sdk.Swap.preSwap()` before building the swap payload. It simulates on chain and returns the actual amounts. Using a raw user input as the swap amount without simulation leads to failed transactions.
4. **Zero slippage**: Never set slippage to zero in production. Use at least 0.5% for stable pairs, 1-5% for volatile pairs.
5. **Pool IDs are not published**: Common pool object IDs (SUI/USDC, etc.) are not in the docs. Query at runtime via `sdk.Pool.getPoolByCoins()`.
6. **Closing positions without collecting rewards**: `closePositionPayload` requires all pending `rewarder_coin_types`. Omitting them causes the transaction to fail.
7. **Raw amounts**: All amounts in the SDK are raw (not human-readable). Multiply by 10^decimals. For example, 1 USDC (6 decimals) = `1_000_000`.

Last updated: 2026-05-12. Source: Cetus Developer Docs (GitBook), cetus-sdk-v2 GitHub.
