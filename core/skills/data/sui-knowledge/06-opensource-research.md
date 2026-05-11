# 06. Open-source research on Sui

> Audience: a dev researching prior art before building. How to read what is on chain, find similar projects, and decide whether to fork or build fresh.

## How to read a Move package on chain

Given a package id, you can read its bytecode and ABI:

```bash
sui client object <PACKAGE_ID>
sui client object <PACKAGE_ID> --json
```

For module-level inspection:

```bash
sui move disassemble --package <PACKAGE_ID> --module <module_name>
```

Limitation: bytecode is verifiable, source is not always recovered cleanly. Many serious projects publish a verified-source link; check Suiscan's package page for "Verified Source" indicator.

For ABI introspection (function signatures, struct shapes):

```bash
sui client call --package <PACKAGE_ID> --module <module_name> --function <fn> --help
```

The TS SDK exposes the same data programmatically:

```ts
import { SuiGrpcClient } from "@mysten/sui/grpc";

const client = new SuiGrpcClient({ network: "mainnet", baseUrl: "https://fullnode.mainnet.sui.io:443" });
// getNormalizedMoveModulesByPackage is JSON-RPC specific. If using the gRPC client,
// use client.core methods or fall back to a JSON-RPC client for module introspection.
const normalized = await client.getNormalizedMoveModulesByPackage({ package: PACKAGE_ID });
```

## How to find similar projects

Three places to look:

1. **Suiscan / Sui Explorer**: search for similar package names, browse by tag (NFT, DeFi, etc.). Limitation: there is no "search by Move function signature" yet.
2. **GitHub topics**: search `sui-blockchain`, `sui-move`, `move-language`, plus the protocol you care about (e.g. `walrus-storage`).
3. **Suiperpower's ecosystem catalog**: `cli/data/clonable-repos.json` lists curated Sui repos with one-liners and tags.

For a hackathon-specific search:

- **Sui Overflow past projects**: `https://overflow.sui.io` archives. Read what won, what shipped, what shipped but did not win.
- **DoraHacks Sui hackathons**: cross-reference for projects that submitted to multiple events.
- **Suiperpower's `overflow-copilot` skill**: structured search over past Sui hackathon submissions.

## How to evaluate a Sui repo for fork-worthiness

Signal-quality checks:

1. **License** (`LICENSE` file). MIT, Apache 2.0, or BSD are forkable. GPL is fine for personal use but harder for a commercial fork. Check the repo's chosen license, not the framework's.
2. **Last commit date.** Older than 12 months on a fast-moving Sui project is a yellow flag. Older than 24 months is usually a red flag for forking.
3. **Build status.** Does `sui move build` work cleanly with the current Sui CLI? If the Move framework dependency is pinned to an old `rev`, the rev might be incompatible with current testnet.
4. **Test coverage.** A repo with zero tests is not a good fork target for production code.
5. **Capabilities and admin keys.** Does the repo's `init` mint capabilities that the fork inherits? You will need to re-publish with your own keys.
6. **External dependencies.** Does the package depend on other on-chain packages? Forking a package that calls `sui::deepbook::*` works only if you also have a DeepBook deployment to point at.

When you fork:

- Change the package name in `Move.toml`.
- Change the published-at address (will be assigned at your publish).
- Audit the `init` function carefully; capabilities go to the deployer, which is now you.
- Remove or replace any hardcoded admin addresses.

## License and attribution norms in the Sui ecosystem

Common patterns:

- **Mysten Labs framework code** (sui-framework, etc.) is Apache 2.0. Forks must retain the license header.
- **Mysten reference apps** (suins, kiosk, deepbook) tend to be Apache 2.0.
- **OpenZeppelin Sui libraries**: check the per-module license; OZ's EVM libs are MIT, but the Sui port may differ.
- **Community projects**: highly variable. Default to checking before assuming.

When forking attribution:

- Keep the original author's attribution in source headers if the license requires it.
- Add your own attribution clearly. Do not strip the original.
- For meaningful adaptations, credit in the README, not just in source comments.

The Sui community is small enough that crediting earlier work tends to make collaboration easier.

## Reference repos by category

This is a starter set. The full curated list lives in `cli/data/clonable-repos.json`.

### Sui core and reference

- `mystenlabs/sui` (the chain itself, framework, CLI)
- `mystenlabs/sui-rust-sdk` and `@mysten/sui` (TS SDK in the same monorepo)
- `mystenlabs/dapp-kit` (React component library)

### Frameworks and templates

- `mystenlabs/sui-typescript-template` (starter web dApp)
- Suiperpower's `scaffold-project` skill picks the appropriate template based on user's stack choice.

### DeFi reference

- `MystenLabs/deepbook-v3` (the Sui DeepBook v3 contracts and SDK)
- Cetus protocol contracts (concentrated liquidity AMM)
- Scallop protocol (money market) reference

### NFT and Kiosk reference

- `mystenlabs/apps/kiosk` (reference kiosk implementation)
- BlueMove and Tradeport may have public components

### Gaming and consumer

- The Sui Gaming Toolkit and example games
- DoubleUp public components

### Storage

- `mystenlabs/walrus-sites` (Walrus + static site hosting)
- Walrus client and SDK

### Auth

- `mystenlabs/zklogin-prover` (zkLogin reference)
- Enoki's public examples

## How to evaluate "is this idea already built"

Before you commit a week to an idea, run a 30-minute prior-art pass:

1. Search Suiscan for the keyword in your idea (e.g. "archive", "data", "audit").
2. Search GitHub topics on Sui for similar implementations.
3. Search Twitter / Telegram for "Sui + <category>".
4. Skim past Sui Overflow projects.
5. Check Suiperpower's `cli/data/sui-ideas.json` for adjacency (your idea might be a small variation of one already on the list, with prior thinking attached).

Outcome:

- "Built and live, well-known": pivot or differentiate sharply.
- "Built but inactive": worth a deeper read; might be a fork-and-revive opportunity.
- "Sketched in past hackathon, never shipped": opportunity, but understand why it never shipped.
- "Not found": you might be early, or the search did not surface it. Triple-check.

## Where to go next

- For idea generation: `skills/idea/find-next-sui-idea/`.
- For competitive landscape mapping: `skills/idea/competitive-landscape/`.
- For past-hackathon search: `skills/idea/overflow-copilot/`.

Last updated: 2026-05-11. Updated for SDK v2.0 (SuiGrpcClient replaces SuiClient).
