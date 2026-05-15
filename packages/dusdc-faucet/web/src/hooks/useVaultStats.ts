import { useQuery } from '@tanstack/react-query'
import type {VaultStatsResponse} from '@/lib/api';
import {  getStats } from '@/lib/api'
import { readFaucetState } from '@/lib/sui/faucet-read'

// Live vault stats with chain fallback. Backend is the fast path; if it 5xx's
// or fails to parse, fall back to a direct chain read so the page stays useful.
async function fetchStats(): Promise<VaultStatsResponse> {
  try {
    return await getStats()
  } catch {
    const state = await readFaucetState()
    return {
      dusdcAvailable: state.dusdcAvailable.toString(),
      dusdcAvailableHuman: Number(state.dusdcAvailable) / 1_000_000,
      suiAccumulatedMist: state.suiAccumulatedMist.toString(),
      rateNumerator: state.rateNumerator,
      rateDenominator: state.rateDenominator,
      perTxSuiCapMist: state.perTxSuiCapMist.toString(),
      perWalletDailySuiCapMist: state.perWalletDailySuiCapMist.toString(),
      paused: state.paused,
      returnEnabled: state.returnEnabled,
      servedTodayDusdc: '0',
      servedTotalDusdc: state.totalServedQuote.toString(),
      claimsTodayCount: 0,
      capturedAt: new Date().toISOString(),
      isFresh: false,
    }
  }
}

export function useVaultStats() {
  return useQuery({
    queryKey: ['vault-stats'],
    queryFn: fetchStats,
    refetchInterval: 10_000,
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  })
}
