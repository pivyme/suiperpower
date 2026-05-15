import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { env } from '@/env'

const networks = {
  testnet: { url: env.VITE_SUI_RPC_URL || getFullnodeUrl('testnet') },
}

export function SuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider autoConnect>{children}</WalletProvider>
    </SuiClientProvider>
  )
}
