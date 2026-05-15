import { Transaction } from '@mysten/sui/transactions'
import { CLOCK_OBJECT_ID } from './format'
import { env } from '@/env'

export interface BuildClaimArgs {
  suiAmountMist: bigint
}

export function buildClaimTx({ suiAmountMist }: BuildClaimArgs): Transaction {
  const tx = new Transaction()
  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmountMist)])
  tx.moveCall({
    target: `${env.VITE_FAUCET_PACKAGE_ID}::faucet::claim`,
    typeArguments: [env.VITE_DUSDC_COIN_TYPE],
    arguments: [
      tx.object(env.VITE_FAUCET_OBJECT_ID),
      payment,
      tx.object(CLOCK_OBJECT_ID),
    ],
  })
  return tx
}
