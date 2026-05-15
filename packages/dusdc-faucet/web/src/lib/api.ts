import { env } from '@/env'

const BASE = env.VITE_API_URL.replace(/\/$/, '')

interface Envelope<T> {
  success: boolean
  error: { code: string; message: string } | null
  data: T
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const json = (await res.json()) as Envelope<T>
  if (!json.success || json.error) {
    throw new ApiError(
      json.error?.code ?? 'API_ERROR',
      json.error?.message ?? `request to ${path} failed`,
      res.status,
    )
  }
  return json.data
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Vault stats. Mirrors the shape from bigdev/plans/02-BACKEND.md.
export interface VaultStatsResponse {
  dusdcAvailable: string
  dusdcAvailableHuman: number
  suiAccumulatedMist: string
  rateNumerator: number
  rateDenominator: number
  perTxSuiCapMist: string
  perWalletDailySuiCapMist: string
  paused: boolean
  returnEnabled: boolean
  servedTodayDusdc: string
  servedTotalDusdc: string
  claimsTodayCount: number
  capturedAt: string
  isFresh: boolean
}

export function getStats(): Promise<VaultStatsResponse> {
  return call<VaultStatsResponse>('/faucet/stats')
}

// tx-hint, remaining daily quota for a wallet.
export interface TxHintResponse {
  walletAddress: string
  remainingMist: string
  remainingHuman: number
  perWalletDailyCapMist: string
  consumedTodayMist: string
  utcDay?: number
}

export function getTxHint(addr: string): Promise<TxHintResponse> {
  return call<TxHintResponse>(`/faucet/tx-hint/${addr}`)
}

// verify, pre-claim gate.
export interface VerifyRequest {
  walletAddress: string
  turnstileToken: string
  fingerprint: string
  requestedSuiMist: number
}

export type VerifyDeny =
  | 'TURNSTILE_FAILED'
  | 'IP_LIMIT'
  | 'FP_LIMIT'
  | 'WALLET_LIMIT'
  | 'PAUSED'
  | 'AMOUNT_OVER_CAP'

export type VerifyResponse =
  | { allowed: true; remainingDailyMist: number; nonce: string }
  | { allowed: false; reason: VerifyDeny; remainingDailyMist: number }

export function postVerify(body: VerifyRequest): Promise<VerifyResponse> {
  return call<VerifyResponse>('/faucet/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// claim event ingestion (idempotent).
export interface ClaimEventBody {
  txDigest: string
  walletAddress: string
  suiMist: number
  dusdcBaseUnit: number
  fingerprint?: string
}

export function postClaimEvent(body: ClaimEventBody): Promise<{ recorded: boolean }> {
  return call<{ recorded: boolean }>('/faucet/event/claim', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
