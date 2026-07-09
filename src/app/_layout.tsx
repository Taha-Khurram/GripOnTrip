import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import {
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { colorScheme } from 'nativewind';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

// Reanimated 4's strict mode emits noisy warnings (including from library
// internals) even when app code accesses shared values correctly. Keep real
// warnings/errors, but disable the over-eager strict checks.
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import { AssistantWidget } from '@/features/assistant';
import { useAuthStore } from '@/store/auth.store';
import { queryClient } from '@/lib/query-client';

SplashScreen.preventAutoHideAsync();

// "Ocean & Sun" is a light-only design. Force the light color scheme so any
// stray `dark:` utilities never activate and the cream canvas stays consistent.
colorScheme.set('light');

// Navigation theme tuned to the cream canvas so screen transitions don't flash
// the default white background.
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f5efe4',
    card: '#f5efe4',
    text: '#0c2b36',
    primary: '#1a7a8c',
    border: '#e6dcc8',
  },
};

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrating && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isHydrating, fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={AppTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#f5efe4' },
                headerStyle: { backgroundColor: '#f5efe4' },
                headerShadowVisible: false,
                headerTintColor: '#1a7a8c',
                headerTitleStyle: { fontFamily: 'Outfit_700Bold', color: '#0c2b36' },
              }}
            >
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
