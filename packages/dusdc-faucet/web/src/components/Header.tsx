import { Moon, Sun } from 'lucide-react'
import { WalletButton } from './WalletButton'
import { useTheme } from '@/providers/ThemeProvider'
import { cnm } from '@/utils/style'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  return (
    <header
      className={cnm(
        'sticky top-0 z-30 h-16 w-full',
        'bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur',
        'border-b border-neutral-200 dark:border-neutral-800',
      )}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2 font-mono text-sm text-neutral-900 dark:text-neutral-100">
          DUSDC Faucet
          <span
            className={cnm(
              'inline-flex h-6 items-center rounded-full border px-2 text-[11px]',
              'border-amber-400/30 bg-amber-400/10 text-amber-300',
            )}
          >
            testnet
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cnm(
              'h-10 w-10 rounded-lg flex items-center justify-center',
              'border border-neutral-200 dark:border-neutral-800',
              'bg-white dark:bg-neutral-900',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
            )}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
