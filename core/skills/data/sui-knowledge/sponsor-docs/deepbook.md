# DeepBook on Sui (knowledge brief)

## What it is

DeepBook is a native, on-chain central limit orderbook (CLOB) on Sui. Built and maintained by Mysten Labs. Pools are shared Objects; orders are typed Move calls; settlement is atomic within a single transaction. Sui Overflow 2026 has DeepBook as a primary track sponsor.

Unlike AMM-based DEXes (Cetus, Turbos), DeepBook gives makers and takers a true orderbook experience: limit orders, partial fills, post-only behavior, and tighter spreads on liquid pairs.

## When to use it

- You are building a DEX, market-making product, or trading interface where users want orderbook semantics.
- You want to reuse a battle-tested matching engine instead of writing your own.
- You need composability: a PTB can place an order, settle, and route the proceeds in one transaction.
- You want native Sui CLOB liquidity that AMMs cannot match on certain pairs.

When NOT to use it:

- Long-tail token swaps where AMM concentrated liquidity gives better execution.
- Products where users do not understand orderbooks; AMM UX is simpler for retail.
- High-frequency trading at sub-millisecond latency; on-chain execution always has consensus latency.

## Key concepts

- **Pool**: a shared Object representing a market for a base/quote pair. Each pool has tick size, lot size, and fees.
- **Tick size**: the minimum price increment for an order.
- **Lot size**: the minimum quantity unit. Orders must be in multiples of the lot size.
- **Maker vs taker**: a maker order rests in the book; a taker order matches against existing book liquidity. Fees differ.
- **BalanceManager**: a per-user Object that holds funds available for trading on DeepBook. You deposit into it before placing orders.
- **Limit order**: place a price; rests until matched or cancelled.
- **Market order**: matches against the best available book price; rejects if liquidity is insufficient and you specified a slippage limit.
- **Order id**: returned at order placement; needed for cancellation.

## Minimal integration recipe

Using DeepBook v3 TS SDK:

```ts
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { deepbook } from "@mysten/deepbook-v3";
import { Transaction } from "@mysten/sui/transactions";

// Init: use the $extend pattern (SuiGrpcClient is the recommended transport in SDK v2.0)
const suiClient = new SuiGrpcClient({ network: "testnet" });
const client = suiClient.$extend(deepbook({ address: userAddr, env: "testnet" }));

const tx = new Transaction();

// Place a limit order: buy 10 SUI at 1.50 DBUSDC each (curried pattern)
client.deepbook.deepBook.placeLimitOrder({
  poolKey: "SUI_DBUSDC",             // testnet pool key
  balanceManagerKey: "MANAGER_1",    // string key, not object ID
  clientOrderId: "1",                // string, not number
  price: 1.50,
  quantity: 10,
  isBid: true,
  payWithDeep: true,                 // default is true; set false if no DEEP balance
})(tx);

const result = await client.core.signAndExecuteTransaction({
  transaction: tx,
  signer,
  include: { effects: true },
});
```

Cancellation (also curried):

```ts
client.deepbook.deepBook.cancelOrder({
  poolKey: "SUI_DBUSDC",
  balanceManagerKey: "MANAGER_1",
  orderId: "0x...",
})(tx);
```

Read book state (positional args, not an object):

```ts
const level2 = await client.deepbook.getLevel2Range("SUI_DBUSDC", 1.40, 1.60, true);
```

Alternative: `getLevel2TicksFromMid(poolKey, ticks)` for a snapshot around mid-price.

For Move-side integration (a smart contract calling DeepBook), import the DeepBook framework from the official package and follow the entry function signatures. Orderbook calls are best done from the client when possible; on-chain composition is reserved for atomic settlement flows.

## Common pitfalls

- **Tick and lot violations.** Orders not aligned to the pool's tick and lot are rejected. Read pool params before placing.
- **BalanceManager not funded.** A user must deposit into their BalanceManager before placing orders. Many first-time integrations skip this and see "insufficient funds" with confusing context.
- **Pay-with-DEEP default.** `payWithDeep` defaults to `true`. If the BalanceManager has zero DEEP balance and you do not explicitly set `payWithDeep: false`, the order rejects.
- **Stale prices.** A market order placed against a stale local view of the book may slip; always use a slippage limit.
- **Pool migration between v2 and v3.** Some older Sui pools are v2; new development should use v3.
- **Pool creation.** DeepBook v3 supports `createPermissionlessPool`, so anyone can create a pool. However, pool creation has costs and constraints; check the SDK for current parameters.

## Specialized pool types

DeepBook offers more than standard spot CLOB pools:

- **DeepBook Predict** (testnet): prediction-market pools for binary or multi-outcome events.
- **DeepBook Margin** (mainnet): margin trading pools with leverage and liquidation mechanics.
- **DeepBook Sandbox**: a simulated environment for testing order flows without real funds.

Check the official docs and SDK for availability on your target network before building against these.

## Where to go deeper

- DeepBook docs: `https://docs.sui.io/standards/deepbook`
- DeepBook GitHub: `https://github.com/MystenLabs/deepbookv3`
- DeepBook TS SDK: `@mysten/deepbook-v3`
- Suiperpower skill: `skills/build/deepbook-orderbook/`
- Idea-phase research: `skills/idea/deepbook-research/`

Last updated: 2026-05-10. Targeting DeepBook v3 mainnet.
