import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Animated, enterUp, OceanHero } from '@/components/ui';
import { APP_NAME } from '@/constants/config';

type IconName = keyof typeof Ionicons.glyphMap;

// Relative path (not the @/ alias): assets are resolved by Metro's asset plugin
// and this avoids relying on tsconfig-path resolution for a non-JS require.
const logo = require('../../../../assets/images/icon.png');

/**
 * Branded hero for the auth screens, in the home page's visual language: a deep
 * navy block with the logo + brand row, an eyebrow badge, a big display title
 * (with an accent-highlighted second line) and a gold underline. Includes its
 * own back control since the auth stack renders without a native header.
 */
export function AuthHeader({
  title,
  highlight,
  subtitle,
  eyebrow,
  eyebrowIcon = 'sparkles',
}: {
  title: string;
  /** Optional second line rendered in the gold accent (mirrors the home hero). */
  highlight?: string;
  subtitle?: string;
  eyebrow?: string;
  eyebrowIcon?: IconName;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <OceanHero className="rounded-b-[36px] px-5 pb-16" style={{ paddingTop: insets.top + 8 }}>
      {router.canGoBack() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={10}
          className="mb-5 h-10 w-10 items-center justify-center rounded-full bg-white/15 active:opacity-70"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
      ) : (
        <View className="mb-5 h-10" />
      )}

      <Animated.View entering={enterUp(0)}>
        {/* Logo + brand row */}
        <View className="flex-row items-center gap-2.5">
          <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
          <Text className="font-display text-base text-white">{APP_NAME}</Text>
        </View>

        {/* Eyebrow badge */}
        {eyebrow ? (
          <View className="mt-5 flex-row">
            <View className="flex-row items-center gap-1.5 rounded-full border border-accent-500/50 bg-accent-500/10 px-3 py-1.5">
              <Ionicons name={eyebrowIcon} size={12} color="#f5a623" />
              <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-accent-400">
                {eyebrow}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Title with accent highlight */}
        <Text className="mt-4 font-display-x text-[32px] leading-[38px] text-white">
          {title}
          {highlight ? (
            <Fragment>
              {'\n'}
              <Text className="text-accent-500">{highlight}</Text>
            </Fragment>
          ) : null}
        </Text>
        <View className="mt-2 h-1 w-16 rounded-full bg-accent-500" />

        {subtitle ? (
          <Text className="mt-3 text-[15px] leading-5 text-white/85">{subtitle}</Text>
        ) : null}
      </Animated.View>
    </OceanHero>
  );
}
