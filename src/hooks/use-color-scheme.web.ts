import { useColorScheme as useNativewindColorScheme } from 'nativewind';

/**
 * Web variant — same source of truth as native (NativeWind), so a user theme
 * override applies on web too. Falls back to 'light' during static rendering
 * before the scheme resolves on the client.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useNativewindColorScheme().colorScheme ?? 'light';
}
