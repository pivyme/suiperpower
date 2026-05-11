# Reference Docs and Resources

All canonical sources used for the skill recheck audit. These are the URLs that skill content must be verified against.

---

## Sui Core

| Resource | URL | Covers |
|----------|-----|--------|
| Sui Docs (main) | https://docs.sui.io/ | Move, objects, transactions, deployment, everything |
| Sui TS SDK (v2.0+) | https://sdk.mystenlabs.com/sui | SuiGrpcClient, Transaction, signing, queries |
| Sui SDK Migration to v2.0 | https://sdk.mystenlabs.com/sui/migrations/sui-2.0 | SuiGrpcClient replaces SuiClient, ESM-only, new imports |
| Sui SDK Clients | https://sdk.mystenlabs.com/sui/clients | SuiGrpcClient vs SuiJsonRpcClient |
| Sui dapp-kit (legacy) | https://sdk.mystenlabs.com/dapp-kit/legacy | Old @mysten/dapp-kit (JSON-RPC only) |
| Sui dapp-kit-react (current) | https://sdk.mystenlabs.com/dapp-kit | @mysten/dapp-kit-react for new projects |
| Sui PTB Docs | https://docs.sui.io/concepts/transactions/prog-txn-blocks | 1,024 command limit, PTB structure |
| Sui PTB Building (SDK) | https://sdk.mystenlabs.com/typescript/transaction-building/basics | Transaction class, splitCoins, moveCall, etc. |
| Sui Sponsored Transactions | https://docs.sui.io/concepts/transactions/sponsored-transactions | Dual-sig flow, three tx types |
| Sui Package Upgrades | https://docs.sui.io/concepts/sui-move-concepts/packages/upgrade | compatible, additive, dep-only, immutable |
| Sui zkLogin Concepts | https://docs.sui.io/concepts/cryptography/zklogin | Architecture, flow, proof system |
| Sui zkLogin Integration | https://docs.sui.io/guides/developer/cryptography/zklogin-integration | Step-by-step implementation |
| Sui zkLogin Providers | https://docs.sui.io/guides/developer/cryptography/zklogin-integration/developer-account | Google, Facebook, Twitch, Apple, Slack, Kakao, MS, AWS, Karrier One, Credenza3 |
| Sui zkLogin SDK | https://sdk.mystenlabs.com/sui/zklogin | generateNonce, jwtToAddress, getZkLoginSignature |
| Sui Fungible Tokens | https://docs.sui.io/onchain-finance/fungible-tokens/coin | coin::create_currency, TreasuryCap warnings |
| Sui Kiosk Docs | https://docs.sui.io/standards/kiosk | TransferPolicy, royalties, lock rule |
| Sui Kiosk SDK | https://sdk.mystenlabs.com/kiosk | KioskClient, KioskTransaction |
| Sui Move Book | https://move-book.com/ | Move language reference |
| Sui Framework Source | https://github.com/MystenLabs/sui | Canonical Move framework code |
| @mysten/sui npm | https://www.npmjs.com/package/@mysten/sui | Current SDK version (v2.16.0+) |

## MystenLabs Skills Repos

| Resource | URL | Covers |
|----------|-----|--------|
| MystenLabs/skills | https://github.com/MystenLabs/skills | Official Mysten skills (may be newer) |
| MystenLabs/sui-dev-skills | https://github.com/MystenLabs/sui-dev-skills | Move, TS SDK v2, dapp-kit-react skills |
| MystenLabs/sui-move-bootcamp | https://github.com/MystenLabs/sui-move-bootcamp | Move learning materials |

## Walrus

