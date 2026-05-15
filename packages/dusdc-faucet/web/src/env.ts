import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z.string().url(),
    VITE_SUI_NETWORK: z.literal('testnet'),
    VITE_SUI_RPC_URL: z.string().url(),
    VITE_FAUCET_PACKAGE_ID: z.string().min(1),
    VITE_FAUCET_OBJECT_ID: z.string().min(1),
    VITE_DUSDC_COIN_TYPE: z.string().min(1),
    VITE_TURNSTILE_SITE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SUI_NETWORK: import.meta.env.VITE_SUI_NETWORK,
    VITE_SUI_RPC_URL: import.meta.env.VITE_SUI_RPC_URL,
    VITE_FAUCET_PACKAGE_ID: import.meta.env.VITE_FAUCET_PACKAGE_ID,
    VITE_FAUCET_OBJECT_ID: import.meta.env.VITE_FAUCET_OBJECT_ID,
    VITE_DUSDC_COIN_TYPE: import.meta.env.VITE_DUSDC_COIN_TYPE,
    VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  },
  emptyStringAsUndefined: true,
})
