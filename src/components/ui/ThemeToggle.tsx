import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useThemeStore, type ThemePreference } from '@/store/theme.store';

const OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

// Explicit colors so the active state is always legible regardless of how
// NativeWind resolves dynamically-toggled classes on an interop component.
const BRAND = '#00a165';
const ACTIVE = '#ffffff';
const INACTIVE = '#6b7280'; // neutral-500 — readable on both light & dark tracks

/**
 * Segmented Appearance control (System / Light / Dark). Writes to the theme
 * store, which drives NativeWind's color scheme and persists the choice.
 */
export function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <View className="flex-row rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
      {OPTIONS.map((opt) => {
        const active = preference === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setPreference(opt.value)}
            style={
              active
                ? {
                    backgroundColor: BRAND,
                    shadowColor: BRAND,
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }
                : undefined
            }
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
          >
            <Ionicons name={opt.icon} size={16} color={active ? ACTIVE : INACTIVE} />
            <Text style={{ color: active ? ACTIVE : INACTIVE }} className="text-sm font-semibold">
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
