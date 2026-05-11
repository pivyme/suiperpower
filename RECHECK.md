# Skill Recheck Audit

Generated: 2026-05-11
Audited against: actual docs (see RESOURCES.md for all canonical URLs)

This document tracks every factual error, outdated claim, and missing coverage found across the 5 sponsor skills + 11 core Sui development skills. Each finding is tagged by severity.

Severity levels:
- **CRITICAL**: Skill teaches something that will break at runtime or is completely fabricated
- **HIGH**: Wrong API names, method signatures, or parameter formats that cause confusion
- **MEDIUM**: Outdated patterns that still compile but are not the recommended approach
- **LOW**: Missing features or minor inaccuracies

---

## Severity Summary

| Skill | Critical | High | Medium | Low |
|-------|----------|------|--------|-----|
| **openzeppelin-sui-libs** | 12 | 0 | 1 | 0 |
| **deepbook-orderbook** | 0 | 9 | 3 | 2 |
| **deepbook-research** | 0 | 5 | 1 | 2 |
| **scallop-money-market** | 0 | 6 | 2 | 3 |
| **walrus-storage** | 0 | 1 | 2 | 7 |
| **walrus-research** | 0 | 0 | 1 | 4 |
| **sui-zk-login** | 0 | 2 | 3 | 5 |
| **launch-coin** | 1 | 0 | 0 | 0 |
| **ptb-composer** | 0 | 1 | 1 | 1 |
| **scaffold-project** | 0 | 0 | 2 | 1 |
| **build-with-move** | 0 | 0 | 1 | 1 |
| **debug-move** | 0 | 0 | 0 | 0 |
| **review-move** | 0 | 0 | 0 | 0 |
| **object-model-design** | 0 | 0 | 0 | 0 |
| **sponsored-transactions** | 0 | 0 | 1 | 1 |
| **kiosk-marketplace** | 0 | 0 | 0 | 0 |
| **deploy-to-testnet** | 0 | 0 | 0 | 1 |
| **deploy-to-mainnet** | 0 | 0 | 0 | 0 |
| **TOTAL** | **13** | **24** | **18** | **28** |

**Verdict**: openzeppelin-sui-libs needs a complete rewrite. deepbook and scallop skills need major fixes to code examples. Walrus, zkLogin, and core dev skills need targeted updates.

---

## Cross-Cutting Issues (affect multiple skills)

### Issue A: Sui SDK v2.0 Migration (MEDIUM, affects 5+ skills)

The `@mysten/sui` SDK is at v2.16.0+. Multiple skills use v1.x patterns:

| Old (v1.x) | New (v2.0+) | Affected files |
|-------------|-------------|----------------|
| `SuiClient` from `@mysten/sui/client` | `SuiGrpcClient` from `@mysten/sui/grpc` | scaffold, ptb-composer, sponsored-txs |
| `getFullnodeUrl` | `getJsonRpcFullnodeUrl` | scaffold, sponsored-txs |
| `@mysten/dapp-kit` | `@mysten/dapp-kit-react` or `@mysten/dapp-kit-core` | scaffold |
| `executeTransactionBlock` | `executeTransaction` with `signatures: []` array | zklogin, ptb-composer |

**Source**: https://sdk.mystenlabs.com/sui/migrations/sui-2.0

### Issue B: Old Walrus Docs URL (LOW, affects walrus sponsor-docs)

`https://docs.walrus.site/` is the old URL. Current: `https://docs.wal.app/`

### Issue C: OZ Repo URL (CRITICAL, affects OZ skill + sponsor-docs)

`https://github.com/OpenZeppelin/openzeppelin-sui` returns 404. Correct: `https://github.com/OpenZeppelin/contracts-sui`

---

## 1. openzeppelin-sui-libs (NEEDS COMPLETE REWRITE)

**Root cause**: Skill was generated from training data about OZ EVM libraries (AccessControl, Ownable, Pausable) and superficially adapted for Sui. The actual OZ Contracts for Sui library has a completely different, much narrower scope.

### What the skill claims exists vs. what actually exists

