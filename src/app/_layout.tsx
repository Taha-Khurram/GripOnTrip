import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AssistantWidget } from '@/features/assistant';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { queryClient } from '@/lib/query-client';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    hydrateTheme();
  }, [hydrate, hydrateTheme]);

  useEffect(() => {
    if (!isHydrating) {
      SplashScreen.hideAsync();
    }
  }, [isHydrating]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
              <Stack.Screen name="hotels/index" options={{ headerShown: true, title: 'Hotels & Stays' }} />
              <Stack.Screen name="hotels/[id]/index" options={{ headerShown: true, title: 'Hotel' }} />
              <Stack.Screen name="hotels/[id]/book" options={{ headerShown: true, title: 'Book', presentation: 'modal' }} />
              <Stack.Screen name="rentals/[id]" options={{ headerShown: true, title: 'Rental' }} />
              <Stack.Screen name="tours/[id]" options={{ headerShown: true, title: 'Tour' }} />
              <Stack.Screen name="umrah/[id]" options={{ headerShown: true, title: 'Umrah Package' }} />
              <Stack.Screen name="guides/[id]" options={{ headerShown: true, title: 'Guide' }} />
              <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
              <Stack.Screen name="profile-settings" options={{ headerShown: true, title: 'Profile settings' }} />
              <Stack.Screen name="wishlist" options={{ headerShown: true, title: 'My Wishlist' }} />
              <Stack.Screen name="my-bookings" options={{ headerShown: true, title: 'My Bookings' }} />
              <Stack.Screen name="my-rental-bookings" options={{ headerShown: true, title: 'My Rental Bookings' }} />
              <Stack.Screen name="my-properties" options={{ headerShown: true, title: 'My Properties' }} />
              <Stack.Screen name="manage-rental-properties" options={{ headerShown: true, title: 'Manage Rental Properties' }} />
            </Stack>
            <AssistantWidget />
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
