# 00, Architecture

## What this is

A self-serve DUSDC faucet for the DeepBook Predict testnet. Builders deposit testnet SUI, get DUSDC at a fixed rate, can swap back at any time. Anyone can refill the vault. The faucet replaces the existing manual Tally form.

Win for builders: no form, tokens in 5 seconds.
Win for DeepBook: zero ops, just refill when low.

## System overview

Three independently deployable parts inside `packages/dusdc-faucet/`:

| Layer | Path | Runtime | Port |
| --- | --- | --- | --- |
| Move package | `contracts/` | Sui Move (testnet) | n/a |
| Backend API | `backend/` | Bun + Fastify + Prisma + Postgres | 3700 |
| Frontend | `web/` | TanStack Start + React 19 + HeroUI v3 | 3200 |

Plus a sibling **test DUSDC** Move package (`contracts/test-dusdc/`) for end-to-end rehearsals before DeepBook funds the real vault.

## Data flow

```
                   ┌───────────────────────────────────┐
                   │      Sui Testnet (full nodes)     │
                   │                                   │
                   │  ┌─────────────┐  ┌────────────┐  │
                   │  │   Faucet    │  │ Real DUSDC │  │
                   │  │  (shared)   │  │  (coin pkg)│  │
                   │  └──────▲──────┘  └─────▲──────┘  │
                   └─────────┼───────────────┼─────────┘
                             │ PTBs (claim,  │
                             │ return, refill)
              ┌──────────────┴───────────────┴────────┐
              │                                       │
   ┌──────────▼──────────┐                ┌───────────▼──────────┐
   │   Frontend (web)    │  /verify       │   Backend (backend)  │
   │  - dapp-kit wallet  │ ─────────────► │  - Turnstile verify  │
   │  - PTB build + sign │                │  - IP/wallet/fp KV   │
   │  - vault stats poll │ ◄───────────── │  - /stats /tx-hint   │
   └─────────────────────┘   nonce        └──────────────────────┘
                                                      │
                                                      ▼
                                              ┌───────────────┐
                                              │   Postgres    │
                                              │  rate_limits  │
                                              │  vault_stats  │
                                              └───────────────┘
```

Key boundary: **the chain is the source of truth**. Backend only decides whether the frontend shows the Claim button. If the backend is offline, anyone with a wallet can still call the contract directly, the on-chain per-wallet daily cap is the real floor.

## Module breakdown

### `contracts/faucet/sources/faucet.move`
The single shared `Faucet` object. Holds SUI and DUSDC balances, per-tx and per-wallet caps, daily usage table. Entry functions for claim, return, refill, and admin tuning. AdminCap is a separate object; whoever holds it controls rate, caps, and pause state.

### `contracts/test-dusdc/sources/test_dusdc.move`
Throwaway coin used during rehearsal. Mints to the deployer wallet. Same 6 decimals as real DUSDC. Discarded once the real type is wired.

### `backend/src/lib/sui/`
Sui RPC client (read-only). Fetches the Faucet object state for `/stats`, derives "DUSDC available" and "served today". No private keys, no signing.

### `backend/src/lib/turnstile.ts`
Wraps Cloudflare's `siteverify` endpoint. Returns boolean + error code.

### `backend/src/lib/rate-limit.ts`
Postgres-backed counters keyed by `(ip)`, `(fingerprint)`, `(wallet)`. Daily window = UTC day. Increment-or-create pattern, returns remaining quota.

### `backend/src/routes/faucetRoutes.ts`
Fastify plugin mounted at `/faucet`. Three routes: `POST /verify`, `GET /stats`, `GET /tx-hint/:addr`.

### `backend/src/workers/statsCacheWorker.ts`
Polls the chain every 15 seconds, snapshots vault state to `vault_stats_snapshot` for fast `/stats` reads. Not strictly required, but a cache row beats an RPC hop on the homepage.

