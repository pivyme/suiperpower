# Sui project templates

Three baseline shapes. Mix and match per project intent.

## Move-only package

```
my-project/
├── Move.toml
├── sources/
│   └── my_module.move
├── tests/
│   └── my_module_tests.move
├── .suiperpower/
│   └── build-context.md
├── .gitignore
└── README.md
```

Use when the project is contracts only (libraries, on-chain protocols, or contracts with a frontend in a separate repo).

## Frontend dapp + Move package

```
my-project/
├── move/
│   └── my_pkg/
│       ├── Move.toml
│       ├── sources/
│       ├── tests/
│       └── ...
├── web/
│   ├── package.json
│   ├── next.config.js
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   │   └── sui.ts
│   ├── public/
│   └── tsconfig.json
├── .suiperpower/
│   └── build-context.md
├── .gitignore
├── pnpm-workspace.yaml
└── README.md
```

Use for a typical user-facing dapp.

`web/lib/sui.ts` defines the Sui client setup:

```ts
import { SuiGrpcClient } from "@mysten/sui/grpc";

export const sui = new SuiGrpcClient({ network: "testnet" });
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
```

`web/app/layout.tsx` wraps the app in `DAppKitProvider`:

```tsx
import { DAppKitProvider } from "@mysten/dapp-kit-react";
// ... full provider setup
```

## Full-stack with backend

```
my-project/
├── move/
├── web/
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   └── sui.ts
│   └── tsconfig.json
├── .suiperpower/
├── pnpm-workspace.yaml
└── README.md
```

Use when there is a backend (sponsor server, indexer, off-chain logic). Backend uses the same `@mysten/sui` library.

For sponsor flows, the backend holds the sponsor private key. Treat `server/.env` as security-critical.

## Sponsor add-ons

If `walrus` is enabled:

- Add `WALRUS_PUBLISHER` and `WALRUS_AGGREGATOR` to `web/.env.local`.
- Add a `web/lib/walrus.ts` helper.

If `deepbook` is enabled:

- Install `@mysten/deepbook-v3`.
- Add a `web/lib/deepbook.ts` helper.

If `scallop` is enabled:

- Install `@scallop-io/sui-scallop-sdk`.
- Add a `web/lib/scallop.ts` helper.

If `zkLogin` is enabled:

- Install `jose` for JWT verification.
- Add `web/lib/zklogin.ts` and a `web/app/auth/callback/page.tsx`.

## Workspace setup

Multi-package layouts use `pnpm-workspace.yaml`:

```yaml
packages:
  - "web"
  - "server"
```

A root `package.json` with shared scripts:

```json
{
  "name": "my-project",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r --parallel dev",
    "move:build": "cd move/my_pkg && sui move build",
    "move:test": "cd move/my_pkg && sui move test"
  }
}
```

## .gitignore essentials

```
node_modules/
dist/
.next/
.suiperpower/.update-check
.suiperpower/.telemetry-prompted
.env*.local
build/
*.log
```

`.suiperpower/build-context.md` is committed; it is the project's memory.

`.suiperpower/.update-check` and `.suiperpower/.telemetry-prompted` are local state, ignore.

Last updated: 2026-05-11.
