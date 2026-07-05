/**
 * Centralized, typed access to runtime environment variables.
 *
 * In Expo, only variables prefixed with `EXPO_PUBLIC_` are inlined into the
 * client bundle. Define them in `.env` (see `.env.example`). Never put secrets
 * here — anything shipped to the client is readable by end users.
 */
import Constants from 'expo-constants';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://www.gripontrip.com/api';

// The web app talks to this Supabase project directly for auth + bookings. The
// anon key is a public, client-safe key (role: anon) — it is designed to ship in
// client bundles and is protected by row-level security, not by secrecy.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ivkorsriknpkrdnmmgwg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a29yc3Jpa25wa3Jkbm1tZ3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTk5NTUsImV4cCI6MjA1MjQzNTk1NX0.NQQr9a97XmCSBN3JXoqboKbFJ2tD10mr_cv66DEjHGU';

export const env = {
  /** Base URL of the Grip On Trip REST API (read endpoints). */
  apiUrl: API_URL,
  /** Public website (used for deep links / web fallbacks). */
  webUrl: process.env.EXPO_PUBLIC_WEB_URL ?? 'https://www.gripontrip.com',
  /** Supabase project — used for auth + booking/review writes (same as web). */
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
  /** Current release channel / environment. */
  env: process.env.EXPO_PUBLIC_ENV ?? 'development',
  /** App version pulled from app.json. */
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  isProduction: process.env.EXPO_PUBLIC_ENV === 'production',
} as const;
