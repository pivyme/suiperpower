import { prismaQuery } from './prisma.ts';

export type RateLimitScope = 'ip' | 'fingerprint' | 'wallet';

export function currentUtcDay(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

export interface CheckArgs {
  scope: RateLimitScope;
  identifier: string;
  requestedMist: bigint;
  capMist: bigint;
}

export interface CheckResult {
  allowed: boolean;
  remaining: bigint;
  consumed: bigint;
}

// Atomic check + consume. Reads current usage for the (scope, identifier, day)
// row, returns disallowed if requested would exceed cap, otherwise upserts the
// counters in a single transaction. Race-safe because the unique index forces
// one writer to retry the update branch.
export async function checkAndConsume(args: CheckArgs): Promise<CheckResult> {
  const { scope, identifier, requestedMist, capMist } = args;
  const utcDay = currentUtcDay();

  return prismaQuery.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({
      where: { scope_identifier_utcDay: { scope, identifier, utcDay } },
    });
    const consumedNow: bigint = existing?.consumedMist ?? 0n;
    const projected: bigint = consumedNow + requestedMist;
    if (projected > capMist) {
      return {
        allowed: false,
        remaining: capMist > consumedNow ? capMist - consumedNow : 0n,
        consumed: consumedNow,
      };
    }
    const next = await tx.rateLimit.upsert({
      where: { scope_identifier_utcDay: { scope, identifier, utcDay } },
      create: {
        scope,
        identifier,
        utcDay,
        consumedMist: requestedMist,
        claimCount: 1,
      },
      update: {
        consumedMist: { increment: requestedMist },
        claimCount: { increment: 1 },
      },
    });
    const consumed: bigint = next.consumedMist;
    return {
      allowed: true,
      remaining: capMist > consumed ? capMist - consumed : 0n,
      consumed,
    };
  });
}

export async function readConsumed(
  scope: RateLimitScope,
  identifier: string
): Promise<bigint> {
  const utcDay = currentUtcDay();
  const row = await prismaQuery.rateLimit.findUnique({
    where: { scope_identifier_utcDay: { scope, identifier, utcDay } },
  });
  return row?.consumedMist ?? 0n;
}
