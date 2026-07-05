import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useThemeStore, type ThemePreference } from '@/store/theme.store';
import { PressableScale } from './motion';

const OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

/**
 * Segmented Appearance control (System / Light / Dark). Writes to the theme
 * store, which drives NativeWind's color scheme and persists the choice.
 */
export function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <View className="flex-row gap-1 rounded-2xl border border-neutral-100 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
      {OPTIONS.map((opt) => {
        const active = preference === opt.value;
        return (
          <PressableScale
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setPreference(opt.value)}
            activeScale={0.95}
            className={[
              'flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5',
              active ? 'bg-brand-500' : 'bg-transparent',
            ].join(' ')}
          >
            <Ionicons name={opt.icon} size={16} color={active ? '#fff' : '#9ca3af'} />
            <Text
              className={[
                'text-sm font-semibold',
                active ? 'text-white' : 'text-neutral-500 dark:text-neutral-400',
              ].join(' ')}
            >
              {opt.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
