import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, ThemeToggle } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAuthStore } from '@/store/auth.store';

/** Small uppercase section heading, aligned to the screen gutter. */
function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="px-5 pb-2 pt-7 text-xs font-semibold uppercase tracking-wider text-neutral-400">
      {children}
    </Text>
  );
}

/** Grouped card wrapper for list rows (hairline border + rounded corners). */
function Group({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-5 overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {children}
    </View>
  );
}

function Row({
  icon,
  label,
  href,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable
        className={[
          'flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-neutral-800/60',
          last ? '' : 'border-b border-neutral-100 dark:border-neutral-800',
        ].join(' ')}
      >
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15">
          <Ionicons name={icon} size={18} color="#219ebc" />
        </View>
        <Text className="flex-1 text-[15px] text-neutral-900 dark:text-white">{label}</Text>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </Pressable>
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
          <View className="items-center gap-3 px-8 pb-2 pt-10">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
              <Ionicons name="person-outline" size={32} color="#219ebc" />
            </View>
            <Text className="text-center text-xl font-bold text-neutral-900 dark:text-white">
              Sign in to Grip On Trip
            </Text>
            <Text className="text-center text-sm leading-5 text-neutral-500">
              Sign in to book stays, manage trips, and leave reviews.
            </Text>
          </View>
          <View className="px-5 pt-4">
            <Button label="Sign in" fullWidth onPress={() => router.push('/(auth)/sign-in')} />
          </View>

          {/* Explore (no account required) */}
          <SectionLabel>Explore</SectionLabel>
          <Group>
            <Row icon="search-outline" label="Search" href="/search" />
            <Row icon="sparkles-outline" label="AI Trip Planner" href="/trip-planner" last />
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
        {/* Identity header */}
        <View className="items-center gap-2 px-8 py-8">
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{ width: 84, height: 84, borderRadius: 42 }}
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-500">
              <Text className="text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-xl font-bold text-neutral-900 dark:text-white">{user.name}</Text>
          <Text className="text-sm text-neutral-500">{user.email}</Text>
        </View>

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <Group>
          <Row icon="briefcase-outline" label="My bookings" href="/my-bookings" />
          <Row icon="search-outline" label="Search" href="/search" />
          <Row icon="sparkles-outline" label="AI Trip Planner" href="/trip-planner" last />
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
