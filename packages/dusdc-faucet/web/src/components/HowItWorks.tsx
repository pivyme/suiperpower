const ITEMS: Array<{ title: string; body: string }> = [
  {
    title: 'Claim in one transaction',
    body: 'Connect, enter SUI, sign once. DUSDC lands in seconds.',
  },
  {
    title: 'Caps live on chain',
    body: '5 SUI daily per wallet. 1 SUI per transaction.',
  },
  {
    title: 'Refill if you can :)',
    body: 'Got spare DUSDC? Drop it back into the vault below and keep the faucet alive for the next builder.',
  },
]

export function HowItWorks({ variant = 'grid' }: { variant?: 'grid' | 'rail' }) {
  if (variant === 'rail') {
    return (
      <section>
        <h3 className="mb-1.5 font-mono text-[10px] uppercase text-white/45">
          How it works
        </h3>
        <div className="divide-y divide-white/10 border border-white/10 bg-white/[0.03]">
          {ITEMS.map((it, index) => (
            <div key={it.title} className="grid grid-cols-[22px_1fr] gap-2 p-2">
              <div className="font-mono text-[11px] text-white/35">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <h4 className="text-xs font-medium text-white">{it.title}</h4>
                <p className="mt-0.5 text-[11px] leading-4 text-white/52">
                  {it.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mt-16 max-w-[880px] mx-auto">
      <h2 className="text-base font-medium text-white/80 mb-4 text-center">
        How it works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ITEMS.map((it) => (
          <div
            key={it.title}
            className="border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md"
          >
            <h3 className="text-sm font-medium text-white">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
