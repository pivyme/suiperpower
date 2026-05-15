import { cnm } from '@/utils/style'
import { useVaultStats } from '@/hooks/useVaultStats'
import { baseToDusdc } from '@/lib/sui/format'

function StatCard({
  label,
  children,
  sub,
}: {
  label: string
  children: React.ReactNode
  sub?: React.ReactNode
}) {
  return (
    <div
      className={cnm(
        'rounded-2xl border p-5 flex flex-col gap-1.5',
        'border-neutral-200 dark:border-neutral-800',
        'bg-white/60 dark:bg-neutral-900/50',
      )}
    >
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="text-xl md:text-[22px] font-mono font-medium text-neutral-900 dark:text-neutral-50">
        {children}
      </div>
      {sub ? <div className="text-xs text-neutral-500">{sub}</div> : null}
    </div>
  )
}

function Skel({ className }: { className?: string }) {
  return (
    <div
      className={cnm(
        'rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse',
        className,
      )}
    />
  )
}

export function VaultStats() {
  const { data, isLoading, isError } = useVaultStats()

  if (isError) {
    return (
      <div className="text-sm text-neutral-500 text-center py-4">
        Stats unavailable, claim still works.
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cnm(
              'rounded-2xl border p-5 flex flex-col gap-2',
              'border-neutral-200 dark:border-neutral-800',
              'bg-white/60 dark:bg-neutral-900/50',
            )}
          >
            <Skel className="h-3 w-24" />
            <Skel className="h-7 w-32 mt-1" />
            <Skel className="h-3 w-20" />
          </div>
        ))}
      </div>
    )
  }

  const perTxCapBase = BigInt(data.perTxSuiCapMist)
  const lowVault = BigInt(data.dusdcAvailable) > 0n && BigInt(data.dusdcAvailable) < perTxCapBase

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="DUSDC available">
          {baseToDusdc(BigInt(data.dusdcAvailable))}
        </StatCard>
        <StatCard
          label="Served today"
          sub={`${data.claimsTodayCount} claims`}
        >
          {baseToDusdc(BigInt(data.servedTodayDusdc))}
        </StatCard>
        <StatCard label="Rate">
          {data.rateNumerator} DUSDC / {data.rateDenominator} SUI
        </StatCard>
      </div>
      {lowVault ? (
        <div className="text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          Vault running low. Anyone can refill from the Refill tab.
        </div>
      ) : null}
      {!data.isFresh ? (
        <div className="text-[11px] text-neutral-500 text-right">
          Stats from chain
        </div>
      ) : null}
    </div>
  )
}
