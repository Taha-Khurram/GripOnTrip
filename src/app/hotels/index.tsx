import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';

import { Button, ListSkeleton } from '@/components/ui';
import { HotelCard, useHotels, type Hotel, type HotelFilters } from '@/features/hotels';

type SortKey = NonNullable<HotelFilters['sort']>;
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price-asc', label: 'Price ↑' },
  { key: 'price-desc', label: 'Price ↓' },
  { key: 'rating-desc', label: 'Top rated' },
];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        'rounded-full border px-3 py-1.5',
        active
          ? 'border-brand-500 bg-brand-500'
          : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
      ].join(' ')}
    >
      <Text className={['text-xs font-semibold', active ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'].join(' ')}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Hotels & Stays listing. Reads all approved hotels from `GET /hotels`, then
 * applies search / filters / sort on the client (the REST endpoint returns the
 * full set). React Query refetches on focus + pull-to-refresh.
 */
export default function HotelsListScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useHotels();
  const [query, setQuery] = useState('');
  const [breakfast, setBreakfast] = useState(false);
  const [freeCancel, setFreeCancel] = useState(false);
  const [sort, setSort] = useState<SortKey>('recommended');

  const hotels = useMemo(() => {
    let list = data?.data ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.location?.city?.toLowerCase().includes(q) ||
          h.location?.address?.toLowerCase().includes(q),
      );
    }
    if (breakfast) list = list.filter((h) => h.breakfastIncluded);
    if (freeCancel) list = list.filter((h) => h.freeCancellation);

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price.amount - b.price.amount);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price.amount - a.price.amount);
    else if (sort === 'rating-desc') sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted;
  }, [data?.data, query, breakfast, freeCancel, sort]);

  const renderItem = useCallback(
    ({ item }: { item: Hotel }) => (
      <View className="px-5 pb-4">
        <HotelCard hotel={item} />
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-black">
        <Stack.Screen options={{ title: 'Hotels & Stays' }} />
        <ListSkeleton count={5} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-neutral-50 px-8 dark:bg-black">
        <Stack.Screen options={{ title: 'Hotels & Stays' }} />
        <Ionicons name="cloud-offline-outline" size={40} color="#9ca3af" />
        <Text className="text-center text-neutral-500">
          Couldn&apos;t load hotels &amp; stays. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-black"
      data={hotels}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#208aef" />}
      ListHeaderComponent={
        <View className="gap-3 px-5 pb-3 pt-3">
          <Stack.Screen options={{ title: 'Hotels & Stays' }} />
          <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search by city or hotel"
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

          <View className="flex-row flex-wrap gap-2">
            <Chip label="Breakfast" active={breakfast} onPress={() => setBreakfast((v) => !v)} />
            <Chip label="Free cancellation" active={freeCancel} onPress={() => setFreeCancel((v) => !v)} />
          </View>

          <View className="flex-row flex-wrap gap-2">
            {SORTS.map((s) => (
              <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />
            ))}
          </View>

          <Text className="text-sm text-neutral-500">
            {hotels.length} stay{hotels.length === 1 ? '' : 's'} available
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="bed-outline" size={28} color="#208aef" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 dark:text-white">No stays match</Text>
          <Text className="text-center text-sm text-neutral-500">
            Try clearing filters or searching a different city.
          </Text>
        </View>
      }
    />
  );
}
