# Scallop quickstart

Minimal recipes for `@scallop-io/sui-scallop-sdk`. Targets mainnet pools. Adjust to testnet if Scallop testnet is current at the time of integration.

## Install

```bash
pnpm add @mysten/sui @scallop-io/sui-scallop-sdk
```

## Init

```ts
import { ScallopClient } from "@scallop-io/sui-scallop-sdk";

const scallop = new ScallopClient({ network: "mainnet" });
await scallop.init();
```

## Deposit

```ts
const tx = await scallop.builder.deposit("usdc", 1_000_000); // 1 USDC, 6 decimals
const result = await scallop.client.signAndExecuteTransaction({
  transaction: tx,
  signer,
  options: { showEffects: true },
});
console.log("deposit digest:", result.digest);
```

The first deposit auto-creates the user's Obligation Object if it does not exist. Subsequent calls reuse it.

## Borrow

```ts
const before = await scallop.query.getObligationAccount(obligationId);
console.log("health factor:", before.healthFactor);

const tx = await scallop.builder.borrow("sui", 100_000_000); // 0.1 SUI, 9 decimals
await scallop.client.signAndExecuteTransaction({ transaction: tx, signer });

const after = await scallop.query.getObligationAccount(obligationId);
console.log("post-borrow health factor:", after.healthFactor);
```

Always read health factor before and after a borrow. Refuse to submit if the projected health factor falls below your safety floor.

## Repay

```ts
const owed = await scallop.query.getObligationBorrow(obligationId, "sui");
const tx = await scallop.builder.repay("sui", owed.amount);
await scallop.client.signAndExecuteTransaction({ transaction: tx, signer });
```

Query live amount-owed. Repaying the original borrow amount leaves dust interest debt that compounds and surprises the user later.

## Withdraw collateral

```ts
const tx = await scallop.builder.withdraw("usdc", 1_000_000);
await scallop.client.signAndExecuteTransaction({ transaction: tx, signer });
```

Withdraw fails if it would push the health factor below the liquidation threshold. Pre-check with `getObligationAccount`.

## Read positions

```ts
const account = await scallop.query.getObligationAccount(obligationId);
console.log({
  collaterals: account.collaterals,
  borrows: account.borrows,
  healthFactor: account.healthFactor,
  totalCollateralUsd: account.totalCollateralValueUsd,
  totalBorrowUsd: account.totalBorrowValueUsd,
});
```

## scTokens

Scallop issues `scTokens` representing deposit positions. They are transferable in some flows. Treat the receipt as the position; transferring it transfers the deposit claim. In a custody product, plan around this.

Last updated: 2026-05-10.
