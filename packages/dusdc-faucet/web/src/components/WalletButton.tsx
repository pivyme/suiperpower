import { useState } from 'react'
import {
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useWallets,
} from '@mysten/dapp-kit'
import { Wallet, LogOut } from 'lucide-react'
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
            'h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2',
            'border border-neutral-800 bg-neutral-900',
            'hover:bg-neutral-800 transition-colors',
            'font-mono text-neutral-200',
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
              'h-9 px-3 rounded-lg text-xs flex items-center gap-2',
              'border border-neutral-800 bg-neutral-900',
              'hover:bg-neutral-800 transition-colors text-neutral-300',
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
        'h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2',
        'bg-amber-400 text-neutral-950',
        'hover:bg-amber-300 active:bg-amber-500',
        'disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed',
        'transition-colors',
      )}
    >
      <Wallet size={14} />
      {isPending ? 'Connecting…' : 'Connect wallet'}
    </button>
  )
}
