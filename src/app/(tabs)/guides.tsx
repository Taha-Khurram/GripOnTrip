import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { ListHero } from '@/components/layout/ListHero';
import { Button, ListSkeleton } from '@/components/ui';
import { GuideCard, useGuides, type Guide, type GuideSort } from '@/features/guides';

const SORTS: { key: GuideSort; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_low', label: 'Price: low' },
  { key: 'price_high', label: 'Price: high' },
  { key: 'rating', label: 'Top rated' },
  { key: 'reviews', label: 'Most reviews' },
];

/**
 * Verified Guides listing.
 *
 * Reads from `GET /api/guides?status=active&include_profiles=true` via
 * `useGuides()` — the same API the web guides page uses. Search, city filter and
 * sort mirror the website; React Query refetches on focus and pull-to-refresh so
 * newly-approved guides appear without a reload.
 */
export default function GuidesScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useGuides();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string | null>(null);
  const [sort, setSort] = useState<GuideSort>('recommended');

  const allGuides = useMemo(() => data?.data ?? [], [data?.data]);

  // Distinct cities across all guides, for the filter row.
  const cities = useMemo(() => {
    const set = new Set<string>();
    allGuides.forEach((g) => g.city && set.add(g.city));
    return Array.from(set).sort();
  }, [allGuides]);

  const guides = useMemo(() => {
    let list = allGuides;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.city?.toLowerCase().includes(q) ||
          g.bio?.toLowerCase().includes(q) ||
          g.languages.some((l) => l.toLowerCase().includes(q)),
      );
    }
    if (city) list = list.filter((g) => g.city === city);

    // Sort is applied to a copy so the source list order is preserved.
    const sorted = [...list];
    switch (sort) {
      case 'price_low':
        sorted.sort((a, b) => a.dailyRate - b.dailyRate);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.dailyRate - a.dailyRate);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }
    return sorted;
  }, [allGuides, query, city, sort]);

  const renderItem = useCallback(
    ({ item, index }: { item: Guide; index: number }) => (
      <View className="px-5 pb-4">
        <GuideCard guide={item} index={index} />
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
          Couldn&apos;t load guides. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={guides}
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
            icon="compass-outline"
            eyebrow="Local experts"
            title="Verified Guides"
            subtitle="Local experts for cultural & hiking experiences."
            query={query}
            onChangeQuery={setQuery}
            placeholder="Search guides, cities or languages"
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
                    <Text
                      className={[
                        'text-xs font-semibold',
                        active ? 'text-white' : 'text-muted',
                      ].join(' ')}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          ) : null}

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SORTS}
            keyExtractor={(s) => s.key}
            contentContainerClassName="gap-2"
            renderItem={({ item }) => {
              const active = sort === item.key;
              return (
                <Pressable
                  onPress={() => setSort(item.key)}
                  className={[
                    'rounded-full border px-3 py-1.5',
                    active
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-hairline bg-white dark:border-neutral-700 dark:bg-neutral-900',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-xs font-semibold',
                      active ? 'text-accent-700' : 'text-muted',
                    ].join(' ')}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />

            <Text className="text-sm text-muted">
              {guides.length} verified guide{guides.length === 1 ? '' : 's'} available
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="people-outline" size={28} color="#00a165" />
          </View>
          <Text className="text-lg font-display text-ink">
            No guides found
          </Text>
          <Text className="text-center text-sm text-muted">
            Approved guides will appear here. Try clearing filters or pull down to refresh.
          </Text>
        </View>
      }
    />
  );
}
