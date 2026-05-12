# Sui SDK v1.x to v2.0 Migration Analysis

Generated: 2026-05-11
Source: https://sdk.mystenlabs.com/sui/migrations/sui-2.0

Our skills were written against SDK v1.x. The SDK is now at v2.16.2. This doc maps every breaking change, shows old vs new code side-by-side, and lists every file in our codebase that needs updating.

---

## TL;DR

- **29 instances** of v1.x SDK patterns across **9 files**
- JSON-RPC is being decommissioned (reported target: July 2026). gRPC is the new default.
- The `$extend` pattern replaces standalone client classes (KioskClient, WalrusClient, DeepBookClient)
- `@mysten/dapp-kit` is replaced by `@mysten/dapp-kit-react` + `@mysten/dapp-kit-core`
- `SuiClient` is now `SuiGrpcClient` (recommended) or `SuiJsonRpcClient` (legacy)
- All ecosystem SDKs (Walrus, Kiosk, DeepBook) now plug into the client via `$extend`

---

## 1. Client Initialization

### Old (v1.x)
```ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
```

### New (v2.0+)
```ts
// RECOMMENDED: gRPC transport
import { SuiGrpcClient } from "@mysten/sui/grpc";

const client = new SuiGrpcClient({
  network: "mainnet",
  baseUrl: "https://fullnode.mainnet.sui.io:443",
});

// LEGACY: JSON-RPC transport (being deprecated)
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";

const client = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl("mainnet"),
  network: "mainnet",  // now required
});
```

### What changed
| v1.x | v2.0+ | Breaking? |
|------|-------|-----------|
| `SuiClient` | `SuiGrpcClient` or `SuiJsonRpcClient` | YES |
| `getFullnodeUrl` | `getJsonRpcFullnodeUrl` (JSON-RPC only) | YES |
| `@mysten/sui/client` import path | `@mysten/sui/grpc` or `@mysten/sui/jsonRpc` | YES |
| `url` constructor param | `baseUrl` (gRPC) or `url` (JSON-RPC) + required `network` | YES |

---

## 2. The $extend Pattern (Ecosystem SDKs)

All ecosystem SDKs now plug into the Sui client instead of being standalone classes.

### Old (v1.x)
```ts
// Walrus
import { WalrusClient } from "@mysten/walrus";
const walrus = new WalrusClient({ network: "testnet", suiClient: client });

// Kiosk
import { KioskClient, Network } from "@mysten/kiosk";
const kioskClient = new KioskClient({ client, network: Network.TESTNET });

// DeepBook
import { DeepBookClient } from "@mysten/deepbook-v3";
const deepbook = new DeepBookClient({ network: "testnet" });
```

### New (v2.0+)
```ts
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { walrus } from "@mysten/walrus";
import { kiosk } from "@mysten/kiosk";
import { deepbook } from "@mysten/deepbook-v3";

const client = new SuiGrpcClient({ network: "testnet", baseUrl: "..." })
  .$extend(walrus())
  .$extend(kiosk())
  .$extend(deepbook({ address: userAddr }));

// Then use via:
await client.walrus.writeFiles({...});
await client.kiosk.getKiosks({...});
client.deepbook.deepBook.placeLimitOrder({...})(tx);
```

### What changed
| v1.x | v2.0+ | Breaking? |
|------|-------|-----------|
| `new WalrusClient(...)` | `client.$extend(walrus())` | YES |
| `new KioskClient(...)` | `client.$extend(kiosk())` | YES |
| `new DeepBookClient(...)` | `client.$extend(deepbook({...}))` | Deprecated (old still works for now) |
| `Network` enum from `@mysten/kiosk` | Removed, derived from client | YES |
| Standalone client instances | Methods accessed via `client.<extension>.*` | YES |

---

## 3. dapp-kit (Frontend)

### Old (v1.x)
```ts
import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <YourApp />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

### New (v2.0+)
```ts
import { DAppKitProvider, createDAppKit } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const dAppKit = createDAppKit({
  networks: {
    testnet: { url: "https://fullnode.testnet.sui.io:443" },
    mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
  },
  network: "testnet",
  createClient(config) {
    return new SuiGrpcClient({ network: config.network, baseUrl: config.url });
  },
});

