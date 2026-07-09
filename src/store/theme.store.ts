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

  // "Ocean & Sun" ships light-only. We keep the store's shape for compatibility
  // but always resolve to light so the cream canvas is consistent everywhere.
  hydrate: async () => {
    colorScheme.set('light');
    set({ preference: 'light', isHydrating: false });
  },

  setPreference: () => {
    colorScheme.set('light');
    set({ preference: 'light' });
  },
}));
