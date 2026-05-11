# Scallop risk surface

Lending introduces risk that the user must understand. Bury it in a tooltip and you ship a footgun.

## Risk level math (Scallop terminology)

Scallop uses **Risk Level**, not "health factor." The key per-market parameters are `liquidation_factor` and `borrow_weight`.

```
risk_level = sum(borrow_value_usd * borrow_weight) / sum(collateral_value_usd * liquidation_factor)
```

`liquidation_factor` and `borrow_weight` are per market. When `risk_level >= 1.0`, the position is liquidatable.

Note the inversion compared to protocols that use a "health factor" (where health < 1.0 means liquidatable). In Scallop's model, higher risk level means closer to liquidation.

Most apps surface a "safe zone" (risk_level under 0.6), a "warning zone" (0.6 to 0.9), and a "danger zone" (above 0.9). Calibrate thresholds to the volatility of the collateral and borrow assets.

## Oracle drift

Scallop reads prices from Pyth feeds. During market stress, oracle prices can lag actual market prices by seconds to minutes. Liquidations execute against the oracle price.

Implications:

- A position that looks safe at "real" prices can liquidate when the oracle catches up.
- A liquidation can also fail to fire when it "should," leaving bad debt.
- For UI, surface the oracle price alongside the user's reference price, not just one.

For a stress-aware product, monitor Pyth feed staleness. If a feed has not updated in N seconds, refuse to accept new borrows against it.

## Borrow caps

Each market has a global borrow cap. Once filled, new borrows fail. Large operators discover this when their order rejects with no obvious reason.

Mitigations:

- Read borrow utilization in the UI: "X / Y borrowed."
- For automated strategies, fall back to a different market if the primary is at cap.

## Interest accrual

Interest accrues continuously. Repaying the exact borrowed amount leaves dust debt that compounds and surprises the user.

Always query live amount owed at repay time via `getObligationAccount`:

```ts
const scallopQuery = scallopSDK.query;
const account = await scallopQuery.getObligationAccount(obligationId);
// Read the borrows array for the target asset's current amount (principal + accrued interest)
```

There is no `getObligationBorrow(obligationId, asset)` method. Use `getObligationAccount` and extract the borrow entry for the asset you need.

## Liquidation incentive

Liquidators are paid a discount on the seized collateral. The discount is the user's "tax" if their position is liquidated. Explain this clearly in the UI:

> If your position is liquidated, you receive the remaining collateral after the borrow is repaid and the liquidator's bonus is paid (typically X percent of the seized collateral).

## sCoin transferability

Scallop issues **sCoins** (e.g. sSUI, sUSDC) as deposit receipts. These are standard Sui Coin objects, not ERC-20 style tokens. Transferring an sCoin transfers the deposit claim. For custody apps:

- Treat sCoin transfers as position transfers.
- Add a confirmation step before transferring sCoins to an external address.
- For multi-user apps, do not pool sCoins across users without strict accounting; accidentally moving the wrong sCoin means the wrong user owns the position.

## Mainnet-only SDK

The Scallop SDK only supports mainnet. Testnet has no address package IDs and will error. Real assets are at risk on mainnet. Test the liquidation path explicitly by simulating an undercollateralized state locally or by reading mainnet liquidation events for a real-world reference.

## Outflow and borrow limits

Markets enforce per-24h outflow limits and per-market borrow caps. Large withdrawals or borrows can fail if limits are reached. For automated strategies, check utilization before submitting and fall back to a different market if the primary is at capacity.

Last updated: 2026-05-11.
