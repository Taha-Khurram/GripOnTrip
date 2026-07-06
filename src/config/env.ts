/**
 * Centralized, typed access to runtime environment variables.
 *
 * In Expo, only variables prefixed with `EXPO_PUBLIC_` are inlined into the
 * client bundle at build time. Define them in `.env` (copy from `.env.example`).
 * Nothing here is hardcoded — every value comes from the environment so the app
 * can be pointed at different backends per build without code changes. Never put
 * real secrets in these vars; anything shipped to the client is readable by users
 * (the Supabase anon key is public/client-safe and guarded by row-level security).
 */
import Constants from 'expo-constants';

/**
 * Read a required `EXPO_PUBLIC_*` var, failing loudly (with a fix hint) when it
 * is missing so misconfiguration surfaces immediately instead of as a confusing
 * runtime error deep in the networking/auth layer.
 */
function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `[env] Missing ${name}. Copy .env.example to .env and set it, then restart ` +
        `the dev server with a cleared cache (\`npx expo start -c\`).`,
    );
  }
  return trimmed;
}

const ENVIRONMENT = process.env.EXPO_PUBLIC_ENV ?? 'development';

export const env = {
  /** Base URL of the Grip On Trip REST API (read endpoints). */
  apiUrl: requireEnv('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL),
  /** Public website (used for deep links / web fallbacks). */
  webUrl: requireEnv('EXPO_PUBLIC_WEB_URL', process.env.EXPO_PUBLIC_WEB_URL),
  /** Supabase project — auth + booking/review writes (same project as the web). */
  supabaseUrl: requireEnv('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: requireEnv(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  /** Current release channel / environment. */
  env: ENVIRONMENT,
  /** App version pulled from app.json. */
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  isProduction: ENVIRONMENT === 'production',
} as const;