| Skill claims this module | Actually exists? | What really exists |
|--------------------------|------------------|--------------------|
| `access_control` (AccessControl, grant_role, assert_role) | NO | `two_step_transfer` (TwoStepTransferWrapper, initiate_transfer, accept_transfer) |
| `pausable` (Pausable, pause, unpause, assert_not_paused) | NO | Nothing. No pausable module in OZ Sui. |
| `ownable` (Ownable, assert_owner, transfer_ownership) | NO | `delayed_transfer` (DelayedTransferWrapper, schedule_transfer, execute_transfer) |
| `upgradeable` (UpgradePolicy, authorize) | NO | Nothing. No upgrade module in OZ Sui. |
| `signer_registry` | NO | Nothing. |
| `events` helpers | NO | Nothing. |
| `math::safe` | PARTIALLY | `openzeppelin_math` package with mul_div, sqrt, log2, log10, etc. across u8-u256 + u512 |

### Critical errors (all CRITICAL severity)

1. **Wrong repo URL**: `openzeppelin-sui.git` is 404. Correct: `contracts-sui`
2. **Wrong dependency format**: `OpenZeppelin = { git = "..." }`. Correct: `openzeppelin_access = { r.mvr = "@openzeppelin-move/access" }`
3. **Wrong import paths**: `use openzeppelin::access_control::{Self, AccessControl}`. No such path exists.
4. **Wrong import paths**: `use openzeppelin::pausable::{Self, Pausable}`. Does not exist.
5. **Wrong import paths**: `use openzeppelin::ownable::{Self, Ownable}`. Does not exist.
6. **Wrong import paths**: `use openzeppelin::upgradeable::{Self, UpgradePolicy}`. Does not exist.
7. **Fabricated function signatures**: `access_control::new()`, `grant_role()`, `assert_role()`. None exist.
8. **Fabricated function signatures**: `pausable::assert_not_paused()`, `pause()`, `unpause()`. None exist.
9. **Fabricated function signatures**: `ownable::assert_owner()`, `transfer_ownership()`. None exist.
10. **Fabricated types**: `AccessControl`, `Pausable`, `Ownable`, `UpgradePolicy`. None exist.
11. **Fabricated role pattern**: `ROLE_ADMIN: vector<u8> = b"admin"`, grant/assert roles. No role registry in OZ Sui.
12. **oz-modules-quickref.md is 100% fabricated**. Every module, type, and function in it is invented.

### What the rewrite should cover

The actual OZ Contracts for Sui (v1.1.0) has three packages:

**openzeppelin_access** (MVR: `@openzeppelin-move/access`):
- `two_step_transfer`: Wrap objects in `TwoStepTransferWrapper<T>`, initiate/accept ownership transfer
- `delayed_transfer`: Time-locked transfers with `DelayedTransferWrapper<T>`, schedule/execute/cancel

**openzeppelin_math** (MVR: `@openzeppelin-move/integer-math`):
- `rounding` module with `Rounding` enum
- Integer math across `u8` through `u256`: `mul_div`, `sqrt`, `log2`, `log10`, `log256`, `average`, `clz`, `msb`, `checked_shl`, `checked_shr`, `inv_mod`, `mul_mod`
- `u512` wide arithmetic
- `decimal_scaling` for decimal conversions

**openzeppelin_fp_math** (MVR: `@openzeppelin-move/fixed-point-math`):
- `UD30x9` (unsigned fixed-point, 30 integer + 9 decimal digits)
- `SD29x9` (signed fixed-point)
- Full arithmetic, comparison, rounding, conversion

**Sources**: https://docs.openzeppelin.com/contracts-sui/1.x, https://github.com/OpenZeppelin/contracts-sui

### Also note
- OZ MCP server (mcp.openzeppelin.com) does NOT support Sui/Move. Only Solidity, Cairo, Stellar, Stylus.
- Mainnet package ID for openzeppelin_access: `0x0a031c162f9982ee32b199b98fbfbb6561051f2c4d2e17d358b09beafc20ce45`

---

## 2. deepbook-orderbook

### HIGH severity

1. **SDK initialization pattern is wrong everywhere**. Skill shows `new DeepBookClient(...)`. Correct pattern:
   ```ts
   import { SuiGrpcClient } from '@mysten/sui/grpc';
   import { deepbook } from '@mysten/deepbook-v3';
   const client = new SuiGrpcClient({ network: 'testnet' })
     .$extend(deepbook({ address: userAddr }));
   ```
   Source: https://docs.sui.io/standards/deepbookv3-sdk

2. **Method call paths are wrong**. Skill shows `deepbook.placeLimitOrder(tx, args)`. Correct: `client.deepbook.deepBook.placeLimitOrder(args)(tx)` (curried function).

3. **`getLevel2BookStatus` does not exist** (sponsor-docs). Correct method: `getLevel2Range(poolKey, priceLow, priceHigh, isBid)`.

