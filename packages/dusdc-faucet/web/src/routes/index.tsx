import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { VaultStats } from '@/components/VaultStats'
import { FaucetCard } from '@/components/FaucetCard'
import { HowItWorks } from '@/components/HowItWorks'
import { GrainBackdrop } from '@/components/GrainBackdrop'
import { WalletButton } from '@/components/WalletButton'
import { DonationPanel } from '@/components/DonationPanel'

export const Route = createFileRoute('/')({ component: IndexPage })

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, filter: 'blur(8px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay, ease: 'easeOut' as const },
})

function IndexPage() {
  return (
    <div className="min-h-screen bg-[#040404] text-white">
      <main className="grid min-h-screen lg:grid-cols-[minmax(0,2.55fr)_minmax(280px,0.58fr)]">
        <section className="relative isolate flex min-h-[620px] items-center justify-center overflow-hidden border-white/10 px-4 py-8 sm:px-6 lg:min-h-screen lg:border-r">
          <GrainBackdrop />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.11),rgba(0,0,0,0.18)_34%,rgba(0,0,0,0.88)_76%)]" />

          <motion.div
            {...fadeIn(0.35)}
            className="absolute bottom-5 left-5 z-10 hidden text-xs leading-5 text-white/42 lg:block"
          >
            Made by{' '}
            <a
              href="https://klvn.dev"
              target="_blank"
              rel="noreferrer"
              className="text-white underline underline-offset-4 hover:text-white/70"
            >
              Kelvin Adithya
            </a>
          </motion.div>

          <motion.div
            {...fadeIn(0.1)}
            className="relative w-full max-w-[540px]"
          >
            <div className="border border-white/15 bg-black/72 shadow-[0_32px_120px_rgba(0,0,0,0.65)] backdrop-blur-xl">
              <div className="p-5">
                <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-mono text-[11px] uppercase text-white/45">
                      DeepBook Predict Testnet
                    </div>
                    <h1 className="mt-1.5 text-3xl font-semibold leading-tight text-white sm:text-[38px]">
                      DUSDC Faucet
                    </h1>
                  </div>
                  <WalletButton />
                </div>
                <FaucetCard />
              </div>
              <VaultStats variant="compact" />
            </div>
          </motion.div>
        </section>

        <aside className="relative border-t border-white/10 bg-[#070707] px-5 py-6 sm:px-8 lg:min-h-screen lg:border-l lg:border-t-0 lg:px-4 lg:py-4 xl:px-5">
          <motion.div {...fadeIn(0.2)} className="mx-auto flex min-h-[calc(100vh-32px)] max-w-sm flex-col justify-between gap-4">
            <div className="flex flex-col justify-center gap-3">
              <section>
                <div className="mb-2 inline-flex border border-white/15 px-2 py-0.5 font-mono text-[10px] uppercase text-white/60">
                  testnet faucet
                </div>
                <h2 className="text-base font-semibold leading-snug text-white xl:text-lg">
                  Swap testnet SUI into DUSDC, then return it.
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-white/58">
                  100 DUSDC per 1 SUI. Caps, returns, and vault balances are
                  enforced on chain.
                </p>
              </section>

              <HowItWorks variant="rail" />

              <section className="border-t border-white/10 pt-2.5 text-xs leading-5 text-white/45">
                <p>
                  Daily cap: 5 SUI per wallet. Transaction cap: 1 SUI. No fees,
                  no spread, no waiting queue.
                </p>
                <p className="mt-2 lg:hidden">
                  Made by{' '}
                  <a
                    href="https://klvn.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white underline underline-offset-4 hover:text-white/70"
                  >
                    Kelvin Adithya
                  </a>
                </p>
              </section>
            </div>

            <DonationPanel />
          </motion.div>
        </aside>
      </main>
    </div>
  )
}
