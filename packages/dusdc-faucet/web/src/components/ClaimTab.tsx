import { useEffect, useMemo, useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ExternalLink, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AmountInput } from './AmountInput'
import { TurnstileWidget } from './TurnstileWidget'
import { cnm } from '@/utils/style'
import { useVaultStats } from '@/hooks/useVaultStats'
import { useTxHint } from '@/hooks/useTxHint'
import { useClaim } from '@/hooks/useFaucetMutations'
import { useTurnstile } from '@/hooks/useTurnstile'
import { baseToDusdc, mistToSui, previewClaim } from '@/lib/sui/format'

const EXPLORER = 'https://suiscan.xyz/testnet/tx'

export function ClaimTab() {
  const account = useCurrentAccount()
  const stats = useVaultStats()
  const hint = useTxHint(account?.address)
  const claim = useClaim()
  const turnstile = useTurnstile()
  const [amount, setAmount] = useState<bigint>(500_000_000n) // 0.5 SUI

  // Reset amount when wallet swaps so we don't carry stale state.
  useEffect(() => {
    setAmount(500_000_000n)
  }, [account?.address])

  const perTxCap = stats.data ? BigInt(stats.data.perTxSuiCapMist) : 1_000_000_000n
  const remaining = hint.data
    ? BigInt(hint.data.remainingMist)
    : perTxCap
  const vaultBase = stats.data ? BigInt(stats.data.dusdcAvailable) : 0n
  const vaultDry = stats.data ? vaultBase === 0n : false
  const rateNum = stats.data?.rateNumerator ?? 1
  const rateDen = stats.data?.rateDenominator ?? 1

  const preview = useMemo(
    () => previewClaim(amount, rateNum, rateDen),
    [amount, rateNum, rateDen],
  )

  const maxClaim = perTxCap < remaining ? perTxCap : remaining

  // Validation messages, plain text under the input.
  let error: string | null = null
  if (amount === 0n) {
    error = null // empty is just disabled, not an error
  } else if (amount > perTxCap) {
    error = `Max ${mistToSui(perTxCap)} SUI per claim`
  } else if (amount > remaining) {
    error = `You have used ${mistToSui(BigInt(hint.data?.consumedTodayMist ?? '0'))} of ${mistToSui(BigInt(hint.data?.perWalletDailyCapMist ?? perTxCap.toString()))} SUI today, try a smaller amount`
  } else if (preview > vaultBase) {
    error = 'Not enough DUSDC in the vault'
  }

  let buttonLabel: string
  let buttonDisabled = false
  if (!account) {
    buttonLabel = 'Connect wallet'
    buttonDisabled = true
  } else if (vaultDry) {
    buttonLabel = 'Vault empty'
    buttonDisabled = true
  } else if (claim.isPending) {
    buttonLabel = 'Claiming…'
    buttonDisabled = true
  } else if (amount === 0n || error) {
    buttonLabel = 'Claim'
    buttonDisabled = true
  } else if (!turnstile.ready) {
    buttonLabel = 'Verifying you are human…'
    buttonDisabled = true
  } else {
    buttonLabel = 'Claim'
  }

  const onSubmit = async () => {
    if (!account || !turnstile.token) return
    try {
      const res = await claim.mutateAsync({
        suiAmountMist: amount,
        turnstileToken: turnstile.token,
        rateNumerator: rateNum,
        rateDenominator: rateDen,
      })
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>{`Claimed ${baseToDusdc(res.dusdcOutBase)} DUSDC`}</span>
            <a
              href={`${EXPLORER}/${res.digest}`}
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-white/70 inline-flex items-center gap-1"
              onClick={() => toast.dismiss(t.id)}
            >
              tx <ExternalLink size={12} />
            </a>
          </div>
        ),
        { duration: 6000 },
      )
      turnstile.reset()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.startsWith('VERIFY_DENIED:')) {
        toast.error(`Cannot claim: ${msg.slice('VERIFY_DENIED:'.length)}`)
      } else {
        toast.error('Transaction failed. Check the wallet for details.')
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {vaultDry ? (
        <div className="border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/80 backdrop-blur-md">
          Vault is empty. If you have spare DUSDC, refill from the panel on the right and keep the faucet alive.
        </div>
      ) : null}

      <AmountInput
        id="claim-amount"
        label="You pay"
        value={amount}
        onChange={setAmount}
        unit="SUI"
        decimals={9}
        max={vaultDry ? 0n : maxClaim}
        disabled={!account || vaultDry}
        error={error}
      />

      <div className="border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-md">
        <div className="text-xs text-white/50">You receive</div>
        <div className="mt-1 font-mono text-xl text-white">
          {baseToDusdc(preview)} <span className="text-sm text-white/50">DUSDC</span>
        </div>
      </div>

      <TurnstileWidget onToken={turnstile.onToken} onError={turnstile.onError} />

      <button
        type="button"
        onClick={onSubmit}
        disabled={buttonDisabled}
        className={cnm(
          'flex h-11 items-center justify-center gap-2 text-sm font-medium transition-colors',
          'bg-white text-black hover:bg-white/90',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white',
        )}
      >
        {claim.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
        {buttonLabel}
      </button>

      {account && hint.data ? (
        <p className="text-xs text-white/50 text-center">
          You have {mistToSui(BigInt(hint.data.remainingMist))} SUI of {mistToSui(BigInt(hint.data.perWalletDailyCapMist))} SUI left today.
        </p>
      ) : null}
    </div>
  )
}
