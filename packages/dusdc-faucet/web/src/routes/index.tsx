import { createFileRoute } from '@tanstack/react-router'
import { Credit } from '@/components/Credit'

export const Route = createFileRoute('/')({ component: IndexPage })

function IndexPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <h1 className="text-4xl font-semibold">DUSDC Faucet</h1>
        <p className="mt-3 text-neutral-400 text-lg">
          Trade testnet SUI for DUSDC at 100 to 1. Swap back any time. No form,
          no waiting.
        </p>
      </main>
      <Credit />
    </div>
  )
}
