# Seal: decentralized encryption for Walrus blobs

## What Seal is

Seal is a decentralized secrets management protocol on Sui. It lets you encrypt data client-side and control who can decrypt it through Move access policies deployed on chain. No centralized key server, no trusted third party holding keys.

- Package: `@mysten/seal`
- Docs: https://seal-docs.wal.app/
- Source and examples: https://github.com/MystenLabs/seal
- Status: live on mainnet

## How it works with Walrus

The pattern: encrypt data via Seal before uploading to Walrus. Store the ciphertext blob. Control decryption by defining who satisfies the on-chain access policy. Only authorized users can retrieve the decryption key shares from Seal's key server network.

Flow:

1. **Define access policy in Move.** A Move module that implements the Seal policy interface. The policy decides who can decrypt (e.g., NFT holder, token-gated, allowlist, DAO vote).
2. **Encrypt client-side.** Use the Seal SDK to encrypt the plaintext with the policy's object ID as the encryption target. This produces ciphertext that can only be decrypted by users who satisfy the policy.
3. **Store ciphertext on Walrus.** Upload the encrypted bytes via the publisher (HTTP API, CLI, or `@mysten/walrus` SDK). Capture the `blobId`.
4. **Retrieve and decrypt.** An authorized user fetches the ciphertext from Walrus, then calls the Seal SDK to obtain decryption key shares. The SDK reconstructs the key and decrypts locally.

## Minimal example

```bash
npm install @mysten/seal @mysten/walrus @mysten/sui
```

```ts
import { SealClient } from "@mysten/seal";
import { WalrusClient } from "@mysten/walrus";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

const seal = new SealClient({ suiClient, networkType: "testnet" });
const walrus = await WalrusClient.$extend({
  suiClient,
  network: "testnet",
});

// Encrypt (policyObjectId is your deployed Move access policy)
const { encryptedBytes } = await seal.encrypt({
  policyObjectId: "0x<your-policy-id>",
  plaintext: new TextEncoder().encode("secret data"),
});

// Store ciphertext on Walrus
const { blobId } = await walrus.writeBlob({
  blob: encryptedBytes,
  epochs: 5,
});

// Later: fetch and decrypt (caller must satisfy the Move policy)
const ciphertext = await walrus.readBlob({ blobId });
const plaintext = await seal.decrypt({
  encryptedBytes: ciphertext,
  // Seal SDK handles key share retrieval internally
});
```

The exact API shape may evolve. Check the `@mysten/seal` README and https://seal-docs.wal.app/ for current method signatures.

## When to use Seal vs plain AES

| Scenario | Approach |
|---|---|
| Access controlled by on-chain state (NFT gate, DAO, allowlist) | Seal |
| Single user encrypting their own private data | AES-GCM with a user-held key is simpler |
| Multi-party access without a shared secret | Seal |
| Data that must be readable by anyone | No encryption needed |

## Access policy examples

The Seal GitHub repo includes example Move policies for common patterns:

- Allowlist (owner adds/removes addresses)
- NFT-gated (must hold a specific NFT collection)
- Token-gated (must hold N tokens)
- Subscription (time-limited access)

Write your own policy module when none of the examples fit. The policy is a Move module that Seal's key servers call to verify access.

Last updated: 2026-05-11.
