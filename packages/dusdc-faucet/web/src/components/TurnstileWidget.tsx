import { Turnstile } from '@marsidev/react-turnstile'
import { env } from '@/env'

export interface TurnstileWidgetProps {
  onToken: (token: string) => void
  onError?: (err?: unknown) => void
}

// Invisible Turnstile by default. The widget auto-runs and fires onToken once
// Cloudflare returns a valid response. Site key 1x00000000000000000000AA
// (always-pass) is the recommended dev value.
export function TurnstileWidget({ onToken, onError }: TurnstileWidgetProps) {
  return (
    <Turnstile
      siteKey={env.VITE_TURNSTILE_SITE_KEY}
      options={{ size: 'invisible', theme: 'dark', appearance: 'interaction-only' }}
      onSuccess={onToken}
      onError={onError}
      onExpire={() => onError?.('expired')}
    />
  )
}
