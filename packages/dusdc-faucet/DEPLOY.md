# Deploy

Two surfaces, two targets. Web ships to Vercel, backend ships to Dokploy via Docker.

## Web, Vercel

The frontend lives in `web/` and uses TanStack Start with the Nitro Vercel preset (auto-detected via the `VERCEL=1` env var Vercel sets at build time).

### Project settings
- **Root Directory**: `web` (or `packages/dusdc-faucet/web` if deploying from the monorepo root).
- **Framework Preset**: Other.
- **Build Command**: `bun run build` (already pinned in `web/vercel.json`).
- **Install Command**: `bun install` (already pinned in `web/vercel.json`).
- **Output Directory**: leave blank. Nitro writes to `.vercel/output/` (Build Output API), which Vercel auto-detects.
- **Node version**: 20+.

### Required env vars (all `VITE_` prefixed, baked into the client bundle)
| Var | Notes |
| --- | --- |
| `VITE_API_URL` | Public URL of the deployed backend, no trailing slash |
| `VITE_SUI_NETWORK` | `testnet` |
| `VITE_SUI_RPC_URL` | `https://fullnode.testnet.sui.io` or your own RPC |
| `VITE_FAUCET_PACKAGE_ID` | From `scripts/deploy.ts` output |
| `VITE_FAUCET_OBJECT_ID` | From `scripts/deploy.ts` output |
| `VITE_DUSDC_COIN_TYPE` | Full `<pkg>::dusdc::DUSDC` type tag |
| `VITE_DEEPBOOK_DUSDC_DONATION_ADDRESS` | Optional, only set when DeepBook hands over a real address |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (use `1x00000000000000000000AA` for preview) |

Set these in Vercel for both Production and Preview. Re-trigger a build whenever they change, since Vite inlines them at build time.

## Backend, Dokploy

The backend lives in `backend/` and ships as a single image built from `backend/Dockerfile`. Dokploy can either build the Dockerfile directly or use `docker-compose.yml` for a Compose-mode deploy.

### Build context
- **Path**: `backend/` (or `packages/dusdc-faucet/backend` from monorepo root).
- **Dockerfile**: `Dockerfile` (multi-stage: deps -> build -> runtime, runs as non-root `bun` user, supervised by `tini`).
- **Exposed port**: `3700`.
- **Healthcheck**: `GET /` returns 200, baked into the image and Compose file.

### Required env vars (set in Dokploy, never commit)
| Var | Notes |
| --- | --- |
| `DATABASE_URL` | External Postgres (Neon / Supabase / Dokploy-managed). The image does not bundle Postgres |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRES_IN` | Optional, default `7d` |
| `ALLOWED_ORIGIN` | Exact origin of the deployed frontend, for CORS lockdown in prod |
| `NODE_ENV` | `production` |
| `APP_PORT` | Optional, default `3700` |
| `SUI_RPC_URL` | Default `https://fullnode.testnet.sui.io` |
| `FAUCET_PACKAGE_ID` | Required in prod |
| `FAUCET_OBJECT_ID` | Required in prod |
| `DUSDC_COIN_TYPE` | Required in prod |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key, required in prod |
| `PER_IP_DAILY_SUI_CAP_MIST` | Optional rate-limit ceiling |
| `PER_FP_DAILY_SUI_CAP_MIST` | Optional rate-limit ceiling |

`E2E_SIGNER_PRIVATE_KEY` is a rehearsal-only key. Never set it in the Dokploy environment.

### First-time database setup

Schema is not auto-applied. After the container is up and `DATABASE_URL` reaches a reachable Postgres, run from your laptop with the same `DATABASE_URL` exported:

```bash
cd backend
bun install
bun run db:push
```

Re-run the same command after every schema change. The project rule in `CLAUDE.md` forbids destructive Prisma commands inside the container, so the entrypoint deliberately skips migrations.

### Local sanity check before pushing to Dokploy

```bash
cd backend
docker build -t dusdc-faucet-backend:local .
docker run --rm -p 3700:3700 \
  -e DATABASE_URL="postgres://..." \
  -e JWT_SECRET=local-test-secret \
  dusdc-faucet-backend:local
curl http://localhost:3700/
```

Or via Compose (loads vars from a local `.env` next to `docker-compose.yml`):

```bash
cd backend
docker compose up --build
```

## Wiring the two together

After both are live:
1. Set `VITE_API_URL` on Vercel to the Dokploy public URL of the backend.
2. Set `ALLOWED_ORIGIN` on Dokploy to the Vercel public URL of the frontend.
3. Redeploy frontend so the new `VITE_API_URL` is baked in.
4. Hit the deployed site, claim once, confirm `/faucet/stats` and `/event/claim` respond from the right origin.