| Resource | URL | Covers |
|----------|-----|--------|
| Walrus Docs (main) | https://docs.wal.app/ | System overview, getting started, all features |
| Walrus Getting Started | https://docs.wal.app/docs/getting-started | Install, first blob, setup |
| Walrus Client CLI | https://docs.wal.app/docs/walrus-client | store, read, info commands |
| Walrus HTTP API | https://docs.wal.app/docs/http-api/storing-blobs | PUT /v1/blobs, deletable param |
| Walrus TS SDK | https://sdk.mystenlabs.com/walrus | @mysten/walrus, WalrusClient, writeBlob, readBlob |
| Walrus Aggregators/Publishers | https://docs.wal.app/docs/system-overview/public-aggregators-and-publishers | Endpoints, testnet vs mainnet |
| Walrus Sites | https://docs.wal.app/docs/sites | Decentralized static hosting |
| Walrus Sites: Install Builder | https://docs.wal.app/docs/sites/getting-started/installing-the-site-builder | site-builder CLI |
| Walrus Sites: First Site | https://docs.wal.app/docs/sites/getting-started/publishing-your-first-site | Deploy workflow |
| Walrus Cost Calculator | https://costcalculator.wal.app | Interactive cost estimation |
| Walrus GitHub | https://github.com/MystenLabs/walrus | Source, releases, docs source |
| @mysten/walrus npm | https://www.npmjs.com/package/@mysten/walrus | SDK package |

## Seal (Encryption + Access Control)

| Resource | URL | Covers |
|----------|-----|--------|
| Seal Docs | https://seal-docs.wal.app/ | On-chain access control, encryption, key servers |
| Seal GitHub | https://github.com/MystenLabs/seal | Source code, examples |
| @mysten/seal npm | https://www.npmjs.com/package/@mysten/seal | SDK package |

## MemWal (AI Agent Memory on Walrus)

| Resource | URL | Covers |
|----------|-----|--------|
| MemWal Docs | https://docs.memwal.ai/ | Encrypted AI memory on Walrus |
| MemWal GitHub | https://github.com/MystenLabs/MemWal | Source, integration examples |

## DeepBook

| Resource | URL | Covers |
|----------|-----|--------|
| DeepBook v3 Docs | https://docs.sui.io/onchain-finance/deepbookv3/deepbook | Architecture, design |
| DeepBook SDK Docs | https://docs.sui.io/standards/deepbookv3-sdk | Client setup via $extend, orders, pools, swaps |
| DeepBook SDK Orders | https://docs.sui.io/standards/deepbookv3-sdk/orders | placeLimitOrder, placeMarketOrder, cancelOrder, modifyOrder |
| DeepBook SDK Balance Manager | https://docs.sui.io/standards/deepbookv3-sdk/balance-manager | createAndShareBalanceManager, deposit, withdraw |
| DeepBook SDK Pools | https://docs.sui.io/standards/deepbookv3-sdk/pools | poolBookParams, getLevel2Range, createPermissionlessPool |
| DeepBook SDK Swaps | https://docs.sui.io/standards/deepbookv3-sdk/swaps | swapExactBaseForQuote, swapExactQuoteForBase |
| DeepBook Contract Info | https://docs.sui.io/standards/deepbookv3/contract-information | Package IDs, mainnet/testnet |
| DeepBook Predict | https://docs.sui.io/onchain-finance/deepbook-predict/ | Prediction markets (testnet only) |
| DeepBook Margin | https://docs.sui.io/onchain-finance/deepbook-margin | Leveraged trading (mainnet, up to 5x) |
| DeepBook Sandbox | https://github.com/MystenLabs/deepbook-sandbox | Local dev environment (Docker) |
| DeepBook v3 GitHub | https://github.com/MystenLabs/deepbookv3 | Move source code |
| DeepBook Predict Source | https://github.com/MystenLabs/deepbookv3/tree/predict-testnet-4-16/packages/predict | Predict package source |
| @mysten/deepbook-v3 npm | https://www.npmjs.com/package/@mysten/deepbook-v3 | SDK package |
| DeepBook SDK Source | https://github.com/MystenLabs/ts-sdks/tree/main/packages/deepbook-v3 | TS SDK source, examples |

## OpenZeppelin Sui

| Resource | URL | Covers |
|----------|-----|--------|
| OZ Contracts Sui Docs | https://docs.openzeppelin.com/contracts-sui/1.x | two_step_transfer, delayed_transfer, math |
| OZ Contracts Sui GitHub | https://github.com/OpenZeppelin/contracts-sui/tree/v1.0.0 | v1.0.0 source |
| OZ Contracts Sui (latest) | https://github.com/OpenZeppelin/contracts-sui | Latest (v1.1.0 as of April 2026) |
| OZ MCP Server | https://mcp.openzeppelin.com | Solidity, Cairo, Stellar, Stylus ONLY (no Sui) |
| OZ Announcement | https://www.openzeppelin.com/news/introducing-openzeppelin-contracts-for-sui | Launch blog post |

