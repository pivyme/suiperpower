import cron from 'node-cron';

import { prismaQuery } from '../lib/prisma.ts';
import { readFaucetState } from '../lib/sui/faucet-read.ts';

let isRunning = false;

const refresh = async (): Promise<void> => {
  if (isRunning) {
    return;
  }
  isRunning = true;
  try {
    const state = await readFaucetState();
    const now = Date.now();
    const startOfDay = Math.floor(now / 86_400_000) * 86_400_000;
    const claimsToday = await prismaQuery.claimEvent.findMany({
      where: { createdAt: { gte: new Date(startOfDay) } },
      select: { dusdcBaseUnit: true },
    });
    const servedTodayDusdc = claimsToday.reduce(
      (acc, c) => acc + c.dusdcBaseUnit,
      0n
    );
    await prismaQuery.vaultStatsSnapshot.create({
      data: {
        dusdcAvailable: state.dusdcAvailable,
        suiAccumulated: state.suiAccumulatedMist,
        servedTodayDusdc,
        servedTotalDusdc: state.totalServedQuote,
        claimsTodayCount: claimsToday.length,
      },
    });
  } catch (error) {
    console.error('[StatsCache] refresh failed:', error);
  } finally {
    isRunning = false;
  }
};

export const startStatsCacheWorker = (): void => {
  console.log('[StatsCache] Worker scheduled: every 15s');
  // 6-field cron, every 15 seconds.
  cron.schedule('*/15 * * * * *', refresh);
  // initial run, do not await so server boot is not blocked
  refresh();
};