### `web/src/routes/index.tsx`
The single page. Header, vault stats card, three tabs (Get DUSDC, Return DUSDC, Refill), credit footer.

### `web/src/lib/sui/`
- `client.ts`: `SuiClient` configured for testnet
- `ptb-claim.ts`: builds the claim transaction
- `ptb-return.ts`: builds the return transaction
- `ptb-refill.ts`: builds the refill transaction
- `format.ts`: SUI ↔ MIST and DUSDC ↔ base-unit conversion
- `faucet-read.ts`: typed wrapper around `sui_getObject` for the Faucet state

### `web/src/lib/api.ts`
Tiny fetch wrapper for the backend (`/faucet/verify`, `/faucet/stats`, `/faucet/tx-hint`).

### `web/src/components/`
- `VaultStats.tsx`, top card with three numbers
- `ClaimTab.tsx`, ReturnTab.tsx, RefillTab.tsx, the three forms
- `WalletButton.tsx`, dapp-kit wallet connect button (themed)
- `TurnstileWidget.tsx`, Cloudflare widget with error handling
- `Credit.tsx`, "made by Kelvin Adithya (klvn.dev)" footer

## Database schema (Postgres via Prisma)

```prisma
model RateLimit {
  id            String   @id @default(cuid())
  scope         String   // "ip" | "fingerprint" | "wallet"
  identifier    String   // ip address, fingerprint hash, or sui address
  utcDay        Int      // floor(timestamp_ms / 86_400_000)
  consumedMist  BigInt   @default(0) // running total of SUI claimed today
  claimCount    Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([scope, identifier, utcDay])
  @@index([utcDay])
}

model ClaimEvent {
  id            String   @id @default(cuid())
  txDigest      String   @unique
  walletAddress String
  suiMist       BigInt
  dusdcBaseUnit BigInt
  ip            String?
  fingerprint   String?
  createdAt     DateTime @default(now())

  @@index([walletAddress])
  @@index([createdAt])
}

model VaultStatsSnapshot {
  id              String   @id @default(cuid())
  dusdcAvailable  BigInt   // base units in the vault
  suiAccumulated  BigInt   // MIST sitting in the vault from claims
  servedTodayDusdc BigInt
  servedTotalDusdc BigInt
  claimsTodayCount Int
  capturedAt      DateTime @default(now())

  @@index([capturedAt])
}
```

Keep `ErrorLog` and `User` from the starter, untouched. `User` is not used by this app but the starter wires it.

## Configuration

### Backend env (`packages/dusdc-faucet/backend/.env`)
| Var | Required | Default | Meaning |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | n/a | Postgres connection string |
| `JWT_SECRET` | yes | n/a | Inherited from starter, unused by faucet but starter loads it |
| `APP_PORT` | no | 3700 | Backend port |
| `ALLOWED_ORIGIN` | prod | n/a | CORS origin for the deployed web |
| `NODE_ENV` | no | development | |
| `SUI_RPC_URL` | yes | https://fullnode.testnet.sui.io | Sui testnet RPC |
| `FAUCET_PACKAGE_ID` | yes | n/a | Move package id after publish |
| `FAUCET_OBJECT_ID` | yes | n/a | Shared Faucet object id after init |
| `DUSDC_COIN_TYPE` | yes | n/a | Full Sui coin type (e.g. `0xe950...::dusdc::DUSDC`) |
| `TURNSTILE_SECRET` | dev: optional | n/a | Cloudflare Turnstile secret. If unset, `/verify` auto-approves but logs a warning. |
| `PER_IP_DAILY_SUI_CAP_MIST` | no | 5_000_000_000 | 5 SUI |
| `PER_FP_DAILY_SUI_CAP_MIST` | no | 5_000_000_000 | 5 SUI |

### Frontend env (`packages/dusdc-faucet/web/.env`)
Validated via `@t3-oss/env-core` in `web/src/env.ts`. Anything that ships to the browser must start with `VITE_`.

