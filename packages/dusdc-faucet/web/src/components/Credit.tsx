import { env } from '@/env'

export function Credit() {
  const network = env.VITE_SUI_NETWORK
  const pkg = env.VITE_FAUCET_PACKAGE_ID
  const suiscanPkg = `https://suiscan.xyz/${network}/object/${pkg}`

  return (
    <footer className="relative py-12 text-center text-sm text-white/50">
      <div>
        made by{' '}
        <a
          href="https://klvn.dev"
          target="_blank"
          rel="noreferrer"
          className="text-white underline-offset-4 hover:underline"
        >
          Kelvin Adithya
        </a>
      </div>
      <div className="mt-2 text-xs text-white/40">
        <a
          href={suiscanPkg}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/70 hover:underline underline-offset-4"
        >
          contract on Suiscan
        </a>
      </div>
    </footer>
  )
}
