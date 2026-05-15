import { useQuery } from '@tanstack/react-query'
import { getTxHint } from '@/lib/api'

export function useTxHint(addr: string | undefined) {
  return useQuery({
    queryKey: ['tx-hint', addr],
    queryFn: () => getTxHint(addr as string),
    enabled: !!addr,
    refetchInterval: 20_000,
    staleTime: 10_000,
  })
}
