import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';

import { Button, ListSkeleton } from '@/components/ui';
import { UmrahPackageCard, useUmrahPackages, type UmrahFilters, type UmrahPackage } from '@/features/umrah';

type SortKey = NonNullable<UmrahFilters['sort']>;
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
          ? 'border-emerald-600 bg-emerald-600'
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
 * Umrah Packages listing.
 *
 * Reads the SAME approved-agencies feed as the web `/umrah` page
 * (`GET /agencies?status=Approved&include_packages=true`) and shows the packages
 * whose name is prefixed "[UMRAH]". Search / sort run on the client; React Query
 * refetches on focus and on pull-to-refresh.
 */
export default function UmrahScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useUmrahPackages();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('recommended');

  const packages = useMemo(() => {
    let list = data ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.packageName.toLowerCase().includes(q) ||
          p.operatingCities.some((c) => c.toLowerCase().includes(q)) ||
          (p.departureLocation?.toLowerCase().includes(q) ?? false),
      );
    }
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
    else if (sort === 'rating-desc') sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted;
  }, [data, query, sort]);

  const renderItem = useCallback(
    ({ item }: { item: UmrahPackage }) => (
      <View className="px-5 pb-4">
        <UmrahPackageCard pkg={item} />
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
          Couldn&apos;t load Umrah packages. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-black"
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#059669" />}
      ListHeaderComponent={
        <View className="gap-3 px-5 pb-3 pt-3">
          <View className="flex-row items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3">
            <Text className="text-xl">🕋</Text>
            <View className="flex-1">
              <Text className="text-sm font-bold text-white">Premium Umrah Booking Service</Text>
              <Text className="text-xs text-emerald-50">
                Verified partner agencies · visa, hotels &amp; transport handled
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search operator, package or city"
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
            {SORTS.map((s) => (
              <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />
            ))}
          </View>

          <Text className="text-sm text-neutral-500">
            {packages.length} package{packages.length === 1 ? '' : 's'} available
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Ionicons name="moon-outline" size={28} color="#059669" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 dark:text-white">No Umrah packages yet</Text>
          <Text className="text-center text-sm text-neutral-500">
            Verified partner agencies haven&apos;t published any pre-built Umrah packages yet. Pull
            down to refresh.
          </Text>
        </View>
      }
    />
  );
}
