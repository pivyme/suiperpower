// Unit conversion for the two coins this page touches.
// SUI uses 9 decimals (MIST). Test DUSDC and real DUSDC both use 6 decimals.

export const SUI_DECIMALS = 9
export const DUSDC_DECIMALS = 6

const SUI_BASE = 10n ** BigInt(SUI_DECIMALS)
const DUSDC_BASE = 10n ** BigInt(DUSDC_DECIMALS)

// Parse a user-typed decimal string into base units.
// Tolerant of empty input (returns 0n) and trailing zeros.
export function parseDecimal(input: string, decimals: number): bigint {
  const trimmed = input.trim()
  if (!trimmed) return 0n
  if (!/^\d*\.?\d*$/.test(trimmed)) {
    throw new Error('PARSE_DECIMAL_INVALID')
  }
  const [whole = '0', frac = ''] = trimmed.split('.')
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  const all = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, '')
  return BigInt(all || '0')
}

// Format a bigint base unit to a human decimal string with trailing zeros trimmed.
export function formatDecimal(
  value: bigint,
  decimals: number,
  trimTrailingZeros = true,
): string {
  const base = 10n ** BigInt(decimals)
  const sign = value < 0n ? '-' : ''
  const abs = value < 0n ? -value : value
  const whole = abs / base
  const frac = (abs % base).toString().padStart(decimals, '0')
  const fracOut = trimTrailingZeros ? frac.replace(/0+$/, '') : frac
  return fracOut ? `${sign}${whole}.${fracOut}` : `${sign}${whole}`
}

// SUI <-> MIST
export function suiToMist(input: string): bigint {
  return parseDecimal(input, SUI_DECIMALS)
}
export function mistToSui(mist: bigint, trim = true): string {
  return formatDecimal(mist, SUI_DECIMALS, trim)
}

// DUSDC <-> base
export function dusdcToBase(input: string): bigint {
  return parseDecimal(input, DUSDC_DECIMALS)
}
export function baseToDusdc(base: bigint, trim = true): string {
  return formatDecimal(base, DUSDC_DECIMALS, trim)
}

// Shorten 0xabcdef…1234 for header chips.
export function shortAddr(addr: string, head = 6, tail = 4): string {
  if (!addr.startsWith('0x') || addr.length <= head + tail + 2) return addr
  return `${addr.slice(0, head + 2)}…${addr.slice(-tail)}`
}

export const SUI_TYPE = '0x2::sui::SUI'
export const CLOCK_OBJECT_ID = '0x6'

// Compute DUSDC out for a given SUI input using on-chain rate.
export function previewClaim(
  suiMist: bigint,
  rateNum: number,
  rateDen: number,
): bigint {
  if (rateDen === 0) return 0n
  // dusdc_out_base = sui_mist * rateNum * 10^DUSDC_DECIMALS / (rateDen * 10^SUI_DECIMALS)
  const num = suiMist * BigInt(rateNum) * DUSDC_BASE
  const den = BigInt(rateDen) * SUI_BASE
  return num / den
}

// Compute SUI out for a given DUSDC input using on-chain rate.
export function previewReturn(
  dusdcBase: bigint,
  rateNum: number,
  rateDen: number,
): bigint {
  if (rateNum === 0) return 0n
  const num = dusdcBase * BigInt(rateDen) * SUI_BASE
  const den = BigInt(rateNum) * DUSDC_BASE
  return num / den
}