4. **`getPoolBookParams` does not exist** (quickstart, pitfalls). Correct: `poolBookParams(poolKey)` (plain string, not object).

5. **`getPools()` does not exist** (data-queries). No "list all pools" convenience method in SDK.

6. **`getOrderBook()` does not exist** (data-queries). Correct: `getLevel2Range()` or `getLevel2TicksFromMid()`.

7. **`getOpenOrders()` does not exist** (data-queries). Correct: `accountOpenOrders(poolKey, managerKey)`.

8. **BalanceManager deposit uses wrong param type**. Skill passes raw object ID. SDK expects a `managerKey` string registered during client construction.

9. **`clientOrderId` should be string, not number**. Source: https://docs.sui.io/standards/deepbookv3-sdk/orders

### MEDIUM severity

10. **Pool creation claim is wrong**. Skill says "requires a capability." Reality: `createPermissionlessPool` exists, anyone can create pools by paying a fee.

11. **`payWithDeep` default is `true`, not `false`**. Skill examples use `false` without noting this differs from the default.

12. **Testnet pool key `SUI_USDC` should be `SUI_DBUSDC`**. Testnet uses DBUSDC/DBUSDT, not USDC.

### LOW severity

13. **Docs URL `https://docs.sui.io/standards/deepbookv3` returns 404**. Correct: `https://docs.sui.io/standards/deepbook`.

14. **`expireTimestamp` param name**. SDK uses `expiration`, not `expireTimestamp`.

### Missing features not covered

- placeMarketOrder, modifyOrder, cancelAllOrders, withdrawSettledAmounts
- Swap functions (swapExactBaseForQuote, etc.)
- Flash loans
- DeepBook Predict (testnet, prediction markets)
- DeepBook Margin (mainnet, up to 5x leverage)
- DeepBook Sandbox (Docker local dev environment)
- Fee structure specifics (taker/maker bps, DEEP discount, staking thresholds)
- Supported coins list (18 tokens, 26 pools on mainnet)

---

## 3. deepbook-research

### HIGH severity

1. **`new DeepBookClient({ network: "mainnet" })` is wrong** (same SDK init issue as build skill).
2. **`sdk.getPools()` does not exist**.
3. **`sdk.getOrderBook(poolId, { depth: 50 })` does not exist**. Use `getLevel2Range` or `getLevel2TicksFromMid`.
4. **`sdk.getOpenOrders(poolId)` does not exist**. Use `accountOpenOrders(poolKey, managerKey)`.
5. **`pool.data.content.fields.fee_bps` is wrong field access**. Use `poolTradeParams(poolKey)` which returns `{takerFee, makerFee, stakeRequired}`.

### MEDIUM severity

6. Same SDK init pattern issues.

### Missing

