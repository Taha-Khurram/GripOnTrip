import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ListHero } from '@/components/layout/ListHero';
import { Button, ListSkeleton } from '@/components/ui';
import { HotelCard, useHotels, type Hotel, type HotelFilters } from '@/features/hotels';

type SortKey = NonNullable<HotelFilters['sort']>;
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price-asc', label: 'Price ↑' },
  { key: 'price-desc', label: 'Price ↓' },
  { key: 'rating-desc', label: 'Top rated' },
];

function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        'flex-row items-center gap-1.5 rounded-full border px-4 py-2',
        active ? 'border-brand-500 bg-brand-500' : 'border-hairline bg-white',
      ].join(' ')}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? '#fff' : '#5f7178'} />
      ) : null}
      <Text className={['text-xs font-semibold', active ? 'text-white' : 'text-muted'].join(' ')}>
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
  const router = useRouter();
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
    ({ item, index }: { item: Hotel; index: number }) => (
      <View className="px-5 pb-4">
        <HotelCard hotel={item} index={index} />
      </View>
    ),
    [],
  );

  const hero = (
    <ListHero
      variant="ocean"
      icon="bed-outline"
      eyebrow="Stays"
      title="Hotels & Stays"
      subtitle="Direct prices, zero commission — find your perfect stay."
      query={query}
      onChangeQuery={setQuery}
      placeholder="Search by city or hotel"
      onBack={() => router.back()}
    />
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        {hero}
        <View className="pt-4">
          <ListSkeleton count={5} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        {hero}
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="#9aa7ac" />
          <Text className="text-center text-muted">
            Couldn&apos;t load hotels &amp; stays. Check your connection and try again.
          </Text>
          <Button label="Retry" variant="outline" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        className="flex-1 bg-white"
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a7a8c" />}
        ListHeaderComponent={
          <View>
            {hero}

            <View className="gap-3 pb-3 pt-5">
              {/* Toggle filters */}
              <View className="flex-row flex-wrap gap-2 px-5">
                <Chip
                  label="Breakfast"
                  icon="cafe-outline"
                  active={breakfast}
                  onPress={() => setBreakfast((v) => !v)}
                />
                <Chip
                  label="Free cancellation"
                  icon="checkmark-circle-outline"
                  active={freeCancel}
                  onPress={() => setFreeCancel((v) => !v)}
                />
              </View>

              {/* Sort — horizontal scroll so it never wraps */}
              <View className="flex-row items-center gap-2 px-5">
                <Ionicons name="swap-vertical" size={16} color="#5f7178" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingRight: 20 }}
                >
                  {SORTS.map((s) => (
                    <Chip
                      key={s.key}
                      label={s.label}
                      active={sort === s.key}
                      onPress={() => setSort(s.key)}
                    />
                  ))}
                </ScrollView>
              </View>

              <Text className="px-5 text-sm font-medium text-muted">
                {hotels.length} stay{hotels.length === 1 ? '' : 's'} available
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-24 items-center justify-center gap-3 px-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <Ionicons name="bed-outline" size={28} color="#1a7a8c" />
            </View>
            <Text className="text-lg font-display text-ink">No stays match</Text>
            <Text className="text-center text-sm text-muted">
              Try clearing filters or searching a different city.
            </Text>
          </View>
        }
      />
    </>
  );
}
