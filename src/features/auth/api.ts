/**
 * Auth service — backed by Supabase (same project as the website).
 *
 * Browsing stays public; these power the sign-in / sign-up / reset screens and
 * the "Continue with Google" button. The auth store's `onAuthStateChange`
 * listener is the source of truth for session state — these functions just
 * kick off the flows and let the listener update the app.
 */
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import { friendlyAuthError, normalizeEmail, parseAuthRedirect } from './utils';

// Re-exported so callers keep a single `@/features/auth` import surface.
export { friendlyAuthError, normalizeEmail, parseAuthRedirect } from './utils';
export type { AuthRedirect } from './utils';

// Allows the auth browser tab to auto-dismiss when the OAuth redirect returns.
// Safe to call at module scope; a no-op on platforms that don't need it.
WebBrowser.maybeCompleteAuthSession();

export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data.session) throw new Error('Could not start a session. Please try again.');
  return data.session;
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<{ session: Session | null }> {
  const fullName = name.trim();
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: { data: { full_name: fullName, name: fullName } },
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  return { session: data.session };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const redirectTo = Linking.createURL('auth-callback');
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo,
  });
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Google OAuth via the system browser (Supabase PKCE flow). Requires the Google
 * provider to be enabled in Supabase and `app://auth-callback` whitelisted as a
 * redirect URL. On success the code is exchanged for a session and the auth
 * listener fires.
 *
 * Returns `'cancelled'` (rather than throwing) when the user dismisses the
 * browser, so the UI can stay silent instead of flashing an error banner.
 */
export async function signInWithGoogle(): Promise<'success' | 'cancelled'> {
  const redirectTo = Linking.createURL('auth-callback');
  const expectedScheme = redirectTo.split(':')[0];

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data?.url) throw new Error('Could not start Google sign-in.');

  try {
    // Android: pre-warm the Custom Tab so the consent screen appears instantly.
    await WebBrowser.warmUpAsync();

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    // User backed out of the browser — treat as a soft cancel, not an error.
    if (result.type === 'cancel' || result.type === 'dismiss') return 'cancelled';
    if (result.type !== 'success' || !result.url) {
      throw new Error('Google sign-in did not complete. Please try again.');
    }

    const parsed = parseAuthRedirect(result.url, expectedScheme);
    if (parsed.kind === 'error') throw new Error(friendlyAuthError(parsed.message));

    if (parsed.kind === 'code') {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(parsed.code);
      if (exchangeError) throw new Error(friendlyAuthError(exchangeError.message));
      return 'success';
    }

    if (parsed.kind === 'tokens') {
      const { error: setError } = await supabase.auth.setSession({
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
      });
      if (setError) throw new Error(friendlyAuthError(setError.message));
      return 'success';
    }

    throw new Error('Google sign-in did not complete. Please try again.');
  } finally {
    // Release the pre-warmed tab regardless of outcome.
    void WebBrowser.coolDownAsync();
  }
}
