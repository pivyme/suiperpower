# Kiosk quickstart

Minimal recipes using `@mysten/kiosk` and `@mysten/sui` for a marketplace flow.

## Install

```bash
pnpm add @mysten/sui @mysten/kiosk
```

## Init

The Kiosk SDK does not support `SuiGrpcClient` yet. Use `SuiJsonRpcClient` (aliased as `SuiClient`) for Kiosk operations.

```ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { kiosk } from "@mysten/kiosk";

const sui = new SuiClient({ url: getFullnodeUrl("testnet") });
const kioskClient = sui.$extend(kiosk());
```

## Create a Kiosk for the seller

```ts
import { Transaction } from "@mysten/sui/transactions";
import { KioskTransaction } from "@mysten/kiosk";

const tx = new Transaction();
const kioskTx = new KioskTransaction({ transaction: tx, kioskClient: sui });

kioskTx.create();
kioskTx.shareAndTransferCap(sellerAddress);

const result = await sui.signAndExecuteTransaction({
  transaction: tx,
  signer: sellerSigner,
  options: { showObjectChanges: true },
});

const kioskId = result.objectChanges?.find(
  (c) => c.type === "created" && c.objectType.endsWith("::kiosk::Kiosk"),
)?.objectId;
const kioskCapId = result.objectChanges?.find(
  (c) => c.type === "created" && c.objectType.endsWith("::kiosk::KioskOwnerCap"),
)?.objectId;
```

Persist `kioskId` and `kioskCapId` per seller.

## List an item

```ts
const tx = new Transaction();
const kioskTx = new KioskTransaction({
  transaction: tx,
  kioskClient: sui,
  cap: { kioskId, objectId: kioskCapId, isPersonal: false },
});

kioskTx.placeAndList({
  itemType: `${PACKAGE_ID}::my_collection::MyAsset`,
  itemId: assetObjectId,
  price: 1_000_000_000n, // 1 SUI in MIST
});

await sui.signAndExecuteTransaction({ transaction: tx, signer: sellerSigner });
```

Now `MyAsset` lives inside the Kiosk and is listed at the price. The seller's wallet no longer holds it directly.

## Purchase from a different wallet

```ts
const tx = new Transaction();
const kioskTx = new KioskTransaction({ transaction: tx, kioskClient: sui });

kioskTx.purchaseAndResolvePolicies({
  itemType: `${PACKAGE_ID}::my_collection::MyAsset`,
  itemId: assetObjectId,
  price: 1_000_000_000n,
  sellerKiosk: kioskId,
});

// optionally place the bought item into the buyer's own Kiosk
// kioskTx.placeInBuyerKiosk(...);

kioskTx.finalize();

await sui.signAndExecuteTransaction({ transaction: tx, signer: buyerSigner });
```

The PTB pays the seller, applies the TransferPolicy (royalty + any rules), and delivers the asset to the buyer.

## Withdraw seller proceeds

The seller's payout sits in the Kiosk's purse. Withdraw separately:

```ts
const tx = new Transaction();
const kioskTx = new KioskTransaction({
  transaction: tx,
  kioskClient: sui,
  cap: { kioskId, objectId: kioskCapId, isPersonal: false },
});

kioskTx.withdraw(sellerAddress, undefined); // undefined = withdraw all
await sui.signAndExecuteTransaction({ transaction: tx, signer: sellerSigner });
```

## Read listings

```ts
const data = await sui.getKiosk({
  id: kioskId,
  options: { withListingPrices: true, withObjects: true },
});

console.log(data.items, data.listings, data.kiosk.profits);
```

## Personal Kiosks

A "personal" Kiosk binds the cap to a single owner address (cannot be transferred). Useful for self-sovereign collector wallets where the cap should never escape.

```ts
kioskTx.create({ kind: "Personal" });
```

For a marketplace with seller flexibility, the standard non-personal Kiosk is fine.

Last updated: 2026-05-11.
