import { TURNSTILE_SECRET } from '../config/main-config.ts';

export interface TurnstileResult {
  success: boolean;
  errorCode?: 'TIMEOUT' | 'INVALID_TOKEN' | 'NO_SECRET' | 'NETWORK';
}

// Thin wrapper so tests can stub the network call.
export type FetchLike = (
  url: string,
  init?: RequestInit
) => Promise<Response>;

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
  fetchImpl: FetchLike = fetch
): Promise<TurnstileResult> {
  if (!TURNSTILE_SECRET) {
    console.warn('[Turnstile] TURNSTILE_SECRET unset, auto-approving (dev mode)');
    return { success: true, errorCode: 'NO_SECRET' };
  }

  const params = new URLSearchParams();
  params.set('secret', TURNSTILE_SECRET);
  params.set('response', token);
  if (remoteIp) params.set('remoteip', remoteIp);

  try {
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { success: boolean };
    return {
      success: json.success,
      errorCode: json.success ? undefined : 'INVALID_TOKEN',
    };
  } catch {
    return { success: false, errorCode: 'NETWORK' };
  }
}
