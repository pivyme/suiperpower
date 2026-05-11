# DeepBook v3 quickstart

Minimal recipes for the `@mysten/deepbook-v3` TS SDK. Default network is testnet.

## Install

```bash
pnpm add @mysten/sui @mysten/deepbook-v3
```

## Init

The SDK uses the `$extend` pattern to add DeepBook methods onto a Sui client.

```ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { deepbook } from "@mysten/deepbook-v3";
import { Transaction } from "@mysten/sui/transactions";

const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

const client = suiClient.$extend(
  deepbook({ address: userAddr, env: "testnet" }),
);
```

All DeepBook calls are now on `client.deepbook.deepBook.*` (transactions) and `client.deepbook.balanceManager.*` (balance ops). Query methods are on `client.deepbook.*` directly.

## Place a limit order

The SDK uses a curried pattern: build args first, then pass the transaction.

```ts
const tx = new Transaction();

client.deepbook.deepBook.placeLimitOrder({
  poolKey: "SUI_DBUSDC",
  balanceManagerKey: "MANAGER_1",
  clientOrderId: "1",          // string, not number
  price: 1.50,
  quantity: 10,
  isBid: true,
  payWithDeep: true,           // default is true; set false to pay fees in input token
})(tx);

const result = await suiClient.signAndExecuteTransaction({
  transaction: tx,
  signer,
  options: { showEffects: true, showEvents: true },
});

console.log("digest:", result.digest);
```

Note: `balanceManagerKey` is a string key (e.g. `"MANAGER_1"`) registered with the SDK, not an object ID. `clientOrderId` is a string. On testnet, the SUI/USDC pool key is `SUI_DBUSDC` (not `SUI_USDC`).

## Cancel an order

```ts
const tx = new Transaction();

client.deepbook.deepBook.cancelOrder({
  poolKey: "SUI_DBUSDC",
  balanceManagerKey: "MANAGER_1",
  orderId: openOrderId,
})(tx);

await suiClient.signAndExecuteTransaction({ transaction: tx, signer });
```

## Read level-2 book

`getLevel2Range` takes positional args: `(poolKey, priceLow, priceHigh, isBid)`.

```ts
const book = await client.deepbook.getLevel2Range(
  "SUI_DBUSDC",
  1.40,    // priceLow
  1.60,    // priceHigh
  true,    // isBid
);

console.log(book.prices, book.quantities);
```

For a snapshot around mid-price, use `getLevel2TicksFromMid(poolKey, ticks)` instead.

## Read open orders for a BalanceManager

`accountOpenOrders` takes positional args: `(poolKey, managerKey)`.

```ts
const orders = await client.deepbook.accountOpenOrders(
  "SUI_DBUSDC",
  "MANAGER_1",
);
```

## Pool params

Always read the pool's tick and lot size before building order entry UI. Orders that violate either are rejected with a generic error.

`poolBookParams` takes a plain string pool key.

```ts
const params = await client.deepbook.poolBookParams("SUI_DBUSDC");
console.log(params.tickSize, params.lotSize, params.minSize);
```

Round price to a multiple of `tickSize`, round quantity to a multiple of `lotSize`, reject below `minSize`. Surface these constraints in the UI so users do not see opaque rejections.

## Slippage on market-style flows

There is no implicit slippage limit. If you want market-style execution, place a limit order at the worst tolerated price and treat unfilled remainder as a partial fill or a cancel.

```ts
client.deepbook.deepBook.placeLimitOrder({
  poolKey: "SUI_DBUSDC",
  balanceManagerKey: "MANAGER_1",
  clientOrderId: String(Date.now()),
  price: worstAcceptablePrice,
  quantity: targetQuantity,
  isBid: true,
  payWithDeep: true,
  // expiration: optionally make it ephemeral (epoch-based)
})(tx);
```

## Move-side composition

For atomic flows that combine an order with another protocol call, do both inside a single PTB. The DeepBook framework exposes entry functions for placing and cancelling orders directly from Move; the TS SDK above is a thin wrapper that builds the same calls.

Last updated: 2026-05-10. Targeting DeepBook v3 testnet stable.
