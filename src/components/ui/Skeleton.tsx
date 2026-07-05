import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

/** A single pulsing placeholder block. Size/shape via `className`. */
export function Skeleton({ className = '' }: { className?: string }) {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className={['rounded-md bg-neutral-200 dark:bg-neutral-800', className].join(' ')}
    />
  );
}

/** Card placeholder (image + title + subtitle + price) used by all list screens. */
export function CardSkeleton() {
  return (
    <View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
      <Skeleton className="h-40 w-full rounded-none" />
      <View className="gap-2 p-3">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <View className="mt-1 flex-row items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-10" />
        </View>
      </View>
    </View>
  );
}

/** A vertical stack of card placeholders for list loading states. */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-4 px-5 pt-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

/** Detail-screen placeholder (hero + heading + text lines + block). */
export function DetailSkeleton() {
  return (
    <View>
      <Skeleton className="h-64 w-full rounded-none" />
      <View className="gap-3 p-5">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/5" />
        <View className="mt-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </View>
        <Skeleton className="mt-3 h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </View>
    </View>
  );
}
