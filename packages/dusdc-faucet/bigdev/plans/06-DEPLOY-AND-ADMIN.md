# 06, Deploy and Admin

How we get the Move package on testnet, how the AdminCap is held and eventually transferred, and the operational knobs available after deploy.

## Prerequisites

Kelvin's machine has:
- `sui` CLI installed (`brew install sui` or per docs.sui.io)
- An active Sui CLI wallet on testnet, funded with at least 1 SUI for gas
- Confirm with `sui client active-env` (should be `testnet`) and `sui client gas`

If `sui client active-env` is not `testnet`:

```bash
sui client switch --env testnet || sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
```

Funded via the official testnet faucet:

```bash
sui client faucet
```

## Publish flow

### 1. Publish the test DUSDC clone (rehearsal only)

```bash
cd packages/dusdc-faucet/contracts/test-dusdc
sui move build
sui client publish --gas-budget 200000000
```

Capture from the output JSON:
- Package id (let's call it `$TEST_DUSDC_PKG`)
- TreasuryCap object id (let's call it `$TEST_TREASURY_CAP`)

The publisher (Kelvin) now holds `TreasuryCap<test_dusdc::TEST_DUSDC>`. Mint a stash:

```bash
sui client call \
  --package 0x2 --module coin --function mint_and_transfer \
  --type-args ${TEST_DUSDC_PKG}::test_dusdc::TEST_DUSDC \
  --args ${TEST_TREASURY_CAP} 100000000000 ${PUBLISHER_ADDR} \
  --gas-budget 100000000
```

That mints `100_000_000_000` base units = `100,000` DUSDC (test).

### 2. Publish the faucet package

```bash
cd packages/dusdc-faucet/contracts/faucet
sui move build
sui client publish --gas-budget 300000000
```

Capture:
- Package id (`$FAUCET_PKG`)

No Faucet object exists yet, only the package.

### 3. Create the shared Faucet object

Two paths: rehearsal (test DUSDC) and live (real DUSDC).

**Rehearsal**:

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function create_faucet \
  --type-args ${TEST_DUSDC_PKG}::test_dusdc::TEST_DUSDC \
  --gas-budget 100000000
```

**Live (after rehearsal passes)**:

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function create_faucet \
  --type-args 0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC \
  --gas-budget 100000000
```

Capture from output:
- Shared Faucet object id (`$FAUCET_OBJ`)
- AdminCap object id (`$ADMIN_CAP`)

### 4. Refill the vault

**Rehearsal**:

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function refill \
  --type-args ${TEST_DUSDC_PKG}::test_dusdc::TEST_DUSDC \
  --args ${FAUCET_OBJ} ${TEST_DUSDC_COIN_OBJ} \
  --gas-budget 100000000
```

Replace `${TEST_DUSDC_COIN_OBJ}` with the coin object id from `sui client objects --filter "Coin"` after the mint.

**Live**: wait for DeepBook to deposit real DUSDC. Until then, the vault reads zero and the frontend shows the "vault empty" banner.

### 5. Wire env

After steps 2 and 3 succeed, write to `packages/dusdc-faucet/.env`:

```bash
FAUCET_PACKAGE_ID=${FAUCET_PKG}
FAUCET_OBJECT_ID=${FAUCET_OBJ}
DUSDC_COIN_TYPE=0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC
```

And to `packages/dusdc-faucet/web/.env`:

```bash
VITE_FAUCET_PACKAGE_ID=${FAUCET_PKG}
VITE_FAUCET_OBJECT_ID=${FAUCET_OBJ}
VITE_DUSDC_COIN_TYPE=0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC
```

Restart backend and web.

## Helper script

`packages/dusdc-faucet/scripts/deploy.ts`, Bun + `@mysten/sui` SDK, automates steps 1 through 4. Stages:

1. Read `WHICH=test|real` and `PRIVATE_KEY` from env (the deploy uses a temporary signer; final env vars come from CLI args or interactive prompts).
2. Publish faucet package, write `FAUCET_PACKAGE_ID` to `.deploy.json` (gitignored).
3. If `WHICH=test`: publish test-dusdc, mint 100,000 DUSDC to publisher, call `create_faucet<TEST_DUSDC>`, refill with 1,000 DUSDC.
4. If `WHICH=real`: call `create_faucet<REAL_DUSDC>`, leave vault empty.
5. Append the captured IDs to `.deploy.json` and copy into `.env` and `web/.env` after user confirms.

The script never overwrites `.env` silently; it prints the lines and prompts before writing.

## AdminCap operations

The AdminCap is an owned object in Kelvin's wallet. To call any admin function, the sender must own it and pass it as the first arg.

### Tune the rate

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function set_rate \
  --type-args ${DUSDC_TYPE} \
  --args ${ADMIN_CAP} ${FAUCET_OBJ} 100 1 \
  --gas-budget 50000000
```

### Adjust per-tx cap

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function set_per_tx_cap \
  --type-args ${DUSDC_TYPE} \
  --args ${ADMIN_CAP} ${FAUCET_OBJ} 2000000000 \
  --gas-budget 50000000
```

(`2_000_000_000` MIST = 2 SUI per tx)

### Pause / unpause

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function set_paused \
  --type-args ${DUSDC_TYPE} \
  --args ${ADMIN_CAP} ${FAUCET_OBJ} true \
  --gas-budget 50000000
```

### Withdraw accumulated SUI

The vault accumulates SUI from claims. When it grows large, the admin can sweep it back out (and presumably back to themselves to fund future return-path liquidity).

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function withdraw_sui \
  --type-args ${DUSDC_TYPE} \
  --args ${ADMIN_CAP} ${FAUCET_OBJ} 1000000000 \
  --gas-budget 50000000
```

### Transfer AdminCap to DeepBook

The kicker. When DeepBook is happy with the faucet, transfer ownership:

```bash
sui client call \
  --package ${FAUCET_PKG} --module faucet --function transfer_admin \
  --type-args ${DUSDC_TYPE} \
  --args ${ADMIN_CAP} ${DEEPBOOK_ADDR} \
  --gas-budget 50000000
```

After this, only the DeepBook wallet can tune the faucet. Kelvin retains nothing (the AdminCap was a unique object, now moved).

## Backend deployment

Bun + Fastify can deploy almost anywhere. Suggested targets:

- **Render / Railway / Fly.io**: Dockerfile already present in the starter. Set env vars in the platform UI. Port 4127.
- **Self-hosted VPS**: `bun start` behind `caddy` reverse proxy with auto-TLS.

CORS origin in prod must match the deployed frontend URL.

## Frontend deployment

Vercel:
- Root Directory: `packages/dusdc-faucet/web`
- Framework preset: Vite
- Build command: `bun run build`
- Output: `.output`
- Env vars: every `VITE_*` from the schema in `03-FRONTEND.md`
- Set `VITE_API_URL` to the deployed backend URL

DNS, if a custom domain is used: a CNAME to Vercel. Domain choice is out of scope for v1; Kelvin can pick `dusdc-faucet.vercel.app` until then.

## Postgres provisioning

The Prisma schema runs anywhere Postgres ≥ 13 does. Suggested testnet-grade hosts:
- Neon (free tier, branchable)
- Supabase (free tier)
- Railway Postgres (one-click)

After provisioning, set `DATABASE_URL` in the backend env, then run `bun run db:push` from `packages/dusdc-faucet/backend/` to apply the schema. Never `db:push --force-reset`, never `migrate reset`.

## Rollback strategy

The contract has no upgrade authority by design. If we ship a buggy faucet:
1. Call `set_paused(true)` via AdminCap. Claims and returns stop.
2. Publish a fixed package as a new deployment.
3. `create_faucet` again with the new package.
4. Move the DUSDC by calling `withdraw_sui` then manually transferring DUSDC out via a new admin entry, OR by calling refill on the new faucet from the same wallet after transferring DUSDC.
5. Update env, restart backend and web.

To keep that path safe, plan an `admin_withdraw_quote` admin entry in a future version. v1 ships without it because (a) the rehearsal coin is throwaway, (b) the real DUSDC migration only happens once at AdminCap handover.

If v1 ships and we discover we need it before handover, we publish v0.1.1 with the new entry. Cheap, low-risk.

## Security notes

- The AdminCap is a hot target. Keep it in a hardware wallet for the live deployment if possible. The starter Sui CLI keystore is fine for rehearsal but not for the real DUSDC vault.
- Anyone can refill, by design. This is not a vulnerability, it is the product. Do not gate refill behind a cap or whitelist.
- Anyone can claim if backend is down. The on-chain per-wallet daily cap is the actual floor. Backend Turnstile + IP/fp limits are nice-to-have. Do not pretend they are the security model.
- Publishing the package gives the publisher's address NO special powers beyond having the AdminCap. There is no UpgradeCap retained. If we lose the AdminCap, the faucet runs forever with whatever settings were last applied.
