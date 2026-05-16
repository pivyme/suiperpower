# 08, Env and Secrets

Every env var, where it lives, who reads it, what happens when it is missing. Anything secret stays in `.env` (gitignored). Anything client-visible is also visible in the deployed JS bundle, so do not put secrets behind `VITE_*`.

## Files

| File | Path | Committed? | Purpose |
| --- | --- | --- | --- |
| `.env.example` | `packages/dusdc-faucet/.env.example` | yes | Single source of truth for required keys, shape only, no real values |
| `.env.local-stub` | `packages/dusdc-faucet/.env.local-stub` | yes | Working defaults for local dev (test Turnstile, placeholder Sui ids) |
| `.env` | `packages/dusdc-faucet/.env` | NO | Real local values, auto-copied from stub by the orchestrator |
| `backend/.env` | `packages/dusdc-faucet/backend/.env` | NO | Backend-only vars, sourced from monorepo `.env` or set directly |
| `web/.env` | `packages/dusdc-faucet/web/.env` | NO | Frontend-only vars, sourced from monorepo `.env` |

The packaged backend and web each read their own `.env`. The monorepo-level `.env.example` and `.env.local-stub` document the full surface in one place so a new contributor sees everything at once.

## Backend variables

| Var | Required | Default | Read by | Notes |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | yes | (none) | `prisma.ts` | Postgres connection string |
| `JWT_SECRET` | yes | (none) | starter middleware | Inherited from starter, used for the verify nonce |
| `JWT_EXPIRES_IN` | no | `7d` | starter | Not load-bearing for the faucet |
| `APP_PORT` | no | `4127` | `index.ts` | |
| `NODE_ENV` | no | `development` | many | |
| `ALLOWED_ORIGIN` | prod | (none) | CORS | Required in prod; in dev defaults to `*` |
| `SUI_RPC_URL` | yes | `https://fullnode.testnet.sui.io` | `lib/sui/client.ts` | Testnet RPC |
| `FAUCET_PACKAGE_ID` | yes (post-deploy) | (none) | `lib/sui/faucet-read.ts` | Move package id after publish |
| `FAUCET_OBJECT_ID` | yes (post-deploy) | (none) | same | Shared Faucet object id |
| `DUSDC_COIN_TYPE` | yes (post-deploy) | (none) | same | Full Sui coin type |
| `TURNSTILE_SECRET` | dev: optional, prod: yes | (none) | `lib/turnstile.ts` | If unset in dev, `/verify` auto-approves and logs warning |
| `PER_IP_DAILY_SUI_CAP_MIST` | no | `5000000000` | rate-limit | 5 SUI in MIST |
| `PER_FP_DAILY_SUI_CAP_MIST` | no | `5000000000` | rate-limit | 5 SUI in MIST |
| `E2E_SIGNER_PRIVATE_KEY` | optional | (none) | `scripts/e2e-rehearsal.ts` | NEVER in prod env, only for local rehearsal |

## Frontend variables

Frontend env is validated by zod in `web/src/env.ts`. Missing variables crash the page at boot with a clear error message rather than silently degrading.

| Var | Required | Default | Read by | Notes |
| --- | --- | --- | --- | --- |
| `VITE_API_URL` | yes | `http://localhost:4127` | `lib/api.ts` | Backend base URL |
| `VITE_SUI_NETWORK` | yes | `testnet` | provider | Literal "testnet" |
| `VITE_SUI_RPC_URL` | yes | `https://fullnode.testnet.sui.io` | provider | Override for redundant RPC if needed |
| `VITE_FAUCET_PACKAGE_ID` | yes (post-deploy) | (none) | PTB builders | |
| `VITE_FAUCET_OBJECT_ID` | yes (post-deploy) | (none) | PTB builders | |
| `VITE_DUSDC_COIN_TYPE` | yes (post-deploy) | (none) | PTB builders + display | |
| `VITE_TURNSTILE_SITE_KEY` | yes | `1x00000000000000000000AA` (always-pass test key) | `TurnstileWidget` | Cloudflare test site key documented at https://developers.cloudflare.com/turnstile/troubleshooting/testing/ |

## `.env.example` content

The example file is committed; users copy it to `.env`. It contains only shapes and comments, never real values.

