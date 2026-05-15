const ITEMS: Array<{ title: string; body: string }> = [
  {
    title: 'Claim in one transaction',
    body: 'Connect a testnet wallet, type the amount of SUI you want to trade, sign one transaction. DUSDC arrives in five seconds.',
  },
  {
    title: 'Caps live on chain',
    body: 'Daily cap is 5 SUI per wallet. Per-transaction cap is 1 SUI. Caps live on-chain and apply even if this site goes down.',
  },
  {
    title: 'Refill is permissionless',
    body: 'Anyone can top up the vault. Returns swap DUSDC back to SUI at the same rate. No fees, no spread.',
  },
]

export function HowItWorks() {
  return (
    <section className="mt-16 max-w-[880px] mx-auto">
      <h2 className="text-base font-medium text-white/80 mb-4 text-center">
        How it works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ITEMS.map((it) => (
          <div
            key={it.title}
            className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5"
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