function App() {
  return (
    <DAppKitProvider dAppKit={dAppKit}>
      <YourApp />
    </DAppKitProvider>
  );
}
```

### What changed
| v1.x | v2.0+ | Breaking? |
|------|-------|-----------|
| `@mysten/dapp-kit` | `@mysten/dapp-kit-react` (React) or `@mysten/dapp-kit-core` (vanilla) | YES |
| `SuiClientProvider` + `WalletProvider` + `QueryClientProvider` | Single `DAppKitProvider` | YES |
| `createNetworkConfig()` | `createDAppKit()` | YES |
| `@mysten/dapp-kit/dist/index.css` | Deleted. Web components with CSS custom properties. | YES |
| `@tanstack/react-query` peer dep | Not required by dapp-kit-react | YES |
| `useSuiClient()` | `useCurrentClient()` | YES |
| `useConnectWallet()` | `dAppKit.connectWallet()` (action, not hook) | YES |
| `useSignAndExecuteTransaction()` | `dAppKit.signAndExecuteTransaction()` | YES |
| `useSuiClientQuery()` | Removed. Use TanStack Query directly. | YES |
| `chain: 'sui:mainnet'` | `network: 'mainnet'` | YES |
| `theme` config prop | Removed. Use CSS custom properties. | YES |
| `autoConnect: false` default | `autoConnect: true` default | YES (behavioral) |

---

## 4. Transaction Execution

### Old (v1.x)
```ts
// Transaction class is unchanged
import { Transaction } from "@mysten/sui/transactions";
const tx = new Transaction();

// Execution
const result = await client.signAndExecuteTransactionBlock({
  transactionBlock: tx,
  signer: keypair,
});

// Dry run
const dryResult = await client.dryRunTransactionBlock({
  transactionBlock: await tx.build({ client }),
});
```

### New (v2.0+)
```ts
// Transaction class is UNCHANGED (same import, same API)
import { Transaction } from "@mysten/sui/transactions";
const tx = new Transaction();

// Execution (use executeTransaction, not signAndExecute on client)
const bytes = await tx.build({ client });
const { signature } = await keypair.signTransaction(bytes);
const result = await client.executeTransaction({
  transaction: bytes,
  signatures: [signature],  // note: array
});

// Or with TransactionExecutor for batching
import { TransactionExecutor } from "@mysten/sui/transactions";
const executor = new TransactionExecutor({ client, signer: keypair });
const result = await executor.executeTransaction(tx);
```

### What changed
| v1.x | v2.0+ | Breaking? |
|------|-------|-----------|
| `signAndExecuteTransactionBlock` on client | Not on client. Use `TransactionExecutor` or sign+execute manually. | YES |
| `dryRunTransactionBlock` on client | Still exists on `SuiJsonRpcClient` native | Depends on transport |
| `executeTransactionBlock` | `executeTransaction` with `signatures: []` array | YES |
| `transactionBlock` param name | `transaction` | YES |
| `signature` (singular) | `signatures` (array) | YES |
| No default expiration | Default expiration = current epoch + 1 | YES (behavioral) |

**Note**: The `Transaction` class itself, `tx.splitCoins()`, `tx.moveCall()`, `tx.transferObjects()`, etc. are ALL UNCHANGED. Only execution patterns changed.

---

## 5. zkLogin

### Old (v1.x)
```ts
import { jwtToAddress, generateNonce, generateRandomness } from "@mysten/sui/zklogin";

const address = jwtToAddress(jwt, salt);
```

### New (v2.0+)
```ts
import { jwtToAddress, generateNonce, generateRandomness } from "@mysten/sui/zklogin";

const address = jwtToAddress(jwt, salt, false);  // legacyAddress param now REQUIRED
```

### What changed
| v1.x | v2.0+ | Breaking? |
|------|-------|-----------|
| `jwtToAddress(jwt, salt)` | `jwtToAddress(jwt, salt, legacyAddress)` (3rd param required) | YES |
| `computeZkLoginAddress({...})` | Must include `legacyAddress` field | YES |
| `computeZkLoginAddressFromSeed(seed, iss)` | `computeZkLoginAddressFromSeed(seed, iss, legacyAddress)` | YES |
| `toZkLoginPublicIdentifier(seed, iss)` | `toZkLoginPublicIdentifier(seed, iss, { legacyAddress })` | YES |

---

## 6. Kiosk SDK

### Old (v1.x)
```ts
import { KioskClient, Network, KioskTransaction } from "@mysten/kiosk";

