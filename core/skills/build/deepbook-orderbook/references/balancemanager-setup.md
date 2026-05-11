# BalanceManager setup

A BalanceManager is a Sui Object that holds the user's funds available for DeepBook trading. Orders are placed against the BalanceManager's balance, not the wallet's spot balance directly.

## Create a BalanceManager

Assumes you have initialized the client using the `$extend` pattern (see `deepbook-quickstart.md`).

```ts
import { Transaction } from "@mysten/sui/transactions";

const tx = new Transaction();

client.deepbook.balanceManager.createAndShareBalanceManager()(tx);

const result = await client.core.signAndExecuteTransaction({
  transaction: tx,
  signer,
  include: { objectTypes: true },
});

const balanceManagerId = result.objectChanges?.find(
  (c) => c.type === "created" && c.objectType.includes("BalanceManager"),
)?.objectId;

console.log("balanceManagerId:", balanceManagerId);
```

Persist `balanceManagerId` per user in your app state. Regenerating it on every session is wasteful and breaks order tracking.

Note: SDK methods that reference a BalanceManager in transaction calls use a `managerKey` string (e.g. `"MANAGER_1"`), which is a local alias registered with the SDK. Query methods also accept this string key. The raw object ID is needed only for on-chain lookups outside the SDK.

## Deposit funds

Before placing orders, deposit input tokens into the BalanceManager. The SDK uses positional args: `(managerKey, coinKey, amount)`.

```ts
const tx = new Transaction();

client.deepbook.balanceManager.depositIntoManager(
  "MANAGER_1",  // managerKey (string alias, not object ID)
  "SUI",        // coinKey
  100,           // amount in human units
)(tx);

await client.core.signAndExecuteTransaction({ transaction: tx, signer });
```

For a buy order, deposit quote token (e.g. USDC). For a sell order, deposit base token (e.g. SUI). Pay-with-DEEP requires DEEP balance separately.

## Withdraw

```ts
const tx = new Transaction();

client.deepbook.balanceManager.withdrawFromManager(
  "MANAGER_1",
  "DBUSDC",     // on testnet, use DBUSDC (not USDC)
  50,
)(tx);

await client.core.signAndExecuteTransaction({ transaction: tx, signer });
```

Withdraws move funds back to the wallet's spot balance. Open orders that need the withdrawn balance reject when matched.

## Check balance

```ts
const balances = await client.deepbook.balanceManager.checkManagerBalance(
  "MANAGER_1",
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
