# Implementation Details: Full Research for All Gaps

Generated: 2026-05-11
Sources: Official docs, GitHub repos, live API queries, npm registries, 2025 winner analysis
Cross-referenced with: IMPLEMENTATION-GAPS.md, ANALYSIS.md, RECHECK.md, RESOURCES.md

This document contains the deep research findings for every gap identified in IMPLEMENTATION-GAPS.md. Each section has enough verified detail to implement the corresponding skill, catalog entry, or infrastructure piece without guessing.

---

## Table of Contents

1. [Seal Access Control](#1-seal-access-control)
2. [Pyth Oracle Integration](#2-pyth-oracle-integration)
3. [AI Agents on Sui (Agentic Web)](#3-ai-agents-on-sui)
4. [Nautilus Off-Chain TEE Compute](#4-nautilus-off-chain-tee)
5. [SuiNS Name Service + MVR](#5-suins-name-service)
6. [Walrus Sites Decentralized Hosting](#6-walrus-sites)
7. [DefiLlama API for Sui Research](#7-defillama-api-for-sui)
8. [Sui Overflow 2025 Winner Patterns](#8-overflow-2025-winners)
9. [Catalog Data: Repos, MCPs, Skills](#9-catalog-data)

---

## 1. Seal Access Control

### Package Info

| Item | Value |
|------|-------|
| npm package | `@mysten/seal` |
| Version | ^1.1.0 |
| Peer dep | `@mysten/sui` ^2.5.1 |
| Install | `npm install @mysten/seal @mysten/sui` |
| Mainnet package ID | `0xcb83a248bda5f7a0a431e6bf9e96d184e604130ec5218696e3f1211113b447b7` |
| Testnet package ID | `0x8d90881fc48eb30d4422db68083b49e7d0f879658444e3a0ed85ce47feaa54b2` |
| GitHub | https://github.com/MystenLabs/seal |
| SDK source | https://github.com/MystenLabs/ts-sdks/tree/main/packages/seal |

### Core Exports

`SealClient`, `SessionKey`, `EncryptedObject`, `seal` (extension function), `DemType`, `SealClientOptions`, `KeyServerConfig`, `EncryptOptions`, `DecryptOptions`, `FetchKeysOptions`

### SealClient API

```typescript
// Standalone
const client = new SealClient({
  suiClient,
  serverConfigs: [{
    objectId: '0x...', weight: 1,
    aggregatorUrl: 'https://seal-aggregator-testnet.mystenlabs.com',
  }],
  verifyKeyServers: false, // true in production
});

// Or via $extend pattern
const client = suiGrpcClient.$extend(seal({ serverConfigs: [...] }));
```

**Methods**: `encrypt(EncryptOptions)`, `decrypt(DecryptOptions)`, `fetchKeys(FetchKeysOptions)`, `getDerivedKeys(...)`, `getKeyServers()`, `getPublicKeys(services[])`

### SessionKey API

```typescript
const sessionKey = await SessionKey.create({
  address: suiAddress, packageId, ttlMin: 10, suiClient, mvrName,
});
const message = sessionKey.getPersonalMessage();
// User signs message via wallet...
await sessionKey.setPersonalMessageSignature(signature);
```

Methods: `isExpired()`, `getAddress()`, `export()`, `SessionKey.import(data, client)`

### Key Server Config (Testnet)

| Server | Object ID |
|--------|-----------|
| Decentralized (committee) | `0xb012378c9f3799fb5b1a7083da74a4069e3c3f1c93de0b27212a5799ce1e1e98` |
| Independent 1 | `0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75` |
| Independent 2 | `0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8` |
| Aggregator URL | `https://seal-aggregator-testnet.mystenlabs.com` |

### The `seal_approve` Convention

Every access policy is a Move `entry` function:
1. Name MUST start with `seal_approve`
2. First param MUST be `id: vector<u8>`
3. Must NOT modify state (runs via dry_run)
4. Aborts = access denied, returns = access granted
5. Key servers independently evaluate by running dry_run_transaction_block

### Seven Access Control Patterns (Move)

| Pattern | Module | Use Case |
|---------|--------|----------|
| Whitelist | `patterns::whitelist` | Admin-managed address list |
| Subscription | `patterns::subscription` | Time-limited paid access |
| Account-based | `patterns::account_based` | Encrypt to specific address |
| Private data | `patterns::private_data` | Creator-only access |
| Time-lock (TLE) | `patterns::tle` | Anyone can decrypt after timestamp |
| Voting | `patterns::voting` | Secret ballot with threshold decryption |
| Key request | `patterns::key_request` | Delegated access via witness pattern |

### Encryption Flow

```typescript
// 1. Build identity: policyObject + nonce
const nonce = crypto.getRandomValues(new Uint8Array(5));
const id = toHex(new Uint8Array([...fromHex(policyObject), ...nonce]));

// 2. Encrypt
const { encryptedObject } = await client.encrypt({
  threshold: 1, packageId, id,
  data: new Uint8Array(fileBuffer),
});

// 3. Upload to Walrus
const resp = await fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
  method: 'PUT', body: encryptedObject.slice(),
});
```

### Decryption Flow

```typescript
// 1. Create SessionKey + sign personal message
// 2. Build seal_approve MoveCall PTB
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::allowlist::seal_approve`,
  arguments: [tx.pure.vector('u8', fromHex(id)), tx.object(allowlistId)],
});
const txBytes = await tx.build({ client: suiClient });

// 3. Decrypt
const plaintext = await client.decrypt({
  data: encryptedBytes, sessionKey, txBytes,
});
```

### Pitfalls

1. Policy functions must not modify state (dry-run only)
2. SessionKey TTL default 10 minutes, expires silently
3. Personal message signature required before decryption
4. `verifyKeyServers: false` in examples only, use `true` in production
5. Threshold at decrypt must match threshold at encrypt
6. fetchKeys batches IDs in groups of 10
7. Package upgrades handled via `fetch_first_pkg_id()` chain
8. Random nonces required in identity to prevent content-addressed collision

---

## 2. Pyth Oracle Integration

### Package Info

| Item | Value |
|------|-------|
| npm package | `@pythnetwork/pyth-sui-js` |
| Version | v3.0.0 |
| Install | `npm install @pythnetwork/pyth-sui-js` |
| Move dep | `git = "https://github.com/pyth-network/pyth-crosschain.git"`, `subdir = "target_chains/sui/contracts"` |
| Wormhole dep | `git = "https://github.com/wormhole-foundation/wormhole.git"`, `subdir = "sui/wormhole"` |
| Hermes mainnet | `https://hermes.pyth.network` |
| Hermes testnet | `https://hermes-beta.pyth.network` |

### Contract Addresses

| Network | Pyth State | Pyth Package | Wormhole State | Wormhole Package |
|---------|-----------|-------------|----------------|-----------------|
| Mainnet | `0x1f9310238ee9298fb703c3419030b35b22bb1cc37113e3bb5007c99aec79e5b8` | `0x04e20ddf36af412a4096f9014f4a565af9e812db9a05cc40254846cf6ed0ad91` | `0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c` | `0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a` |
| Testnet | `0x243759059f4c3111179da5878c12f68d612c21a8d54d85edc86164bb18be1c7c` | `0xabf837e98c26087cba0883c0a7a28326b1fa3c5e1e2c5abdb486f9e8f594c837` | `0x31358d198147da50db32eda2562951d53973a0c0ad5ed738e9b17d88b213d790` | `0xf47329f4344f3bf0f8e436e2f7b485466cff300f12a166563995d3888c296a94` |

### Common Feed IDs (Stable/Mainnet)

| Pair | Feed ID |
|------|---------|
| SUI/USD | `23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744` |
| BTC/USD | `e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` |
| ETH/USD | `ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` |
| USDC/USD | `eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a` |
| SOL/USD | `ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d` |

Lookup: `GET https://hermes.pyth.network/v2/price_feeds?query=<symbol>&asset_type=crypto`

### Architecture: Pull Model

1. Frontend queries Hermes for signed price update data
2. Hermes returns binary VAA data
3. Frontend builds PTB: SDK adds update commands, then calls your contract
4. Your contract receives `&PriceInfoObject` as parameter, reads price
5. All atomic in one PTB

**Critical**: Your Move contract must NOT hard-code `pyth::update_single_price_feed`. The Pyth package ID changes on upgrades. The TS SDK resolves dynamically.

### TypeScript API

```typescript
import { SuiPythClient, SuiPriceServiceConnection } from "@pythnetwork/pyth-sui-js";

// 1. Fetch price data from Hermes
const connection = new SuiPriceServiceConnection("https://hermes.pyth.network");
const priceUpdateData = await connection.getPriceFeedsUpdateData([SUI_USD_FEED_ID]);

// 2. Build PTB with price update
const tx = new Transaction();
const pythClient = new SuiPythClient(suiClient, PYTH_STATE_ID, WORMHOLE_STATE_ID);
const priceInfoObjectIds = await pythClient.updatePriceFeeds(tx, priceUpdateData, [SUI_USD_FEED_ID]);

// 3. Call your contract with PriceInfoObject
tx.moveCall({
  target: `${PKG}::my_module::use_price`,
  arguments: [tx.object(priceInfoObjectIds[0]), tx.object("0x6"), tx.pure.u64(60)],
});
```

### Move API

```move
// Read price (recommended)
public fun get_price_no_older_than(
    price_info_object: &PriceInfoObject, clock: &Clock, max_age_secs: u64
): Price

// Price struct accessors
public fun get_price(price: &Price): I64      // raw value
public fun get_conf(price: &Price): u64       // confidence
public fun get_expo(price: &Price): I64       // exponent (typically -8)
public fun get_timestamp(price: &Price): u64  // unix timestamp
```

### Pitfalls

1. **Exponent handling**: Price `12276250` with `expo = -5` means $122.76250. Always apply exponent.
2. **Confidence intervals**: Use `price - conf` for conservative collateral valuation, `price + conf` for obligations.
3. **Staleness**: Always use `get_price_no_older_than`. Never use `get_price_unsafe` in production.
4. **Hot potato pattern**: `HotPotatoVector<PriceInfo>` has no drop/copy/store. SDK handles consumption automatically.
5. **Gas cost**: Updating feeds costs SUI. SDK splits coins from gas automatically.
6. **Beta vs Stable feed IDs differ**: Use correct Hermes endpoint per network.

---

## 3. AI Agents on Sui

### Why Sui for Agents

| Requirement | Sui Solution |
|---|---|
| Shared verifiable state | Object-centric model, each asset independent |
| Permissions travel with data | Move linear types, capabilities are properties of objects |
| Atomic multi-step execution | PTBs: up to 1,024 Move calls in one atomic transaction |
| Proof of execution | Sub-second finality (390ms), events as auditable signals |
| Parallel execution | Unrelated agent transactions parallelize without contention |

### Agent Wallet Patterns

**zkLogin**: Ephemeral key per session, OAuth-based identity, no persistent key custody. Providers: Google, Apple, Facebook, Twitch, AWS, Slack, Kakao, Microsoft, Credenza3, Karrier One.

**Sponsored transactions**: Agent never holds SUI for gas. Backend sponsors via Enoki or Shinami Gas Station. Combined with zkLogin, agents are created, transact, and expire without managing keys or tokens.

### Agent Memory: MemWal

```typescript
import { MemWal } from '@mysten-incubation/memwal';

const mw = MemWal.create({
  key: 'delegate-key-hex', accountId: 'memwal-account-id',
  serverUrl: 'https://relayer-url.com', namespace: 'agent-scope',
});
await mw.remember('User prefers DeFi with < 5% IL');
const memories = await mw.recall('what does the user want?');
```

Packages: `@mysten-incubation/memwal`, `@mysten-incubation/memwal/manual`, `@mysten-incubation/memwal/ai` (Vercel AI SDK)

### Agent Compute: Nautilus + Atoma

**Nautilus**: TEE-based (AWS Nitro), verifiable inference, on-chain attestation verification. Self-managed AWS or Marlin Oyster marketplace.

**Atoma Network**: Decentralized AI cloud, OpenAI-compatible API, TEE isolation, 200+ dApps integrated, mainnet since Dec 2024.

### Existing Agent Frameworks

| Framework | npm/URL | Features |
|-----------|---------|----------|
| Sui Agent Kit (Pelagos) | `@pelagosai/sui-agent-kit` | LangChain/Vercel AI, NAVI/Cetus/Suilend |
| Sui AI Agent Kit (Caterpillar) | github.com/caterpillardev/Sui-AI-Agent-Kit | MCP-based, Suilend/Steamm/SpringSui |
| Talus / Nexus | talus.network | On-chain agent framework, mainnet April 2026 |
| MemWal | `@mysten-incubation/memwal` | AI memory on Walrus + Seal |

### Example Architecture: Trading Agent

1. **Identity**: zkLogin ephemeral keys + Enoki sponsored txs
2. **Inference**: Atoma API (OpenAI-compatible)
3. **Execution**: Single PTB: check pools, swap, update state, emit event (all atomic)
4. **Memory**: MemWal stores trading history
5. **Privacy**: Seal encrypts strategy parameters

### PTBs as Agent Tool Use

PTBs map directly to the "tool use" pattern in AI agents. Up to 1,024 commands, sequential execution with output chaining via `NestedResult`, all atomic. If any step fails, entire transaction reverts cleanly.

---

## 4. Nautilus Off-Chain TEE

### Package Info

| Item | Value |
|------|-------|
| GitHub | https://github.com/MystenLabs/nautilus |
| TEE type | AWS Nitro Enclaves |
| Framework | Sui Move + Rust (Axum server) |
| License | Apache 2.0 |
| Status | Mainnet since June 2025, not security audited |

### Architecture

1. Build enclave logic in Rust (`src/nautilus-server/src/apps/<app>/`)
2. Reproducible build produces EIF binary + PCR values (PCR0, PCR1, PCR2)
3. Deploy Move contract with expected PCRs
4. Deploy enclave to AWS EC2 (or Marlin Oyster)
5. Register enclave on-chain (attestation verified against AWS root CA in Sui framework)
6. Clients call `/process_data`, verify Ed25519 signature on-chain

### Move Module: `enclave::enclave`

Key functions:
- `new_cap<T: drop>(witness, ctx): Cap<T>` (OTW pattern)
- `create_enclave_config<T: drop>(cap, name, pcr0, pcr1, pcr2, ctx)`
- `register_enclave<T>(config, attestation_doc, ctx)` (creates shared Enclave<T>)
- `verify_signature<T, P: drop>(enclave, intent, timestamp, payload, sig): bool`

### Sui Framework: `sui::nitro_attestation`

```move
public fun load_nitro_attestation(attestation: vector<u8>, clock: &Clock): NitroAttestationDocument
```

Verifies certificate chain against AWS root CA embedded in Sui framework.

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Ping |
| `/health_check` | GET | Public key + connectivity |
| `/get_attestation` | GET | Hex-encoded attestation document |
| `/process_data` | POST | Custom computation |

### Key Pitfalls

1. BCS serialization must match exactly between Rust and Move
2. Not security audited (reference template only)
3. AWS Nitro only (for self-managed), Marlin Oyster for managed
4. Ephemeral keys: new keypair on each boot, must re-register
5. Debug mode (all-zero PCRs) offers zero security
6. allowed_endpoints.yaml whitelists domains strictly

---

## 5. SuiNS Name Service

### Package Info

| Item | Value |
|------|-------|
| npm package | `@mysten/suins` |
| Install | `npm install @mysten/suins` |
| Contracts | https://github.com/MystenLabs/suins-contracts |
| Docs | https://docs.suins.io/ |
| MVR CLI | `cargo install --locked --git https://github.com/mystenlabs/mvr --branch release mvr` |

### SDK API

```typescript
import { SuinsClient, SuinsTransaction } from '@mysten/suins';

const suinsClient = new SuinsClient({ client: suiClient, network: 'mainnet' });

// Query
const record = await suinsClient.getNameRecord('demo.sui');
// Returns: { name, nftId, targetAddress, expirationTimestampMs, data: { avatar, contentHash, walrusSiteId } }

// Transactions
const tx = new Transaction();
const suinsTx = new SuinsTransaction(suinsClient, tx);
suinsTx.register({ domain: 'myname', years: 1, coinConfig, coin, priceInfoObjectId });
suinsTx.setTargetAddress({ nft, address, isSubname: false });
suinsTx.setDefault('myname.sui');
suinsTx.setUserData({ nft, key: 'walrusSiteId', value: objectId });
```

### MVR (Move Registry)

Human-readable package naming: `@myorg/mypackage` instead of `0xabc123...::module`.

```bash
mvr add @deepbook/core --network mainnet
sui move build  # MVR resolves dependencies
```

### Pricing

| Length | Cost/year |
|--------|-----------|
| 3 chars | 500 SUI |
| 4 chars | 100 SUI |
| 5+ chars | 20 SUI |

---

## 6. Walrus Sites

### Overview

Static decentralized hosting on Walrus. 4 components: files on Walrus, Sui Site Object, site-builder CLI, portals (wal.app).

### CLI

```bash
suiup install site-builder@mainnet
site-builder deploy --epochs 53 ./dist     # Publish or update
site-builder convert <OBJECT_ID>           # Get Base36 subdomain
site-builder sitemap --id <OBJECT_ID>      # List resources
site-builder destroy --id <OBJECT_ID>      # Irreversible delete
```

### Configuration (`ws-resources.json`)

```json
{
  "object_id": "0x...",
  "site_name": "My dApp",
  "routes": { "/*": "/index.html" },
  "headers": { "/assets/*": { "Cache-Control": "max-age=31536000" } },
  "redirects": { "/old": { "target": "/new", "status": 301 } }
}
```

### Key Constraints

- Static only (no SSR, no request handlers)
- All content public (never embed secrets)
- Epoch-based storage: mainnet = ~14 days/epoch, max 53 epochs (~2 years)
- SuiNS required for human-readable URLs (`<name>-wal.wal.app`)
- PWAs unsupported on wal.app portal
- Two-token economy: WAL (storage) + SUI (gas)

---

## 7. DefiLlama API for Sui

### Base URLs

| Service | URL | Auth |
|---------|-----|------|
| TVL/Protocols | `https://api.llama.fi` | None (free) |
| Yields | `https://yields.llama.fi` | None |
| Stablecoins | `https://stablecoins.llama.fi` | None |

### Key Endpoints

| Endpoint | Returns |
|----------|---------|
| `GET /v2/chains` | All chains with TVL (Sui: ~$644M) |
| `GET /v2/historicalChainTvl/Sui` | Historical Sui TVL |
| `GET /protocols` | All protocols (filter `chains.includes("Sui")`) |
| `GET /overview/dexs/Sui` | DEX volumes by protocol |
| `GET /overview/fees/Sui` | Fee/revenue by protocol |
| `GET /pools` (yields) | Yield pools (filter `chain === "Sui"`) |
| `GET /stablecoincharts/Sui` (stablecoins) | Stablecoin market cap on Sui |

### Sui DeFi Protocols on DefiLlama

**DEXes**: Cetus CLMM, FlowX V2/V3, Kriya, Turbos, DeepBook V2/V3, Aftermath
**Fee protocols**: Bluefin, Cetus, Scallop, NAVI, Suilend, Bucket, SpringSui, Haedal, STEAMM

Chain identifier: `"Sui"` (case-sensitive)

---

## 8. Overflow 2025 Winners

### Technology Usage Frequency

| Technology | # Winners | Notable Projects |
|-----------|-----------|-----------------|
| Move (core) | 46/46 | All (baseline) |
| Walrus | 14+ | SuiSQL, SuiSign, Suithetic, ZeroLeaks, WalGraph |
| Seal | 4 | ZeroLeaks, Suithetic, Sui Shadow, Chatiwal |
| AI/ML | 8+ | Suithetic, OpenGraph, Magma, Sui Sentinel, GiveRep |
| Pyth | 3 | Pismo, DeepMaker, (Magma) |
| zkLogin | 3 | Sui Shadow, PactDa, Noodles.FI |
| ZK proofs | 3 | ZeroLeaks, Shroud, PactDa |
| Kiosk | 2 | Sui Shadow, Exclusuive |
| Nautilus | 1 | Sui Sentinel |
| DeepBook | 1 | DeepMaker |
| SuiNS | 1 | Walpress |

### Winning Patterns

1. **"X but decentralized" with Walrus**: SQL, email, git, websites, document signing
2. **Seal enables privacy categories**: Access-gated encrypted content is the pattern
3. **AI as load-bearing feature**: Real ML/LLM utility, not decoration
4. **Pyth as standard oracle**: Every DeFi project with price feeds used Pyth
5. **CLI/dev tools can win**: SuiSQL (1st Infra), Sui Multisig (2nd Payments)
6. **Kiosk for NFT commerce**: Both NFT marketplace winners used Kiosk

### Top Generalizable Ideas (from 1st place winners)

| Idea | Source | Pattern |
|------|--------|---------|
| Verifiable synthetic data marketplace | Suithetic | LLM + Walrus + Seal + marketplace |
| Anonymous verified document sharing | ZeroLeaks | ZK + Seal + Walrus |
| AI-rebalanced liquidity engine | Magma | Adaptive bins + ML rebalancing |
| Fee-sharing token launchpad | MoonBags | Bonding curve + fee redistribution |
| Social reputation tokens | GiveRep | X engagement -> on-chain REP |
| Machine-to-machine coordination | Suibotics | Smart contracts + hardware agents |
| Decentralized SQL on blobs | SuiSQL | Sui objects for state + Walrus for data |
| Decentralized document signing | SuiSign | Walrus storage + on-chain signatures |
| Stealth address payments | PIVY | Move stealth addresses + cross-chain USDC |

---

## 9. Catalog Data

### Repos: 67 New Candidates (to add to existing 33 = ~100)

**DeFi (13)**: Suilend, SpringSui, Bucket Protocol SDK, FlowX SDK, 7K Aggregator SDK, Hop SDK, Cetus Aggregator, Cetus Move STL, Cetus Integer Mate, SUI DeFi SDK (Canoe), SuiTears (interest-protocol), Interest Protocol DeFi, DeepBook Sandbox

**Walrus/Storage (9)**: Walrus Sites, Example Walrus Sites, Walrus Go SDK, Walrus Python SDK, Walrus Rust SDK, Tusky TS SDK, iWalrus iOS SDK, Walrus Sites Deploy, Walrus Sites GA (GitHub Actions)

**Seal/Security (5)**: Seal, Seal Rust SDK, Sui Stack Messaging SDK, Sui Stack Messaging, Decryptable Move Enum

**AI/Agent (4)**: Atoma Node, Atoma Proxy, Sui AI Agent Kit (Caterpillar), ElizaOS (Sui plugin)

**Infrastructure (13)**: ts-sdks, Suiup, MVR, Sui Gas Pool, Minting Server, Sui Owned Object Pools, fastcrypto, Move Book, Sui Move Bootcamp, Sui Prover, Suibase, Sui Client Gen, Nautilus

**Templates (3)**: Suiware dApp Starter, Sui dApp Scaffold, Dubhe Engine

**Multi-language SDKs (6)**: pysui (Python), Sui Go SDK, ksui (Kotlin), SuiKit (Swift), Sui Dart SDK, Walrus Dart SDK

**NFT/Gaming (1)**: OriginByte NFT Protocol

**Security/Audit (3)**: OtterSec CTF Framework, Sui Token Gen, SuiSec Blocklist

**Wallet/Auth (4)**: Suiet Wallet Kit, @suiware/kit, Polymedia zkLogin Demo, useSuiZkLogin

**Dev Tools (7)**: Polymedia Suitcase, Polymedia Commando, CoinMeta, Sui Move Analyzer (MoveBit), Sui Extension (zktx-io), Sui RPC Proxy, Sui Explorer (local)

**Learning (2)**: Sui Move Intro Course, Awesome Sui

### MCPs: 20 New Candidates (to add to existing 5 = 25)

**Sui-specific (15)**: Sui GraphQL MCP (Sceat), Sui MCP (0xdwong), Sui MCP (tamago-labs), Sui Dev MCP (motion-intern), Walrus MCP (Motion Labs), Sui Trader MCP (kukapay), Go Sui MCP (hawkli-1994), Sui Analytics MCP (0xfreak0, 39 tools), Sui Move Analyzer MCP (KlyntLabs), Suimate MCP, Sui AI Agent Kit MCP (caterpillardev, 33+ tools), Wormhole MCP, Web3 MCP (multi-chain), Sui MCP RAG Server, Sui MCP (ProbonoBonobo)

**General-purpose useful for Sui (5)**: GitHub MCP, Filesystem MCP, PostgreSQL MCP, Puppeteer MCP, Memory MCP

### Ecosystem Skills: 3 Real Candidates Found

| Name | Publisher | URL | Agents |
|------|-----------|-----|--------|
| Sui Stack Claude Code Plugin | 0x-j | github.com/0x-j/sui-stack-claude-code-plugin | claude |
| Sui Dev Skill | Nebryx | github.com/Nebryx/sui-dev-skill | claude |
| Suimate Agent Skills | suimate.ai | skills.suimate.ai | claude, cursor |

Note: The ecosystem skills catalog is harder to populate than repos or MCPs because few Sui projects publish standalone Claude Code skills. The 7 existing entries + 3 new = 10, still far from solana-new's 80. Most entries will need to be sourced from the repos themselves (checking for `.claude/skills/` directories) or created as references to protocol-specific documentation.

---

## Open Questions (Unverified)

| Item | What Needs Verification |
|------|------------------------|
| Seal mainnet key server objects | Testnet confirmed, mainnet decentralized server may not be live |
| Pyth mainnet Move.toml rev tag | Likely `sui-contract-mainnet` but not explicitly confirmed |
| Pyth Beta vs Stable feed IDs | Confirmed they differ, specific Beta IDs need querying |
| Atoma production SLA | Described as "alpha" on mainnet, unclear pricing |
| Nautilus non-AWS TEE support | Docs mention future providers, none confirmed |
| MemWal maturity | Beta, 17 stars, may have breaking API changes |
| SuiNS current pricing | May have shifted to USDC denomination via NS token DAO |
| Walrus Sites WAL pricing | Dynamic, run `walrus info` for current rates |
