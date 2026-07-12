import { Stack } from 'expo-router';

// Land on sign-in when the app opens into the auth flow (no index route here).
export const unstable_settings = {
  initialRouteName: 'sign-in',
};

export default function AuthLayout() {
  // Screens render their own branded hero (AuthHeader), so the native header is
  // hidden for a full-bleed look; the hero provides its own back control.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    />
  );
}