**IMPORTANT**: The correct repo is `contracts-sui`, NOT `openzeppelin-sui`. The old URL `github.com/OpenZeppelin/openzeppelin-sui` returns 404.

**Actual modules (v1.1.0)**:
- `openzeppelin_access`: `two_step_transfer`, `delayed_transfer`
- `openzeppelin_math`: `rounding`, `u8` through `u256`, `u512`, `decimal_scaling`
- `openzeppelin_fp_math`: `ud30x9`, `sd29x9`
- There is NO `access_control`, `pausable`, `ownable`, `upgradeable`, or `signer_registry` module.

**Dependency format (MVR)**:
```toml
openzeppelin_access = { r.mvr = "@openzeppelin-move/access" }
openzeppelin_math = { r.mvr = "@openzeppelin-move/integer-math" }
```

## Scallop

| Resource | URL | Covers |
|----------|-----|--------|
| Scallop Docs | https://docs.scallop.io | Lending, borrowing, liquidation, oracles |
| Scallop Borrowing | https://docs.scallop.io/scallop-lend/borrowing | Obligation, sub-accounts, borrow flow |
| Scallop Liquidation | https://docs.scallop.io/scallop-lend/liquidations | Risk level formula, liquidation_factor, borrow_weight |
| Scallop sCoin | https://docs.scallop.io/scallop-lend/lending/scoin | sCoins (not "scTokens"), exchange rate mechanism |
| Scallop Oracles | https://docs.scallop.io/protocol/oracles | Pyth-based XOracle |
| Scallop SDK GitHub | https://github.com/scallop-io/sui-scallop-sdk | Source, README, docs |
| Scallop SDK Client Docs | https://github.com/scallop-io/sui-scallop-sdk/blob/main/document/client.md | Client methods (deposit, borrow, repay, withdraw) |
| Scallop SDK Builder Docs | https://github.com/scallop-io/sui-scallop-sdk/blob/main/document/builder.md | depositQuick, borrowQuick, repayQuick, withdrawQuick |
| Scallop SDK Query Docs | https://github.com/scallop-io/sui-scallop-sdk/blob/main/document/query.md | getObligations, queryObligation |
| Scallop Contract Integration | https://docs.scallop.io/integrations/contract-integration/borrowing-function | Move-level integration |
| @scallop-io/sui-scallop-sdk npm | https://www.npmjs.com/package/@scallop-io/sui-scallop-sdk | SDK package |

**IMPORTANT**: SDK constructor is `new Scallop({ addressId, networkType, secretKey })`, NOT `new ScallopClient({ network })`. SDK currently only supports mainnet.

## Sui Overflow 2026

| Resource | URL | Covers |
|----------|-----|--------|
| Sui Overflow Official | https://overflow.sui.io/ | Tracks, prizes, timeline, sponsors |
| DeepSurge Submission | https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf | Submission portal |
| Overflow 2025 Winners | https://blog.sui.io/2025-sui-overflow-hackathon-winners/ | Winner patterns, 599 submissions |
| Sui Stack Messaging | https://github.com/MystenLabs/sui-stack-messaging | Example: Sui + Walrus + Seal messaging app |

## Third-Party Services

| Resource | URL | Covers |
|----------|-----|--------|
| Shinami (gas station, zkLogin) | https://docs.shinami.com | Managed gas sponsorship, zkLogin API |
| Enoki (Mysten managed zkLogin) | https://docs.enoki.mystenlabs.com | Production zkLogin service |
| Mysten Salt Service | https://salt.api.mystenlabs.com/get_salt | zkLogin salt endpoint |
| Mysten Prover (dev) | https://prover-dev.mystenlabs.com/v1 | zkLogin proof generation (dev/testnet) |

## solana-new (Reference Implementation)

| Resource | URL | Covers |
|----------|-----|--------|
| solana-new GitHub | https://github.com/sendaifun/solana-new | Skills structure, CLI, catalog data patterns |
| solana-new reference copy | /reference/solana-new-main/ | Local vendored copy in this repo |
