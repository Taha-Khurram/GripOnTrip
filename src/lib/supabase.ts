/**
 * Supabase client — auth + user writes (same project the website uses).
 *
 * The public REST API (`src/api/client.ts`) is read-only; anything that needs a
 * signed-in user (profile, bookings, owned listings) goes through this client.
 * The anon key is public/client-safe and guarded by row-level security.
 *
 * Session is persisted in AsyncStorage and auto-refreshed. PKCE flow is used so
 * the Google OAuth redirect can be completed with `exchangeCodeForSession`.
 */
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { env } from '@/config/env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Supabase recommends pausing token auto-refresh while the app is backgrounded
// and resuming it on foreground so refreshes don't fire needlessly.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
