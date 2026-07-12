import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Animated, DeepPanel, enterUp, PressableScale } from '@/components/ui';
import type { Rental } from '../types';

/**
 * "Featured Destinations" — a horizontal strip of the most-listed rental cities,
 * as branded navy tiles (the app's photo-less fallback treatment). Each tile
 * deep-links into a city-filtered search. Renders nothing without located stock.
 */
export function FeaturedDestinations({ rentals, index = 0 }: { rentals: Rental[]; index?: number }) {
  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    rentals.forEach((r) => {
      const c = r.location?.city?.trim();
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([city, count]) => ({ city, count }));
  }, [rentals]);

  if (cities.length === 0) return null;

  return (
    <Animated.View entering={enterUp(index)} className="gap-4">
      <View className="px-5">
        <Text className="font-display-x text-[22px] leading-7 text-ink">Featured Destinations</Text>
        <Text className="mt-1 text-[13px] leading-5 text-muted">
          Explore our most popular rental markets across Pakistan.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-5"
      >
        {cities.map(({ city, count }) => (
          <Link
            key={city}
            href={{ pathname: '/search', params: { q: city, category: 'rentals' } }}
            asChild
          >
            <PressableScale accessibilityRole="button" activeScale={0.96}>
              <View className="h-44 w-64 overflow-hidden rounded-[24px] bg-brand-900">
                <DeepPanel className="absolute inset-0" />
                <View pointerEvents="none" className="absolute -right-5 -top-6">
                  <Ionicons name="location" size={130} color="rgba(255,255,255,0.06)" />
                </View>
                <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-900/40" />

                <View className="flex-1 justify-end gap-2 p-4">
                  <Text className="font-display-x text-[20px] leading-6 text-white">{city}</Text>
                  <View className="flex-row items-center gap-1.5 self-start rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                    <Ionicons name="home" size={11} color="#f5a623" />
                    <Text className="text-[11px] font-body-semibold text-white">
                      {count} propert{count === 1 ? 'y' : 'ies'}
                    </Text>
                  </View>
                </View>
              </View>
            </PressableScale>
          </Link>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
