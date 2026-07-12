import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { ListHero } from '@/components/layout/ListHero';
import { Button, ListSkeleton } from '@/components/ui';
import { TourCard, useTours, type Tour } from '@/features/tours';

/**
 * Guided Tours listing.
 *
 * Reads from `GET /agencies?status=Approved&include_packages=true` via
 * `useTours()` — the same API the web tours page uses. Anything an approved tour
 * operator posts from the dashboard shows up here; React Query refetches on focus
 * and on pull-to-refresh, so new operators appear without a reload.
 */
export default function ToursScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useTours();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string | null>(null);

  const allTours = useMemo(() => data?.data ?? [], [data?.data]);

  // Distinct operating cities across all operators, for the filter row.
  const cities = useMemo(() => {
    const set = new Set<string>();
    allTours.forEach((t) => t.operatingCities.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [allTours]);

  const tours = useMemo(() => {
    let list = allTours;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.operatingCities.some((c) => c.toLowerCase().includes(q)),
      );
    }
    if (city) list = list.filter((t) => t.operatingCities.includes(city));
    return list;
  }, [allTours, query, city]);

  const renderItem = useCallback(
    ({ item, index }: { item: Tour; index: number }) => (
      <View className="px-5 pb-4">
        <TourCard tour={item} index={index} />
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <ListSkeleton count={5} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Ionicons name="cloud-offline-outline" size={40} color="#9aa7ac" />
        <Text className="text-center text-muted">
          Couldn&apos;t load guided tours. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={tours}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00a165" />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          <ListHero
            variant="ocean"
            icon="bus-outline"
            eyebrow="Explore"
            title="Guided Tours"
            subtitle="Expert-curated travel experiences."
            query={query}
            onChangeQuery={setQuery}
            placeholder="Search operators or cities"
          />

          <View className="gap-3 px-5 pb-3 pt-4">
            {cities.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['All', ...cities]}
              keyExtractor={(c) => c}
              contentContainerClassName="gap-2"
              renderItem={({ item }) => {
                const active = item === 'All' ? city === null : city === item;
                return (
                  <Pressable
                    onPress={() => setCity(item === 'All' ? null : item)}
                    className={[
                      'rounded-full border px-3 py-1.5',
                      active
                        ? 'border-brand-500 bg-brand-500'
                        : 'border-hairline bg-white dark:border-neutral-700 dark:bg-neutral-900',
                    ].join(' ')}
                  >
                    <Text className={['text-xs font-semibold', active ? 'text-white' : 'text-muted'].join(' ')}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          ) : null}

            <Text className="text-sm text-muted">
              {tours.length} tour operator{tours.length === 1 ? '' : 's'} available
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="map-outline" size={28} color="#00a165" />
          </View>
          <Text className="text-lg font-display text-ink">
            No tours posted yet
          </Text>
          <Text className="text-center text-sm text-muted">
            Approved tour operators posted from the dashboard will appear here. Pull down to refresh.
          </Text>
        </View>
      }
    />
  );
}
