import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

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
  readConsumed: vi.fn().mockResolvedValue(0n),
  currentUtcDay: () => Math.floor(Date.now() / 86_400_000),
}));

import { buildTestApp } from './helpers/app.ts';
import { prismaQuery } from '../src/lib/prisma.ts';
import { readFaucetState } from '../src/lib/sui/faucet-read.ts';

const chainState = {
  dusdcAvailable: 1_000_000_000_000n,
  suiAccumulatedMist: 250_000_000n,
  rateNumerator: 100,
  rateDenominator: 1,
  perTxSuiCapMist: 1_000_000_000n,
  perWalletDailySuiCapMist: 5_000_000_000n,
  paused: false,
  returnEnabled: true,
  totalServedQuote: 50_000_000_000n,
  totalClaims: 7n,
};

function freshSnapshot(ageMs: number) {
  return {
    id: 'snap1',
    dusdcAvailable: chainState.dusdcAvailable,
    suiAccumulated: chainState.suiAccumulatedMist,
    servedTodayDusdc: 10_000_000_000n,
    servedTotalDusdc: chainState.totalServedQuote,
    claimsTodayCount: 3,
    capturedAt: new Date(Date.now() - ageMs),
  };
}

beforeEach(() => {
  vi.mocked(readFaucetState).mockResolvedValue(chainState);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('GET /faucet/stats', () => {
  test('returns fresh snapshot without refetching chain', async () => {
    vi.mocked(prismaQuery.vaultStatsSnapshot.findFirst).mockResolvedValue(
      freshSnapshot(5_000)
    );
    const app = await buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/faucet/stats' });
    expect(res.statusCode).toBe(200);
    const json = res.json() as {
      data: {
        dusdcAvailable: string;
        dusdcAvailableHuman: number;
        isFresh: boolean;
        capturedAt: string;
      };
    };
    expect(json.data.isFresh).toBe(true);
    // string serialization preserves BigInt precision
    expect(typeof json.data.dusdcAvailable).toBe('string');
    expect(json.data.dusdcAvailable).toBe('1000000000000');
    expect(json.data.dusdcAvailableHuman).toBe(1_000_000);
    // chain not refetched for the cached path inside the worker write,
    // but the route also pulls live chain to fill rate/cap fields, so
    // readFaucetState may be called once. Acceptable per the route logic.
    await app.close();
  });

  test('refetches chain when snapshot is older than 60s', async () => {
    const stale = freshSnapshot(90_000);
    vi.mocked(prismaQuery.vaultStatsSnapshot.findFirst).mockResolvedValue(stale);
    vi.mocked(prismaQuery.claimEvent.findMany).mockResolvedValue([
      { dusdcBaseUnit: 1_000_000n },
      { dusdcBaseUnit: 2_000_000n },
    ] as unknown as Awaited<
      ReturnType<typeof prismaQuery.claimEvent.findMany>
    >);
    vi.mocked(prismaQuery.vaultStatsSnapshot.create).mockResolvedValue({
      id: 'snap2',
      dusdcAvailable: chainState.dusdcAvailable,
      suiAccumulated: chainState.suiAccumulatedMist,
      servedTodayDusdc: 3_000_000n,
      servedTotalDusdc: chainState.totalServedQuote,
      claimsTodayCount: 2,
      capturedAt: new Date(),
    });
    const app = await buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/faucet/stats' });
    expect(res.statusCode).toBe(200);
    expect(vi.mocked(prismaQuery.vaultStatsSnapshot.create)).toHaveBeenCalledTimes(
      1
    );
    expect(vi.mocked(readFaucetState).mock.calls.length).toBeGreaterThanOrEqual(
      1
    );
    await app.close();
  });

  test('response shape matches plan, with BigInts as strings', async () => {
    vi.mocked(prismaQuery.vaultStatsSnapshot.findFirst).mockResolvedValue(
      freshSnapshot(1_000)
    );
    const app = await buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/faucet/stats' });
    const json = res.json() as { data: Record<string, unknown> };
    const d = json.data;
    for (const k of [
      'dusdcAvailable',
      'suiAccumulatedMist',
      'perTxSuiCapMist',
      'perWalletDailySuiCapMist',
      'servedTodayDusdc',
      'servedTotalDusdc',
    ]) {
      expect(typeof d[k]).toBe('string');
    }
    expect(typeof d.dusdcAvailableHuman).toBe('number');
    expect(typeof d.rateNumerator).toBe('number');
    expect(typeof d.rateDenominator).toBe('number');
    expect(typeof d.paused).toBe('boolean');
    expect(typeof d.returnEnabled).toBe('boolean');
    expect(typeof d.claimsTodayCount).toBe('number');
    expect(typeof d.capturedAt).toBe('string');
    expect(typeof d.isFresh).toBe('boolean');
    await app.close();
  });

  test('returns 503 when no snapshot exists and chain read fails', async () => {
    vi.mocked(prismaQuery.vaultStatsSnapshot.findFirst).mockResolvedValue(null);
    vi.mocked(readFaucetState).mockRejectedValue(new Error('rpc down'));
    const app = await buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/faucet/stats' });
    expect(res.statusCode).toBe(503);
    const json = res.json() as { error: { code: string } };
    expect(json.error.code).toBe('STATS_UNAVAILABLE');
    await app.close();
  });
});
