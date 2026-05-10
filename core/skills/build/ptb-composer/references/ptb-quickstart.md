# PTB quickstart patterns

PTBs let one transaction do many things atomically. The TS SDK exposes them as the `Transaction` builder.

## Pattern A: split + transfer

```ts
import { Transaction } from "@mysten/sui/transactions";

const tx = new Transaction();

// Split 1 SUI off the gas coin
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000_000)]);

// Send it to a recipient
tx.transferObjects([coin], tx.pure.address(recipient));

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

The split's result handle (`coin`) feeds the transfer command. They run in order, atomically.

## Pattern B: split + Move call + transfer

```ts
const tx = new Transaction();

const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(2_000_000_000)]);

const purchasedItem = tx.moveCall({
  target: `${MARKETPLACE_PKG}::market::buy`,
  arguments: [tx.object(LISTING_ID), paymentCoin],
});

tx.transferObjects([purchasedItem], tx.pure.address(buyer));

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

The `paymentCoin` flows from split to the move call. The move call's return value flows to the transfer.

## Pattern C: multi-protocol composition

```ts
const tx = new Transaction();

// 1. Borrow USDC from Scallop
const borrowed = tx.moveCall({
  target: `${SCALLOP_PKG}::lending::borrow`,
  arguments: [tx.object(OBLIGATION_ID), tx.pure.u64(1_000_000)],
});

// 2. Swap USDC for SUI on DeepBook
const sui = tx.moveCall({
  target: `${DEEPBOOK_PKG}::trade::swap`,
  arguments: [tx.object(POOL_ID), borrowed],
});

// 3. Deposit SUI into yet another protocol
tx.moveCall({
  target: `${YIELD_PKG}::vault::deposit`,
  arguments: [tx.object(VAULT_ID), sui],
});

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

If any step aborts, the whole PTB rolls back. No partial state.

## Pattern D: makeMoveVec for vector arguments

```ts
const tx = new Transaction();

const items = tx.makeMoveVec({
  type: `${PKG}::item::Item`,
  elements: [tx.object(ID1), tx.object(ID2), tx.object(ID3)],
});

tx.moveCall({
  target: `${PKG}::vault::deposit_many`,
  arguments: [tx.object(VAULT_ID), items],
});

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

Use this when a Move function takes `vector<Item>`.

## Pattern E: explicit gas

```ts
const tx = new Transaction();
// ... build commands ...
tx.setGasBudget(50_000_000n); // 0.05 SUI

await sui.signAndExecuteTransaction({ transaction: tx, signer });
```

Set gas budget when the auto-estimate is wrong (rare) or when you want predictability for production flows.

## Pattern F: dry-run before execute

```ts
const tx = new Transaction();
// ... build ...
tx.setSender(sender);

const dryRun = await sui.dryRunTransactionBlock({
  transactionBlock: await tx.build({ client: sui }),
});

if (dryRun.effects.status.status !== "success") {
  throw new Error("dry run failed: " + dryRun.effects.status.error);
}

console.log(dryRun.balanceChanges, dryRun.objectChanges);

// then execute
```

Always dry-run for high-stakes flows. Cheaper than a failed mainnet tx.

## Pattern G: per-call result destructuring

`moveCall` returns either a single result or a tuple, depending on the Move function's return type.

```ts
// Single return
const item = tx.moveCall({ target: "...::mint" });

// Multiple returns
const [a, b] = tx.moveCall({ target: "...::split" });
```

The SDK returns proxy handles. They are not the actual values; they are placeholders the runtime substitutes when the PTB executes.

Last updated: 2026-05-10.
