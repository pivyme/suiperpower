# Committing a Walrus blob id on chain

When the on-chain Object should be the canonical record of "this Walrus blob belongs to this user / asset", the blob id lives in a Move struct.

## Minimal Move pattern

```move
module my_pkg::document;

use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::TxContext;

public struct Document has key, store {
    id: UID,
    title: vector<u8>,
    walrus_blob_id: vector<u8>,
    walrus_epochs: u64,
}

public fun create(
    title: vector<u8>,
    walrus_blob_id: vector<u8>,
    walrus_epochs: u64,
    ctx: &mut TxContext,
): Document {
    Document {
        id: object::new(ctx),
        title,
        walrus_blob_id,
        walrus_epochs,
    }
}

public entry fun mint_and_transfer(
    title: vector<u8>,
    walrus_blob_id: vector<u8>,
    walrus_epochs: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    let doc = create(title, walrus_blob_id, walrus_epochs, ctx);
    transfer::public_transfer(doc, recipient);
}
```

The `walrus_blob_id` field is the content hash returned by the publisher, stored as raw bytes.

## Atomic upload-then-commit

For atomicity, do the Walrus upload first (off chain), then put the resulting blob id into a single PTB that calls `mint_and_transfer`. If the upload fails, no on-chain state changes. If the on-chain call fails, the blob still lives in Walrus until expiry, and you can retry the on-chain commit.

```ts
import { Transaction } from "@mysten/sui/transactions";
import { storeBlob } from "./walrus-client";

const data = await readFile(path);
const blobId = await storeBlob(data, 26);

const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::document::mint_and_transfer`,
  arguments: [
    tx.pure.vector("u8", Array.from(new TextEncoder().encode(title))),
    tx.pure.vector("u8", Array.from(new TextEncoder().encode(blobId))),
    tx.pure.u64(26),
    tx.pure.address(userAddr),
  ],
});

await client.signAndExecuteTransaction({ transaction: tx, signer });
```

## Notes on the type

`vector<u8>` for the blob id is the safest choice. Walrus blob ids are typically encoded as a base-something string in transit. The on-chain canonical form is the raw bytes; encode/decode at the API boundary.

If you prefer a typed wrapper for clarity, define a fresh struct:

```move
public struct WalrusBlobId has store, copy, drop {
    bytes: vector<u8>,
}
```

This costs nothing extra and makes Object inspection more readable.

## Lifetime tracking on chain

If the user can extend lifetime, store `walrus_epochs` and a `last_extended_at_epoch` field. When the user pays to extend in Walrus, record the new epoch in the same Move call. The on-chain record is then the authority on "is this blob still alive."

```move
public entry fun extend_lifetime(
    doc: &mut Document,
    new_epochs: u64,
    _ctx: &mut TxContext,
) {
    doc.walrus_epochs = new_epochs;
}
```

Gate this behind a capability or `&mut` ownership. Random callers should not be able to update lifetime metadata for someone else's Document.

Last updated: 2026-05-10.
