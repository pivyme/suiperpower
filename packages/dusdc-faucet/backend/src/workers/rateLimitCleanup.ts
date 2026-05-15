import cron from 'node-cron';

import { prismaQuery } from '../lib/prisma.ts';
import { currentUtcDay } from '../lib/rate-limit.ts';

let isRunning = false;

const cleanup = async (): Promise<void> => {
  if (isRunning) {
    return;
  }
  isRunning = true;
  try {
    const threshold = currentUtcDay() - 14;
    const result = await prismaQuery.rateLimit.deleteMany({
      where: { utcDay: { lt: threshold } },
    });
    if (result.count > 0) {
      console.log(`[RateLimitCleanup] deleted ${result.count} stale rows`);
    }
  } catch (error) {
    console.error('[RateLimitCleanup] failed:', error);
  } finally {
    isRunning = false;
  }
};

export const startRateLimitCleanupWorker = (): void => {
  console.log('[RateLimitCleanup] Worker scheduled: hourly');
  cron.schedule('0 * * * *', cleanup);
  cleanup();
};
