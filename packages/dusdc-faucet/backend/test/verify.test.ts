import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the modules the route imports. Order matters: declare mocks before importing the app.
vi.mock('../src/lib/prisma.ts', () => ({
  prismaQuery: {
    errorLog: { create: vi.fn().mockResolvedValue(undefined) },
    rateLimit: { findUnique: vi.fn(), upsert: vi.fn() },
    vaultStatsSnapshot: { findFirst: vi.fn(), create: vi.fn() },
    claimEvent: { create: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/lib/sui/faucet-read.ts', () => ({
  readFaucetState: vi.fn(),
}));

vi.mock('../src/lib/turnstile.ts', () => ({
  verifyTurnstile: vi.fn(),
}));

vi.mock('../src/lib/rate-limit.ts', () => ({
  checkAndConsume: vi.fn(),
  readConsumed: vi.fn(),
  currentUtcDay: () => Math.floor(Date.now() / 86_400_000),
}));

import { buildTestApp } from './helpers/app.ts';
import { readFaucetState } from '../src/lib/sui/faucet-read.ts';
import { verifyTurnstile } from '../src/lib/turnstile.ts';
import { checkAndConsume } from '../src/lib/rate-limit.ts';

const validBody = {
  walletAddress: '0x' + 'a'.repeat(64),
  turnstileToken: 'cf-token-xyz',
  fingerprint: 'fp-' + 'b'.repeat(20),
  requestedSuiMist: 500_000_000, // 0.5 SUI
};

const defaultState = {
  dusdcAvailable: 1_000_000_000_000n,
  suiAccumulatedMist: 0n,
  rateNumerator: 100,
  rateDenominator: 1,
  perTxSuiCapMist: 1_000_000_000n,
  perWalletDailySuiCapMist: 5_000_000_000n,
  paused: false,
  returnEnabled: true,
  totalServedQuote: 0n,
  totalClaims: 0n,
};

beforeEach(() => {
  vi.mocked(readFaucetState).mockResolvedValue(defaultState);
  vi.mocked(verifyTurnstile).mockResolvedValue({ success: true });
  vi.mocked(checkAndConsume).mockResolvedValue({
    allowed: true,
    remaining: 4_500_000_000n,
    consumed: 500_000_000n,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /faucet/verify', () => {
  test('rejects malformed body with 400', async () => {
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/faucet/verify',
      payload: { walletAddress: 'nope' },
    });
    expect(res.statusCode).toBe(400);
    const json = res.json() as { success: boolean; error: { code: string } };
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VERIFY_BAD_BODY');
    await app.close();
  });

  test('Turnstile pass + quota available returns allowed with nonce', async () => {
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/faucet/verify',
      payload: validBody,
    });
    expect(res.statusCode).toBe(200);
    const json = res.json() as {
      success: boolean;
      data: { allowed: boolean; nonce: string; remainingDailyMist: number };
    };
    expect(json.success).toBe(true);
    expect(json.data.allowed).toBe(true);
    expect(typeof json.data.nonce).toBe('string');
    expect(json.data.nonce.split('.').length).toBe(3); // jwt
    expect(json.data.remainingDailyMist).toBeGreaterThan(0);
    await app.close();
  });

  test('Turnstile fail returns allowed=false with TURNSTILE_FAILED', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValueOnce({
      success: false,
      errorCode: 'INVALID_TOKEN',
    });
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/faucet/verify',
      payload: validBody,
    });
    expect(res.statusCode).toBe(200);
    const json = res.json() as {
      data: { allowed: boolean; reason: string };
    };
    expect(json.data.allowed).toBe(false);
    expect(json.data.reason).toBe('TURNSTILE_FAILED');
    await app.close();
  });

  test('wallet cap exhausted returns WALLET_LIMIT', async () => {
    vi.mocked(checkAndConsume).mockImplementation(async ({ scope }) => {
      if (scope === 'wallet') {
        return { allowed: false, remaining: 0n, consumed: 5_000_000_000n };
      }
      return { allowed: true, remaining: 5_000_000_000n, consumed: 0n };
    });
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/faucet/verify',
      payload: validBody,
    });
    const json = res.json() as { data: { allowed: boolean; reason: string } };
    expect(json.data.allowed).toBe(false);
    expect(json.data.reason).toBe('WALLET_LIMIT');
    await app.close();
  });

  test('IP cap exhausted returns IP_LIMIT', async () => {
    vi.mocked(checkAndConsume).mockImplementation(async ({ scope }) => {
      if (scope === 'ip') {
        return { allowed: false, remaining: 0n, consumed: 5_000_000_000n };
      }
      return { allowed: true, remaining: 5_000_000_000n, consumed: 0n };
    });
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/faucet/verify',
      payload: validBody,
    });
    const json = res.json() as { data: { allowed: boolean; reason: string } };
    expect(json.data.allowed).toBe(false);
    expect(json.data.reason).toBe('IP_LIMIT');
    await app.close();
  });

  test('chain paused returns PAUSED', async () => {
    vi.mocked(readFaucetState).mockResolvedValueOnce({
      ...defaultState,
      paused: true,
    });
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/faucet/verify',
      payload: validBody,
    });
    const json = res.json() as { data: { allowed: boolean; reason: string } };
    expect(json.data.allowed).toBe(false);
    expect(json.data.reason).toBe('PAUSED');
    await app.close();
  });

  test('request over per-tx cap returns AMOUNT_OVER_CAP', async () => {
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/faucet/verify',
      payload: { ...validBody, requestedSuiMist: 2_000_000_000 },
    });
    const json = res.json() as { data: { allowed: boolean; reason: string } };
    expect(json.data.allowed).toBe(false);
    expect(json.data.reason).toBe('AMOUNT_OVER_CAP');
    await app.close();
  });

  test('concurrent verify calls each consume independently from the mock', async () => {
    // Two requests in flight, both succeed when the rate-limit mock allows both.
    // This documents the route does not double-count internally; the atomic
    // upsert in checkAndConsume is what prevents real-world double-spend.
    const app = await buildTestApp();
    const [r1, r2] = await Promise.all([
      app.inject({ method: 'POST', url: '/faucet/verify', payload: validBody }),
      app.inject({ method: 'POST', url: '/faucet/verify', payload: validBody }),
    ]);
    expect(r1.statusCode).toBe(200);
    expect(r2.statusCode).toBe(200);
    // checkAndConsume must have been called for each scope, both requests.
    // 3 scopes (wallet, ip, fingerprint) * 2 requests = 6 invocations.
    expect(vi.mocked(checkAndConsume)).toHaveBeenCalledTimes(6);
    await app.close();
  });
});
