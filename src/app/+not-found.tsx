import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center gap-4 bg-neutral-50 px-8 dark:bg-black">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/(tabs)" className="font-semibold text-brand-600">
          Go to home
        </Link>
      </View>
    </>
  );
}
