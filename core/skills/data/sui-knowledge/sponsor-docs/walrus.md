# Walrus on Sui (knowledge brief)

## What it is

Walrus is a decentralized blob storage protocol built on Sui. Storage nodes hold encoded shards of user data; a smart-contract registry on Sui tracks blob metadata, certifications, and lifetimes. Reads are content-addressed and verifiable against the on-chain commitment.

It is the headline Sui Overflow 2026 sponsor and is unique to the Sui ecosystem; there is no clean parity protocol on EVM or Solana today.

## When to use it

- You need to store data larger than is reasonable on chain (images, audio, video, datasets, archives).
- You want retrieval to be verifiable against an on-chain commitment, not just trust-the-CDN.
- You want the storage layer to live on the same chain as your business logic, so deletion, lifetime, and ownership are first-class Sui concepts.
- You want a write-once-read-many model with epoch-based pricing.

When NOT to use it:

- Pure ephemeral caching where IPFS or a centralized CDN is enough.
- Sub-millisecond read latency requirements; Walrus is fast but not CDN-fast.
- Encrypted data without a plan for key management; Walrus does not encrypt for you. See Seal (`@mysten/seal`) for threshold encryption with on-chain access control.

## Key concepts

- **Blob**: a unit of stored data, identified by its content hash (`blobId`).
- **Epoch**: Walrus's time unit for storage commitments. A blob is paid for to live N epochs.
- **Storage Node**: a Walrus participant holding shards of blobs.
- **Certification**: when enough storage nodes acknowledge they hold the blob's shards, the blob is "certified" on Sui.
- **Deletable vs permanent**: at write time you choose whether the blob can be deleted or is permanent.
- **Storage cost**: paid in WAL token (the Walrus utility token); cost is a function of size and epoch count.
- **Aggregator and publisher**: edge nodes that abstract chunking, erasure coding, and certification from end users. Most apps go through these rather than running their own storage node.

## Minimal integration recipe

Preferred approach: use the `@mysten/walrus` TS SDK (`npm install @mysten/walrus @mysten/sui`).

```ts
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus, WalrusFile } from '@mysten/walrus';

const client = new SuiGrpcClient({
  network: 'testnet',
}).$extend(walrus());

// Write a blob
const { blobId } = await client.walrus.writeBlob({
  blob: new TextEncoder().encode('Hello, Walrus'),
  deletable: true,
  epochs: 3,
  signer: keypair, // Ed25519Keypair from @mysten/sui
});

// Read a blob
const data = await client.walrus.readBlob({ blobId });
```

For higher-level file operations, use `WalrusFile`:

```ts
const file = WalrusFile.from({
  contents: new TextEncoder().encode('Hello'),
  identifier: 'README.md',
});
const results = await client.walrus.writeFiles({
  files: [file],
  epochs: 3,
  signer: keypair,
});
```

The raw HTTP API via public publisher/aggregator endpoints is also available but the SDK is the preferred TS approach.

CLI alternative:

```bash
walrus store hello.txt --epochs 5
walrus read <blob_id> --out hello-out.txt
```

For Move integration (committing a blob id on chain):

```move
public struct Document has key {
    id: UID,
    walrus_blob_id: vector<u8>,
    title: vector<u8>,
}
```

The blob id is the content hash; you can commit it on chain and treat the on-chain Object as the canonical record of "this Walrus blob belongs to this Document."

## Common pitfalls

- **Lifetime expiry.** A blob paid for N epochs is reclaimed after epoch N. If you want longer life, extend or pay more up front. Apps that "lose" a blob usually let it expire by accident.
- **Encryption is your problem.** Walrus stores bytes. If the data is sensitive, encrypt client-side before upload. Consider Seal (`@mysten/seal`) for threshold encryption with on-chain access policies, or bring your own key management.
- **Public publishers / aggregators are best-effort.** They are convenient for development. For production, run your own or use a paid Walrus service provider.
- **Blob id is content-addressed.** Two identical files have the same blob id. Re-uploading the same data does not create a new blob; it extends the existing one if you pay for more epochs.
- **Mainnet vs testnet endpoints differ.** Verify you are pointing at the right network's publisher and aggregator. Cross-network reads will silently return "not found."
- **Cost in WAL.** WAL is a separate token from SUI. Apps that route gas through SUI but storage through WAL need to manage two balances.

## Encryption with Seal

For encrypting data before storing on Walrus, use Seal (`@mysten/seal`). Seal provides threshold encryption with on-chain access control on Sui. Encrypted data can be stored on Walrus, on Sui as Objects, or any storage.

- Package: `npm install @mysten/seal`
- Docs: `https://seal-docs.wal.app/`
- Status: beta (testnet). Check for mainnet availability before shipping.

Seal extends a `SuiGrpcClient` the same way the Walrus SDK does. Encrypt client-side before uploading to Walrus; key management is handled by a committee of Seal key servers, with access policies defined on-chain.

## Where to go deeper

- Walrus official docs: `https://docs.wal.app/`
- Walrus TS SDK docs: `https://sdk.mystenlabs.com/walrus`
- Seal SDK docs: `https://sdk.mystenlabs.com/seal`
- Seal project docs: `https://seal-docs.wal.app/`
- Walrus GitHub: `https://github.com/MystenLabs/walrus`
- Walrus Sites docs: `https://docs.wal.app/docs/sites/getting-started/installing-the-site-builder`
- Suiperpower skill: `skills/build/walrus-storage/`
- Idea-phase research skill: `skills/idea/walrus-research/`

Last updated: 2026-05-11. Walrus mainnet is live (Epoch 1 began March 25, 2025). The `@mysten/walrus` SDK currently documents testnet configuration; verify mainnet endpoint availability before deploying to production.
