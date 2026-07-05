import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { Button, ListSkeleton } from '@/components/ui';
import { RentalCard, useRentals, type Rental } from '@/features/rentals';

/**
 * Vacation Rentals listing.
 *
 * Reads from `GET /rentals` via `useRentals()` — the same API the web site uses.
 * Anything posted from the web dashboard shows up here; React Query refetches on
 * focus and on pull-to-refresh, so new listings appear without a reload.
 */
export default function RentalsScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useRentals();

  const rentals = data?.data ?? [];

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
          Couldn&apos;t load vacation rentals. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-black"
      data={rentals}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8 pt-3"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#219ebc" />
      }
      ListHeaderComponent={
        <View className="px-5 pb-3">
          <Text className="text-sm text-neutral-500">
            {rentals.length > 0
              ? `${data?.total ?? rentals.length} rental${(data?.total ?? rentals.length) === 1 ? '' : 's'} available`
              : ' '}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="home-outline" size={28} color="#219ebc" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 dark:text-white">
            No rentals posted yet
          </Text>
          <Text className="text-center text-sm text-neutral-500">
            New vacation rentals posted from the dashboard will appear here. Pull down to refresh.
          </Text>
        </View>
      }
    />
  );
}
