import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { ListHero } from '@/components/layout/ListHero';
import { Button, ListSkeleton } from '@/components/ui';
import { RentalCard, useRentals, type Rental } from '@/features/rentals';

/**
 * BNB listing (vacation rentals — renamed "BNB" to match the website's tab).
 *
 * Reads from `GET /rentals` via `useRentals()` — the same API the web site uses.
 * Anything posted from the web dashboard shows up here; React Query refetches on
 * focus and on pull-to-refresh, so new listings appear without a reload.
 */
export default function RentalsScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useRentals();
  const [query, setQuery] = useState('');

  const allRentals = useMemo(() => data?.data ?? [], [data?.data]);

  const rentals = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRentals;
    return allRentals.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.propertyType.toLowerCase().includes(q) ||
        (r.location?.city?.toLowerCase().includes(q) ?? false),
    );
  }, [allRentals, query]);

  const renderItem = useCallback(
    ({ item, index }: { item: Rental; index: number }) => (
      <View className="px-5 pb-4">
        <RentalCard rental={item} index={index} />
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
          Couldn&apos;t load BNB properties. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={rentals}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f5a623" />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          <ListHero
            variant="sun"
            icon="home-outline"
            eyebrow="Stay"
            title="BNB"
            subtitle="Villas, apartments and unique properties."
            query={query}
            onChangeQuery={setQuery}
            placeholder="Search BNBs, cities or types"
          />

          <View className="px-5 pb-3 pt-4">
            <Text className="text-sm text-muted">
              {rentals.length} propert{rentals.length === 1 ? 'y' : 'ies'} available
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="home-outline" size={28} color="#00a165" />
          </View>
          <Text className="text-lg font-display text-ink">
            No BNBs posted yet
          </Text>
          <Text className="text-center text-sm text-muted">
            New BNB properties posted from the dashboard will appear here. Pull down to refresh.
          </Text>
        </View>
      }
    />
  );
}