const kioskClient = new KioskClient({ client, network: Network.TESTNET });
const kioskTx = new KioskTransaction({ transactionBlock: tx, kioskClient });
```

### New (v2.0+)
```ts
import { kiosk, KioskTransaction } from "@mysten/kiosk";

const client = new SuiJsonRpcClient({...})  // NOTE: gRPC not supported for kiosk yet
  .$extend(kiosk());

const kioskTx = new KioskTransaction({ transaction: tx, kioskClient: client.kiosk });
```

### What changed
| v1.x | v2.0+ | Breaking? |
|------|-------|-----------|
| `KioskClient` class | Removed. Use `$extend(kiosk())` | YES |
| `Network.TESTNET` enum | Removed. Derived from client. | YES |
| `transactionBlock` param | `transaction` param | YES |
| 16+ standalone functions | Removed. Use `KioskTransaction` builder. | YES |
| Works with any client | Must use `SuiJsonRpcClient` or `SuiGraphQLClient` (no gRPC) | LIMITATION |

---

## 7. Walrus SDK

### Old (v1.x)
```ts
import { WalrusClient } from "@mysten/walrus";

const walrusClient = new WalrusClient({
  network: "testnet",
  suiClient: client,
});

const { blobId } = await walrusClient.writeBlob({ blob, epochs: 5, signer });
```

### New (v2.0+)
```ts
import { walrus, WalrusFile } from "@mysten/walrus";

const client = new SuiGrpcClient({...}).$extend(walrus());

// Low-level blob
const { blobId } = await client.walrus.writeBlob({ blob, epochs: 5, signer });

