import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { env } from '@/env'

export const sui = new SuiClient({
  url: env.VITE_SUI_RPC_URL || getFullnodeUrl('testnet'),
})
