import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';

import { Button, ListSkeleton } from '@/components/ui';
import { ProductCard, useProducts, type Product } from '@/features/shop';

/**
 * Marketplace listing (travel gear & local products).
 *
 * Reads from `GET /products` via `useProducts()` — the same API the web
 * Marketplace page uses. Search and the category row filter the fetched list
 * client-side; React Query refetches on focus and on pull-to-refresh, so items
 * posted from the web dashboard appear without a reload.
 */
export default function ShopScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const allProducts = useMemo(() => data?.data ?? [], [data?.data]);

  // Distinct seller categories across all products, for the filter row.
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.productCategory) set.add(p.productCategory);
    });
    return Array.from(set).sort();
  }, [allProducts]);

  const products = useMemo(() => {
    let list = allProducts;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.productCategory?.toLowerCase().includes(q),
      );
    }
    if (category) list = list.filter((p) => p.productCategory === category);
    return list;
  }, [allProducts, query, category]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} />,
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-black">
        <ListSkeleton count={4} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-neutral-50 px-8 dark:bg-black">
        <Ionicons name="cloud-offline-outline" size={40} color="#9ca3af" />
        <Text className="text-center text-neutral-500">
          Couldn&apos;t load the marketplace. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-black"
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={{ paddingHorizontal: 20, gap: 12 }}
      contentContainerClassName="gap-3 pb-8 pt-3"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#208aef" />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="gap-3 px-5 pb-3 pt-3">
          <View className="flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search products or brands"
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

          {categories.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['All', ...categories]}
              keyExtractor={(c) => c}
              contentContainerClassName="gap-2"
              renderItem={({ item }) => {
                const active = item === 'All' ? category === null : category === item;
                return (
                  <Pressable
                    onPress={() => setCategory(item === 'All' ? null : item)}
                    className={[
                      'rounded-full border px-3 py-1.5',
                      active
                        ? 'border-brand-500 bg-brand-500'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
                    ].join(' ')}
                  >
                    <Text
                      className={[
                        'text-xs font-semibold',
                        active ? 'text-white' : 'text-neutral-600 dark:text-neutral-300',
                      ].join(' ')}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          ) : null}

          <Text className="text-sm text-neutral-500">
            {products.length} item{products.length === 1 ? '' : 's'} available
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="bag-handle-outline" size={28} color="#208aef" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 dark:text-white">
            {query || category ? 'No matching products' : 'No products yet'}
          </Text>
          <Text className="text-center text-sm text-neutral-500">
            {query || category
              ? 'Try a different search or category.'
              : 'Products posted from the dashboard will appear here. Pull down to refresh.'}
          </Text>
        </View>
      }
    />
  );
}
