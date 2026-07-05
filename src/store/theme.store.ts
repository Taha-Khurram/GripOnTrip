/**
 * Theme preference (Zustand) — lets the user override the OS color scheme.
 *
 * `preference` is what the user picked ('system' follows the device); the
 * effective light/dark resolution is handled by NativeWind. We drive NativeWind
 * imperatively via `colorScheme.set()` and persist the choice so it survives
 * app restarts (NativeWind itself resets to system on launch).
 */
import { colorScheme } from 'nativewind';
import { create } from 'zustand';

import { storage, StorageKeys } from '@/lib/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  /** True until the persisted preference has been read + applied on launch. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  setPreference: (pref: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  isHydrating: true,

  hydrate: async () => {
    const saved = await storage.getJSON<ThemePreference>(StorageKeys.themePreference);
    const pref = saved ?? 'system';
    colorScheme.set(pref);
    set({ preference: pref, isHydrating: false });
  },

  setPreference: (pref) => {
    colorScheme.set(pref);
    void storage.setJSON(StorageKeys.themePreference, pref);
    set({ preference: pref });
  },
}));
