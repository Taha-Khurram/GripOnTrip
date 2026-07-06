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

/** Turn a raw Supabase auth error message into something user-facing. */
export function friendlyAuthError(message?: string): string {
  if (!message) return 'Something went wrong. Please try again.';
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email, then sign in.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'An account with that email already exists.';
  if (m.includes('network')) return 'Network error. Check your connection and try again.';
  return message;
}

export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data.session) throw new Error('Could not start a session. Please try again.');
  return data.session;
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<{ session: Session | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, name } },
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  return { session: data.session };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const redirectTo = Linking.createURL('auth-callback');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Google OAuth via the system browser. Requires the Google provider to be
 * enabled in Supabase and `app://auth-callback` whitelisted as a redirect URL.
 * On success the code is exchanged for a session and the auth listener fires.
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('auth-callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data?.url) throw new Error('Could not start Google sign-in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    // User dismissed the browser (or it failed) — surface a soft cancel.
    throw new Error('Google sign-in was cancelled.');
  }

  // PKCE flow returns `?code=...`; older configs return tokens in the fragment.
  const parsed = Linking.parse(result.url);
  const code = parsed.queryParams?.code;
  if (typeof code === 'string' && code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw new Error(friendlyAuthError(exchangeError.message));
    return;
  }

  const fragment = result.url.split('#')[1];
  if (fragment) {
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      const { error: setError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (setError) throw new Error(friendlyAuthError(setError.message));
      return;
    }
  }

  throw new Error('Google sign-in did not complete. Please try again.');
}
