import { useColorScheme as useNativewindColorScheme } from 'nativewind';

/**
 * Effective color scheme ('light' | 'dark'), sourced from NativeWind so it
 * reflects the user's theme override (see `store/theme.store.ts`) — not just
 * the OS setting. Falls back to 'light' before the scheme resolves.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useNativewindColorScheme().colorScheme ?? 'light';
}
