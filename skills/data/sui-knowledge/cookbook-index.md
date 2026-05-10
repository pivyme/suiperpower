# Cookbook index

> Quick recipes by intent. Each entry points to the canonical reference (Sui docs, Mysten examples, sponsor docs, or our own knowledge files). The cookbook is the AI's first-stop dispatcher when a user asks "how do I do X on Sui."

## Move and packages

| Intent | Pointer |
|---|---|
| Mint a coin | `https://docs.sui.io/guides/developer/coin` and `03-move-and-objects.md` "Coin standard" |
| Burn a coin | `03-move-and-objects.md` "Coin standard" |
| Create an Object | `03-move-and-objects.md` "Module declaration" |
| Transfer an Object | `03-move-and-objects.md` "Owned, shared, immutable Objects" |
| Make an Object shared | `transfer::share_object` |
| Freeze an Object (immutable) | `transfer::freeze_object` |
| Define a one-time witness | `03-move-and-objects.md` "Witness pattern" |
| Issue an admin capability | `03-move-and-objects.md` "Capability pattern" |
| Set up Display for an NFT | `03-move-and-objects.md` "Display standard" |
| Build a package | `sui move build` |
| Test a package | `sui move test`; `03-move-and-objects.md` "Test patterns" |
| Publish to devnet | `skills/data/guides/deploy-runbook.md` Phase 2 |
| Publish to testnet | `skills/data/guides/deploy-runbook.md` Phase 3 |
| Publish to mainnet | `skills/data/guides/deploy-runbook.md` Phase 5 |
| Capture package id from publish | `skills/data/guides/package-id-capture.md` |
| Upgrade a package | `sui client upgrade --upgrade-capability <CAP>` and `https://docs.sui.io/concepts/sui-move-concepts/packages/upgrade` |

## Frontend and dApp-kit

| Intent | Pointer |
|---|---|
| Set up dapp-kit in Next.js | `05-app-layer-and-consumer.md` "Frontend stack defaults" |
| Add a connect button | `05-app-layer-and-consumer.md` "Wallet connection patterns" |
| Sign and execute a PTB | `useSignAndExecuteTransaction` from `@mysten/dapp-kit` |
| Read an Object from the frontend | `client.getObject({ id, options })` |
| Subscribe to events | `client.subscribeEvent` (websocket fullnode required) |
| Format SUI balance for display | `skills/build/number-formatting/` |

## PTBs

| Intent | Pointer |
|---|---|
| Build a basic PTB | `https://docs.sui.io/concepts/transactions/prog-txn-blocks` |
| Split and transfer SUI | `tx.splitCoins(tx.gas, [amount])` then `tx.transferObjects` |
| Call a Move function | `tx.moveCall({ target: '<pkg>::<mod>::<fn>', arguments, typeArguments })` |
| Compose multi-step PTBs | `skills/build/ptb-composer/` |

## Wallets and auth

| Intent | Pointer |
|---|---|
| Connect Slush, Sui Wallet, Phantom | `@mysten/dapp-kit` Wallet Standard support |
| Add zkLogin (dev) | `https://docs.sui.io/concepts/cryptography/zklogin` |
| Add zkLogin (production) | Enoki, see `05-app-layer-and-consumer.md` "zkLogin in production" |
| Sponsor a transaction | `https://docs.sui.io/concepts/transactions/sponsored-transactions` and `skills/build/sponsored-transactions/` |
| Multisig signing | `https://docs.sui.io/concepts/cryptography/transaction-auth/multisig` |

## Storage (Walrus)

| Intent | Pointer |
|---|---|
| Store a blob on Walrus | `sponsor-docs/walrus.md` "Minimal integration recipe" |
| Retrieve a blob by id | `sponsor-docs/walrus.md` |
| Set blob lifetime / extend | `sponsor-docs/walrus.md` "Pitfalls" |
| Encrypt before upload | user's responsibility, see `sponsor-docs/walrus.md` |

## DeepBook

| Intent | Pointer |
|---|---|
| Place a limit order | `sponsor-docs/deepbook.md` |
| Place a market order | `sponsor-docs/deepbook.md` |
| Cancel an order | `sponsor-docs/deepbook.md` |
| Read the orderbook | DeepBook indexer or direct Object reads |
| Create a new pool | `sponsor-docs/deepbook.md` (advanced, requires native pool create cap) |

## Scallop

| Intent | Pointer |
|---|---|
| Deposit collateral | `sponsor-docs/scallop.md` "Minimal recipe" |
| Borrow against collateral | `sponsor-docs/scallop.md` |
| Repay a loan | `sponsor-docs/scallop.md` |
| Read a position | `sponsor-docs/scallop.md` |

## Kiosk

| Intent | Pointer |
|---|---|
| Create a Kiosk | `https://docs.sui.io/standards/kiosk` |
| List an item for sale | Kiosk standard `place` and `list` flow |
| Buy from a Kiosk | Kiosk standard `purchase` flow |
| Set up a Transfer Policy | Kiosk standard, royalty enforcement |

## OpenZeppelin Sui libs

| Intent | Pointer |
|---|---|
| Add OZ access control | `sponsor-docs/openzeppelin-sui.md` |
| Add OZ pausable | `sponsor-docs/openzeppelin-sui.md` |
| Replace hand-rolled patterns | `skills/build/openzeppelin-sui-libs/` |

## Cross-chain

| Intent | Pointer |
|---|---|
| Bridge USDC from Ethereum | Wormhole or Circle's CCTP if supported |
| Bridge ETH | Wormhole or LayerZero |
| Send a Sui asset to another chain | depends on bridge; check the bridge's UI |

## Oracles

| Intent | Pointer |
|---|---|
| Read a Pyth price feed | `https://docs.pyth.network/price-feeds/sui` |
| Use Switchboard randomness | Switchboard Sui docs |
| Build a custom oracle | `04-protocols-and-sdks.md` "Oracles" |

## Indexing and analytics

| Intent | Pointer |
|---|---|
| Read historical events for a package | Mysten public indexer or Blockvision |
| Build a custom indexer | open-source Sui indexer in mystenlabs/sui |
| Stream new events | websocket subscription on a fullnode |

## Mobile

| Intent | Pointer |
|---|---|
| React Native Sui setup | `skills/build/build-mobile-sui/` |
| Deep-link to Slush mobile | Slush mobile docs |
| Embedded mobile wallet | Sui Mobile SDK reference |

## Security

| Intent | Pointer |
|---|---|
| Pre-audit Move review | `skills/build/review-move/` and `skills/data/guides/security-checklist.md` |
| Engage OtterSec | `sponsor-docs/ottersec-checklist.md` |
| Capability hygiene checklist | `skills/data/guides/security-checklist.md` "P0" |

## Hackathon and launch

| Intent | Pointer |
|---|---|
| Pick a Sui Overflow track | `skills/ship/pick-my-sui-track/` |
| Submit to deepsurge.xyz | `skills/data/guides/deepsurge-submission.md` |
| Apply for a Sui Foundation grant | `skills/ship/apply-grant/` |

## Convention

If you cannot find your intent here, the answer is probably in:

- `https://docs.sui.io/` for first-party docs
- `skills/data/sui-knowledge/0X-*.md` for distilled knowledge
- `skills/data/sui-knowledge/sponsor-docs/<sponsor>.md` for sponsor-specific recipes
- `skills/build/<skill>/SKILL.md` for the procedural skill that walks you through it

Recipes here are pointers, not full content. Length budget for this index: stays under 250 lines so the AI loads it cheaply on every skill.

Last updated: 2026-05-10.
