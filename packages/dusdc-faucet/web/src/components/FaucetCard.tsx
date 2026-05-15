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
        'rounded-2xl p-6 max-w-[480px] mx-auto w-full',
        'bg-white/5 border border-white/10 backdrop-blur-md',
      )}
    >
      <div
        role="tablist"
        aria-label="Faucet actions"
        className={cnm(
          'grid grid-cols-3 gap-1 p-1 rounded-xl mb-5',
          'bg-white/5 border border-white/10 backdrop-blur-md',
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
                'h-9 rounded-lg text-sm font-medium transition-colors',
                selected
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
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
