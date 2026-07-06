import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Screens render their own branded hero (AuthHeader), so the native header is
  // hidden for a full-bleed look; the hero provides its own back control.
  return <Stack screenOptions={{ headerShown: false }} />;
}
