import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAuthStore } from '@/store/auth.store';

function Row({
  icon,
  label,
  href,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable className="flex-row items-center gap-3 border-b border-neutral-100 px-5 py-4 active:bg-neutral-50 dark:border-neutral-800 dark:active:bg-neutral-900">
        <Ionicons name={icon} size={20} color="#208aef" />
        <Text className="flex-1 text-base text-neutral-900 dark:text-white">{label}</Text>
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
      <Screen className="justify-center gap-4 px-8">
        <Stack.Screen options={{ title: 'Profile' }} />
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="person-outline" size={28} color="#208aef" />
          </View>
          <Text className="text-center text-lg font-bold text-neutral-900 dark:text-white">
            Sign in to Grip On Trip
          </Text>
          <Text className="text-center text-sm text-neutral-500">
            Sign in to book stays, manage trips, and leave reviews.
          </Text>
        </View>
        <Button label="Sign in" fullWidth onPress={() => router.push('/(auth)/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView>
        <View className="items-center gap-2 py-8">
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={{ width: 80, height: 80, borderRadius: 40 }} />
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

        <View className="border-t border-neutral-100 dark:border-neutral-800">
          <Row icon="briefcase-outline" label="My bookings" href="/my-bookings" />
          <Row icon="search-outline" label="Search" href="/search" />
          <Row icon="sparkles-outline" label="AI Trip Planner" href="/trip-planner" />
        </View>

        <View className="px-5 pt-8">
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
