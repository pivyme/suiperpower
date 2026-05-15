import type {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { prismaQuery } from '../lib/prisma.ts';
import { verifyTurnstile } from '../lib/turnstile.ts';
import { readFaucetState } from '../lib/sui/faucet-read.ts';
import {
  checkAndConsume,
  currentUtcDay,
  readConsumed,
} from '../lib/rate-limit.ts';
import {
  JWT_SECRET,
  PER_IP_DAILY_SUI_CAP_MIST,
  PER_FP_DAILY_SUI_CAP_MIST,
} from '../config/main-config.ts';
import { handleError } from '../utils/errorHandler.ts';

const SUI_ADDRESS_RE = /^0x[0-9a-fA-F]{1,64}$/;

const verifyBody = z.object({
  walletAddress: z.string().regex(SUI_ADDRESS_RE),
  turnstileToken: z.string().min(1),
  fingerprint: z.string().min(16).max(64),
  requestedSuiMist: z.number().int().positive(),
});

const claimEventBody = z.object({
  txDigest: z.string().min(1),
  walletAddress: z.string().regex(SUI_ADDRESS_RE),
  suiMist: z.number().int().nonnegative(),
  dusdcBaseUnit: z.number().int().nonnegative(),
  fingerprint: z.string().min(16).max(64).optional(),
});

type DenyReason =
  | 'TURNSTILE_FAILED'
  | 'IP_LIMIT'
  | 'FP_LIMIT'
  | 'WALLET_LIMIT'
  | 'PAUSED'
  | 'AMOUNT_OVER_CAP';

function deny(reply: FastifyReply, reason: DenyReason, remaining: bigint) {
  return reply.code(200).send({
    success: true,
    error: null,
    data: {
      allowed: false,
      reason,
      remainingDailyMist: Number(remaining),
    },
  });
}

function clientIp(request: FastifyRequest): string {
  const fwd = request.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0]!.trim();
  }
  return request.ip || 'unknown';
}

