import { useCallback, useState } from 'react'

export interface UseTurnstileResult {
  token: string | null
  ready: boolean
  error: string | null
  onToken: (t: string) => void
  onError: (e?: unknown) => void
  reset: () => void
}

// Lightweight state shell around the Turnstile widget. Component wires
// onToken/onError/reset into the underlying widget callbacks.
export function useTurnstile(): UseTurnstileResult {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onToken = useCallback((t: string) => {
    setToken(t)
    setError(null)
  }, [])

  const onError = useCallback((_e?: unknown) => {
    setError('turnstile_error')
    setToken(null)
  }, [])

  const reset = useCallback(() => {
    setToken(null)
    setError(null)
  }, [])

  return { token, ready: !!token, error, onToken, onError, reset }
}
