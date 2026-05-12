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
| Seal GitHub | https://github.com/MystenLabs/seal | Source code, examples, 7 Move patterns |
| Seal SDK Source | https://github.com/MystenLabs/ts-sdks/tree/main/packages/seal | SealClient, SessionKey, EncryptedObject |
| Seal SDK Docs | https://sdk.mystenlabs.com/seal | $extend pattern, API reference |
| @mysten/seal npm | https://www.npmjs.com/package/@mysten/seal | SDK package (^1.1.0) |
| Seal Blog Post | https://blog.sui.io/seal-programmable-access-control/ | Technical overview, architecture |
| Seal Decentralized Key Server | https://blog.sui.io/introducing-decentralized-seal-key-server-testnet/ | 3-of-5 threshold, committee mode |
| Seal Move Patterns | https://github.com/MystenLabs/seal/tree/main/move/patterns/sources | whitelist, subscription, account_based, private_data, tle, voting, key_request |
| Sui Stack Messaging (Seal+Walrus) | https://github.com/MystenLabs/sui-stack-messaging | E2E encrypted messaging example |
| Awesome Seal | https://github.com/MystenLabs/awesome-seal | Ecosystem projects using Seal |

**Package IDs**: Mainnet `0xcb83a2...b447b7`, Testnet `0x8d9088...aa54b2`. Aggregator (testnet): `https://seal-aggregator-testnet.mystenlabs.com`

## MemWal (AI Agent Memory on Walrus)

| Resource | URL | Covers |
|----------|-----|--------|
| MemWal Docs | https://docs.memwal.ai/ | Encrypted AI memory on Walrus |
| MemWal GitHub | https://github.com/MystenLabs/MemWal | Source, integration examples |
| @mysten-incubation/memwal npm | https://www.npmjs.com/package/@mysten-incubation/memwal | SDK: full-service, manual, ai (Vercel), oc (OpenClaw) |

## Pyth Oracle (Price Feeds on Sui)

| Resource | URL | Covers |
|----------|-----|--------|
| Pyth Sui Integration Guide | https://docs.pyth.network/price-feeds/core/use-real-time-data/pull-integration/sui | Pull model, PTB pattern, Move integration |
| Pyth Sui Contract Addresses | https://docs.pyth.network/price-feeds/contract-addresses/sui | State IDs, package IDs (mainnet + testnet) |
| Pyth Best Practices | https://docs.pyth.network/price-feeds/core/best-practices | Exponent handling, confidence, staleness |
| Pyth Price Feed IDs | https://docs.pyth.network/price-feeds/core/price-feed-ids | Feed ID lookup |
| @pythnetwork/pyth-sui-js npm | https://www.npmjs.com/package/@pythnetwork/pyth-sui-js | SuiPythClient, SuiPriceServiceConnection |
| Pyth Move Source | https://github.com/pyth-network/pyth-crosschain/tree/main/target_chains/sui/contracts | pyth.move, price.move, price_info.move, hot_potato_vector.move |
| Pyth TS SDK Source | https://github.com/pyth-network/pyth-crosschain/tree/main/target_chains/sui/sdk/js | client.ts, SuiPriceServiceConnection.ts |
| Hermes Mainnet | https://hermes.pyth.network | Price data API (Stable channel) |
| Hermes Testnet | https://hermes-beta.pyth.network | Price data API (Beta channel) |

**Key IDs**: SUI/USD `23d731...65744`, BTC/USD `e62df6...5b43`, ETH/USD `ff6149...0ace`

## Nautilus (Off-Chain TEE Compute)

| Resource | URL | Covers |
|----------|-----|--------|
| Nautilus Sui Docs | https://docs.sui.io/guides/developer/nautilus | Overview, developer guide |
| Nautilus Using Guide | https://docs.sui.io/guides/developer/nautilus/using-nautilus | Step-by-step walkthrough |
| Nautilus GitHub | https://github.com/MystenLabs/nautilus | Rust server, Move contracts, deploy scripts |
| Nautilus Design Doc | https://github.com/MystenLabs/nautilus/blob/main/Design.md | Trust model, architecture |
| Nautilus Usage Guide | https://github.com/MystenLabs/nautilus/blob/main/UsingNautilus.md | Full developer guide |
| Nautilus enclave.move | https://github.com/MystenLabs/nautilus/blob/main/move/enclave/sources/enclave.move | Core verification module |
| Sui Framework nitro_attestation | https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/packages/sui-framework/sources/crypto/nitro_attestation.move | On-chain attestation verification |
| Nautilus Blog Post | https://blog.sui.io/nautilus-offchain-security-privacy-web3/ | Launch announcement |
| Marlin Oyster (managed TEE) | https://blog.marlin.org/scaling-confidential-compute-on-sui-nautilus-and-marlin-oyster-integration | Managed Nautilus deployment |

## SuiNS (Name Service + MVR)

