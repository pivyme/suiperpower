import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Header } from '@/components/Header'
import { HeroBlock } from '@/components/HeroBlock'
import { VaultStats } from '@/components/VaultStats'
import { FaucetCard } from '@/components/FaucetCard'
import { HowItWorks } from '@/components/HowItWorks'
import { Credit } from '@/components/Credit'
import { GrainBackdrop } from '@/components/GrainBackdrop'

export const Route = createFileRoute('/')({ component: IndexPage })

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, filter: 'blur(8px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay, ease: 'easeOut' as const },
})

function IndexPage() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <GrainBackdrop />
      <Header />
      <main className="relative mx-auto max-w-3xl px-6 pb-24">
        <motion.div {...fadeIn(0.1)}>
          <HeroBlock />
        </motion.div>
        <motion.div {...fadeIn(0.3)} className="mb-10">
          <VaultStats />
        </motion.div>
        <motion.div {...fadeIn(0.4)}>
          <FaucetCard />
        </motion.div>
        <motion.div {...fadeIn(0.5)}>
          <HowItWorks />
        </motion.div>
      </main>
      <motion.div {...fadeIn(0.6)}>
        <Credit />
      </motion.div>
    </div>
  )
}
