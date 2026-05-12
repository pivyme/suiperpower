# Seal quickstart recipes

Install, initialize, encrypt, decrypt. Default network is testnet for development.

Sources: https://github.com/MystenLabs/seal, https://sdk.mystenlabs.com/seal

## Install

```bash
npm install @mysten/seal @mysten/sui
```

`@mysten/seal` v1.1.0+ requires `@mysten/sui` ^2.5.1 as a peer dependency.

## SealClient init (standalone)

```typescript
import { SealClient } from '@mysten/seal';
import { SuiGrpcClient } from '@mysten/sui/grpc';

const suiClient = new SuiGrpcClient({ network: 'testnet' });

const sealClient = new SealClient({
  suiClient,
  serverConfigs: [{
    objectId: '0xb012378c9f3799fb5b1a7083da74a4069e3c3f1c93de0b27212a5799ce1e1e98',
    weight: 1,
    aggregatorUrl: 'https://seal-aggregator-testnet.mystenlabs.com',
  }],
  verifyKeyServers: false, // true in production
});
```

The `serverConfigs` array lists the key servers that hold decryption key shares. For testnet, use the single decentralized key server above. For production, set `verifyKeyServers: true`.

## SealClient init (via $extend)

```typescript
import { seal } from '@mysten/seal';
import { SuiGrpcClient } from '@mysten/sui/grpc';

const client = new SuiGrpcClient({ network: 'testnet' }).$extend(seal({
  serverConfigs: [{ /* same as above */ }],
}));
```

## Package IDs

| Network | Package ID |
|---|---|
| Mainnet | `0xcb83a248bda5f7a0a431e6bf9e96d184e604130ec5218696e3f1211113b447b7` |
| Testnet | `0x8d90881fc48eb30d4422db68083b49e7d0f879658444e3a0ed85ce47feaa54b2` |

## Encrypt

Build the identity from the policy object ID + a random nonce. The nonce prevents content-addressed collisions.

```typescript
import { fromHex, toHex } from '@mysten/sui/utils';

const policyObjectId = '0x<your-deployed-policy-object>';
const nonce = crypto.getRandomValues(new Uint8Array(5));
const id = toHex(new Uint8Array([...fromHex(policyObjectId), ...nonce]));

const packageId = '0x8d90881fc48eb30d4422db68083b49e7d0f879658444e3a0ed85ce47feaa54b2'; // testnet

const { encryptedObject } = await sealClient.encrypt({
  threshold: 1,
  packageId,
  id,
  data: new TextEncoder().encode('secret content'),
});
```

`threshold` is the minimum number of key server shares needed for decryption. Must match at decrypt time.

## Decrypt

Decryption requires a SessionKey signed by the user's wallet.

```typescript
import { SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';

// 1. Create a SessionKey (signer is required)
const sessionKey = await SessionKey.create({
  address: userAddress,
  packageId,
  ttlMin: 10, // expires in 10 minutes
  signer: keypair,
  suiClient,
});

// 3. Build a seal_approve PTB (dry-run only, no state change)
const tx = new Transaction();
tx.moveCall({
  target: `${yourPolicyPackageId}::your_module::seal_approve`,
  arguments: [tx.pure.vector('u8', Array.from(fromHex(id))), /* policy-specific args */],
});
const txBytes = await tx.build({ client: suiClient });

// 4. Decrypt
const decryptedData = await sealClient.decrypt({
  data: encryptedObject,
  sessionKey,
  txBytes,
});
```

## SessionKey methods

| Method | Purpose |
|---|---|
| `SessionKey.create({ address, packageId, ttlMin, signer, suiClient })` | Create a new session key (signer is required) |
| `isExpired()` | Check if the TTL has elapsed |
| `export()` | Serialize for storage (e.g., sessionStorage) |
| `SessionKey.import(data)` | Restore from serialized form |

## Walrus + Seal integration (canonical pattern)

Encrypt with Seal, store ciphertext on Walrus, decrypt after policy check.

```typescript
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';

// Create a Walrus-extended client
const walrusClient = new SuiGrpcClient({ network: 'testnet' }).$extend(walrus());

// Encrypt
const { encryptedObject } = await sealClient.encrypt({
  threshold: 1, packageId, id, data: plaintext,
});

// Upload ciphertext to Walrus
const { blobId } = await walrusClient.walrus.writeBlob({
  blob: encryptedObject, epochs: 5, signer: myKeypair,
});

// Later: download and decrypt
const ciphertext = await walrusClient.walrus.readBlob({ blobId });
const decrypted = await sealClient.decrypt({
  data: new Uint8Array(ciphertext),
  sessionKey,
  txBytes,
});
```

The blob on Walrus is opaque ciphertext. Without passing the Seal policy check, the bytes are useless.

Last updated: 2026-05-12. Targeting Seal testnet key server.
