# Scallop quickstart

Minimal recipes for `@scallop-io/sui-scallop-sdk`. Targets mainnet pools only. The SDK does not support testnet (no address package IDs exist for testnet).

## Install

```bash
pnpm add @mysten/sui @scallop-io/sui-scallop-sdk
```

## Init

The entry point is the `Scallop` class, not `ScallopClient`. You must call `init()` before using any sub-client.

```ts
import { Scallop } from "@scallop-io/sui-scallop-sdk";

const scallopSDK = new Scallop({
  addressId: "67c44a103fe1b8c454eb9699",
  networkType: "mainnet",
  secretKey: secretKey, // Ed25519 private key
});
await scallopSDK.init();

// Sub-clients available after init:
const scallopClient = scallopSDK.client;   // high-level ops
const scallopQuery = scallopSDK.query;     // read-only queries
```

The `addressId` is required. It points to the on-chain address configuration that the SDK reads for package IDs. Check the SDK repo for the current value if this one is stale.

## Build transactions with ScallopTxBlock

For fine-grained control, use the builder pattern:

```ts
const scallopBuilder = await scallopSDK.createScallopBuilder();
const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);
```

Methods on `txBlock` use the pattern `(amount, coinName)`. Coin names are Scallop-specific identifiers: `"wusdc"`, `"sui"`, `"usdt"`, etc. Check the Scallop dashboard for current supported coin names.

## Deposit

```ts
const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);

await txBlock.depositQuick(1_000_000, "wusdc"); // 1 USDC, 6 decimals
const result = await scallopBuilder.signAndSendTxBlock(txBlock);
console.log("deposit digest:", result.digest);
```

The first deposit auto-creates the user's Obligation Object if it does not exist. Subsequent calls reuse it.

Depositing mints an sCoin (e.g. sUSDC for wusdc deposits). The sCoin is a Coin object on Sui representing the deposit position.

## Borrow

```ts
const before = await scallopQuery.getObligationAccount(obligationId);
// Check risk level before borrowing

const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);
await txBlock.borrowQuick(100_000_000, "sui"); // 0.1 SUI, 9 decimals
await scallopBuilder.signAndSendTxBlock(txBlock);

const after = await scallopQuery.getObligationAccount(obligationId);
// Verify risk level is still within safe bounds
```

Always read the obligation state before and after a borrow. Refuse to submit if the projected risk pushes the position toward liquidation.

## Repay

```ts
const account = await scallopQuery.getObligationAccount(obligationId);
// Extract the live borrow amount from account.borrows for the target asset
// Interest accrues continuously, so always use the live amount, not the original borrow

const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);
await txBlock.repayQuick(liveOwedAmount, "sui");
await scallopBuilder.signAndSendTxBlock(txBlock);
```

Query live amount owed via `getObligationAccount`. Repaying the original borrow amount leaves dust interest debt that compounds and surprises the user later. The `getObligationBorrow(obligationId, asset)` method does not exist; use `getObligationAccount` and read the borrows array.

## Withdraw collateral

```ts
const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);
await txBlock.withdrawQuick(1_000_000, "wusdc");
await scallopBuilder.signAndSendTxBlock(txBlock);
```

Withdraw fails if it would push the position past the liquidation threshold. Pre-check with `getObligationAccount`.

## Flash loans

```ts
const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);

const [coin, loan] = txBlock.borrowFlashLoan(amount, "wusdc");
// ... use the coin in the same tx block ...
txBlock.repayFlashLoan(coin, loan, "wusdc");

await scallopBuilder.signAndSendTxBlock(txBlock);
```

Flash loans must be borrowed and repaid within the same transaction block. The `loan` hot-potato object enforces repayment.

## Read positions

```ts
const account = await scallopQuery.getObligationAccount(obligationId);
console.log({
  collaterals: account.collaterals,
  borrows: account.borrows,
});
```

For all obligations owned by an address:

```ts
const obligations = await scallopQuery.getObligations(ownerAddress);
// Returns obligation keys and IDs
```

## sCoins

Scallop issues **sCoins** (e.g. sSUI, sUSDC) representing deposit positions. These are standard Sui Coin objects, not ERC-20 style tokens. Transferring an sCoin transfers the deposit claim. In a custody product, plan around this: the holder of the sCoin owns the position.

## Obligation limits

Each address can create up to 5 Obligation sub-accounts. For most integrations, one per user is sufficient.

## Outflow and borrow limits

Markets enforce per-24h outflow limits and borrow caps. Large withdrawals or borrows can fail if limits are reached. Read utilization before submitting large operations.

Last updated: 2026-05-11.
