import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Text className="text-lg font-display-semibold text-ink">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/(tabs)" className="font-semibold text-brand-600">
          Go to home
        </Link>
      </View>
    </>
  );
}
