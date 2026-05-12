# EVE Frontier quickstart

Setup, scaffold, and deploy flow for building Smart Assemblies on Sui.

Sources: https://docs.evefrontier.com/, https://github.com/evefrontier/builder-scaffold

## Background

EVE Frontier migrated from Ethereum to Sui in March 2026. Smart Assemblies are programmable on-chain objects that modify gameplay: targeting behavior, access control, and item trading. The $50K EVE Frontier track at Sui Overflow 2026 rewards novel assembly designs.

The system uses zkLogin for player identity, sponsored transactions for gas-free gameplay, Walrus for asset storage, and Seal for encrypted data where needed.

## Prerequisites

| Requirement | Install |
|---|---|
| Sui CLI | `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch main sui` |
| Node.js 20+ | https://nodejs.org/ |
| Docker | https://docs.docker.com/get-docker/ (required for local testing) |
| Git | Standard install |

Verify: `sui --version && docker --version && node --version`

## Clone the builder scaffold

```bash
git clone https://github.com/evefrontier/builder-scaffold
cd builder-scaffold
```

The scaffold contains:

- `move-contracts/`: Move packages with extension examples (smart_gate_extension, storage_unit_extension). Each has its own `sources/`, `tests/`, and `Move.toml`.
- `ts-scripts/`: TypeScript interaction scripts (helpers, utils, example gate scripts).
- `docker/`: Dev container with Sui CLI + Node.js.
- `dapps/`: Reference dApp template.
- `setup-world/`: World deployment configuration.
- `zklogin/`: OAuth-based signing CLI.

## Local development with Docker

```bash
# Start the local EVE dev environment
docker compose up -d

# Deploy your Move package to the local environment
sui move build
# Follow scaffold instructions for local deployment
```

The Docker environment simulates the EVE Frontier game world locally, so you can test assembly behavior without deploying to testnet.

## Deploy to testnet

```bash
# Build the Move package
sui move build

# Ensure your active Sui address has testnet SUI
sui client faucet

# Publish the package
sui client publish --gas-budget 100000000
```

Record the package ID from the publish output. You will need it for world registration.

## Register extension with the assembly

After deploying, the assembly owner registers your extension so the game uses your logic. Follow the builder docs: https://docs.evefrontier.com/

The registration flow:

1. Your package exposes a `register` (or similar) function that calls `authorize_extension<YourAuth>()` on the assembly.
2. The owner calls this function, passing their `OwnerCap<Turret>`, `OwnerCap<Gate>`, or `OwnerCap<StorageUnit>`.
3. The assembly's `extension` field is set to your Auth witness type name. The game resolves your package from this type at runtime.

## Key integration points

| Integration | When to use | Suiperpower skill |
|---|---|---|
| Walrus | Store large assets (images, configs) referenced by assemblies | `walrus-storage` |
| Seal | Encrypt assembly data (secret targeting rules, private gate lists) | `seal-access-control` |
| zkLogin | Verify player identity without wallet popups | `sui-zk-login` |
| Sponsored tx | Make assembly interactions gasless for players | `sponsored-transactions` |

## Troubleshooting

| Issue | Fix |
|---|---|
| Docker not running | Start Docker Desktop or `systemctl start docker` |
| Sui CLI version mismatch | Check the scaffold README for required Sui CLI version |
| Build fails with missing deps | Run `sui move build` from inside the specific `move-contracts/<extension>/` directory, not the repo root |
| Registration fails | Verify your package ID and that your Auth witness type matches what was registered via `authorize_extension` |
