# Walrus quickstart recipes

Three surfaces, pick the one that fits. Default network is testnet for development.

## Endpoints

Testnet:

```
PUBLISHER:  https://publisher.walrus-testnet.walrus.space
AGGREGATOR: https://aggregator.walrus-testnet.walrus.space
```

Mainnet (live since March 2025):

```
PUBLISHER:  https://publisher.walrus.space
AGGREGATOR: https://aggregator.walrus.space
```

Verify these against the official Walrus docs at the time of integration. Cross-network reads silently return not-found.

## HTTP publisher (no SDK)

Smallest dependency footprint. Works in any backend that can do HTTPS.

Upload:

```bash
curl -X PUT "$PUBLISHER/v1/blobs?epochs=5" \
  --data-binary @./hello.txt
```

Response (truncated):

```json
{
  "newlyCreated": {
    "blobObject": {
      "blobId": "Tl3GHxEB...",
      "registeredEpoch": 12,
      "size": 13
    }
  }
}
```

Blob IDs are base64url-encoded strings, not hex. Do not prefix with `0x`.

Capture `blobId`. That is the content-addressed identifier you read with later.

Read:

```bash
curl -o hello-out.txt "$AGGREGATOR/v1/blobs/$BLOB_ID"
```

## HTTP API wrapper (browser or Node)

Raw `fetch()` against the publisher. No SDK dependency. Good enough for simple integrations.

```ts
import fs from "node:fs";

const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

export async function storeBlob(data: Uint8Array, epochs = 5): Promise<string> {
  const resp = await fetch(`${PUBLISHER}/v1/blobs?epochs=${epochs}`, {
    method: "PUT",
    body: data,
  });
  if (!resp.ok) throw new Error(`walrus store failed: ${resp.status}`);
  const json = await resp.json();
  const blobId =
    json.newlyCreated?.blobObject?.blobId ??
    json.alreadyCertified?.blobId;
  if (!blobId) throw new Error("walrus store: no blobId in response");
  return blobId;
}

export async function readBlob(blobId: string): Promise<Uint8Array> {
  const resp = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);
  if (!resp.ok) throw new Error(`walrus read failed: ${resp.status}`);
  return new Uint8Array(await resp.arrayBuffer());
}

const data = fs.readFileSync("./hello.txt");
const id = await storeBlob(data, 5);
const back = await readBlob(id);
console.log("ok", id, back.byteLength === data.byteLength);
```

Note that the response shape has two cases. A fresh upload returns `newlyCreated`. If the same content already exists, the publisher returns `alreadyCertified` with the existing `blobId`. Handle both.

## @mysten/walrus SDK (recommended for production)

The `@mysten/walrus` package extends a `SuiGrpcClient` with typed methods, automatic retries, and proper error handling. Prefer it over raw `fetch()` for anything beyond prototyping.

```bash
npm install @mysten/walrus @mysten/sui
```

```ts
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { walrus } from "@mysten/walrus";

const client = new SuiGrpcClient({ network: "testnet" }).$extend(walrus());

// Store (signer is required)
const { blobId, blobObject } = await client.walrus.writeBlob({
  blob: myData,
  deletable: true,
  epochs: 5,
  signer: myKeypair,
});

// Read
const data = await client.walrus.readBlob({ blobId });
```

`signer` is required for `writeBlob`. Blobs are permanent by default; pass `deletable: true` to allow later deletion. Return value includes both `blobId` and `blobObject`.

See the `@mysten/walrus` README for the full API surface (extend lifetime, delete, etc.).

## CLI

For one-off uploads or scripts:

```bash
walrus store hello.txt --epochs 5
# prints blob id to stdout

walrus read <blob_id> --out hello-out.txt
```

The CLI requires `walrus` installed and a wallet with WAL balance. For first integration, prefer the HTTP publisher; switch to the CLI when you need offline batch operations.

Use `walrus info` to check current epoch length, storage pricing, and system parameters.

## Deletable vs permanent

Blobs are **permanent by default**. Pass `deletable=true` explicitly to make a blob deletable (allows later deletion for a storage refund). There is no `?permanent=true` parameter.

```bash
# Permanent (default), cannot be deleted
curl -X PUT "$PUBLISHER/v1/blobs?epochs=5" --data-binary @./file.txt

# Deletable, blob can be deleted for storage refund
curl -X PUT "$PUBLISHER/v1/blobs?epochs=5&deletable=true" --data-binary @./file.txt
```

Pick permanent (default) for canonical, never-changing content (NFT media, archival datasets). Pick deletable for user-uploaded content where the user controls lifetime.

Note: public publishers enforce a **10 MiB default blob size limit**. For larger blobs, run your own publisher or use the CLI.

## Choosing epochs

A Walrus epoch is ~1 day on testnet and ~2 weeks on mainnet. Verify the current value with `walrus info` at integration time. Common choices (mainnet epochs):

| Use case | Epochs |
|---|---|
| Throwaway dev test | 1 |
| Short-lived user upload | 5 to 12 |
| One-year retention | ~26 |
| Multi-year, switch to permanent | n/a |

Document the choice in `.suiperpower/build-context.md`. Surprises about expiry come from undocumented choices.

## Walrus Sites

Walrus Sites lets you host static frontends (HTML/CSS/JS) directly on Walrus, served from a custom domain. The `site-builder` CLI handles packaging and deployment:

```bash
site-builder deploy ./dist
```

Useful for fully decentralized dApps where the frontend itself should be censorship-resistant. See the Walrus Sites docs for details.

## Encryption

Walrus stores bytes as-is. For access-controlled content, use Seal (`@mysten/seal`) to encrypt client-side before upload. Seal provides decentralized secrets management with on-chain access policies. See `references/seal-encryption.md` for the integration pattern.

Last updated: 2026-05-12. Targeting Walrus testnet and mainnet.
