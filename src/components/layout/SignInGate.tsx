import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAuthStore } from '@/store/auth.store';

/**
 * Renders `children` only when signed in; otherwise shows a branded sign-in
 * prompt. Guards the account screens that need a user session.
 */
export function SignInGate({
  icon = 'lock-closed-outline',
  message,
  children,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <>{children}</>;

  return (
    <Screen className="justify-center gap-5 px-8">
      <View className="items-center gap-4">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-500/15">
          <Ionicons name={icon} size={34} color="#1a7a8c" />
        </View>
        <Text className="text-center text-xl font-display text-ink">
          Sign in required
        </Text>
        <Text className="text-center text-sm leading-5 text-muted">{message}</Text>
      </View>
      <Button label="Sign in" fullWidth onPress={() => router.push('/(auth)/sign-in')} />
    </Screen>
  );
}
