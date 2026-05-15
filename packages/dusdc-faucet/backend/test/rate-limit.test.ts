import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

// Mock prisma so the rate-limit module's $transaction can be driven from tests.
vi.mock('../src/lib/prisma.ts', () => ({
  prismaQuery: {
    rateLimit: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prismaQuery } from '../src/lib/prisma.ts';
import {
  checkAndConsume,
  currentUtcDay,
  readConsumed,
} from '../src/lib/rate-limit.ts';

type Tx = typeof prismaQuery;

function withTx() {
  // The route uses $transaction((tx) => fn(tx)). We feed the same prisma mock
  // back in as the tx handle so spies hit one surface.
  vi.mocked(prismaQuery.$transaction).mockImplementation(async (fn) => {
    return await (fn as (tx: Tx) => unknown)(prismaQuery);
  });
}

beforeEach(() => {
  withTx();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('currentUtcDay', () => {
  test('UTC day boundary math matches floor(epoch / 86_400_000)', () => {
    expect(currentUtcDay(0)).toBe(0);
    expect(currentUtcDay(86_400_000 - 1)).toBe(0);
    expect(currentUtcDay(86_400_000)).toBe(1);
    expect(currentUtcDay(86_400_001)).toBe(1);
  });
});

describe('checkAndConsume', () => {
  test('first call in a day creates the row and allows', async () => {
    vi.mocked(prismaQuery.rateLimit.findUnique).mockResolvedValue(null);
    vi.mocked(prismaQuery.rateLimit.upsert).mockResolvedValue({
      id: 'rl1',
      scope: 'wallet',
      identifier: '0xabc',
      utcDay: currentUtcDay(),
      consumedMist: 1_000_000_000n,
      claimCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await checkAndConsume({
      scope: 'wallet',
      identifier: '0xabc',
      requestedMist: 1_000_000_000n,
      capMist: 5_000_000_000n,
    });
    expect(res.allowed).toBe(true);
    expect(res.consumed).toBe(1_000_000_000n);
    expect(res.remaining).toBe(4_000_000_000n);
  });

  test('same-day increment accumulates', async () => {
    vi.mocked(prismaQuery.rateLimit.findUnique).mockResolvedValue({
      id: 'rl1',
      scope: 'wallet',
      identifier: '0xabc',
      utcDay: currentUtcDay(),
      consumedMist: 2_000_000_000n,
      claimCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prismaQuery.rateLimit.upsert).mockResolvedValue({
      id: 'rl1',
      scope: 'wallet',
      identifier: '0xabc',
      utcDay: currentUtcDay(),
      consumedMist: 3_000_000_000n,
      claimCount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await checkAndConsume({
      scope: 'wallet',
      identifier: '0xabc',
      requestedMist: 1_000_000_000n,
      capMist: 5_000_000_000n,
    });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(2_000_000_000n);
  });

  test('over-cap denies without calling upsert', async () => {
    vi.mocked(prismaQuery.rateLimit.findUnique).mockResolvedValue({
      id: 'rl1',
      scope: 'wallet',
      identifier: '0xabc',
      utcDay: currentUtcDay(),
      consumedMist: 4_500_000_000n,
      claimCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await checkAndConsume({
      scope: 'wallet',
      identifier: '0xabc',
      requestedMist: 1_000_000_000n,
      capMist: 5_000_000_000n,
    });
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(500_000_000n);
    expect(vi.mocked(prismaQuery.rateLimit.upsert)).not.toHaveBeenCalled();
  });

  test('cap exactly equal to projected is allowed (not over)', async () => {
    vi.mocked(prismaQuery.rateLimit.findUnique).mockResolvedValue({
      id: 'rl1',
      scope: 'wallet',
      identifier: '0xabc',
      utcDay: currentUtcDay(),
      consumedMist: 4_000_000_000n,
      claimCount: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prismaQuery.rateLimit.upsert).mockResolvedValue({
      id: 'rl1',
      scope: 'wallet',
      identifier: '0xabc',
      utcDay: currentUtcDay(),
      consumedMist: 5_000_000_000n,
      claimCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await checkAndConsume({
      scope: 'wallet',
      identifier: '0xabc',
      requestedMist: 1_000_000_000n,
      capMist: 5_000_000_000n,
    });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(0n);
  });
});

describe('readConsumed', () => {
  test('returns 0n when no row exists', async () => {
    vi.mocked(prismaQuery.rateLimit.findUnique).mockResolvedValue(null);
    const v = await readConsumed('wallet', '0xabc');
    expect(v).toBe(0n);
  });

  test('returns stored consumedMist when row exists', async () => {
    vi.mocked(prismaQuery.rateLimit.findUnique).mockResolvedValue({
      id: 'rl1',
      scope: 'wallet',
      identifier: '0xabc',
      utcDay: currentUtcDay(),
      consumedMist: 1_234_567_890n,
      claimCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const v = await readConsumed('wallet', '0xabc');
    expect(v).toBe(1_234_567_890n);
  });
});
