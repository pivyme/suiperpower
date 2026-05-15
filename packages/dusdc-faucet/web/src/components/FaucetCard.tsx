import { useState } from 'react'
import { ClaimTab } from './ClaimTab'
import { ReturnTab } from './ReturnTab'
import { cnm } from '@/utils/style'

type Tab = 'claim' | 'return'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'claim', label: 'Get DUSDC' },
  { id: 'return', label: 'Return DUSDC' },
]

export function FaucetCard() {
  const [active, setActive] = useState<Tab>('claim')
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div
        role="tablist"
        aria-label="Faucet actions"
        className={cnm(
          'mb-5 grid grid-cols-2 border border-white/12 bg-white/[0.03]',
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
                'h-10 border-r border-white/10 text-sm font-medium transition-colors last:border-r-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-white/70',
                selected
                  ? 'bg-white text-black'
                  : 'text-white/48 hover:bg-white/[0.06] hover:text-white',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {active === 'claim' ? <ClaimTab /> : null}
      {active === 'return' ? <ReturnTab /> : null}
    </div>
  )
}
