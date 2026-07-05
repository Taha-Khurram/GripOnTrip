/**
 * Thin persistence helpers.
 *
 * - `secureStorage` — for sensitive values (auth tokens). Backed by the OS
 *   keychain / keystore via expo-secure-store.
 * - `storage` — for non-sensitive app data (cache, preferences) via
 *   AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
};

export const storage = {
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setJSON: (key: string, value: unknown) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string) => AsyncStorage.removeItem(key),
};

export const StorageKeys = {
  authToken: 'got.auth.token',
  refreshToken: 'got.auth.refresh',
  onboardingComplete: 'got.onboarding.complete',
  themePreference: 'got.theme.preference',
} as const;
