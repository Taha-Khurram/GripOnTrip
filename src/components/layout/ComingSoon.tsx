import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Animated, enterUp } from '@/components/ui';

/**
 * Consistent placeholder for verticals whose screens are not built yet.
 * Replace with the real listing UI (see `features/hotels` for the pattern).
 */
export function ComingSoon({ title, icon, note }: { title: string; icon: string; note?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-neutral-50 px-8 dark:bg-black">
      <Animated.View
        entering={enterUp(0)}
        className="h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15"
      >
        <Ionicons name={icon as never} size={28} color="#219ebc" />
      </Animated.View>
      <Animated.Text
        entering={enterUp(1)}
        className="text-xl font-bold text-neutral-900 dark:text-white"
      >
        {title}
      </Animated.Text>
      <Animated.Text entering={enterUp(2)} className="text-center text-sm text-neutral-500">
        {note ?? 'This section is ready for development. Wire it up to the API using the feature module pattern.'}
      </Animated.Text>
    </View>
  );
}