| Var | Required | Default | Meaning |
| --- | --- | --- | --- |
| `VITE_API_URL` | yes | http://localhost:3700 | Backend base URL |
| `VITE_SUI_NETWORK` | yes | testnet | Always `testnet` for v1 |
| `VITE_SUI_RPC_URL` | yes | https://fullnode.testnet.sui.io | RPC for read paths |
| `VITE_FAUCET_PACKAGE_ID` | yes | n/a | Published Move package id |
| `VITE_FAUCET_OBJECT_ID` | yes | n/a | Shared Faucet object id |
| `VITE_DUSDC_COIN_TYPE` | yes | n/a | Full DUSDC type |
| `VITE_TURNSTILE_SITE_KEY` | yes | n/a | Cloudflare site key; in dev use `1x00000000000000000000AA` (always-pass test key) |

Dev-mode shortcut: `.env.local-stub` ships test Turnstile keys and points at a placeholder DUSDC type so the UI can render before the contract is published.

## Dependency list

### Backend (additions to current starter)
- `@mysten/sui` (latest), Sui SDK for chain reads
- `node-cron` (already present), poll worker
- `zod` (add), env + body schemas

### Frontend (additions to current starter)
- `@mysten/sui` (latest)
- `@mysten/dapp-kit` (latest)
- `@tanstack/react-query` (already present)
- `@marsidev/react-turnstile` (latest), Turnstile widget wrapper, MIT
- `@noble/hashes` (latest), for the fingerprint hash

Anything Solana in the bootstrapped backend gets removed. The starter has `@solana/*` deps left over from the template; we strip them.

### Contracts
- Move package, no external deps beyond `Sui::balance`, `Sui::coin`, `Sui::clock`, `Sui::table`.

## Concurrency model

### Backend
Fastify single-process, async/await. Postgres handles all locking. Rate limit increments use an upsert with `ON CONFLICT (scope, identifier, utcDay) DO UPDATE` so concurrent claims do not race. Stats cache worker uses the starter's `isRunning` flag pattern.

### Frontend
Standard React + TanStack Query. No web workers. The Turnstile widget is invisible by default and only renders the challenge if Cloudflare flags the request.

### Contract
Sui Move has no classic reentrancy. Update the daily usage table BEFORE transferring coins, just for tidiness. Use `balance::split` and `transfer::public_transfer` for coin movement.

## Error handling strategy

### Contract
Aborts only. Custom error codes per `01-MOVE-CONTRACT.md`. Never silently fail.

### Backend
Use the starter's `handleError()` helper. All faucet-specific error codes prefixed `FAUCET_`. Examples: `FAUCET_TURNSTILE_FAILED`, `FAUCET_IP_LIMIT_EXCEEDED`, `FAUCET_WALLET_LIMIT_EXCEEDED`. Never leak Turnstile secrets in error messages.

### Frontend
Three error surfaces:
1. Toast (transient): network errors, Turnstile failures, wallet rejected
2. Inline form error: validation, quota exceeded
3. Vault empty banner (top of page): when the chain reports zero DUSDC

## Testing strategy

What we test:
- Move package: unit tests for cap math, daily reset, refund-with-rounding, pause-blocks-claim. Run with `sui move test`.
- Backend: integration tests for `/verify` (turnstile pass/fail), `/stats` shape, `/tx-hint` accuracy. Vitest.
- Frontend PTB builders: pure functions, unit tested. Vitest.
- End-to-end: scripted test runner that publishes the faucet, mints test DUSDC, runs claim/return/refill PTBs, asserts vault state. Bun script in `packages/dusdc-faucet/scripts/e2e-rehearsal.ts`.

What we deliberately skip:
- Frontend visual snapshot tests. Manual demo walkthrough is the gate.
- Backend load tests. Testnet volume is low, Turnstile is the actual throttle.

## Demo network

Sui testnet only. No mainnet, no devnet for production. Devnet may be used briefly in the e2e rehearsal script (cheap, disposable) but the final demo target is testnet.
