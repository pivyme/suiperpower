import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { sui } from '@/lib/sui/client'
import { env } from '@/env'

// How much DUSDC the connected wallet may still return on-chain.
// Returns 0 if the wallet has never claimed.
async function readCapacity(wallet: string): Promise<bigint> {
  const tx = new Transaction()
  tx.moveCall({
    target: `${env.VITE_FAUCET_PACKAGE_ID}::faucet::wallet_return_capacity`,
    typeArguments: [env.VITE_DUSDC_COIN_TYPE],
    arguments: [
      tx.object(env.VITE_FAUCET_OBJECT_ID),
      tx.pure.address(wallet),
    ],
  })

  const res = await sui.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: wallet,
  })
  const bytes = res.results?.[0]?.returnValues?.[0]?.[0]
  if (!bytes || bytes.length < 8) return 0n

  // u64 little-endian, BCS-encoded.
  let acc = 0n
  for (let i = 0; i < 8; i++) {
    acc += BigInt(bytes[i]) << BigInt(i * 8)
  }
  return acc
}

export function useReturnCapacity() {
  const account = useCurrentAccount()
  return useQuery({
    queryKey: ['return-capacity', account?.address],
    queryFn: async () => {
      if (!account) return 0n
      return readCapacity(account.address)
    },
    enabled: !!account,
    staleTime: 5_000,
    refetchInterval: 15_000,
  })
}
