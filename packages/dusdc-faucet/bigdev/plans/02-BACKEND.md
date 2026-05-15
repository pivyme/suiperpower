# 02, Backend

Bun + Fastify + Prisma + Postgres. The backend's only job is to gate the frontend's claim button, surface vault stats, and rate-limit off-chain. It does not sign transactions, hold keys, or touch user funds.

## Routes

Mounted at `/faucet` via `app.register(faucetRoutes, { prefix: '/faucet' })` in `index.ts`.

### `POST /faucet/verify`

Pre-claim gate. Frontend calls this right before showing the Claim button (or right after the user types an amount, whichever you prefer).

**Request body**:
```ts
{
  walletAddress: string;   // sui hex address, validated by zod
  turnstileToken: string;  // from <TurnstileWidget />
  fingerprint: string;     // browser hash, 16-64 chars
  requestedSuiMist: number; // amount the user wants to claim, in MIST
}
```

**Response 200**:
```ts
{
  success: true,
  data: {
    allowed: true,
    remainingDailyMist: number,
    nonce: string,            // JWT, 60s expiry, claims: { wallet, ip, fp, requested }
  }
}
```

**Response 200 with `allowed: false`**:
```ts
{
  success: true,
  data: {
    allowed: false,
    reason: "TURNSTILE_FAILED" | "IP_LIMIT" | "FP_LIMIT" | "WALLET_LIMIT" | "PAUSED" | "AMOUNT_OVER_CAP",
    remainingDailyMist: number,
  }
}
```

**Logic**:
1. Validate body with zod. Reject malformed.
2. Verify Turnstile token via Cloudflare. If `TURNSTILE_SECRET` is unset, log a warning and treat as pass (dev path).
3. Look up `RateLimit` rows for `(ip, today)`, `(fp, today)`, `(wallet, today)`. Compute remaining quota for each scope.
4. If any quota is < `requestedSuiMist`, return `allowed: false` with the binding scope.
5. Increment each scope's `consumedMist` by `requestedSuiMist` and `claimCount` by 1 in a single Postgres transaction. Use upsert pattern.
6. Sign and return a short-lived JWT nonce. Frontend stores nothing, just uses it to flip the button to enabled.

The nonce is **not validated on-chain**. It only exists so the frontend has a single source of truth for "did the user just clear the gate".

### `GET /faucet/stats`

Public. No auth, no rate limit. Used by the homepage's VaultStats card.

**Response 200**:
```ts
{
  success: true,
  data: {
    dusdcAvailable: string,   // base units, returned as string to preserve precision
    dusdcAvailableHuman: number, // dusdcAvailable / 10^6, for display
    suiAccumulatedMist: string,
    rateNumerator: number,
    rateDenominator: number,
    perTxSuiCapMist: string,
    perWalletDailySuiCapMist: string,
    paused: boolean,
    returnEnabled: boolean,
    servedTodayDusdc: string,
    servedTotalDusdc: string,
    claimsTodayCount: number,
    capturedAt: string,       // ISO timestamp
    isFresh: boolean,         // true if snapshot is < 30s old
  }
}
```

**Logic**: read the latest `VaultStatsSnapshot` row. If it is older than 60 seconds or missing, refetch the on-chain object inline before responding. Otherwise serve the cache.

### `GET /faucet/tx-hint/:addr`

Public. Tells the frontend how much SUI a given wallet can still claim today, before the user signs anything.

**Response 200**:
```ts
{
  success: true,
  data: {
    walletAddress: string,
    remainingMist: string,    // string for BigInt safety
    remainingHuman: number,   // SUI
    perWalletDailyCapMist: string,
    consumedTodayMist: string,
  }
}
```

**Logic**:
1. Validate addr with a Sui-address regex (`^0x[0-9a-fA-F]{1,64}$`).
2. Read on-chain Faucet object, get current `per_wallet_daily_sui_cap_mist`.
3. Read backend `RateLimit` row for `(scope='wallet', identifier=addr, today)`.
4. `remaining = max(0, cap - consumed)`. The chain enforces the on-chain table; the backend mirrors it as a hint only, divergence is tolerated.

## Rate limit storage

Postgres via Prisma. Schema lives in `00-ARCHITECTURE.md`.

The unique constraint `(scope, identifier, utcDay)` means a single concurrent claim that races itself will hit the unique violation and the upsert will retry the update path. No double counting.

### Daily window

UTC day: `Math.floor(Date.now() / 86_400_000)`. Matches the on-chain reset boundary. Stored as `Int`, not date, because integer comparison is cheaper than date math and the chain side does the same.

### Cleanup

Add a worker `src/workers/rateLimitCleanup.ts` that deletes `RateLimit` rows where `utcDay < currentDay - 14`. Runs once an hour. Keeps the table small forever.

## Turnstile verification

`src/lib/turnstile.ts`:

```ts
export interface TurnstileResult {
  success: boolean;
  errorCode?: 'TIMEOUT' | 'INVALID_TOKEN' | 'NO_SECRET' | 'NETWORK';
}

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    console.warn('[Turnstile] TURNSTILE_SECRET unset, auto-approving (dev mode)');
    return { success: true, errorCode: 'NO_SECRET' };
  }

  const params = new URLSearchParams();
  params.set('secret', secret);
  params.set('response', token);
  if (remoteIp) params.set('remoteip', remoteIp);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json() as { success: boolean };
    return { success: json.success, errorCode: json.success ? undefined : 'INVALID_TOKEN' };
  } catch {
    return { success: false, errorCode: 'NETWORK' };
  }
}
```

The `NO_SECRET` fall-through is the dev shortcut. Production must set `TURNSTILE_SECRET` or `/verify` will silently let everyone through.

## Sui RPC client

`src/lib/sui/client.ts`:

```ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SUI_RPC_URL } from '../../config/main-config.ts';

export const sui = new SuiClient({ url: SUI_RPC_URL || getFullnodeUrl('testnet') });
```

`src/lib/sui/faucet-read.ts`:

```ts
import { sui } from './client.ts';
import { FAUCET_OBJECT_ID } from '../../config/main-config.ts';

export interface FaucetState {
  dusdcAvailable: bigint;
  suiAccumulatedMist: bigint;
  rateNumerator: number;
  rateDenominator: number;
  perTxSuiCapMist: bigint;
  perWalletDailySuiCapMist: bigint;
  paused: boolean;
  returnEnabled: boolean;
  totalServedQuote: bigint;
  totalClaims: bigint;
}

export async function readFaucetState(): Promise<FaucetState> {
  const obj = await sui.getObject({
    id: FAUCET_OBJECT_ID,
    options: { showContent: true, showType: true },
  });
  if (obj.data?.content?.dataType !== 'moveObject') {
    throw new Error('FAUCET_OBJECT_NOT_FOUND');
  }
  const f = obj.data.content.fields as Record<string, unknown>;
  return {
    dusdcAvailable: BigInt((f.quote_balance as { fields: { value: string } }).fields.value),
    suiAccumulatedMist: BigInt((f.sui_balance as { fields: { value: string } }).fields.value),
    rateNumerator: Number(f.rate_numerator),
    rateDenominator: Number(f.rate_denominator),
    perTxSuiCapMist: BigInt(f.per_tx_sui_cap_mist as string),
    perWalletDailySuiCapMist: BigInt(f.per_wallet_daily_sui_cap_mist as string),
    paused: f.paused === true,
    returnEnabled: f.return_enabled === true,
    totalServedQuote: BigInt(f.total_served_quote as string),
    totalClaims: BigInt(f.total_claims as string),
  };
}
```

Field-name dependencies on the Move struct. If a field is renamed, the read here breaks. That is fine, it is the only place the wire format crosses.

## Stats cache worker

`src/workers/statsCacheWorker.ts`:

- Cron: `*/15 * * * * *` (every 15 seconds via `node-cron`'s 6-field syntax). Use the starter's `isRunning` flag.
- On each tick: read on-chain state, compute "served today" by summing `ClaimEvent` rows for the UTC day, write a `VaultStatsSnapshot` row.
- Daily counters reset implicitly because they query `ClaimEvent.createdAt >= startOfUtcDay`.

`/stats` reads the latest snapshot. If `capturedAt` is < 60s old, return it raw with `isFresh: true`. Otherwise refetch inline and write a fresh row.

## Claim event ingestion

We are not subscribing to chain events in v1, which is fine because we record the `ClaimEvent` from the frontend after the user's tx confirms. Frontend posts to a new endpoint:

### `POST /faucet/event/claim`

**Body**:
```ts
{
  txDigest: string;
  walletAddress: string;
  suiMist: number;
  dusdcBaseUnit: number;
  fingerprint?: string;
}
```

**Logic**:
1. Validate.
2. Insert into `ClaimEvent`. Conflict on `txDigest` is allowed and ignored (idempotent).
3. Return `{ recorded: true }`.

Why not subscribe to events with an indexer? Because we control the frontend and it already knows the digest, no need for extra infra in v1. If the user bypasses the frontend, we miss the event but the chain still records it; `/stats` reads the chain so the user-visible numbers stay correct (just the "served today" might drift).

## Configuration centralization

Extend `src/config/main-config.ts`:

```ts
export const SUI_RPC_URL = process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io';
export const FAUCET_PACKAGE_ID = process.env.FAUCET_PACKAGE_ID || '';
export const FAUCET_OBJECT_ID = process.env.FAUCET_OBJECT_ID || '';
export const DUSDC_COIN_TYPE = process.env.DUSDC_COIN_TYPE || '';
export const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || '';
export const PER_IP_DAILY_SUI_CAP_MIST = BigInt(process.env.PER_IP_DAILY_SUI_CAP_MIST || '5000000000');
export const PER_FP_DAILY_SUI_CAP_MIST = BigInt(process.env.PER_FP_DAILY_SUI_CAP_MIST || '5000000000');
```

Add a startup assertion in `index.ts`: if `IS_PROD && (!FAUCET_PACKAGE_ID || !FAUCET_OBJECT_ID || !DUSDC_COIN_TYPE || !TURNSTILE_SECRET)`, log loud and exit with code 1. Dev mode just warns.

## Solana cleanup

The bootstrap left Solana deps in `package.json`. Remove these before we start:

- `@solana/wallet-standard-util`
- `@solana/web3.js`
- `bs58` (only if no other code uses it)
- `ethers` (the brief is Sui only)

Remove `src/lib/evm/` if it exists. Keep `src/lib/prisma.ts` and the error/auth/validation utilities.

## Testing

`backend/test/` (new folder), Vitest, runs via `bun test` once we add `vitest` to devDeps.

- `verify.test.ts`: stubs Turnstile, tests pass/fail paths, IP/wallet/fp quota exhaustion, body validation.
- `stats.test.ts`: stubs `readFaucetState`, asserts response shape and `isFresh` logic.
- `tx-hint.test.ts`: address validation, remaining math.
- `rate-limit.test.ts`: pure function tests for daily reset semantics.

Tests do not hit Postgres directly. Wire `prisma` mocks via `vitest-mock-extended`.

## Operational notes

- The backend can be killed without taking the chain offline. The frontend gracefully degrades to a yellow banner "stats unavailable" and lets the user claim anyway, with the chain enforcing caps.
- Never log the Turnstile secret. Never log full JWT nonces. IP can be logged. Fingerprint can be logged.
- Health endpoint stays at `/` from the starter, untouched.
