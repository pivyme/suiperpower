import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { HeroBlock } from '@/components/HeroBlock'
import { VaultStats } from '@/components/VaultStats'
import { FaucetCard } from '@/components/FaucetCard'
import { HowItWorks } from '@/components/HowItWorks'
import { Credit } from '@/components/Credit'

export const Route = createFileRoute('/')({ component: IndexPage })

function IndexPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6">
        <HeroBlock />
        <div className="mb-10">
          <VaultStats />
        </div>
        <FaucetCard />
        <HowItWorks />
      </main>
      <Credit />
    </div>
  )
}
