# RPC and Wallet Setup Guide

Shared reference for all suiperpower skills. RPC + wallet setup for Sui dev and production.

## RPC Setup

Pick the network first, then the endpoint. Public Mysten endpoints are fine for development. For production, switch to a paid or self-hosted node.

### Devnet

```bash
sui client switch --env devnet
sui client active-env
```

If the env is missing:

```bash
sui client new-env --alias devnet --rpc https://fullnode.devnet.sui.io:443
sui client switch --env devnet
```

### Testnet

Testnet is the primary network for Sui Overflow 2026 submissions when the project is not mainnet ready.

```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
```

### Mainnet

Mysten's public mainnet RPC is rate limited. For anything beyond casual testing, point at a paid provider (Blockvision, Suiscan) or a self-hosted full node.

```bash
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet
```

To use a paid RPC, replace the `--rpc` URL with the provider's mainnet endpoint.

### Verify the RPC works

```bash
sui client active-env
sui client envs
sui client active-address
sui client gas
```

If `sui client gas` returns nothing on devnet or testnet, the wallet has no SUI yet. Run the faucet (see below).

## Wallet Setup

### Development on devnet or testnet

```bash
sui client new-address ed25519
sui client switch --address <NEW_ADDRESS>
sui client faucet
sui client gas
```

The faucet drips test SUI to the active address on the active env. Devnet and testnet both have public faucets through `sui client faucet`.

### Production on mainnet

Never reuse a devnet or testnet keypair on mainnet. Generate a fresh address, fund it from a wallet you control, and back up the seed phrase offline.

```bash
sui client new-address ed25519
sui client switch --address <MAINNET_ADDRESS>
```

Send SUI from your personal wallet (Slush, Suiet) to this address before publishing.

### Multisig for high value packages

For any package holding meaningful TVL or capability, the upgrade authority should be a multisig. Mysten's `sui keytool multi-sig-address` produces a multisig from N existing keys. Ecosystem multisig services (Squads-equivalent on Sui) are emerging; check the catalog for current recommendations.

## Wallet Adapter and Frontend Setup

Pick the SDK by use case.

| Use case | SDK | Install |
|---|---|---|
| Web dApp, crypto users | @mysten/dapp-kit-react | pnpm i @mysten/dapp-kit-react @mysten/sui |
| Web dApp, social login | @mysten/enoki (zkLogin) | pnpm i @mysten/enoki |
| Sui Wallet only | dapp-kit's wallet integration | included with dapp-kit |
| Mobile (React Native) | Sui Mobile SDK | per Mysten Mobile SDK guide |
| AI agent or backend bot | @mysten/sui Keypair | pnpm i @mysten/sui |

For the dapp-kit-react setup, wrap the app in `DAppKitProvider` near the root (replaces the old `SuiClientProvider` + `WalletProvider` pair). The dapp-kit docs at sdk.mystenlabs.com cover the full setup; we do not duplicate it here.

## Environment Variables Pattern

Every project ships `.env.example` (committed) and `.env` (gitignored). Canonical Sui variables:

```bash
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_FAUCET_URL=https://faucet.testnet.sui.io/v1/gas
ENOKI_API_KEY=
WALRUS_AGGREGATOR_URL=
WALRUS_PUBLISHER_URL=
DEEPBOOK_PACKAGE_ID=
```

Frontend frameworks expose a subset to the client (e.g. `NEXT_PUBLIC_SUI_NETWORK`). Server only secrets (Enoki API key, RPC keys with quota) stay unprefixed.

## Quick Reference: which RPC for what

| Use case | RPC | Why |
|---|---|---|
| Dev and testing | Mysten public devnet or testnet | Free, no signup |
| Production app, low volume | Blockvision or Suiscan | Reliable, generous free tiers |
| Production app, high volume | Paid RPC tier or self-hosted full node | Rate limit headroom |
| Indexer or analytics | Mysten indexer or third-party indexer | Different endpoint than RPC |

## Quick Reference: which wallet for what

| Use case | Wallet | Why |
|---|---|---|
| Crypto-native users | Slush, Suiet, OKX | Familiar, supports dapp-kit out of box |
| Social-login users | zkLogin via Enoki | No seed phrase, OAuth identity |
| Mobile-first product | Sui Mobile SDK | Native iOS and Android |
| Backend signer | @mysten/sui Keypair from env | No browser dependency |

For depth on protocol and SDK choices, see `skills/data/sui-knowledge/04-protocols-and-sdks.md`.

## Skills that read this guide

`scaffold-project`, `build-with-claude`, `deploy-to-testnet`, `deploy-to-mainnet`, `sui-zk-login`, `sponsored-transactions`, `build-mobile-sui`.

*Last updated: 2026-05-11. Targets Sui CLI v1.x and @mysten/dapp-kit-react (SDK v2.0).*
