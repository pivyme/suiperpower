import { useEffect, useMemo, useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ExternalLink, Inbox, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AmountInput } from './AmountInput'
import { cnm } from '@/utils/style'
import { useVaultStats } from '@/hooks/useVaultStats'
import { useOwnedDusdc, useReturn } from '@/hooks/useFaucetMutations'
import {
  baseToDusdc,
  mistToSui,
  previewReturn,
} from '@/lib/sui/format'

const EXPLORER = 'https://suiscan.xyz/testnet/tx'

export function ReturnTab() {
  const account = useCurrentAccount()
  const stats = useVaultStats()
  const owned = useOwnedDusdc()
  const ret = useReturn()
  const [amount, setAmount] = useState<bigint>(0n)

  useEffect(() => {
    setAmount(0n)
  }, [account?.address])

  const rateNum = stats.data?.rateNumerator ?? 100
  const rateDen = stats.data?.rateDenominator ?? 1
  const vaultSui = stats.data ? BigInt(stats.data.suiAccumulatedMist) : 0n
  const returnEnabled = stats.data ? stats.data.returnEnabled : true
  const ownedBase = owned.data?.totalBase ?? 0n

  const preview = useMemo(
    () => previewReturn(amount, rateNum, rateDen),
    [amount, rateNum, rateDen],
  )

  let error: string | null = null
  if (amount > ownedBase) error = `You only have ${baseToDusdc(ownedBase)} DUSDC`
  else if (preview > vaultSui && amount > 0n) error = 'Vault does not have enough SUI yet'

  let buttonLabel: string
  let buttonDisabled = false

  if (!account) {
    buttonLabel = 'Connect wallet'
    buttonDisabled = true
  } else if (!returnEnabled) {
    buttonLabel = 'Returns disabled by admin'
    buttonDisabled = true
  } else if (ownedBase === 0n) {
    buttonLabel = 'No DUSDC to return'
    buttonDisabled = true
  } else if (ret.isPending) {
    buttonLabel = 'Returning…'
    buttonDisabled = true
  } else if (amount === 0n || error) {
    buttonLabel = 'Return'
    buttonDisabled = true
  } else {
    buttonLabel = 'Return'
  }

  const onSubmit = async () => {
    if (!account) return
    try {
      const res = await ret.mutateAsync({
        dusdcAmountBase: amount,
        rateNumerator: rateNum,
        rateDenominator: rateDen,
      })
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>{`Returned ${baseToDusdc(amount)} DUSDC for ${mistToSui(res.suiMistOut)} SUI`}</span>
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
      setAmount(0n)
    } catch {
      toast.error('Transaction failed. Check the wallet for details.')
    }
  }

  if (account && ownedBase === 0n && !owned.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Inbox size={28} className="text-white/40" />
        <p className="text-sm text-white/50">
          You have no DUSDC to return. Claim some first.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <AmountInput
        id="return-amount"
        label="You return"
        value={amount}
        onChange={setAmount}
        unit="DUSDC"
        decimals={6}
        max={ownedBase}
        disabled={!account || ownedBase === 0n}
        error={error}
      />

      <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-md px-4 py-3">
        <div className="text-xs text-white/50">You receive</div>
        <div className="mt-1 font-mono text-xl text-white">
          {mistToSui(preview)} <span className="text-sm text-white/50">SUI</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={buttonDisabled}
        className={cnm(
          'h-11 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2',
          'bg-white text-black hover:bg-white/90',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {ret.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
        {buttonLabel}
      </button>

      {account ? (
        <p className="text-xs text-white/50 text-center">
          Balance: {baseToDusdc(ownedBase)} DUSDC
        </p>
      ) : null}
    </div>
  )
}
