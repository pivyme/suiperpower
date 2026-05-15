import { Transaction } from '@mysten/sui/transactions'
import { env } from '@/env'
import { CLOCK_OBJECT_ID } from './format'

export interface OwnerCoin {
  coinObjectId: string
  balance: string
}

export interface BuildReturnArgs {
  dusdcAmountBase: bigint
  ownerCoins: OwnerCoin[]
}

export function buildReturnTx({
  dusdcAmountBase,
  ownerCoins,
}: BuildReturnArgs): Transaction {
  if (ownerCoins.length === 0) {
    throw new Error('NO_DUSDC_COINS')
  }
  const tx = new Transaction()
  const primary = tx.object(ownerCoins[0].coinObjectId)
  if (ownerCoins.length > 1) {
    tx.mergeCoins(
      primary,
      ownerCoins.slice(1).map((c) => tx.object(c.coinObjectId)),
    )
  }
  const [payment] = tx.splitCoins(primary, [tx.pure.u64(dusdcAmountBase)])
  tx.moveCall({
    target: `${env.VITE_FAUCET_PACKAGE_ID}::faucet::return_quote`,
    typeArguments: [env.VITE_DUSDC_COIN_TYPE],
    arguments: [
      tx.object(env.VITE_FAUCET_OBJECT_ID),
      payment,
      tx.object(CLOCK_OBJECT_ID),
    ],
  })
  return tx
}
