import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit'
import type {OwnerCoin} from '@/lib/sui/ptb-return';
import type {VerifyResponse} from '@/lib/api';
import { buildClaimTx } from '@/lib/sui/ptb-claim'
import {  buildReturnTx } from '@/lib/sui/ptb-return'
import { buildRefillTx } from '@/lib/sui/ptb-refill'
import { sui } from '@/lib/sui/client'
import {
  
  postClaimEvent,
  postVerify
} from '@/lib/api'
import { getOwnedDusdcCoins } from '@/lib/sui/faucet-read'
import { previewClaim, previewReturn } from '@/lib/sui/format'
import { getFingerprint } from '@/lib/fingerprint'

const CHAIN = 'sui:testnet' as const

export interface ClaimArgs {
  suiAmountMist: bigint
  turnstileToken: string
  rateNumerator: number
  rateDenominator: number
}

export interface ClaimSuccess {
  digest: string
  dusdcOutBase: bigint
}

export function useClaim() {
  const account = useCurrentAccount()
  const sign = useSignAndExecuteTransaction()
  const qc = useQueryClient()

  return useMutation<ClaimSuccess, Error, ClaimArgs>({
    mutationFn: async (args): Promise<ClaimSuccess> => {
      if (!account) throw new Error('NOT_CONNECTED')
      const fp = await getFingerprint()
      // Backend gate. Failure here is informational; chain still enforces caps.
      let verify: VerifyResponse | null = null
      try {
        verify = await postVerify({
          walletAddress: account.address,
          turnstileToken: args.turnstileToken,
          fingerprint: fp,
          requestedSuiMist: Number(args.suiAmountMist),
        })
      } catch {
        verify = null
      }
      if (verify && !verify.allowed) {
        throw new Error(`VERIFY_DENIED:${verify.reason}`)
      }

      const tx = buildClaimTx({ suiAmountMist: args.suiAmountMist })
      const result = await sign.mutateAsync({
        transaction: tx,
        chain: CHAIN,
      })
      const digest = (result as { digest: string }).digest

      // Wait for the tx to be visible before recording or refetching.
      await sui.waitForTransaction({ digest, options: { showEffects: true } })

      const dusdcOutBase = previewClaim(
        args.suiAmountMist,
        args.rateNumerator,
        args.rateDenominator,
      )

      // Best-effort claim event ingestion. Idempotent on server; safe to retry-not.
      try {
        await postClaimEvent({
          txDigest: digest,
          walletAddress: account.address,
          suiMist: Number(args.suiAmountMist),
          dusdcBaseUnit: Number(dusdcOutBase),
          fingerprint: fp,
        })
      } catch {
        // ignore, stats reads chain
      }

      return { digest, dusdcOutBase }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-stats'] })
      qc.invalidateQueries({ queryKey: ['tx-hint'] })
      qc.invalidateQueries({ queryKey: ['dusdc-coins'] })
    },
  })
}

export interface ReturnArgs {
  dusdcAmountBase: bigint
  rateNumerator: number
  rateDenominator: number
}

export interface ReturnSuccess {
  digest: string
  suiMistOut: bigint
}

export function useReturn() {
  const account = useCurrentAccount()
  const sign = useSignAndExecuteTransaction()
  const qc = useQueryClient()

  return useMutation<ReturnSuccess, Error, ReturnArgs>({
    mutationFn: async (args): Promise<ReturnSuccess> => {
      if (!account) throw new Error('NOT_CONNECTED')
      const coins: Array<OwnerCoin> = await getOwnedDusdcCoins(account.address)
      if (coins.length === 0) throw new Error('NO_DUSDC')

      const tx = buildReturnTx({
        dusdcAmountBase: args.dusdcAmountBase,
        ownerCoins: coins,
      })
      const result = await sign.mutateAsync({ transaction: tx, chain: CHAIN })
      const digest = (result as { digest: string }).digest
      await sui.waitForTransaction({ digest, options: { showEffects: true } })

      const suiMistOut = previewReturn(
        args.dusdcAmountBase,
        args.rateNumerator,
        args.rateDenominator,
      )
      return { digest, suiMistOut }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-stats'] })
      qc.invalidateQueries({ queryKey: ['dusdc-coins'] })
    },
  })
}

export interface RefillArgs {
  dusdcAmountBase: bigint
}

export interface RefillSuccess {
  digest: string
  dusdcAmountBase: bigint
}

export function useRefill() {
  const account = useCurrentAccount()
  const sign = useSignAndExecuteTransaction()
  const qc = useQueryClient()

  return useMutation<RefillSuccess, Error, RefillArgs>({
    mutationFn: async (args): Promise<RefillSuccess> => {
      if (!account) throw new Error('NOT_CONNECTED')
      const coins: Array<OwnerCoin> = await getOwnedDusdcCoins(account.address)
      if (coins.length === 0) throw new Error('NO_DUSDC')

      const tx = buildRefillTx({
        dusdcAmountBase: args.dusdcAmountBase,
        ownerCoins: coins,
      })
      const result = await sign.mutateAsync({ transaction: tx, chain: CHAIN })
      const digest = (result as { digest: string }).digest
      await sui.waitForTransaction({ digest, options: { showEffects: true } })

      return { digest, dusdcAmountBase: args.dusdcAmountBase }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-stats'] })
      qc.invalidateQueries({ queryKey: ['dusdc-coins'] })
    },
  })
}

// User's DUSDC coin list with cached balance sum for Return/Refill tabs.
export function useOwnedDusdc() {
  const account = useCurrentAccount()
  return useQuery({
    queryKey: ['dusdc-coins', account?.address],
    queryFn: async () => {
      if (!account) return { coins: [], totalBase: 0n }
      const coins = await getOwnedDusdcCoins(account.address)
      const totalBase = coins.reduce((acc, c) => acc + BigInt(c.balance), 0n)
      return { coins, totalBase }
    },
    enabled: !!account,
    staleTime: 5_000,
  })
}