// High-level file API (new)
const file = WalrusFile.from({
  contents: new Uint8Array([...]),
  identifier: "data.json",
  tags: { "content-type": "application/json" },
});
const results = await client.walrus.writeFiles({ files: [file], epochs: 3, signer });
```

### What changed
| v1.x | v2.0+ | Breaking? |
|------|-------|-----------|
| `new WalrusClient({...})` | `client.$extend(walrus())` | YES |
| `network` option | Removed. Derived from Sui client. | YES |
| `WalrusClient` class import | `walrus` function import (for $extend) | YES |
| No file API | `WalrusFile.from()`, `client.walrus.writeFiles()` | New feature |

---

## 8. Other Breaking Changes

### BCS and Effects
| v1.x | v2.0+ |
|------|-------|
| `effects.status.Failed.error` | `effects.status.Failure.error` |
| `MoveObject` data variant | `Move` |
| `ObjectBcs.serialize(obj)` | `bcs.Object.serialize(obj)` |
| `effects.unchangedSharedObjects` | `effects.unchangedConsensusObjects` |

### ESM Requirement
| v1.x | v2.0+ |
|------|-------|
| CJS supported | ESM only |
| Any `moduleResolution` | `NodeNext`, `Node16`, or `Bundler` required |

### Default Transaction Expiration
| v1.x | v2.0+ |
|------|-------|
| No expiration by default | Expires at current epoch + 1 (`ValidDuring`) |
| N/A | Use `tx.setExpiration({ None: true })` for old behavior |

### MVR Resolution
| v1.x | v2.0+ |
|------|-------|
| `namedPackagesPlugin` + `Transaction.registerGlobalSerializationPlugin()` | Built into client via `mvr` config option |

---

## 9. Files That Need Updating

Sorted by number of breaking changes (highest first):

| # | File | Breaking Changes | What's Wrong |
|---|------|-----------------|--------------|
| 1 | `core/skills/data/sui-knowledge/05-app-layer-and-consumer.md` | 11 | Full dapp-kit provider setup, CSS import, hooks, `SuiClient`, `getFullnodeUrl`, install command |
| 2 | `core/skills/data/sui-knowledge/04-protocols-and-sdks.md` | 4 | SDK reference table lists `@mysten/dapp-kit`, missing dapp-kit-react/core |
| 3 | `core/skills/data/guides/rpc-wallet-guide.md` | 4 | Install commands, provider names, version reference |
| 4 | `core/skills/data/sui-knowledge/cookbook-index.md` | 4 | `useSignAndExecuteTransaction` hook, `client.getObject`, `client.subscribeEvent`, dapp-kit import |
| 5 | `core/skills/idea/deepbook-research/references/deepbook-data-queries.md` | 3 | `DeepBookClient` init, `queryEvents`, `getObject` |
| 6 | `core/skills/data/sui-knowledge/06-opensource-research.md` | 2 | `SuiClient`, `getFullnodeUrl` |
| 7 | `core/skills/data/sui-knowledge/sponsor-docs/deepbook.md` | 2 | `signAndExecuteTransaction` on client, DeepBook import |
| 8 | `core/skills/data/sui-knowledge/sponsor-docs/scallop.md` | 3 | Depends on Scallop SDK update (needs verification) |
| 9 | `core/skills/learn/sui-beginner/SKILL.md` | 1 | `@mysten/dapp-kit` package name reference |

### Skills with SDK code in reference files (also need updating)

| File | Issue |
|------|-------|
| `build/scaffold-project/references/template-shapes.md` | `SuiClient`, `getFullnodeUrl`, `@mysten/dapp-kit` imports |
| `build/ptb-composer/references/ptb-quickstart.md` | Client execution method may need update |
| `build/sponsored-transactions/references/gas-station-flow.md` | `SuiClient` import, `executeTransactionBlock` |
| `build/walrus-storage/references/walrus-quickstart.md` | Uses raw fetch (correct for HTTP API path, but SDK path should show $extend) |
| `build/deepbook-orderbook/references/deepbook-quickstart.md` | `DeepBookClient` init pattern |
| `build/deepbook-orderbook/references/balancemanager-setup.md` | `DeepBookClient` init pattern |
| `build/kiosk-marketplace/references/kiosk-quickstart.md` | `KioskClient` class, `Network` enum |
| `build/sui-zk-login/references/zklogin-flow.md` | `jwtToAddress` missing `legacyAddress`, `executeTransactionBlock` |

---

## 10. What's UNCHANGED (safe to keep)

These SDK patterns work identically in v1.x and v2.0+:

| Pattern | Import | Status |
|---------|--------|--------|
| `Transaction` class | `@mysten/sui/transactions` | UNCHANGED |
| `tx.splitCoins()` | Transaction method | UNCHANGED |
| `tx.mergeCoins()` | Transaction method | UNCHANGED |
| `tx.transferObjects()` | Transaction method | UNCHANGED |
| `tx.moveCall()` | Transaction method | UNCHANGED |
| `tx.makeMoveVec()` | Transaction method | UNCHANGED |
| `tx.publish()` | Transaction method | UNCHANGED |
| `tx.pure.u64()`, `tx.pure.address()`, etc. | Transaction method | UNCHANGED |
| `tx.object()` | Transaction method | UNCHANGED |
| `tx.setGasBudget()` | Transaction method | UNCHANGED |
| `tx.setGasOwner()` | Transaction method | UNCHANGED |
| `tx.setGasPayment()` | Transaction method | UNCHANGED |
| `tx.build({ client })` | Transaction method | UNCHANGED |
| `useCurrentAccount()` | `@mysten/dapp-kit-react` | UNCHANGED |
| `ConnectButton` | `@mysten/dapp-kit-react` | Changed impl, same usage |
| `generateNonce`, `generateRandomness` | `@mysten/sui/zklogin` | UNCHANGED |
| `getZkLoginSignature` | `@mysten/sui/zklogin` | UNCHANGED |

---

## 11. New v2.0 Features Our Skills Should Teach

| Feature | What It Does | Why It Matters |
|---------|-------------|----------------|
| **gRPC transport** | Faster, binary protocol, recommended default | JSON-RPC deprecation timeline means gRPC is mandatory soon |
| **Core API** (`client.core.*`) | Transport-agnostic interface for common queries | Write once, works with gRPC, JSON-RPC, and GraphQL |
| **`$extend` pattern** | Plug ecosystem SDKs into client | Single client instance, composable, consistent |
| **`WalrusFile.from()`** | High-level file API with tags and content types | Much nicer DX than raw blob operations |
| **`DAppKitProvider`** | Single provider replaces 3 nested providers | Simpler setup, less boilerplate |
| **`@mysten/dapp-kit-core`** | Framework-agnostic wallet integration | Vue, Svelte, vanilla JS support |
| **Default tx expiration** | Transactions expire after epoch + 1 | Prevents stale transactions, but breaks long-running queues |
| **Built-in MVR** | Named package resolution via client config | No more manual plugin registration |
| **Web components** | Lit-based UI components with CSS variables | Framework-agnostic theming, no Radix dependency |
| **GraphQL transport** | `SuiGraphQLClient` for complex queries | Alternative to gRPC for apps needing GraphQL |
