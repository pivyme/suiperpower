import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'

const STORAGE_KEY = 'dusdc-faucet:fp'

export async function getFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    // SSR safety, server has no browser surface; return a stable placeholder.
    return 'ssr-no-fingerprint-available-here-yet'
  }
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (cached && cached.length >= 16) return cached
  } catch {
    // sessionStorage blocked, fall through to compute fresh each call
  }

  const parts: Array<string> = [
    navigator.userAgent,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency || 0),
    String((navigator as { deviceMemory?: number }).deviceMemory || 0),
    String(navigator.language),
  ]

  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(0, 0, 60, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('dusdc-faucet', 2, 15)
      parts.push(canvas.toDataURL().slice(-200))
    }
  } catch {
    // canvas blocked, accept reduced entropy
  }

  const data = new TextEncoder().encode(parts.join('|'))
  const fp = bytesToHex(sha256(data))
  try {
    sessionStorage.setItem(STORAGE_KEY, fp)
  } catch {
    // ignore
  }
  return fp
}
