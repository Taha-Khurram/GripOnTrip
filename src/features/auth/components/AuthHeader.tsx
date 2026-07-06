import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Animated, enterUp } from '@/components/ui';

// Relative path (not the @/ alias): assets are resolved by Metro's asset plugin
// and this avoids relying on tsconfig-path resolution for a non-JS require.
const logo = require('../../../../assets/images/icon.png');

/**
 * Branded hero for the auth screens: a deep blue-green block with decorative
 * orbs, the app logo, and a title/subtitle. Includes its own back control since
 * the auth stack renders without a native header for a full-bleed look.
 */
export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="overflow-hidden rounded-b-[36px] bg-brand-600 px-6 pb-12 dark:bg-brand-800"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Decorative orbs for depth (no gradient lib needed). */}
      <View className="absolute -right-12 -top-10 h-48 w-48 rounded-full bg-white/10" />
      <View className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-brand-800/30 dark:bg-black/20" />
      <View className="absolute right-10 bottom-6 h-16 w-16 rounded-full bg-accent-500/20" />

      {router.canGoBack() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={10}
          className="mb-5 h-9 w-9 items-center justify-center rounded-full bg-white/15 active:opacity-70"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
      ) : (
        <View className="mb-5 h-9" />
      )}

      <Animated.View entering={enterUp(0)} className="items-center gap-3">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/25">
          <Image source={logo} style={{ width: 46, height: 46, borderRadius: 12 }} contentFit="contain" />
        </View>
        <Text className="text-2xl font-extrabold tracking-tight text-white">{title}</Text>
        {subtitle ? (
          <Text className="max-w-[280px] text-center text-sm leading-5 text-white/80">{subtitle}</Text>
        ) : null}
      </Animated.View>
    </View>
  );
}
