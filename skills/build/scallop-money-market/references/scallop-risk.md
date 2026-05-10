# Scallop risk surface

Lending introduces risk that the user must understand. Bury it in a tooltip and you ship a footgun.

## Health factor math (intuition)

```
health = sum(collateral_value_usd * collateral_factor) / sum(borrow_value_usd)
```

`collateral_factor` is per market. USDC might be 0.85, volatile assets lower. When `health < 1.0`, the position is liquidatable.

Most apps surface a "safe zone" floor (1.5+), a "warning zone" (1.1 to 1.5), and a "danger zone" (under 1.1). Calibrate to the volatility of the borrow asset.

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

Always query live amount-owed at repay time:

```ts
const owed = await scallop.query.getObligationBorrow(obligationId, asset);
// owed.amount = principal + accrued interest
```

## Liquidation incentive

Liquidators are paid a discount on the seized collateral. The discount is the user's "tax" if their position is liquidated. Explain this clearly in the UI:

> If your position is liquidated, you receive the remaining collateral after the borrow is repaid and the liquidator's bonus is paid (typically X percent of the seized collateral).

## scToken transferability

scTokens are ERC-20-ish receipts on Sui. Transferring an scToken transfers the deposit claim. For custody apps:

- Treat scToken transfers as position transfers.
- Add a confirmation step before transferring scTokens to an external address.
- For multi-user apps, do not pool scTokens across users without strict accounting; accidentally moving the wrong scToken means the wrong user owns the position.

## Mainnet vs testnet posture

For mainnet integrations, real assets are at risk. Testnet positions cannot be liquidated by real liquidators (or the liquidator network is sparse). Test the liquidation path explicitly by simulating an undercollateralized state on a fork or by reading mainnet liquidation events for a real-world reference.

Last updated: 2026-05-10.
