import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { signInWithGoogle } from '../api';

/** "Continue with Google" (+ future providers). Uses Supabase OAuth. */
export function SocialAuthButtons({ onError }: { onError?: (message: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // On success, the auth-state listener updates the store and the root
      // layout redirects out of the auth stack automatically.
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        <Text className="text-xs text-muted-foreground">or</Text>
        <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={handleGoogle}
        className="flex-row items-center justify-center gap-3 rounded-xl border border-hairline bg-white px-4 py-3 active:opacity-70 dark:border-neutral-700 dark:bg-neutral-900"
      >
        {loading ? (
          <ActivityIndicator color="#1a7a8c" />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color="#ea4335" />
            <Text className="text-base font-semibold text-ink">
              Continue with Google
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
