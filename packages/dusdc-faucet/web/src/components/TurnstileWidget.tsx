import { Turnstile } from '@marsidev/react-turnstile'
import { env } from '@/env'

export interface TurnstileWidgetProps {
  onToken: (token: string) => void
  onError?: (err?: unknown) => void
}

// Managed Turnstile. Cloudflare decides whether to challenge silently or show
// a checkbox; appearance:'interaction-only' keeps the widget hidden until a
// challenge is actually required. Dashboard widget mode must be Managed for
// this to render correctly.
export function TurnstileWidget({ onToken, onError }: TurnstileWidgetProps) {
  return (
    <Turnstile
      siteKey={env.VITE_TURNSTILE_SITE_KEY}
      options={{ size: 'flexible', theme: 'dark', appearance: 'interaction-only' }}
      onSuccess={onToken}
      onError={onError}
      onExpire={() => onError?.('expired')}
    />
  )
}
