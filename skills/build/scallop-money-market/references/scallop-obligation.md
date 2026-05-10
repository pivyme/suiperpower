# Obligation Object lifecycle

The Obligation is Scallop's per-user record. It tracks all collateral and borrow positions across markets for a single user.

## Creation

The first deposit auto-creates the Obligation. The SDK handles this transparently:

```ts
const tx = await scallop.builder.deposit("usdc", amount);
// internally: if no Obligation exists for the signer, creates one in the same tx
```

The Obligation Object id is returned in the transaction effects. Capture it from `objectChanges` and persist it per user.

```ts
const result = await scallop.client.signAndExecuteTransaction({
  transaction: tx,
  signer,
  options: { showObjectChanges: true },
});

const obligationId = result.objectChanges?.find(
  (c) => c.type === "created" && c.objectType.includes("Obligation"),
)?.objectId;
```

For subsequent sessions, query existing Obligations for the user:

```ts
const obligations = await scallop.query.getObligations(userAddress);
const obligationId = obligations[0]?.id;
```

## Per-user singleton, mostly

Conventionally one Obligation per user. The protocol allows multiple, useful for isolated risk buckets ("DCA bucket" vs "leveraged trade bucket"). For first integration, treat it as a singleton.

## Ownership

The Obligation is owned by the address that created it. Owner-only operations: deposit, borrow, repay, withdraw, claim rewards.

There is no transfer flow for Obligations. If the user changes wallets, they must close out the old position and open a new one in the new wallet.

## Health factor query

```ts
const account = await scallop.query.getObligationAccount(obligationId);

console.log({
  collaterals: account.collaterals,        // [{ asset, amount, valueUsd }]
  borrows: account.borrows,                // [{ asset, amount, valueUsd }]
  healthFactor: account.healthFactor,      // number, < 1 means liquidatable
  totalCollateralValueUsd: account.totalCollateralValueUsd,
  totalBorrowValueUsd: account.totalBorrowValueUsd,
});
```

This is the canonical view for UIs and risk checks.

## Closing an Obligation

When the user wants to exit fully:

1. Repay all borrows (use live amount-owed).
2. Withdraw all collateral.
3. The Obligation Object remains, but holds zero positions.

There is no "delete Obligation" call by design; the Object stays to preserve history and allow reuse.

## Cross-market Obligations

A single Obligation can hold multiple collateral and borrow positions across different markets. The health factor is computed across all of them. Adding a new collateral asset improves health; adding a new borrow asset reduces it.

For UIs that show "your position," show the cross-market view, not just one asset's slice.

## Concurrent updates

Obligations are owned Objects, so concurrent modifications from a single user are serialized at the wallet's tx level. No multi-signer race condition concerns. For app keepers operating on a user's Obligation, the keeper holds the user's signing capability or operates via a delegation pattern.

Last updated: 2026-05-10.