export const faucetRoutes: FastifyPluginCallback = (
  app: FastifyInstance,
  _opts,
  done
) => {
  // POST /faucet/verify, pre-claim gate
  app.post('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = verifyBody.safeParse(request.body);
    if (!parsed.success) {
      return handleError(reply, 400, 'invalid body', 'VERIFY_BAD_BODY');
    }
    const { walletAddress, turnstileToken, fingerprint, requestedSuiMist } =
      parsed.data;
    const ip = clientIp(request);

    // Chain state, pause + per-tx + per-wallet cap
    let state;
    try {
      state = await readFaucetState();
    } catch (err) {
      return handleError(
        reply,
        503,
        'faucet state unavailable',
        'FAUCET_READ_FAILED',
        err instanceof Error ? err : null
      );
    }
    if (state.paused) {
      return deny(reply, 'PAUSED', 0n);
    }
    const requested = BigInt(requestedSuiMist);
    if (requested > state.perTxSuiCapMist) {
      return deny(reply, 'AMOUNT_OVER_CAP', state.perTxSuiCapMist);
    }

    // Turnstile
    const tsr = await verifyTurnstile(turnstileToken, ip);
    if (!tsr.success) {
      return deny(reply, 'TURNSTILE_FAILED', 0n);
    }

    // Per-wallet on-chain cap mirrored off-chain
    const walletCheck = await checkAndConsume({
      scope: 'wallet',
      identifier: walletAddress,
      requestedMist: requested,
      capMist: state.perWalletDailySuiCapMist,
    });
    if (!walletCheck.allowed) {
      return deny(reply, 'WALLET_LIMIT', walletCheck.remaining);
    }

    const ipCheck = await checkAndConsume({
      scope: 'ip',
      identifier: ip,
      requestedMist: requested,
      capMist: PER_IP_DAILY_SUI_CAP_MIST,
    });
    if (!ipCheck.allowed) {
      return deny(reply, 'IP_LIMIT', ipCheck.remaining);
    }

    const fpCheck = await checkAndConsume({
      scope: 'fingerprint',
      identifier: fingerprint,
      requestedMist: requested,
      capMist: PER_FP_DAILY_SUI_CAP_MIST,
    });
    if (!fpCheck.allowed) {
      return deny(reply, 'FP_LIMIT', fpCheck.remaining);
    }

    const nonce = jwt.sign(
      {
        wallet: walletAddress,
        ip,
        fp: fingerprint,
        requested: requestedSuiMist,
      },
      JWT_SECRET,
      { expiresIn: '60s' }
    );

    return reply.code(200).send({
      success: true,
      error: null,
      data: {
        allowed: true,
        remainingDailyMist: Number(walletCheck.remaining),
        nonce,
      },
    });
  });

  // GET /faucet/stats, public, served from VaultStatsSnapshot cache
  app.get('/stats', async (_request: FastifyRequest, reply: FastifyReply) => {
    const latest = await prismaQuery.vaultStatsSnapshot.findFirst({
      orderBy: { capturedAt: 'desc' },
    });
    const now = Date.now();
    const ageMs = latest ? now - latest.capturedAt.getTime() : Infinity;
    const fresh = latest !== null && ageMs < 30_000;

    let snapshot = latest;
    if (!snapshot || ageMs > 60_000) {
      try {
        const state = await readFaucetState();
        const startOfDay = Math.floor(now / 86_400_000) * 86_400_000;
        const claimsToday = await prismaQuery.claimEvent.findMany({
          where: { createdAt: { gte: new Date(startOfDay) } },
          select: { dusdcBaseUnit: true },
        });
        const servedTodayDusdc = claimsToday.reduce(
          (acc, c) => acc + c.dusdcBaseUnit,
          0n
        );
        snapshot = await prismaQuery.vaultStatsSnapshot.create({
          data: {
            dusdcAvailable: state.dusdcAvailable,
            suiAccumulated: state.suiAccumulatedMist,
            servedTodayDusdc,
            servedTotalDusdc: state.totalServedQuote,
            claimsTodayCount: claimsToday.length,
          },
        });
      } catch (err) {
        if (!snapshot) {
          return handleError(
            reply,
            503,
            'stats unavailable',
            'STATS_UNAVAILABLE',
            err instanceof Error ? err : null
          );
        }
        // stale snapshot is better than no snapshot
      }
    }

    let chain;
    try {
      chain = await readFaucetState();
    } catch {
      chain = null;
    }

    return reply.code(200).send({
      success: true,
      error: null,
      data: {
        dusdcAvailable: snapshot.dusdcAvailable.toString(),
        dusdcAvailableHuman: Number(snapshot.dusdcAvailable) / 1_000_000,
        suiAccumulatedMist: snapshot.suiAccumulated.toString(),
        rateNumerator: chain?.rateNumerator ?? 100,
        rateDenominator: chain?.rateDenominator ?? 1,
        perTxSuiCapMist: (chain?.perTxSuiCapMist ?? 0n).toString(),
        perWalletDailySuiCapMist: (
          chain?.perWalletDailySuiCapMist ?? 0n
        ).toString(),
        paused: chain?.paused ?? false,
        returnEnabled: chain?.returnEnabled ?? true,
        servedTodayDusdc: snapshot.servedTodayDusdc.toString(),
        servedTotalDusdc: snapshot.servedTotalDusdc.toString(),
        claimsTodayCount: snapshot.claimsTodayCount,
        capturedAt: snapshot.capturedAt.toISOString(),
        isFresh: fresh,
      },
    });
  });

  // GET /faucet/tx-hint/:addr, public, remaining for the wallet today
  app.get(
    '/tx-hint/:addr',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { addr } = request.params as { addr: string };
      if (!SUI_ADDRESS_RE.test(addr)) {
        return handleError(reply, 400, 'invalid address', 'TX_HINT_BAD_ADDR');
      }
      let cap = 5_000_000_000n;
      try {
        const state = await readFaucetState();
        cap = state.perWalletDailySuiCapMist;
      } catch {
        // chain unreachable, fall back to default; UX surface this in /stats
      }
      const consumed = await readConsumed('wallet', addr);
      const remaining = cap > consumed ? cap - consumed : 0n;
      return reply.code(200).send({
        success: true,
        error: null,
        data: {
          walletAddress: addr,
          remainingMist: remaining.toString(),
          remainingHuman: Number(remaining) / 1_000_000_000,
          perWalletDailyCapMist: cap.toString(),
          consumedTodayMist: consumed.toString(),
          utcDay: currentUtcDay(),
        },
      });
    }
  );

  // POST /faucet/event/claim, idempotent claim record
  app.post(
    '/event/claim',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = claimEventBody.safeParse(request.body);
      if (!parsed.success) {
        return handleError(reply, 400, 'invalid body', 'CLAIM_EVENT_BAD_BODY');
      }
      const { txDigest, walletAddress, suiMist, dusdcBaseUnit, fingerprint } =
        parsed.data;
      const ip = clientIp(request);
      try {
        await prismaQuery.claimEvent.create({
          data: {
            txDigest,
            walletAddress,
            suiMist: BigInt(suiMist),
            dusdcBaseUnit: BigInt(dusdcBaseUnit),
            ip,
            fingerprint: fingerprint ?? null,
          },
        });
      } catch (err) {
        // Unique violation on txDigest is fine, treat as idempotent.
        const code = (err as { code?: string }).code;
        if (code !== 'P2002') {
          return handleError(
            reply,
            500,
            'failed to record claim',
            'CLAIM_EVENT_DB_FAILED',
            err instanceof Error ? err : null
          );
        }
      }
      return reply
        .code(200)
        .send({ success: true, error: null, data: { recorded: true } });
    }
  );

  done();
};
