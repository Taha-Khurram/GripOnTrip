/**
 * Pure auth helpers — no native, Supabase, or env imports, so they can be unit
 * tested in isolation. `api.ts` re-exports these for a single import surface.
 */

/**
 * Normalize an email for auth: trim surrounding whitespace and lowercase it.
 * Prevents duplicate-case accounts (`Jane@x.com` vs `jane@x.com`) and strips
 * accidental leading/trailing spaces from autofill/paste. Defense-in-depth —
 * the zod schemas do this too, but direct API callers get it for free.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Turn a raw Supabase auth error message into something user-facing. */
export function friendlyAuthError(message?: string): string {
  if (!message) return 'Something went wrong. Please try again.';
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email, then sign in.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'An account with that email already exists.';
  if (m.includes('for security purposes') || m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('password') && m.includes('should be'))
    return 'Please choose a stronger password.';
  if (m.includes('network') || m.includes('failed to fetch'))
    return 'Network error. Check your connection and try again.';
  return message;
}

/**
 * Outcome of an OAuth redirect URL, parsed without any native dependency so it
 * can be unit-tested in isolation.
 *
 * - `code`   — PKCE authorization code (the secure, expected path).
 * - `tokens` — implicit-flow tokens in the URL fragment (legacy fallback).
 * - `error`  — the provider/Supabase reported a failure.
 * - `none`   — nothing actionable in the URL.
 */
export type AuthRedirect =
  | { kind: 'code'; code: string }
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'error'; message: string }
  | { kind: 'none' };

/**
 * Parse the redirect URL returned by the OAuth browser session.
 *
 * Security: when `expectedScheme` is provided, a URL that doesn't use our app's
 * scheme is rejected outright — the app only trusts a redirect back to itself,
 * never an arbitrary host injected into the browser result.
 */
export function parseAuthRedirect(rawUrl: string, expectedScheme?: string): AuthRedirect {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { kind: 'error', message: 'Google sign-in returned an invalid response.' };
  }

  if (expectedScheme && url.protocol.replace(/:$/, '') !== expectedScheme) {
    return { kind: 'error', message: 'Google sign-in returned an unexpected redirect.' };
  }

  const q = url.searchParams;
  const queryError = q.get('error_description') || q.get('error');
  if (queryError) return { kind: 'error', message: queryError };

  const code = q.get('code');
  if (code) return { kind: 'code', code };

  // PKCE returns `?code=…`; older/implicit configs return tokens in the fragment.
  const fragment = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  if (fragment) {
    const h = new URLSearchParams(fragment);
    const fragError = h.get('error_description') || h.get('error');
    if (fragError) return { kind: 'error', message: fragError };
    const accessToken = h.get('access_token');
    const refreshToken = h.get('refresh_token');
    if (accessToken && refreshToken) return { kind: 'tokens', accessToken, refreshToken };
  }

  return { kind: 'none' };
}
