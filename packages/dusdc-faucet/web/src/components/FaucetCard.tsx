import { useState } from 'react'
import { ClaimTab } from './ClaimTab'
import { ReturnTab } from './ReturnTab'
import { RefillTab } from './RefillTab'
import { cnm } from '@/utils/style'

type Tab = 'claim' | 'return' | 'refill'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'claim', label: 'Get DUSDC' },
  { id: 'return', label: 'Return DUSDC' },
  { id: 'refill', label: 'Refill' },
]

export function FaucetCard() {
  const [active, setActive] = useState<Tab>('claim')
  return (
    <div
      className={cnm(
        'rounded-2xl border p-6 max-w-[480px] mx-auto w-full',
        'border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900',
      )}
    >
      <div
        role="tablist"
        aria-label="Faucet actions"
        className={cnm(
          'grid grid-cols-3 gap-1 p-1 rounded-lg mb-5',
          'bg-neutral-100 dark:bg-neutral-950',
          'border border-neutral-200 dark:border-neutral-800',
        )}
      >
        {TABS.map((t) => {
          const selected = active === t.id
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(t.id)}
              className={cnm(
                'h-9 rounded-md text-sm font-medium transition-colors',
                selected
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {active === 'claim' ? <ClaimTab /> : null}
      {active === 'return' ? <ReturnTab /> : null}
      {active === 'refill' ? <RefillTab /> : null}
    </div>
  )
}
