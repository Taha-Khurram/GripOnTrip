import { Stack } from 'expo-router';

/**
 * Navigator for a single hotel: the detail screen (`index`) and the booking
 * modal (`book`). The `[id]` folder holds more than one route, so it needs its
 * own layout — without it those screens render outside a navigator and expo-router
 * throws "Couldn't find a navigation context".
 */
export default function HotelDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f5efe4' },
        headerShadowVisible: false,
        headerTintColor: '#1a7a8c',
        headerTitleStyle: { fontFamily: 'Outfit_700Bold', color: '#0c2b36' },
        contentStyle: { backgroundColor: '#f5efe4' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="book" options={{ title: 'Book', presentation: 'modal' }} />
    </Stack>
  );
}
