import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

import { AssistantWidget } from '@/features/assistant';
import { useAuthStore } from '@/store/auth.store';
import { queryClient } from '@/lib/query-client';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
              <Stack.Screen name="my-bookings" options={{ headerShown: true, title: 'My Bookings' }} />
            </Stack>
            <AssistantWidget />
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
