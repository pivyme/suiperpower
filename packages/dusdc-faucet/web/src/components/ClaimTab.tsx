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
  const rateNum = stats.data?.rateNumerator ?? 100
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
              className="text-amber-300 hover:text-amber-200 inline-flex items-center gap-1"
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
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Vault is empty. Ping @DeepBookFi to refill.
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

      <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="text-xs text-neutral-500">You receive</div>
        <div className="mt-1 font-mono text-xl text-neutral-100">
          {baseToDusdc(preview)} <span className="text-sm text-neutral-500">DUSDC</span>
        </div>
      </div>

      <TurnstileWidget onToken={turnstile.onToken} onError={turnstile.onError} />

      <button
        type="button"
        onClick={onSubmit}
        disabled={buttonDisabled}
        className={cnm(
          'h-11 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2',
          'bg-amber-400 text-neutral-950',
          'hover:bg-amber-300 active:bg-amber-500',
          'disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed',
        )}
      >
        {claim.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
        {buttonLabel}
      </button>

      {account && hint.data ? (
        <p className="text-xs text-neutral-500 text-center">
          You have {mistToSui(BigInt(hint.data.remainingMist))} SUI of {mistToSui(BigInt(hint.data.perWalletDailyCapMist))} SUI left today.
        </p>
      ) : null}
    </div>
  )
}
