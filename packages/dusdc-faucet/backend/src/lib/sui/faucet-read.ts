import { sui } from './client.ts';
import { FAUCET_OBJECT_ID } from '../../config/main-config.ts';

export interface FaucetState {
  dusdcAvailable: bigint;
  suiAccumulatedMist: bigint;
  rateNumerator: number;
  rateDenominator: number;
  perTxSuiCapMist: bigint;
  perWalletDailySuiCapMist: bigint;
  paused: boolean;
  returnEnabled: boolean;
  totalServedQuote: bigint;
  totalClaims: bigint;
}

// Sui RPC serializes a Move `Balance<T>` field as a plain numeric string,
// not the nested `{ fields: { value } }` shape the older SDK reported. We
// accept both forms so this keeps working if the RPC encoding flips again.
function readBalance(v: unknown): bigint {
  if (typeof v === 'string' || typeof v === 'number') return BigInt(v);
  if (v && typeof v === 'object') {
    const o = v as { value?: unknown; fields?: { value?: unknown } };
    if (o.fields && (typeof o.fields.value === 'string' || typeof o.fields.value === 'number')) {
      return BigInt(o.fields.value);
    }
    if (typeof o.value === 'string' || typeof o.value === 'number') {
      return BigInt(o.value);
    }
  }
  throw new Error('FAUCET_BALANCE_SHAPE_UNEXPECTED');
}

export async function readFaucetState(): Promise<FaucetState> {
  if (!FAUCET_OBJECT_ID) {
    throw new Error('FAUCET_OBJECT_ID_UNSET');
  }
  const obj = await sui.getObject({
    id: FAUCET_OBJECT_ID,
    options: { showContent: true, showType: true },
  });
  if (obj.data?.content?.dataType !== 'moveObject') {
    throw new Error('FAUCET_OBJECT_NOT_FOUND');
  }
  const f = obj.data.content.fields as Record<string, unknown>;
  return {
    dusdcAvailable: readBalance(f.quote_balance),
    suiAccumulatedMist: readBalance(f.sui_balance),
    rateNumerator: Number(f.rate_numerator),
    rateDenominator: Number(f.rate_denominator),
    perTxSuiCapMist: BigInt(f.per_tx_sui_cap_mist as string),
    perWalletDailySuiCapMist: BigInt(f.per_wallet_daily_sui_cap_mist as string),
    paused: f.paused === true,
    returnEnabled: f.return_enabled === true,
    totalServedQuote: BigInt(f.total_served_quote as string),
    totalClaims: BigInt(f.total_claims as string),
  };
}