| Resource | URL | Covers |
|----------|-----|--------|
| SuiNS Docs | https://docs.suins.io/ | Registration, resolution, subnames, pricing |
| SuiNS SDK Docs | https://docs.suins.io/developer/sdk.md | SuinsClient, SuinsTransaction |
| SuiNS Contracts | https://github.com/MystenLabs/suins-contracts | Move source code |
| MVR (Move Registry) | https://docs.suins.io/move-registry | Human-readable package naming |
| MVR CLI | https://docs.suins.io/move-registry/tooling/mvr-cli.md | `mvr add`, `mvr resolve` |
| MVR GitHub | https://github.com/MystenLabs/mvr | CLI source + web app |
| @mysten/suins npm | https://www.npmjs.com/package/@mysten/suins | SDK package |

## Walrus Sites (Decentralized Hosting)

| Resource | URL | Covers |
|----------|-----|--------|
| Walrus Sites Sui Docs | https://docs.sui.io/sui-stack/walrus/sui-stack-walrus-sites | Architecture, constraints, portals |
| Walrus Sites GitHub | https://github.com/MystenLabs/walrus-sites | site-builder CLI source |
| Example Walrus Sites | https://github.com/MystenLabs/example-walrus-sites | Demo dApp with NFT sites |
| site-builder Install | https://docs.wal.app/docs/sites/getting-started/installing-the-site-builder | `suiup install site-builder@mainnet` |
| site-builder Usage | https://docs.wal.app/docs/sites/getting-started/using-the-site-builder | deploy, convert, sitemap, destroy |

## DefiLlama (DeFi Research API)

| Resource | URL | Covers |
|----------|-----|--------|
| DefiLlama API Docs | https://api-docs.defillama.com/ | All endpoints, no auth required |
| TVL/Protocols API | https://api.llama.fi | /v2/chains, /protocols, /tvl/{name} |
| DEX Volume Sui | https://api.llama.fi/overview/dexs/Sui | Sui DEX volumes by protocol |
| Fees/Revenue Sui | https://api.llama.fi/overview/fees/Sui | Sui fee data by protocol |
| Yields API | https://yields.llama.fi | /pools (filter chain=Sui) |
| Stablecoins API | https://stablecoins.llama.fi | /stablecoincharts/Sui |
| @defillama/api npm | https://www.npmjs.com/package/@defillama/api | JS SDK |

## AI Agents on Sui

| Resource | URL | Covers |
|----------|-----|--------|
| Sui Agentic Vision Blog | https://blog.sui.io/agentic-execution-ai-agents-need-blockchain/ | Why Sui for AI agents |
| Composable Systems Blog | https://blog.sui.io/from-apps-to-composable-systems/ | PTBs as agent tool use |
| Atoma Network GitHub | https://github.com/atoma-network/atoma-node | Decentralized AI inference |
| Atoma Sui Blog | https://blog.sui.io/atoma-ai-artificial-intelligence-blockchain/ | Atoma integration details |
| Sui Agent Kit (Pelagos) | https://github.com/pelagosaionsui/sui-agent-kit | LangChain/Vercel AI framework |
| Sui AI Agent Kit (Caterpillar) | https://github.com/caterpillardev/Sui-AI-Agent-Kit | MCP-based agent framework |
| Talus Network | https://talus.network/ | On-chain agent framework (mainnet) |
| Turnkey Sui Agent Analysis | https://www.turnkey.com/blog/sui-for-ai-blockchain-infrastructure-for-multi-agent-systems | Architecture analysis |

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

## Cetus Protocol (DEX/AMM)

| Resource | URL | Covers |
|----------|-----|--------|
| Cetus Docs | https://cetus-1.gitbook.io/cetus-docs | Protocol overview, CLMM mechanics, fee tiers, tokenomics |
| Cetus Developer Docs | https://cetus-1.gitbook.io/cetus-developer-docs | SDK integration, contract addresses, aggregator, quick start |
| Cetus CLMM SDK GitHub | https://github.com/CetusProtocol/cetus-clmm-sui-sdk | CLMM SDK source, examples, pool/position/swap operations |
| Cetus Aggregator GitHub | https://github.com/CetusProtocol/aggregator | Multi-DEX aggregator SDK, route optimization, 25+ DEX support |
| Cetus GitHub Org | https://github.com/CetusProtocol | All Cetus repos (CLMM, aggregator, vaults, farming) |
| @cetusprotocol/cetus-sui-clmm-sdk npm | https://www.npmjs.com/package/@cetusprotocol/cetus-sui-clmm-sdk | CLMM SDK package (swap, liquidity, pool queries) |
| @cetusprotocol/aggregator-sdk npm | https://www.npmjs.com/package/@cetusprotocol/aggregator-sdk | Aggregator SDK package (multi-DEX routing) |
| Cetus App | https://app.cetus.zone/ | Live DEX frontend |

## Haedal Protocol (Liquid Staking)

| Resource | URL | Covers |
|----------|-----|--------|
| Haedal Docs | https://haedal-protocol.gitbook.io/haedal-protocol-docs | Protocol overview, haSUI, haWAL, HMM, haeVault |
| Haedal GitHub Org | https://github.com/haedallsd | Contracts, audit reports, docs, adapters |
| Haedal Website | https://www.haedal.xyz/ | Staking UI, APR info |

