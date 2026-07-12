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
    background: '#eef2f7',
    card: '#eef2f7',
    text: '#0a1a2f',
    primary: '#00a165',
    border: '#dbe3ec',
  },
};

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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

  // Hold the splash until fonts AND the persisted session have resolved, so the
  // auth guard below mounts with settled state (no sign-in → tabs flash).
  if (!fontsLoaded || isHydrating) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={AppTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#eef2f7' },
                headerStyle: { backgroundColor: '#eef2f7' },
                headerShadowVisible: false,
                headerTintColor: '#00a165',
                headerTitleStyle: { fontFamily: 'Outfit_700Bold', color: '#0a1a2f' },
              }}
            >
              {/* Launch-time auth gate: signed out, the only reachable group is
                  (auth), so the app opens on the sign-in screen. Once signed in
                  (including a restored session), the app screens take over and
                  (auth) is removed from the navigator. */}
              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              </Stack.Protected>

              <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="hotels/index" options={{ headerShown: false }} />
                <Stack.Screen name="hotels/[id]" options={{ headerShown: false }} />
                <Stack.Screen
                  name="hotels/book"
                  options={{ headerShown: true, title: 'Book', presentation: 'modal' }}
                />
                <Stack.Screen name="rentals/[id]" options={{ headerShown: false }} />
                <Stack.Screen
                  name="rentals/book"
                  options={{ headerShown: true, title: 'Request to Book', presentation: 'modal' }}
                />
                <Stack.Screen name="tours/[id]" options={{ headerShown: false }} />
                <Stack.Screen
                  name="tours/enquiry"
                  options={{ headerShown: true, title: 'Request an Inquiry', presentation: 'modal' }}
                />
                <Stack.Screen
                  name="tours/book"
                  options={{ headerShown: true, title: 'Book Package', presentation: 'modal' }}
                />
                <Stack.Screen name="shop/[id]" options={{ headerShown: false }} />
                <Stack.Screen
                  name="shop/checkout"
                  options={{ headerShown: true, title: 'Checkout', presentation: 'modal' }}
                />
                <Stack.Screen name="umrah/[id]" options={{ headerShown: true, title: 'Umrah Package' }} />
                <Stack.Screen name="umrah/book" options={{ headerShown: true, title: 'Book Umrah' }} />
                <Stack.Screen name="guides/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
                <Stack.Screen name="profile-settings" options={{ headerShown: true, title: 'Profile settings' }} />
                <Stack.Screen name="wishlist" options={{ headerShown: true, title: 'My Wishlist' }} />
                <Stack.Screen name="my-bookings" options={{ headerShown: true, title: 'My Bookings' }} />
                <Stack.Screen name="my-rental-bookings" options={{ headerShown: true, title: 'My Rental Bookings' }} />
                <Stack.Screen name="my-properties" options={{ headerShown: true, title: 'My Properties' }} />
                <Stack.Screen name="list-property" options={{ headerShown: true, title: 'List Your Property' }} />
                <Stack.Screen name="manage-rental-properties" options={{ headerShown: true, title: 'Manage Rental Properties' }} />
              </Stack.Protected>
            </Stack>
            {/* Keep the assistant out of the sign-in flow — only inside the app. */}
            {isAuthenticated ? <AssistantWidget /> : null}
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
