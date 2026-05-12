# SuiNS quickstart reference

## Installation

```bash
npm install @mysten/suins
# Peer dependency:
npm install @mysten/sui
```

The package is `@mysten/suins`. Older names (`@suins/toolkit`, `@suins/sdk`) are deprecated.

## SuinsClient setup

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SuinsClient } from '@mysten/suins';

const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });
const suinsClient = new SuinsClient({ client: suiClient, network: 'mainnet' });
```

The `network` param accepts `'mainnet'` or `'testnet'`. It determines which on-chain SuiNS registry the client queries. Always match it to the `SuiClient` network.

## Querying (read operations)

### Get a name record

```typescript
const record = await suinsClient.getNameRecord('example.sui');
// Returns NameRecord or null if unregistered/expired.
// NameRecord fields: name, nftId, targetAddress, expirationTimestampMs,
//   data (avatar, contentHash, walrusSiteId), avatar, contentHash, walrusSiteId
```

Use `record.targetAddress` for forward lookup (name to address). For reverse lookup (address to default name), query the default name registry on chain. The SDK does not expose a standalone `getAddress()` or `getName()` method.

### Get price lists

```typescript
const priceList = await suinsClient.getPriceList();
// Returns pricing tiers: { [3,3] => 500_000_000, [4,4] => 100_000_000, [5,63] => 20_000_000 } (USDC MIST)

const renewalPriceList = await suinsClient.getRenewalPriceList();
// Same structure as getPriceList(), for renewal pricing.
```

### Calculate price

```typescript
const price = await suinsClient.calculatePrice({ name: 'myname', years: 2, isRegistration: true });
```

## SuinsTransaction (write operations)

For mutations (register, set address, set default, set user data), use `SuinsTransaction`:

```typescript
import { SuinsTransaction } from '@mysten/suins';
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
const suinsTx = new SuinsTransaction(suinsClient, tx);
```

### Register a name

```typescript
const nft = suinsTx.register({
  domain: 'myname.sui',
  years: 3,
  coinConfig: suinsClient.config.coins.USDC, // or .SUI or .NS
  coin,              // The payment coin object (optional for base asset)
  maxAmount: 60_000_000n, // Max payment in coin MIST
  priceInfoObjectId, // On-chain price info object (required for SUI/NS, not USDC)
});
```

Registration requires:
- `domain`: the full `.sui` name to register.
- `years`: duration (1 to 5).
- `coinConfig`: coin type config. Three options: `suinsClient.config.coins.SUI`, `.USDC`, or `.NS`.
- `coin`: a coin object with sufficient balance. Optional for the base asset.
- `maxAmount`: maximum payment in coin MIST (bigint).
- `priceInfoObjectId`: on-chain Pyth price feed object. Required for SUI and NS payments (price oracle lookup). Not required for USDC. Fetch via `suinsClient.getPriceInfoObject(tx, feed)`.

Returns the SuiNS name NFT `TransactionObjectArgument`.

### Renew a name

```typescript
suinsTx.renew({
  nft,               // The SuiNS name NFT object
  years: 2,
  coinConfig: suinsClient.config.coins.USDC,
  coin,
  maxAmount: 40_000_000n,
  priceInfoObjectId,
});
```

Same parameters as `register()` except `nft` replaces `domain`. Extends the expiration by the given number of years.

### Burn an expired name

```typescript
suinsTx.burnExpired({
  nft,               // The expired SuiNS name NFT object
  isSubname: false,  // true if this is a subname
});
```

Destroys an expired name to recover storage deposits. Only works on names past their expiration date.

### Set target address

```typescript
suinsTx.setTargetAddress({
  nft,              // The SuiNS name NFT object
  address: '0x...', // Target Sui address (omit to clear)
  isSubname: false,  // true if this is a subname
});
```

### Set default name (reverse record)

```typescript
suinsTx.setDefault('myname.sui');
```

Constraint: `setDefault` only works when the transaction signer is the same address the name currently points to. If the signer does not match the target address, the transaction will abort.

### Set user data

```typescript
suinsTx.setUserData({
  nft,                    // The SuiNS name NFT object
  key: 'walrusSiteId',   // Arbitrary string key
  value: siteObjectId,    // Arbitrary string value
  isSubname: false,       // true if this is a subname
});
```

Common user data keys: `walrusSiteId`, `avatar`, `contentHash`.

## Pricing

Base prices per year in USDC (fetch live prices with `suinsClient.getPriceList()`):

| Name length | Cost per year (USDC) |
|---|---|
| 3 characters | ~500 |
| 4 characters | ~100 |
| 5+ characters | ~20 |

The pricing refers to the name portion only (before `.sui`). A name like `abc.sui` is 3 characters. SUI and NS payments use a Pyth price oracle for conversion, so exact SUI cost fluctuates. Use `suinsClient.calculatePrice()` for precise amounts.

## Move Registry (MVR) integration

MVR provides human-readable package names (`@org/package`) that resolve to on-chain Sui package IDs. Two integration points:

### CLI: add named dependencies to Move.toml

```bash
# Install the MVR CLI globally
npm install -g @aspect-run/mvr

# Add a named package dependency
mvr add @deepbook/core --network mainnet
```

This updates your `Move.toml` with the resolved package address for the specified network.

### TypeScript: resolve named packages in transactions

```typescript
import { namedPackagesPlugin } from '@mysten/sui/transactions';
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
// Enable MVR resolution for this transaction
tx.addPlugin(namedPackagesPlugin({ suiClient }));

// Now you can use @org/package in moveCall targets
tx.moveCall({
  target: '@deepbook/core::pool::create',
  arguments: [/* ... */],
});
```

At transaction build time, the plugin resolves `@deepbook/core` to the actual package ID via a network call.

### Build-time resolution (no runtime network call)

For production builds where you want to avoid runtime MVR lookups:

```bash
npm install @mysten/mvr-static
```

Use `@mysten/mvr-static` to pre-resolve all named packages at build time and embed the addresses.

## Full resolution example

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SuinsClient } from '@mysten/suins';

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
const suins = new SuinsClient({ client, network: 'mainnet' });

// Resolve a .sui name to an address for a transaction
async function resolveRecipient(input: string): Promise<string> {
  if (input.endsWith('.sui')) {
    const record = await suins.getNameRecord(input);
    if (!record?.targetAddress) throw new Error(`Name ${input} not found or expired`);
    return record.targetAddress;
  }
  return input; // Already an address
}

// Get full name metadata
async function getNameInfo(name: string) {
  const record = await suins.getNameRecord(name);
  if (!record) return null;
  return {
    address: record.targetAddress,
    expires: new Date(Number(record.expirationTimestampMs)),
    avatar: record.avatar,
    walrusSite: record.walrusSiteId,
  };
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
```