**Note**: Haedal does not appear to publish a standalone public npm SDK. Integration is typically done via the Cetus Aggregator or NAVI wallet-client which include Haedal staking support.

## NAVI Protocol (Lending)

| Resource | URL | Covers |
|----------|-----|--------|
| NAVI Docs | https://docs.naviprotocol.io/ | Protocol overview, lending, borrowing, liquidation |
| NAVI Docs (GitBook) | https://naviprotocol.gitbook.io/navi-protocol-docs | Alternate docs mirror |
| NAVI SDK Docs | https://sdk.naviprotocol.io/lending | SDK setup, pool operations, flash loans, rewards |
| NAVI SDK GitHub | https://github.com/naviprotocol/navi-sdk | SDK source, examples, integration guides |
| NAVI GitHub Org | https://github.com/naviprotocol | All NAVI repos |
| @naviprotocol/lending npm | https://www.npmjs.com/package/@naviprotocol/lending | Lending SDK (deposit, borrow, repay, withdraw, flash loans) |
| @naviprotocol/wallet-client npm | https://www.npmjs.com/package/@naviprotocol/wallet-client | Unified wallet client (lending + swaps + staking) |
| NAVI Website | https://naviprotocol.io/ | App frontend |

## Suilend (Lending)

| Resource | URL | Covers |
|----------|-----|--------|
| Suilend Docs | https://docs.suilend.fi/ | Protocol overview, lending, borrowing, SpringSui, STEAMM |
| Suilend SDK Guide | https://docs.suilend.fi/ecosystem/suilend-sdk-guide | SDK setup, auto-generated bindings, usage examples |
| Suilend GitHub | https://github.com/suilend/suilend | Move contracts source (money market on Sui) |
| Suilend Frontend (public) | https://github.com/suilend/suilend-fe-public | Frontend source, SDK subfolder |
| @suilend/sdk npm | https://www.npmjs.com/package/@suilend/sdk | TypeScript SDK (lending, borrowing, liquidity mining) |
| @suilend/springsui-sdk npm | https://www.npmjs.com/package/@suilend/springsui-sdk | SpringSui liquid staking SDK |
| Suilend Website | https://suilend.fi/ | App frontend |

## Turbos Finance (DEX)

| Resource | URL | Covers |
|----------|-----|--------|
| Turbos Docs | https://turbos.gitbook.io/turbos | Protocol overview, CLMM mechanics, developer guides |
| Turbos CLMM SDK GitHub | https://github.com/turbos-finance/turbos-clmm-sdk | CLMM SDK source (swap, pool, position, NFT) |
| Turbos GitHub Org | https://github.com/turbos-finance | All Turbos repos |
| turbos-clmm-sdk npm | https://www.npmjs.com/package/turbos-clmm-sdk | CLMM SDK package (swap, liquidity, pool management) |

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

## Sui Overflow 2025 Winners

| Resource | URL | Covers |
|----------|-----|--------|
| 2025 Winners Blog | https://blog.sui.io/2025-sui-overflow-hackathon-winners/ | All 46 winners, tracks, technologies |
| Walrus Hackathon Highlights | https://blog.walrus.xyz/walrus-hackathon-highlight-summer25/ | Walrus-specific project details |
| Suithetic Deep Dive | https://blog.sui.io/verifiable-ai-data-sui-stack/ | Atoma + Walrus + Seal pattern |

**Top tech by winner count**: Walrus (14+), AI/ML (8+), Seal (4), Pyth (3), zkLogin (3), ZK proofs (3), Kiosk (2), Nautilus (1)

## Catalog Data Sources (Repos, MCPs, Skills)

| Resource | URL | Covers |
|----------|-----|--------|
| Awesome Sui | https://github.com/sui-foundation/awesome-sui | Curated Sui ecosystem repos |
| Awesome Walrus | https://github.com/MystenLabs/awesome-walrus | Walrus ecosystem tools and SDKs |
| Awesome Seal | https://github.com/MystenLabs/awesome-seal | Seal ecosystem projects |
| Awesome Web3 MCPs | https://github.com/demcp/awesome-web3-mcp-servers | Blockchain MCP server registry |
| Awesome Blockchain MCPs | https://github.com/royyannick/awesome-blockchain-mcps | Another MCP list |
| Awesome Agent Skills | https://github.com/VoltAgent/awesome-agent-skills | Claude Code skill registry |
| MystenLabs GitHub Org | https://github.com/orgs/MystenLabs/repositories | All official repos |
| Suimate Skills | https://skills.suimate.ai/ | Community Sui agent skills |
| MCP Pizza (Sui) | https://www.mcp.pizza/mcp-server/HuK2/sui-mcp | MCP directory |

## solana-new (Reference Implementation)

| Resource | URL | Covers |
|----------|-----|--------|
| solana-new GitHub | https://github.com/sendaifun/solana-new | Skills structure, CLI, catalog data patterns |
| solana-new reference copy | /reference/solana-new-main/ | Local vendored copy in this repo |
