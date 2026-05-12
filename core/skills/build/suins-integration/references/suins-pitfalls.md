# SuiNS common pitfalls

## Wrong package name

The correct package is `@mysten/suins`. Older names like `@suins/toolkit` or `@suins/sdk` are deprecated and will not work with the current API. Always install `@mysten/suins`.

## Network mismatch

`SuinsClient` requires a `network` param (`'mainnet'` or `'testnet'`). If the network does not match your `SuiClient` RPC endpoint, lookups will silently return `undefined` or incorrect results. Always ensure both point to the same network.

## setDefault signer constraint

`setDefault('myname.sui')` only works when the transaction signer is the address that the name currently resolves to. If you call `setDefault` from a different address, the transaction aborts. Set the target address first with `setTargetAddress`, then call `setDefault` from that same address.

## Registration requires payment objects

`suinsTx.register()` needs a `coinConfig` (SUI, USDC, or NS), a `coin` object, `maxAmount`, and a `priceInfoObjectId`. The `priceInfoObjectId` is required for SUI and NS payments (fetched via `suinsClient.getPriceInfoObject(tx, feed)`) but not for USDC. Do not hardcode `priceInfoObjectId` values, they can change. Fetch the current value at runtime.

## Names expire

SuiNS names have an expiration date based on the registration duration (1 to 5 years). A resolved address can become `undefined` after expiration. Always handle the `undefined` case in resolution code. Do not cache resolved addresses indefinitely.

## MVR resolution is a network call

`namedPackagesPlugin` makes a network request to resolve `@org/package` to a package ID at transaction build time. This adds latency and a failure point. For production, consider `@mysten/mvr-static` to pre-resolve at build time and avoid runtime lookups.

## Subnames require isSubname flag

When calling `setTargetAddress` on a subname (e.g., `sub.name.sui`), you must set `isSubname: true`. Omitting this flag on a subname will cause the transaction to fail.

## Do not assume all addresses have names

Most Sui addresses do not have a SuiNS name. Always have a fallback display (truncated address) when `getNameRecord` returns `null`. Never treat a null result as an error in name lookups.

## getAddress() and getName() do not exist

The SDK does not expose standalone `getAddress()` or `getName()` methods. Use `getNameRecord(name)` which returns a full `NameRecord` with `targetAddress`, `expirationTimestampMs`, `avatar`, `walrusSiteId`, and other fields. Returns `null` if the name is unregistered or expired.
