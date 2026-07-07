import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Animated, Button, PressableScale, ThemeToggle, enterUp } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAuthStore } from '@/store/auth.store';

// The app's brand mark (same asset the auth header uses). Relative path so
// Metro's asset plugin resolves it; swap this file to update every logo at once.
const logo = require('../../assets/images/icon.png');

/** Small uppercase section heading, centered above its group. */
function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="px-5 pb-2 pt-6 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
      {children}
    </Text>
  );
}

/** Grouped card wrapper for list rows (hairline border + rounded corners). */
function Group({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  return (
    <Animated.View
      entering={enterUp(index)}
      className="mx-5 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm shadow-black/5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {children}
    </Animated.View>
  );
}

const ICON_TINT: Record<string, string> = {
  brand: '#219ebc',
  accent: '#fb8500',
};

function Row({
  icon,
  label,
  href,
  tone = 'brand',
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
  tone?: 'brand' | 'accent';
  last?: boolean;
}) {
  return (
    <Link href={href as never} asChild>
      {/* Layout lives on the inner View: NativeWind's className→style interop
          is dropped when Link/asChild clones the reanimated PressableScale, so
          the flex-row row would otherwise collapse to a vertical stack. */}
      <PressableScale activeScale={0.985} accessibilityRole="button">
        <View
          className={[
            'flex-row items-center gap-3 px-4 py-3.5',
            last ? '' : 'border-b border-neutral-100 dark:border-neutral-800',
          ].join(' ')}
        >
          <View
            className={[
              'h-9 w-9 items-center justify-center rounded-xl',
              tone === 'accent' ? 'bg-accent-50 dark:bg-accent-500/15' : 'bg-brand-50 dark:bg-brand-500/15',
            ].join(' ')}
          >
            <Ionicons name={icon} size={18} color={ICON_TINT[tone]} />
          </View>
          <Text className="flex-1 text-[15px] font-medium text-neutral-900 dark:text-white">
            {label}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </View>
      </PressableScale>
    </Link>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Profile' }} />
        <ScrollView contentContainerClassName="pb-12">
          {/* Sign-in prompt */}
          <Animated.View entering={enterUp(0)} className="items-center gap-2 px-8 pt-12">
            {/* Brand badge is a self-contained circular logo — show it clean,
                no tile, so its own artwork/border reads properly. */}
            <View className="h-28 w-28 items-center justify-center">
              <Image source={logo} style={{ width: 112, height: 112 }} contentFit="contain" />
            </View>
            <Text className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
              Sign in to Grip On Trip
            </Text>
            <Text className="text-center text-sm leading-5 text-neutral-500">
              Sign in to book stays, manage trips, save a wishlist, and leave reviews.
            </Text>
          </Animated.View>

          {/* Full-width primary CTA. Chrome lives on an inner View (not on the
              PressableScale) so NativeWind's className→style interop is reliable
              — a className on the animated pressable itself can be dropped. */}
          <Animated.View entering={enterUp(1)} className="px-8 pt-6">
            <PressableScale accessibilityRole="button" onPress={() => router.push('/(auth)/sign-in')}>
              <View className="items-center justify-center rounded-xl bg-brand-500 py-4 shadow-sm shadow-brand-500/30">
                <Text className="text-base font-semibold text-white">Sign in</Text>
              </View>
            </PressableScale>
          </Animated.View>

          {/* Explore (no account required) */}
          <SectionLabel>Explore</SectionLabel>
          <Group index={2}>
            <Row icon="search-outline" label="Search" href="/search" />
            <Row icon="sparkles-outline" label="AI Trip Planner" href="/trip-planner" tone="accent" last />
          </Group>

          {/* Appearance */}
          <SectionLabel>Appearance</SectionLabel>
          <View className="px-5">
            <ThemeToggle />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView contentContainerClassName="pb-12">
        {/* Identity card */}
        <Animated.View entering={enterUp(0)} className="px-5 pt-4">
          <View className="overflow-hidden rounded-3xl bg-brand-600 p-5 dark:bg-brand-800">
            <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <View className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/10" />
            <View className="flex-row items-center gap-4">
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' }}
                />
              ) : (
                <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/15">
                  <Text className="text-2xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-xl font-bold text-white" numberOfLines={1}>
                  {user.name}
                </Text>
                <Text className="text-sm text-white/75" numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              <Link href="/profile-settings" asChild>
                <PressableScale className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Ionicons name="create-outline" size={18} color="#fff" />
                </PressableScale>
              </Link>
            </View>
          </View>
        </Animated.View>

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <Group index={1}>
          <Row icon="person-circle-outline" label="Profile settings" href="/profile-settings" />
          <Row icon="heart-outline" label="My Wishlist" href="/wishlist" tone="accent" />
          <Row icon="briefcase-outline" label="My bookings" href="/my-bookings" />
          <Row icon="home-outline" label="My rental bookings" href="/my-rental-bookings" last />
        </Group>

        {/* Hosting */}
        <SectionLabel>Hosting</SectionLabel>
        <Group index={2}>
          <Row icon="business-outline" label="My properties" href="/my-properties" />
          <Row icon="key-outline" label="Manage rental properties" href="/manage-rental-properties" tone="accent" last />
        </Group>

        {/* Explore */}
        <SectionLabel>Explore</SectionLabel>
        <Group index={3}>
          <Row icon="search-outline" label="Search" href="/search" />
          <Row icon="sparkles-outline" label="AI Trip Planner" href="/trip-planner" tone="accent" last />
        </Group>

        {/* Appearance */}
        <SectionLabel>Appearance</SectionLabel>
        <View className="px-5">
          <ThemeToggle />
        </View>

        {/* Sign out */}
        <View className="px-5 pt-10">
          <Button
            label="Sign out"
            variant="outline"
            fullWidth
            onPress={async () => {
              await signOut();
              router.replace('/(tabs)');
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
