import { useEffect, useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ExternalLink, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AmountInput } from './AmountInput'
import { cnm } from '@/utils/style'
import { useOwnedDusdc, useRefill } from '@/hooks/useFaucetMutations'
import { baseToDusdc } from '@/lib/sui/format'

const EXPLORER = 'https://suiscan.xyz/testnet/tx'

export function DonationPanel() {
  const account = useCurrentAccount()
  const owned = useOwnedDusdc()
  const refill = useRefill()
  const [amount, setAmount] = useState<bigint>(0n)

  useEffect(() => {
    setAmount(0n)
  }, [account?.address])

  const ownedBase = owned.data?.totalBase ?? 0n

  let error: string | null = null
  if (amount > ownedBase) {
    error = `You only have ${baseToDusdc(ownedBase)} DUSDC`
  }

  let buttonLabel = 'Refill the vault'
  let buttonDisabled = false
  if (!account) {
    buttonLabel = 'Connect wallet'
    buttonDisabled = true
  } else if (ownedBase === 0n) {
    buttonLabel = 'No DUSDC in wallet'
    buttonDisabled = true
  } else if (refill.isPending) {
    buttonLabel = 'Refilling…'
    buttonDisabled = true
  } else if (amount === 0n || error) {
    buttonDisabled = true
  }

  const onSubmit = async () => {
    if (!account) return
    try {
      const res = await refill.mutateAsync({ dusdcAmountBase: amount })
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>{`Refilled ${baseToDusdc(amount)} DUSDC. Thank you!`}</span>
            <a
              href={`${EXPLORER}/${res.digest}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-white hover:text-white/70"
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

  return (
    <section className="w-full border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-medium text-white">Keep the faucet alive</h3>
          <p className="mt-1 text-[11px] leading-4 text-white/55">
            Anyone can refill. Your DUSDC lands straight in the vault, no
            middleman, and the next builder gets to claim.
          </p>
        </div>
        <span className="border border-white/10 px-2 py-1 font-mono text-[10px] uppercase text-white/45">
          DUSDC
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <AmountInput
          id="donate-amount"
          value={amount}
          onChange={setAmount}
          unit="DUSDC"
          decimals={6}
          max={ownedBase}
          disabled={!account || ownedBase === 0n}
          error={error}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={buttonDisabled}
          className={cnm(
            'flex h-10 items-center justify-center gap-2 text-sm font-medium transition-colors',
            'bg-white text-black hover:bg-white/90',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white',
          )}
        >
          {refill.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          {buttonLabel}
        </button>

        {account ? (
          <p className="text-center text-[11px] text-white/45">
            You hold {baseToDusdc(ownedBase)} DUSDC
          </p>
        ) : (
          <p className="text-center text-[11px] text-white/45">
            Connect a wallet with DUSDC to chip in.
          </p>
        )}
      </div>
    </section>
  )
}
