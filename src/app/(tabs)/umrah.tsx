import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { ListHero } from '@/components/layout/ListHero';
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
          ? 'border-accent-500 bg-accent-500'
          : 'border-hairline bg-white dark:border-neutral-700 dark:bg-neutral-900',
      ].join(' ')}
    >
      <Text className={['text-xs font-semibold', active ? 'text-white' : 'text-muted'].join(' ')}>
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
    ({ item, index }: { item: UmrahPackage; index: number }) => (
      <View className="px-5 pb-4">
        <UmrahPackageCard pkg={item} index={index} />
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
          Couldn&apos;t load Umrah packages. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f39024" />}
      ListHeaderComponent={
        <>
          <ListHero
            variant="sun"
            icon="moon-outline"
            eyebrow="Pilgrimage"
            title="Umrah Packages"
            subtitle="Verified partner agencies — visa, hotels & transport handled."
            query={query}
            onChangeQuery={setQuery}
            placeholder="Search operator, package or city"
          />

          <View className="gap-3 px-5 pb-3 pt-4">
            <View className="flex-row flex-wrap gap-2">
              {SORTS.map((s) => (
                <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />
              ))}
            </View>

            <Text className="text-sm text-muted">
              {packages.length} package{packages.length === 1 ? '' : 's'} available
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-50">
            <Ionicons name="moon-outline" size={28} color="#f39024" />
          </View>
          <Text className="text-lg font-display text-ink">No Umrah packages yet</Text>
          <Text className="text-center text-sm text-muted">
            Verified partner agencies haven&apos;t published any pre-built Umrah packages yet. Pull
            down to refresh.
          </Text>
        </View>
      }
    />
  );
}
