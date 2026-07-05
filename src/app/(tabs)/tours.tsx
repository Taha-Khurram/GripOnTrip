import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';

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
    ({ item }: { item: Tour }) => (
      <View className="px-5 pb-4">
        <TourCard tour={item} />
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-black">
        <ListSkeleton count={5} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-neutral-50 px-8 dark:bg-black">
        <Ionicons name="cloud-offline-outline" size={40} color="#9ca3af" />
        <Text className="text-center text-neutral-500">
          Couldn&apos;t load guided tours. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-black"
      data={tours}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8 pt-3"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#208aef" />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="gap-3 px-5 pb-3 pt-3">
          <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search operators or cities"
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={setQuery}
              className="flex-1 text-base text-neutral-900 dark:text-white"
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </Pressable>
            ) : null}
          </View>

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
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
                    ].join(' ')}
                  >
                    <Text className={['text-xs font-semibold', active ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'].join(' ')}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          ) : null}

          <Text className="text-sm text-neutral-500">
            {tours.length} tour operator{tours.length === 1 ? '' : 's'} available
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="map-outline" size={28} color="#208aef" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 dark:text-white">
            No tours posted yet
          </Text>
          <Text className="text-center text-sm text-neutral-500">
            Approved tour operators posted from the dashboard will appear here. Pull down to refresh.
          </Text>
        </View>
      }
    />
  );
}
