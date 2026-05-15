import { useState } from 'react'
import {
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useWallets,
} from '@mysten/dapp-kit'
import { LogOut, Wallet } from 'lucide-react'
import { cnm } from '@/utils/style'
import { shortAddr } from '@/lib/sui/format'

// Lightweight wallet button. Picks the first detected wallet on connect; if
// none are installed, opens the Sui Wallet page in a new tab.
export function WalletButton() {
  const account = useCurrentAccount()
  const wallets = useWallets()
  const { mutate: connect, isPending } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const [open, setOpen] = useState(false)

  if (account) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cnm(
            'h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2',
            'bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md',
            'font-mono text-white transition-colors',
          )}
        >
          <Wallet size={14} />
          {shortAddr(account.address, 6, 4)}
        </button>
        {open ? (
          <button
            type="button"
            onClick={() => {
              disconnect()
              setOpen(false)
            }}
            className={cnm(
              'absolute right-0 mt-2 z-10',
              'h-9 px-3 rounded-xl text-xs flex items-center gap-2',
              'bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md',
              'text-white/80 transition-colors',
            )}
          >
            <LogOut size={12} />
            Disconnect
          </button>
        ) : null}
      </div>
    )
  }

  const handleConnect = () => {
    if (wallets.length === 0) {
      window.open('https://suiwallet.com/', '_blank', 'noopener')
      return
    }
    connect({ wallet: wallets[0] })
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isPending}
      className={cnm(
        'h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2',
        'bg-white text-black',
        'hover:bg-white/90',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'transition-colors',
      )}
    >
      <Wallet size={14} />
      {isPending ? 'Connecting…' : 'Connect wallet'}
    </button>
  )
}
