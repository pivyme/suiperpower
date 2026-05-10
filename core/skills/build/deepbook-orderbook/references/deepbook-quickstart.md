# DeepBook v3 quickstart

Minimal recipes for the `@mysten/deepbook-v3` TS SDK. Default network is testnet.

## Install

```bash
pnpm add @mysten/sui @mysten/deepbook-v3
```

## Init

```ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { DeepBookClient } from "@mysten/deepbook-v3";
import { Transaction } from "@mysten/sui/transactions";

const sui = new SuiClient({ url: getFullnodeUrl("testnet") });

const deepbook = new DeepBookClient({
  client: sui,
  address: userAddr,
  env: "testnet",
});
```

## Place a limit order

```ts
const tx = new Transaction();

deepbook.deepBook.placeLimitOrder({
  poolKey: "SUI_USDC",
  balanceManager: balanceManagerId,
  clientOrderId: BigInt(Date.now()),
  price: 1.50,
  quantity: 10,
  isBid: true,
  payWithDeep: false,
})(tx);

const result = await sui.signAndExecuteTransaction({
  transaction: tx,
  signer,
  options: { showEffects: true, showEvents: true },
});

console.log("digest:", result.digest);
```

## Cancel an order

```ts
const tx = new Transaction();

deepbook.deepBook.cancelOrder({
  poolKey: "SUI_USDC",
  balanceManager: balanceManagerId,
  orderId: openOrderId,
})(tx);

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

## Read level-2 book

```ts
const book = await deepbook.deepBook.getLevel2Range({
  poolKey: "SUI_USDC",
  priceLow: 1.40,
  priceHigh: 1.60,
  isBid: true,
});

console.log(book.prices, book.quantities);
```

## Read open orders for a BalanceManager

```ts
const orders = await deepbook.deepBook.accountOpenOrders({
  poolKey: "SUI_USDC",
  balanceManager: balanceManagerId,
});
```

## Pool params

Always read the pool's tick and lot size before building order entry UI. Orders that violate either are rejected with a generic error.

```ts
const params = await deepbook.deepBook.getPoolBookParams({ poolKey: "SUI_USDC" });
console.log(params.tickSize, params.lotSize, params.minSize);
```

Round price to a multiple of `tickSize`, round quantity to a multiple of `lotSize`, reject below `minSize`. Surface these constraints in the UI so users do not see opaque rejections.

## Slippage on market-style flows

There is no implicit slippage limit. If you want market-style execution, place a limit order at the worst tolerated price and treat unfilled remainder as a partial fill or a cancel.

```ts
deepbook.deepBook.placeLimitOrder({
  poolKey: "SUI_USDC",
  balanceManager: balanceManagerId,
  clientOrderId: BigInt(Date.now()),
  price: worstAcceptablePrice,
  quantity: targetQuantity,
  isBid: true,
  payWithDeep: false,
  // expireTimestamp: optionally make it ephemeral
})(tx);
```

## Move-side composition

For atomic flows that combine an order with another protocol call, do both inside a single PTB. The DeepBook framework exposes entry functions for placing and cancelling orders directly from Move; the TS SDK above is a thin wrapper that builds the same calls.

Last updated: 2026-05-10. Targeting DeepBook v3 testnet stable.
