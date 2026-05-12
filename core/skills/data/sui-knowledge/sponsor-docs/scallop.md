# Scallop on Sui (knowledge brief)

## What it is

Scallop is a money market protocol on Sui. Users deposit assets as collateral, borrow other assets against the collateral, and earn or pay interest. Scallop sponsors the Sui Overflow 2026 university award track.

Scallop is one of the largest TVL DeFi protocols on Sui, with multiple isolated and shared markets and an active liquidator network.

## When to use it

- You want to integrate lending or borrowing into your product without building the underlying interest-rate model and liquidation infrastructure.
- You are building a yield aggregator, margin-position manager, or treasury management product.
- You want to compose lending positions with other Sui protocols (e.g. borrow USDC, deposit to a yield pool).
- You want to enable users to earn yield on idle balances inside your app.

When NOT to use it:

- Markets you need are not listed; check the live market list before designing.
- Your users cannot bear the liquidation risk of borrow positions; for retail, surface the risk clearly.
- The SDK only supports mainnet. Testnet has no address package IDs and will error.

## Key concepts

- **Market**: a shared Object representing a single asset pool with parameters (LTV, interest model, liquidation threshold).
- **Obligation**: a per-user Object representing the user's positions across markets. Holds collateral and borrow records.
- **Collateral**: deposits that back borrows. Different markets accept different collateral types.
- **Borrow**: against collateral; the borrow asset accrues interest at a rate set by utilization.
- **Liquidation threshold**: the LTV at which a position becomes liquidatable.
- **Oracle drift**: prices come from an oracle (Pyth on Sui in most cases). Drift between actual market price and oracle price is a real liquidation risk.
- **sCoins**: receipt Coin objects (e.g. sSUI, sUSDC) representing your deposit position; transferable.

## Minimal integration recipe

Using the Scallop TS SDK (mainnet only, testnet not supported):

```ts
import { Scallop } from "@scallop-io/sui-scallop-sdk";

const scallopSDK = new Scallop({
  addressId: "67c44a103fe1b8c454eb9699",
  networkType: "mainnet",
  secretKey: secretKey,
});
await scallopSDK.init();

const scallopBuilder = await scallopSDK.createScallopBuilder();
const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);

// Deposit USDC as collateral (note: coin name is "wusdc", not "usdc")
await txBlock.depositQuick(1_000_000, "wusdc"); // 1 USDC = 1_000_000 base units
await scallopBuilder.signAndSendTxBlock(txBlock);

// Borrow SUI against the deposit
const borrowTx = scallopBuilder.createTxBlock();
borrowTx.setSender(senderAddress);
await borrowTx.borrowQuick(100_000_000, "sui"); // 0.1 SUI
await scallopBuilder.signAndSendTxBlock(borrowTx);

// Repay (always query live amount owed, not original borrow amount)
const repayTx = scallopBuilder.createTxBlock();
repayTx.setSender(senderAddress);
await repayTx.repayQuick(100_000_000, "sui");
await scallopBuilder.signAndSendTxBlock(repayTx);
```

Read a position:

```ts
const scallopQuery = scallopSDK.query;
const account = await scallopQuery.getObligationAccount(obligationId);
console.log(account.collaterals, account.borrows);
```

For Move-side integration: import Scallop's Move package and call entry functions directly. The TS SDK is the recommended path for most apps; only go Move-side if you need atomic composition with another on-chain protocol inside a single PTB.

## Common pitfalls

- **Risk level at or above 1.0.** Position is liquidatable. Scallop uses "Risk Level" (not "health factor") with `liquidation_factor` and `borrow_weight` per market. Always check the post-borrow risk level before submitting.
- **Oracle drift on volatile pairs.** During market stress, oracle prices can lag actual market prices; positions liquidate based on oracle, not market. Surface this risk to users.
- **Borrow caps.** Each market has a global borrow cap. Large borrows can fail silently if the cap is reached.
- **Interest accrues continuously.** Repaying the exact borrowed amount leaves a tiny residual interest debt. Query the live amount owed via `getObligationAccount`, not the original borrow amount.
- **sCoin transfers move position.** Transferring an sCoin (e.g. sSUI, sUSDC) transfers the deposit claim. Be careful in custody flows.
- **Collateral and borrow types must match a configured market.** Scallop does not auto-create markets.

## Where to go deeper

- Scallop docs: `https://docs.scallop.io/`
- Scallop GitHub: `https://github.com/scallop-io`
- Scallop TS SDK: `@scallop-io/sui-scallop-sdk`
- Scallop dashboard: `https://app.scallop.io/`
- Suiperpower skill: `skills/build/scallop-money-market/`

Last updated: 2026-05-11.
