import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { ListHero } from '@/components/layout/ListHero';
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
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard product={item} index={index} />
    ),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <ListSkeleton count={4} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Ionicons name="cloud-offline-outline" size={40} color="#9aa7ac" />
        <Text className="text-center text-muted">
          Couldn&apos;t load the marketplace. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={{ paddingHorizontal: 20, gap: 12 }}
      contentContainerClassName="gap-3 pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a7a8c" />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          <ListHero
            variant="sun"
            icon="bag-outline"
            eyebrow="Shop"
            title="Marketplace"
            subtitle="Travel gear and local products."
            query={query}
            onChangeQuery={setQuery}
            placeholder="Search products or brands"
          />

          <View className="gap-3 px-5 pb-3 pt-4">
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

            <Text className="text-sm text-muted">
              {products.length} item{products.length === 1 ? '' : 's'} available
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-24 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="bag-handle-outline" size={28} color="#1a7a8c" />
          </View>
          <Text className="text-lg font-display text-ink">
            {query || category ? 'No matching products' : 'No products yet'}
          </Text>
          <Text className="text-center text-sm text-muted">
            {query || category
              ? 'Try a different search or category.'
              : 'Products posted from the dashboard will appear here. Pull down to refresh.'}
          </Text>
        </View>
      }
    />
  );
}
