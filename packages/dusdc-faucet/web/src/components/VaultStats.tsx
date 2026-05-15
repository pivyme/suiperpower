import { cnm } from '@/utils/style'
import { useVaultStats } from '@/hooks/useVaultStats'
import { baseToDusdc } from '@/lib/sui/format'

function formatGroupedAmount(value: string): string {
  const [whole, fraction = ''] = value.split('.')
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const shortFraction = fraction.slice(0, 2).replace(/0+$/, '')
  return shortFraction ? `${groupedWhole}.${shortFraction}` : groupedWhole
}

function formatDusdcStat(base: bigint): string {
  return formatGroupedAmount(baseToDusdc(base))
}

function StatCard({
  label,
  children,
  sub,
  variant = 'grid',
}: {
  label: string
  children: React.ReactNode
  sub?: React.ReactNode
  variant?: 'grid' | 'rail' | 'compact'
}) {
  if (variant === 'rail') {
    return (
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border border-white/10 bg-white/[0.035] px-3 py-2 backdrop-blur-md">
        <div className="text-[11px] uppercase tracking-wide text-white/45">
          {label}
        </div>
        <div className="text-right font-mono text-sm font-medium text-white">
          {children}
        </div>
        {sub ? (
          <div className="col-span-2 text-[11px] text-white/45">{sub}</div>
        ) : null}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="min-w-0 whitespace-nowrap border-r border-white/10 px-3 py-2 last:border-r-0">
        <span className="mr-2 text-[10px] uppercase tracking-wide text-white/38">
          {label}
        </span>
        <span className="font-mono text-xs font-medium text-white">
          {children}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cnm(
        'flex flex-col gap-1.5 border border-white/10 bg-white/[0.035] backdrop-blur-md',
        'p-5',
      )}
    >
      <div className="text-xs uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="font-mono text-xl font-medium text-white md:text-[22px]">
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
        'animate-pulse bg-white/10',
        className,
      )}
    />
  )
}

export function VaultStats({ variant = 'grid' }: { variant?: 'grid' | 'rail' | 'compact' }) {
  const { data, isLoading, isError } = useVaultStats()

  if (isError) {
    return (
      <div className="border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm text-white/58 backdrop-blur-md">
        Stats unavailable, claim still works.
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div
        className={cnm(
          'grid',
          variant === 'rail'
            ? 'grid-cols-1 gap-2'
            : variant === 'compact'
              ? 'grid-cols-3 border-t border-white/10 bg-white/[0.035]'
              : 'grid-cols-1 gap-3 md:grid-cols-3',
        )}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cnm(
              'flex flex-col gap-2 border border-white/10 bg-white/[0.035] backdrop-blur-md',
              variant === 'rail' ? 'p-3' : variant === 'compact' ? 'border-0 p-2' : 'p-5',
            )}
          >
            <Skel className="h-2.5 w-16" />
            <Skel className={cnm('mt-1 w-20', variant === 'compact' || variant === 'rail' ? 'h-4' : 'h-7')} />
            {variant === 'rail' || variant === 'compact' ? null : <Skel className="h-3 w-20" />}
          </div>
        ))}
      </div>
    )
  }

  const perTxCapBase = BigInt(data.perTxSuiCapMist)
  const lowVault = BigInt(data.dusdcAvailable) > 0n && BigInt(data.dusdcAvailable) < perTxCapBase

  return (
    <div className={cnm('flex flex-col', variant === 'rail' || variant === 'compact' ? 'gap-2' : 'gap-3')}>
      <div
        className={cnm(
          'grid',
          variant === 'rail'
            ? 'grid-cols-1 gap-2'
            : variant === 'compact'
              ? 'grid-cols-3 border-t border-white/10 bg-white/[0.035]'
              : 'grid-cols-1 gap-3 md:grid-cols-3',
        )}
      >
        <StatCard label={variant === 'compact' ? 'DUSDC' : 'DUSDC available'} variant={variant}>
          {formatDusdcStat(BigInt(data.dusdcAvailable))}
        </StatCard>
        <StatCard
          label={variant === 'compact' ? 'Today' : 'Served today'}
          sub={`${data.claimsTodayCount} claims`}
          variant={variant}
        >
          {formatDusdcStat(BigInt(data.servedTodayDusdc))}
        </StatCard>
        <StatCard label="Rate" variant={variant}>
          {variant === 'compact'
            ? `${data.rateNumerator}:${data.rateDenominator}`
            : `${data.rateNumerator} DUSDC / ${data.rateDenominator} SUI`}
        </StatCard>
      </div>
      {lowVault ? (
        <div className="border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white/80 backdrop-blur-md">
          Vault running low. Please donate dUSDC from the donate panel if you can spare some.
        </div>
      ) : null}
      {!data.isFresh && variant !== 'compact' ? (
        <div className="text-[11px] text-white/40 text-right">
          Stats from chain
        </div>
      ) : null}
    </div>
  )
}
