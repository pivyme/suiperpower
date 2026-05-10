# Kiosk pitfalls

Mistakes that look right and break the marketplace.

## Forgetting the TransferPolicy

A new asset type without a TransferPolicy cannot be purchased from a Kiosk. The buyer's transaction reverts with a generic policy error.

Always pair an asset type with a TransferPolicy at publish time. Document the policy id in the project README.

## Wrong Object type in placeAndList

`placeAndList` requires the exact asset type string, including the package id. A typo (wrong module, wrong type name, wrong package) produces a confusing "type not found" error.

```ts
// correct
itemType: `${PACKAGE_ID}::my_collection::MyAsset`,

// common typo: missing the type generic, or wrong module name
```

## No Display

Without a Display, wallets render the asset as a generic Object. Marketplace UIs can fall back to reading raw fields, but the buyer's wallet still shows nothing useful after purchase.

Add Display at publish time:

```move
use sui::display;
use sui::package;

let publisher = package::claim(otw, ctx);
let mut display = display::new<MyAsset>(&publisher, ctx);
display::add(&mut display, b"name", b"{name}");
display::add(&mut display, b"image_url", b"{image_url}");
display::add(&mut display, b"description", b"{description}");
display::update_version(&mut display);
transfer::public_transfer(publisher, ctx.sender());
transfer::public_transfer(display, ctx.sender());
```

## Royalty bypass attempts

Buyers (or other contracts) may try to extract the asset from a Kiosk without satisfying the policy. The lock rule (kiosk_lock_rule) prevents this by requiring the asset re-enter a Kiosk on every transfer.

If you do not add the lock rule, a buyer can pull the asset into their wallet and trade peer-to-peer, bypassing future royalties. For a marketplace that enforces royalties, the lock rule is mandatory.

## Mixing personal and standard Kiosks

A "personal" Kiosk has its cap bound to a single owner. Trying to transfer the cap fails. Some marketplace flows assume non-personal Kiosks and break against personal ones.

Detect the Kiosk kind in the UI:

```ts
const isPersonal = await kioskClient.isPersonalKiosk(kioskId);
```

If the user has a personal Kiosk, route them to flows that respect that constraint.

## Withdraw confusion

Sale proceeds accumulate inside the Kiosk's purse. They are not auto-transferred to the seller. A seller who lists, sells, and never withdraws is confused why their wallet did not receive the SUI.

Surface a "your Kiosk has X SUI to withdraw" indicator in the UI. Or auto-withdraw on every sale, accepting the extra gas cost.

## Stale listings

A listed asset can be delisted by the seller. A buyer's UI showing a stale listing produces a "not for sale" error on purchase.

Either subscribe to Kiosk events, or refresh listings before showing the buy button.

## Multi-coin payments

Kiosk pricing is in SUI by default. For pricing in another coin (USDC, custom token), you need a custom rule that takes a Coin<T> in `prove`. Plan for this in the policy design from the start; retrofitting is painful.

## Kiosk count drift

Sellers can have multiple Kiosks (only personal Kiosks are constrained to one). Indexing "the seller's Kiosk" assumes a single one, which breaks for power sellers.

In your data model, assume seller -> many Kiosks. Aggregate listings across all of them in the UI.

Last updated: 2026-05-10.
