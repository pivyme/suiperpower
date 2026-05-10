# Walrus quickstart recipes

Three surfaces, pick the one that fits. Default network is testnet for development.

## Endpoints (testnet)

```
PUBLISHER:  https://publisher.walrus-testnet.walrus.space
AGGREGATOR: https://aggregator.walrus-testnet.walrus.space
```

Verify these against the official Walrus docs at the time of integration. Mainnet endpoints are different.

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
      "blobId": "0xb0fa...",
      "registeredEpoch": 12,
      "size": 13
    }
  }
}
```

Capture `blobId`. That is the content-addressed identifier you read with later.

Read:

```bash
curl -o hello-out.txt "$AGGREGATOR/v1/blobs/$BLOB_ID"
```

## TS SDK (browser or Node)

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

## CLI

For one-off uploads or scripts:

```bash
walrus store hello.txt --epochs 5
# prints blob id to stdout

walrus read <blob_id> --out hello-out.txt
```

The CLI requires `walrus` installed and a wallet with WAL balance. For first integration, prefer the HTTP publisher; switch to the CLI when you need offline batch operations.

## Permanent vs deletable

The publisher accepts `?permanent=true` to mark a blob as permanent. Permanent blobs cost more up front and cannot be deleted for storage refund. Default is deletable, paid for N epochs.

Pick deletable for user-uploaded content where the user controls lifetime. Pick permanent for canonical, never-changing content (NFT media, archival datasets).

## Choosing epochs

A Walrus epoch is roughly two weeks; verify the current value at integration time. Common choices:

| Use case | Epochs |
|---|---|
| Throwaway dev test | 1 |
| Short-lived user upload | 5 to 12 |
| One-year retention | ~26 |
| Multi-year, switch to permanent | n/a |

Document the choice in `.suiperpower/build-context.md`. Surprises about expiry come from undocumented choices.

Last updated: 2026-05-10. Targeting Walrus testnet stable.