```
# ───────────────────────────────────────────────────────────
# DUSDC Faucet, monorepo-level env example
# Copy to .env or split into backend/.env and web/.env.
# ───────────────────────────────────────────────────────────

# ===== Backend =====
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
JWT_SECRET=replace-with-a-long-random-string
APP_PORT=4127
NODE_ENV=development
ALLOWED_ORIGIN=https://your-deployed-frontend.example

# Sui
SUI_RPC_URL=https://fullnode.testnet.sui.io
FAUCET_PACKAGE_ID=
FAUCET_OBJECT_ID=
DUSDC_COIN_TYPE=0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC

# Cloudflare Turnstile
# Get keys at https://dash.cloudflare.com/?to=/:account/turnstile
# For local dev, use the always-pass test keys instead.
TURNSTILE_SECRET=
PER_IP_DAILY_SUI_CAP_MIST=5000000000
PER_FP_DAILY_SUI_CAP_MIST=5000000000

# Rehearsal only, NEVER set in prod
E2E_SIGNER_PRIVATE_KEY=

# ===== Frontend (VITE_*) =====
VITE_API_URL=http://localhost:4127
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io
VITE_FAUCET_PACKAGE_ID=
VITE_FAUCET_OBJECT_ID=
VITE_DUSDC_COIN_TYPE=0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC
VITE_TURNSTILE_SITE_KEY=
```

## `.env.local-stub` content

Auto-copied to `.env` by the orchestrator if `.env` is missing. Lets the loop and a fresh contributor run `bun dev` without setting anything up first. Postgres still has to exist locally; the stub does not bypass it.

```
# Local dev stub. Copied to .env automatically if .env is missing.
# Real values only go in .env (gitignored), never here.

# Backend
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dusdc_faucet_dev
JWT_SECRET=dev-only-not-secret-replace-in-prod
APP_PORT=4127
NODE_ENV=development
ALLOWED_ORIGIN=

# Sui, testnet RPC and placeholder ids that crash early if the contract isn't published yet.
SUI_RPC_URL=https://fullnode.testnet.sui.io
FAUCET_PACKAGE_ID=0xPENDING_PUBLISH
FAUCET_OBJECT_ID=0xPENDING_CREATE
DUSDC_COIN_TYPE=0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC

# Cloudflare Turnstile test keys, always-pass. Documented at
# https://developers.cloudflare.com/turnstile/troubleshooting/testing/
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
PER_IP_DAILY_SUI_CAP_MIST=5000000000
PER_FP_DAILY_SUI_CAP_MIST=5000000000

# Frontend
VITE_API_URL=http://localhost:4127
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io
VITE_FAUCET_PACKAGE_ID=0xPENDING_PUBLISH
VITE_FAUCET_OBJECT_ID=0xPENDING_CREATE
VITE_DUSDC_COIN_TYPE=0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

The `0xPENDING_*` placeholders are intentional: PTBs will fail loudly until the publisher updates them, so a contributor never accidentally believes a stub-mode build is functional.

## Secret handling rules

- Secrets live in `.env`, gitignored.
- Production secrets (live `TURNSTILE_SECRET`, `JWT_SECRET`, `DATABASE_URL`) are set in the deploy platform UI (Vercel for frontend, Render/Railway/Fly for backend). They never live in the repo.
- The deploy script (`scripts/deploy.ts`) reads `.env`, never `.env.local-stub`.
- `E2E_SIGNER_PRIVATE_KEY` is local-only; rotated after every rehearsal if leaked.
- The AdminCap private key (the Sui CLI keystore) lives in `~/.sui/sui_config/`; back it up before live deploy, restore from backup is the recovery plan if the keystore is lost.

## Validation

### Backend startup

`backend/index.ts` adds a `validateConfig()` call before `fastify.listen`:

```ts
function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  for (const k of required) {
    if (!process.env[k]) {
      console.error(`[fatal] missing env: ${k}`);
      process.exit(1);
    }
  }
  if (IS_PROD) {
    const prodRequired = ['FAUCET_PACKAGE_ID', 'FAUCET_OBJECT_ID', 'DUSDC_COIN_TYPE', 'TURNSTILE_SECRET', 'ALLOWED_ORIGIN'];
    for (const k of prodRequired) {
      if (!process.env[k]) {
        console.error(`[fatal] missing prod env: ${k}`);
        process.exit(1);
      }
    }
  } else {
    if (!process.env.FAUCET_PACKAGE_ID) console.warn('[warn] FAUCET_PACKAGE_ID unset, /stats will fail');
    if (!process.env.TURNSTILE_SECRET) console.warn('[warn] TURNSTILE_SECRET unset, /verify will auto-approve (dev)');
  }
}
```

### Frontend startup

`web/src/env.ts` (zod) throws on the first missing var. The error message lists exactly which key is missing.

## Adding a new env var

1. Add to `.env.example`.
2. Add to `.env.local-stub` with a runnable default.
3. Add to the appropriate validation file (`main-config.ts` or `env.ts`).
4. Document it in this file with a row in the table above.
5. If it is a secret, ensure it is NOT prefixed `VITE_` and that the deploy platform UI knows about it.
