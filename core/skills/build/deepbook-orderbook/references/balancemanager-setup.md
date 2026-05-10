# BalanceManager setup

A BalanceManager is a Sui Object that holds the user's funds available for DeepBook trading. Orders are placed against the BalanceManager's balance, not the wallet's spot balance directly.

## Create a BalanceManager

```ts
import { Transaction } from "@mysten/sui/transactions";

const tx = new Transaction();

deepbook.balanceManager.createAndShareBalanceManager()(tx);

const result = await sui.signAndExecuteTransaction({
  transaction: tx,
  signer,
  options: { showObjectChanges: true },
});

const balanceManagerId = result.objectChanges?.find(
  (c) => c.type === "created" && c.objectType.includes("BalanceManager"),
)?.objectId;

console.log("balanceManagerId:", balanceManagerId);
```

Persist `balanceManagerId` per user in your app state. Regenerating it on every session is wasteful and breaks order tracking.

## Deposit funds

Before placing orders, deposit input tokens into the BalanceManager.

```ts
const tx = new Transaction();

deepbook.balanceManager.depositIntoManager(
  balanceManagerId,
  "SUI",       // coinKey
  100,          // amount in human units
)(tx);

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

For a buy order, deposit quote token (e.g. USDC). For a sell order, deposit base token (e.g. SUI). Pay-with-DEEP requires DEEP balance separately.

## Withdraw

```ts
const tx = new Transaction();

deepbook.balanceManager.withdrawFromManager(
  balanceManagerId,
  "USDC",
  50,
)(tx);

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

Withdraws move funds back to the wallet's spot balance. Open orders that need the withdrawn balance reject when matched.

## Check balance

```ts
const balances = await deepbook.balanceManager.checkManagerBalance(
  balanceManagerId,
  "SUI",
);

console.log("SUI balance:", balances);
```

## Ownership and capabilities

The creator of the BalanceManager owns it. Owner-only operations: deposit, withdraw, place order, cancel order.

For app flows where a backend keeper places orders on behalf of the user, the user grants a `TradeProof` capability to the keeper. The keeper can place and cancel orders but cannot withdraw funds.

For first integration, keep ownership with the user wallet. Add capability delegation only after the base flow works and you have a clear use case (market-making, automated strategy).

## Re-creating vs reusing

Creating a fresh BalanceManager every session is fine for tests but wasteful in production:

- Costs gas every time.
- Loses the order history associated with the previous BalanceManager.
- Confuses indexers that key on BalanceManager id.

Persist the id. Treat it as a per-user singleton.

Last updated: 2026-05-10.
