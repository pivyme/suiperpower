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
  readConsumed: vi.fn(),
  currentUtcDay: () => 19_500,
}));

import { buildTestApp } from './helpers/app.ts';
import { readFaucetState } from '../src/lib/sui/faucet-read.ts';
import { readConsumed } from '../src/lib/rate-limit.ts';

const chainState = {
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
  vi.mocked(readFaucetState).mockResolvedValue(chainState);
});

afterEach(() => {
  vi.clearAllMocks();
});

const VALID_ADDR = '0x' + 'a'.repeat(64);

describe('GET /faucet/tx-hint/:addr', () => {
  test('invalid address returns 400', async () => {
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/faucet/tx-hint/not-an-address',
    });
    expect(res.statusCode).toBe(400);
    const json = res.json() as { error: { code: string } };
    expect(json.error.code).toBe('TX_HINT_BAD_ADDR');
    await app.close();
  });

  test('zero usage returns full daily cap', async () => {
    vi.mocked(readConsumed).mockResolvedValue(0n);
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/faucet/tx-hint/${VALID_ADDR}`,
    });
    expect(res.statusCode).toBe(200);
    const json = res.json() as {
      data: {
        remainingMist: string;
        remainingHuman: number;
        consumedTodayMist: string;
        perWalletDailyCapMist: string;
      };
    };
    expect(json.data.remainingMist).toBe('5000000000');
    expect(json.data.remainingHuman).toBe(5);
    expect(json.data.consumedTodayMist).toBe('0');
    expect(json.data.perWalletDailyCapMist).toBe('5000000000');
    await app.close();
  });

  test('partial usage returns cap minus consumed', async () => {
    vi.mocked(readConsumed).mockResolvedValue(1_500_000_000n);
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/faucet/tx-hint/${VALID_ADDR}`,
    });
    const json = res.json() as {
      data: { remainingMist: string; consumedTodayMist: string };
    };
    expect(json.data.remainingMist).toBe('3500000000');
    expect(json.data.consumedTodayMist).toBe('1500000000');
    await app.close();
  });

  test('over-cap returns zero, never negative', async () => {
    vi.mocked(readConsumed).mockResolvedValue(9_000_000_000n);
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/faucet/tx-hint/${VALID_ADDR}`,
    });
    const json = res.json() as {
      data: { remainingMist: string; remainingHuman: number };
    };
    expect(json.data.remainingMist).toBe('0');
    expect(json.data.remainingHuman).toBe(0);
    await app.close();
  });

  test('falls back to default cap when chain read fails', async () => {
    vi.mocked(readFaucetState).mockRejectedValue(new Error('rpc down'));
    vi.mocked(readConsumed).mockResolvedValue(0n);
    const app = await buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/faucet/tx-hint/${VALID_ADDR}`,
    });
    expect(res.statusCode).toBe(200);
    const json = res.json() as { data: { perWalletDailyCapMist: string } };
    expect(json.data.perWalletDailyCapMist).toBe('5000000000');
    await app.close();
  });
});
