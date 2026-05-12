# Obligation Object lifecycle

The Obligation is Scallop's per-user record. It tracks all collateral and borrow positions across markets for a single user.

## Creation

The first deposit via the ScallopClient auto-creates the Obligation transparently. You can also create one explicitly via the builder:

```ts
const scallopBuilder = await scallopSDK.createScallopBuilder();
const txBlock = scallopBuilder.createTxBlock();
txBlock.setSender(senderAddress);

// Explicit creation (needed before first borrow if not depositing first):
txBlock.openObligationEntry();

// Or for programmatic access to the obligation and key:
const [obligation, obligationKey, hotPotato] = txBlock.openObligation();
```

When using `depositQuick`, the SDK handles Obligation creation internally if none exists.

The Obligation Object id is returned in the transaction effects. Capture it from `objectChanges` and persist it per user.

For subsequent sessions, query existing Obligations:

```ts
const scallopQuery = scallopSDK.query;
const obligations = await scallopQuery.getObligations(ownerAddress);
const obligationId = obligations[0]?.id;
```

## Per-user singleton, mostly

Conventionally one Obligation per user. The protocol allows up to 5 per address, useful for isolated risk buckets ("DCA bucket" vs "leveraged trade bucket"). For first integration, treat it as a singleton.

## Ownership

The Obligation is owned by the address that created it. Owner-only operations: deposit, borrow, repay, withdraw, claim rewards.

There is no transfer flow for Obligations. If the user changes wallets, they must close out the old position and open a new one in the new wallet.

## Obligation account query

```ts
const scallopQuery = scallopSDK.query;
const account = await scallopQuery.getObligationAccount(obligationId);

console.log({
  collaterals: account.collaterals,
  borrows: account.borrows,
});
```

This is the canonical view for UIs and risk checks. Scallop uses "Risk Level" terminology with `liquidation_factor` and `borrow_weight` per market. Refer to `references/scallop-risk.md` for the risk model details.

## Closing an Obligation

When the user wants to exit fully:

1. Repay all borrows (use live amount-owed).
2. Withdraw all collateral.
3. The Obligation Object remains, but holds zero positions.

There is no "delete Obligation" call by design; the Object stays to preserve history and allow reuse.

## Cross-market Obligations

A single Obligation can hold multiple collateral and borrow positions across different markets. The risk level is computed across all of them. Adding a new collateral asset lowers risk; adding a new borrow asset raises it.

For UIs that show "your position," show the cross-market view, not just one asset's slice.

## Concurrent updates

Obligations are owned Objects, so concurrent modifications from a single user are serialized at the wallet's tx level. No multi-signer race condition concerns. For app keepers operating on a user's Obligation, the keeper holds the user's signing capability or operates via a delegation pattern.

Last updated: 2026-05-11.
