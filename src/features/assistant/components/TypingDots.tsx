import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

/** Three bouncing dots shown while the assistant is composing a reply. */
export function TypingDots() {
  return (
    <View className="flex-row items-center gap-1 py-1">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const [value] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(value, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, value]);

  return (
    <Animated.View
      style={{ opacity: value, transform: [{ scale: value }] }}
      className="h-2 w-2 rounded-full bg-slate-300"
    />
  );
}
