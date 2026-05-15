import { Transaction } from '@mysten/sui/transactions'
import { env } from '@/env'
import type { OwnerCoin } from './ptb-return'

export interface BuildRefillArgs {
  dusdcAmountBase: bigint
  ownerCoins: OwnerCoin[]
}

export function buildRefillTx({
  dusdcAmountBase,
  ownerCoins,
}: BuildRefillArgs): Transaction {
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
  const [deposit] = tx.splitCoins(primary, [tx.pure.u64(dusdcAmountBase)])
  tx.moveCall({
    target: `${env.VITE_FAUCET_PACKAGE_ID}::faucet::refill`,
    typeArguments: [env.VITE_DUSDC_COIN_TYPE],
    arguments: [tx.object(env.VITE_FAUCET_OBJECT_ID), deposit],
  })
  return tx
}
