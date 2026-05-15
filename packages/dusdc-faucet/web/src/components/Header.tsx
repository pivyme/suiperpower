import { WalletButton } from './WalletButton'
import { cnm } from '@/utils/style'

export function Header() {
  return (
    <header
      className={cnm(
        'sticky top-0 z-30 h-16 w-full',
        'bg-black/40 backdrop-blur-md',
        'border-b border-white/10',
      )}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2 font-mono text-sm text-white">
          DUSDC Faucet
          <span className="inline-flex h-6 items-center border border-white/10 bg-white/5 px-2 text-[11px] text-white/80 backdrop-blur-md">
            testnet
          </span>
        </div>
        <WalletButton />
      </div>
    </header>
  )
}
