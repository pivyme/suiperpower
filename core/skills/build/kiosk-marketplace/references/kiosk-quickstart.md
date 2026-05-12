# Kiosk quickstart

Minimal recipes using `@mysten/kiosk` and `@mysten/sui` for a marketplace flow.

## Install

```bash
pnpm add @mysten/sui @mysten/kiosk
```

## Init

The Kiosk SDK requires `SuiJsonRpcClient` or `SuiGraphQLClient`. gRPC clients are not supported (the SDK depends on event queries). Use `$extend(kiosk())` to add the kiosk extension.

```ts
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { kiosk } from "@mysten/kiosk";

const client = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl("testnet"),
  network: "testnet",
}).$extend(kiosk());
// client.kiosk is now available for all kiosk operations
```

## Create a Kiosk for the seller

```ts
import { Transaction } from "@mysten/sui/transactions";
import { KioskTransaction } from "@mysten/kiosk";

const tx = new Transaction();
const kioskTx = new KioskTransaction({ kioskClient: client.kiosk, transaction: tx });

kioskTx.create();
kioskTx.shareAndTransferCap(sellerAddress);
kioskTx.finalize();

const result = await client.signAndExecuteTransaction({
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
  kioskClient: client.kiosk,
  transaction: tx,
  cap: { kioskId, objectId: kioskCapId, isPersonal: false },
});

kioskTx.placeAndList({
  itemType: `${PACKAGE_ID}::my_collection::MyAsset`,
  item: assetObjectId,
  price: 1_000_000_000n, // 1 SUI in MIST
});

kioskTx.finalize();
await client.signAndExecuteTransaction({ transaction: tx, signer: sellerSigner });
```

Now `MyAsset` lives inside the Kiosk and is listed at the price. The seller's wallet no longer holds it directly.

## Purchase from a different wallet

```ts
const tx = new Transaction();
const kioskTx = new KioskTransaction({ kioskClient: client.kiosk, transaction: tx });

await kioskTx.purchaseAndResolve({
  itemType: `${PACKAGE_ID}::my_collection::MyAsset`,
  itemId: assetObjectId,
  price: 1_000_000_000n,
  sellerKiosk: kioskId,
});

kioskTx.finalize();

await client.signAndExecuteTransaction({ transaction: tx, signer: buyerSigner });
```

The PTB pays the seller, applies the TransferPolicy (royalty + any rules), and delivers the asset to the buyer. `purchaseAndResolve` automatically queries the TransferPolicy and resolves all rules.

## Withdraw seller proceeds

The seller's payout sits in the Kiosk's purse. Withdraw separately:

```ts
const tx = new Transaction();
const kioskTx = new KioskTransaction({
  kioskClient: client.kiosk,
  transaction: tx,
  cap: { kioskId, objectId: kioskCapId, isPersonal: false },
});

kioskTx.withdraw(sellerAddress, undefined); // undefined = withdraw all
kioskTx.finalize();
await client.signAndExecuteTransaction({ transaction: tx, signer: sellerSigner });
```

## Read listings

```ts
const data = await client.kiosk.getKiosk({
  id: kioskId,
  options: { withKioskFields: true, withListingPrices: true },
});

console.log(data.items, data.listings, data.kiosk.profits);
```

## Personal Kiosks

A "personal" Kiosk binds the cap to a single owner address (cannot be transferred). Useful for self-sovereign collector wallets where the cap should never escape. Create one with `createPersonal()` instead of `create()`:

```ts
kioskTx.createPersonal();
kioskTx.shareAndTransferCap(ownerAddress);
```

The SDK handles personal vs non-personal kiosks seamlessly through the cap wrapping.

For a marketplace with seller flexibility, the standard non-personal Kiosk (`create()`) is fine.

Last updated: 2026-05-12.
