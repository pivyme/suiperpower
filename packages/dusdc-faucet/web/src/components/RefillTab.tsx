import { useEffect, useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ExternalLink, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AmountInput } from './AmountInput'
import { cnm } from '@/utils/style'
import { useOwnedDusdc, useRefill } from '@/hooks/useFaucetMutations'
import { baseToDusdc } from '@/lib/sui/format'

const EXPLORER = 'https://suiscan.xyz/testnet/tx'

export function RefillTab() {
  const account = useCurrentAccount()
  const owned = useOwnedDusdc()
  const refill = useRefill()
  const [amount, setAmount] = useState<bigint>(100_000_000n) // 100 DUSDC

  useEffect(() => {
    setAmount(100_000_000n)
  }, [account?.address])

  const ownedBase = owned.data?.totalBase ?? 0n

  let error: string | null = null
  if (amount > ownedBase && account) error = `You only have ${baseToDusdc(ownedBase)} DUSDC`

  let buttonLabel: string
  let buttonDisabled = false
  if (!account) {
    buttonLabel = 'Connect wallet'
    buttonDisabled = true
  } else if (ownedBase === 0n) {
    buttonLabel = 'No DUSDC to deposit'
    buttonDisabled = true
  } else if (refill.isPending) {
    buttonLabel = 'Refilling…'
    buttonDisabled = true
  } else if (amount === 0n || error) {
    buttonLabel = 'Top up vault'
    buttonDisabled = true
  } else {
    buttonLabel = 'Top up vault'
  }

  const onSubmit = async () => {
    if (!account) return
    try {
      const res = await refill.mutateAsync({ dusdcAmountBase: amount })
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>{`Topped up the vault with ${baseToDusdc(res.dusdcAmountBase)} DUSDC. Thanks.`}</span>
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
    } catch {
      toast.error('Transaction failed. Check the wallet for details.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-400">
        Anyone can refill. Recommended balance is 1,000 DUSDC or more.
      </p>

      <AmountInput
        id="refill-amount"
        label="You deposit"
        value={amount}
        onChange={setAmount}
        unit="DUSDC"
        decimals={6}
        max={ownedBase > 0n ? ownedBase : undefined}
        disabled={!account}
        error={error}
      />

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
        {refill.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
        {buttonLabel}
      </button>

      {account ? (
        <p className="text-xs text-neutral-500 text-center">
          Your balance: {baseToDusdc(ownedBase)} DUSDC
        </p>
      ) : null}
    </div>
  )
}
