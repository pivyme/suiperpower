import { sui } from './client'
import { env } from '@/env'

export interface FaucetState {
  dusdcAvailable: bigint
  suiAccumulatedMist: bigint
  rateNumerator: number
  rateDenominator: number
  perTxSuiCapMist: bigint
  perWalletDailySuiCapMist: bigint
  paused: boolean
  returnEnabled: boolean
  totalServedQuote: bigint
  totalClaims: bigint
}

// Sui RPC returns Move `Balance<T>` fields as plain numeric strings, but
// older SDK versions wrapped them as `{ fields: { value } }`. Accept both.
function readBalance(v: unknown): bigint {
  if (typeof v === 'string' || typeof v === 'number') return BigInt(v)
  if (v && typeof v === 'object') {
    const o = v as { value?: unknown; fields?: { value?: unknown } }
    if (o.fields && (typeof o.fields.value === 'string' || typeof o.fields.value === 'number')) {
      return BigInt(o.fields.value)
    }
    if (typeof o.value === 'string' || typeof o.value === 'number') {
      return BigInt(o.value)
    }
  }
  throw new Error('FAUCET_BALANCE_SHAPE_UNEXPECTED')
}

// Mirrors backend/src/lib/sui/faucet-read.ts. Frontend uses it as a
// chain-only fallback when /faucet/stats is unavailable.
export async function readFaucetState(): Promise<FaucetState> {
  const id = env.VITE_FAUCET_OBJECT_ID
  if (!id) throw new Error('FAUCET_OBJECT_ID_UNSET')
  const obj = await sui.getObject({
    id,
    options: { showContent: true, showType: true },
  })
  if (obj.data?.content?.dataType !== 'moveObject') {
    throw new Error('FAUCET_OBJECT_NOT_FOUND')
  }
  const f = obj.data.content.fields as Record<string, unknown>
  return {
    dusdcAvailable: readBalance(f.quote_balance),
    suiAccumulatedMist: readBalance(f.sui_balance),
    rateNumerator: Number(f.rate_numerator),
    rateDenominator: Number(f.rate_denominator),
    perTxSuiCapMist: BigInt(f.per_tx_sui_cap_mist as string),
    perWalletDailySuiCapMist: BigInt(
      f.per_wallet_daily_sui_cap_mist as string,
    ),
    paused: f.paused === true,
    returnEnabled: f.return_enabled === true,
    totalServedQuote: BigInt(f.total_served_quote as string),
    totalClaims: BigInt(f.total_claims as string),
  }
}

// Fetch all owned DUSDC coins for a given address (for return + refill).
export async function getOwnedDusdcCoins(owner: string): Promise<
  Array<{ coinObjectId: string; balance: string }>
> {
  const out: Array<{ coinObjectId: string; balance: string }> = []
  let cursor: string | null | undefined
  do {
    const page = await sui.getCoins({
      owner,
      coinType: env.VITE_DUSDC_COIN_TYPE,
      cursor: cursor ?? undefined,
    })
    for (const c of page.data) {
      out.push({ coinObjectId: c.coinObjectId, balance: c.balance })
    }
    cursor = page.hasNextPage ? page.nextCursor : null
  } while (cursor)
  return out
}