- DeepBook Indexer (https://docs.sui.io/standards/deepbookv3-indexer) for historical data
- `midPrice(poolKey)` for simple price queries
- `vaultBalances(poolKey)` for depth analysis
- DeepBook Predict and Margin as research opportunities

---

## 4. scallop-money-market

### HIGH severity

1. **Constructor is fabricated**. Skill shows `new ScallopClient({ network: "mainnet" })`. Correct:
   ```ts
   const scallopSDK = new Scallop({
     addressId: '67c44a103fe1b8c454eb9699',
     networkType: 'mainnet',
     secretKey: secretKey,
   });
   await scallopSDK.init();
   ```
   Source: https://github.com/scallop-io/sui-scallop-sdk

2. **Builder method names are wrong**. Skill: `scallop.builder.deposit("usdc", amount)`. Correct: `scallopTxBlock.depositQuick(amount, 'wusdc')`. Methods are `depositQuick`, `borrowQuick`, `repayQuick`, `withdrawQuick`. Parameter order is `(amount, coinName)`, not `(coinName, amount)`.

3. **`scallop.client.signAndExecuteTransaction` is invented**. SDK does not proxy Sui client's signing.

4. **`getObligationBorrow(obligationId, asset)` does not exist**. Correct: `getObligationAccount(obligationId)` returns borrows data.

5. **Health factor formula uses wrong terminology**. Scallop uses "Risk Level" with `liquidation_factor` and `borrow_weight`, not `collateral_factor` and `health`.

6. **"scTokens" terminology is outdated**. Current name: **sCoins** (sSUI, sUSDC, etc.). "ERC-20-ish receipts" framing is wrong on Sui.

### MEDIUM severity

7. **SDK only supports mainnet**. Skill references testnet demos but SDK README says: "Currently, this SDK only supports the mainnet network."

8. **Obligation sub-account limit**: Up to 5 per address. Not mentioned.

### LOW severity

9. **Missing: `addressId` is required** for SDK init. Critical practical detail.
10. **Missing: Flash loans** (`borrowFlashLoan`, `repayFlashLoan`).
11. **Missing: Outflow/borrow limits** per 24-hour period.

---

## 5. walrus-storage

### HIGH severity

1. **`?permanent=true` query parameter does not exist** in Walrus HTTP API. The correct parameter is `deletable` (boolean). Use `?deletable=false` for permanent storage.

### MEDIUM severity

2. **Default blob behavior changed in v1.33+**. Blobs are now deletable by default (was permanent by default). Skill assumes permanent-by-default.

3. **"TS SDK" code examples use raw `fetch()`, not the actual SDK**. The `@mysten/walrus` package provides `WalrusClient` with `writeBlob`/`readBlob`. The quickstart should be renamed "HTTP API" or replaced with actual SDK usage.

### LOW severity (missing features)

4. **`@mysten/walrus` SDK never mentioned by name**. No install command, no WalrusClient init pattern.
5. **Seal (`@mysten/seal`) not mentioned** for encryption (directly addresses "encryption is your problem" pitfall).
6. **Walrus Sites not mentioned** (decentralized static hosting, `site-builder` CLI).
7. **Quilt not mentioned** (multi-file batching, up to ~660 files per blob).
8. **Upload Relay not mentioned** (uploads without WAL tokens).
9. **MemWal not mentioned** (AI agent memory on Walrus, relevant to this project).
10. **Mainnet endpoints missing**. Walrus mainnet launched March 2025, skills only reference testnet.
11. **`walrus info` command and cost calculator** (`costcalculator.wal.app`) not mentioned.

---

## 6. walrus-research

### MEDIUM severity

1. **`suiscan.xyz/mainnet/Walrus` URL may not exist** at that path. Needs verification.

### LOW severity (missing)

2. **Seal not mentioned** in identity/verifiable storage category.
3. **MemWal not mentioned** as a research category (AI + Walrus).
4. **Walrus Sites not mentioned** as existing product in developer tooling category.
5. **Quilt not mentioned** for solving small-file economics problem.

---

## 7. sui-zk-login

### HIGH severity

1. **`executeTransactionBlock` is outdated**. Current: `executeTransaction` with `signatures: [zkLoginSignature]` (array). Source: https://docs.sui.io/guides/developer/cryptography/zklogin-integration

2. **`jwtToAddress` missing `legacyAddress` parameter**. Correct: `jwtToAddress(jwt, userSalt, false)`. Third param matters for address compatibility.

### MEDIUM severity

3. **Provider list is incomplete**. Skill lists Google, Apple, Facebook, Twitch. Missing: Slack, Kakao, Microsoft (devnet), AWS (tenant), Karrier One, Credenza3 (all networks).

4. **No prover/salt service URLs anywhere**. Salt: `https://salt.api.mystenlabs.com/get_salt`. Prover (dev): `https://prover-dev.mystenlabs.com/v1`. These are the most actionable pieces of info.

5. **Enoki not mentioned**. Mysten's managed zkLogin service for production deployments.

### LOW severity

6. **Shinami not mentioned** as third-party zkLogin provider.
7. **`@mysten/zklogin` deprecation** not flagged as a pitfall (merged into `@mysten/sui/zklogin`).
8. **RS256 requirement** not mentioned (only supported JWT signing algorithm).
9. **Network-specific zkey differences** not mentioned (devnet uses different zkey from testnet/mainnet).
10. **`computeZkLoginAddress`** alternative not mentioned.

---

## 8. launch-coin

### CRITICAL severity

1. **TreasuryCap freezing contradicts official docs**. The coin-module-template shows `transfer::public_freeze_object(treasury)` to make supply fixed. Official Sui docs say: "never freeze or share the TreasuryCap." The `coin::burn` reference in the SKILL.md body is also wrong: `coin::burn` burns a `Coin<T>`, not a `TreasuryCap`.

   Correct fixed-supply patterns:
   - Wrap TreasuryCap in a module-level struct, never expose mint
   - Use `coin::treasury_into_supply()` and manage supply directly
   - Do not freeze TreasuryCap

   Source: https://docs.sui.io/onchain-finance/fungible-tokens/coin

---

## 9. ptb-composer

### HIGH severity

1. **Command limit stated as "100 commands or 100 inputs"**. Actual protocol limit is **1,024 commands**. Source: https://docs.sui.io/concepts/transactions/prog-txn-blocks

### MEDIUM severity

2. **Client method names may need update for SDK v2.0** (`dryRunTransactionBlock` etc.).

### LOW severity

3. **Missing: gas budget auto-estimation** (optional since Sui v1.24.1).

---

## 10. scaffold-project

### MEDIUM severity

1. **`@mysten/dapp-kit` is legacy**. New projects should use `@mysten/dapp-kit-react` (React) or `@mysten/dapp-kit-core` (framework-agnostic). Source: https://sdk.mystenlabs.com/dapp-kit/legacy

2. **`SuiClient` / `getFullnodeUrl` are deprecated aliases in SDK v2.0**. New projects should use `SuiGrpcClient` from `@mysten/sui/grpc`.

### LOW severity

3. **Missing: ESM-only requirement** in SDK v2.0.

---

## 11. build-with-move

### MEDIUM severity

1. **Import style is dated for Move 2024 edition**. `use sui::object::{Self, UID}` and explicit `TxContext` import are functional but the 2024 convention uses method syntax and auto-imports.

### LOW severity

2. **Move 2024 edition features** (`public(package)`, method syntax, enums, macros) not highlighted in main SKILL.md body.

---

## 12-18. Clean skills (no issues found)

The following skills passed the audit with no significant issues:

- **debug-move**: Error categories, tracing commands, playbooks all accurate
- **review-move**: Severity framework, workflow all sound
- **object-model-design**: Ownership, abilities, capability patterns all correct
- **kiosk-marketplace**: Kiosk, TransferPolicy, royalties all accurate against SDK docs
- **deploy-to-mainnet**: Upgrade policies, gate system all correct
- **deploy-to-testnet**: Publish command, preflight checklist accurate (minor: gas-budget is now optional)
- **sponsored-transactions**: Dual-sig flow accurate (minor: only covers user-initiated type, two other types exist)

---

## Sponsor-docs files

### sponsor-docs/deepbook.md
Same issues as deepbook-orderbook skill. SDK init, method calls, `getLevel2BookStatus`, pool creation claim all wrong. Needs rewrite of code examples.

### sponsor-docs/openzeppelin-sui.md
Same issues as OZ skill. Wrong repo URL, wrong modules, wrong dependency format, wrong code examples. Needs complete rewrite.

### sponsor-docs/scallop.md
Same issues as scallop skill. Wrong constructor, wrong method names.

### sponsor-docs/walrus.md
Old docs URL (`docs.walrus.site` should be `docs.wal.app`). Missing `@mysten/walrus` SDK, Seal, mainnet info. `permanent=true` param doesn't exist.

### sponsor-docs/ottersec-checklist.md
Not audited in this pass (no external docs to verify against). Flagged for future review.

---

## Action Plan

### Phase 1: Critical rewrites (must fix before launch)

1. **Rewrite openzeppelin-sui-libs** SKILL.md + all 3 references + sponsor-docs/openzeppelin-sui.md from scratch against https://docs.openzeppelin.com/contracts-sui/1.x
2. **Fix launch-coin** TreasuryCap freezing pattern in coin-module-template.md

### Phase 2: Major fixes (SDK patterns, method names)

3. **Fix deepbook-orderbook** SDK init, method calls, pool creation claim, all reference files
4. **Fix deepbook-research** SDK init, invented method names, data-queries.md
5. **Fix scallop-money-market** constructor, builder methods, terminology, all reference files
6. **Fix sponsor-docs/deepbook.md** (same as #3)
7. **Fix sponsor-docs/scallop.md** (same as #5)
8. **Fix sponsor-docs/walrus.md** (old URL, `permanent` param, add SDK)

### Phase 3: Targeted updates (outdated patterns)

9. **Update walrus-storage** `permanent` param, default behavior, add SDK mention, Seal mention
10. **Update sui-zk-login** executeTransaction, jwtToAddress, provider list, add service URLs
11. **Update scaffold-project** dapp-kit-react, SuiGrpcClient
12. **Update ptb-composer** command limit 100 to 1024
13. **Apply SDK v2.0 migration** across all affected reference files

### Phase 4: Enrich (missing features)

14. Add Seal mentions to walrus skills
15. Add MemWal, Walrus Sites, Quilt references
16. Add DeepBook Predict/Margin/Sandbox references
17. Add Enoki/Shinami to zkLogin
18. Add missing DeepBook SDK methods coverage
19. Add Scallop flash loans, borrow weights
