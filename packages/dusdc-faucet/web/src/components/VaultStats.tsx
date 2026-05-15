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
        'rounded-2xl p-5 flex flex-col gap-1.5',
        'bg-white/5 border border-white/10 backdrop-blur-md',
      )}
    >
      <div className="text-xs uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="text-xl md:text-[22px] font-mono font-medium text-white">
        {children}
      </div>
      {sub ? <div className="text-xs text-white/50">{sub}</div> : null}
    </div>
  )
}

function Skel({ className }: { className?: string }) {
  return (
    <div
      className={cnm(
        'rounded bg-white/10 animate-pulse',
        className,
      )}
    />
  )
}

export function VaultStats() {
  const { data, isLoading, isError } = useVaultStats()

  if (isError) {
    return (
      <div className="text-sm text-white/50 text-center py-4">
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
              'rounded-2xl p-5 flex flex-col gap-2',
              'bg-white/5 border border-white/10 backdrop-blur-md',
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
        <div className="text-xs text-white/80 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl px-3 py-2">
          Vault running low. Anyone can refill from the Refill tab.
        </div>
      ) : null}
      {!data.isFresh ? (
        <div className="text-[11px] text-white/40 text-right">
          Stats from chain
        </div>
      ) : null}
    </div>
  )
}
