import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';

import { Animated, Button, DeepPanel, enterUp, ListSkeleton, OceanHero, PressableScale } from '@/components/ui';
import { ProductCard, useProducts, type Product } from '@/features/shop';

/** Sort options mirroring the web collection page's "Sort By" control. */
const SORTS = [
  { key: 'recommended', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low' },
  { key: 'price-desc', label: 'Price: High' },
  { key: 'rating-desc', label: 'Top Rated' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

const OTHER = 'Other Items';

/** All-caps, letter-spaced field label — same as the home booking card. */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {children}
    </Text>
  );
}

/** Small selectable pill — the home hero's EXPERIENCE selector language. */
function SelectPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      activeScale={0.94}
      onPress={onPress}
    >
      <View
        className={[
          'rounded-full px-4 py-2.5',
          active ? 'bg-brand-800' : 'border border-hairline bg-surface-sunk',
        ].join(' ')}
      >
        <Text
          className={['text-[13px] font-body-semibold', active ? 'text-white' : 'text-ink'].join(' ')}
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

/**
 * Marketplace — "The Collection".
 *
 * Reads from `GET /products` via `useProducts()` (the same API the web
 * Marketplace uses) and presents it in the home screen's visual language: a
 * navy hero, a floating search/sort/filter toolbar, and category "collections"
 * rendered as horizontal rails. React Query refetches on focus and pull-to-
 * refresh, so items posted from the web dashboard appear without a reload.
 */
export default function ShopScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('recommended');
  const [openPanel, setOpenPanel] = useState<'sort' | 'filters' | null>(null);

  const allProducts = useMemo(() => data?.data ?? [], [data?.data]);

  // Distinct seller categories, in first-seen order, for the filter row + rails.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    allProducts.forEach((p) => {
      const c = p.productCategory ?? OTHER;
      if (!seen.has(c)) {
        seen.add(c);
        list.push(c);
      }
    });
    return list;
  }, [allProducts]);

  // Search + category filter, then sort — the flat working set.
  const filtered = useMemo(() => {
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
    if (category) list = list.filter((p) => (p.productCategory ?? OTHER) === category);

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price.amount - b.price.amount);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price.amount - a.price.amount);
    else if (sort === 'rating-desc') sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted;
  }, [allProducts, query, category, sort]);

  // Group into "collections" (one rail per category), preserving discovery order.
  const sections = useMemo(() => {
    const map = new Map<string, Product[]>();
    filtered.forEach((p) => {
      const c = p.productCategory ?? OTHER;
      const bucket = map.get(c);
      if (bucket) bucket.push(p);
      else map.set(c, [p]);
    });
    return Array.from(map, ([title, items]) => ({ title, items }));
  }, [filtered]);

  // When a search/single-category is active we drop the rails for a flat grid.
  const showFlatList = Boolean(query.trim()) || category != null;

  const togglePanel = useCallback(
    (panel: 'sort' | 'filters') => setOpenPanel((prev) => (prev === panel ? null : panel)),
    [],
  );

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? 'Featured';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="pb-12"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00a165" />
      }
    >
      {/* Hero — deep navy, mirrors the home hero */}
      <Animated.View entering={enterUp(0)}>
        <OceanHero className="rounded-b-[36px] px-5 pb-16 pt-6">
          <View className="flex-row items-center gap-2">
            <Ionicons name="bag-handle" size={16} color="#a9c2dd" />
            <Text className="text-[13px] font-medium text-brand-200">Shop</Text>
          </View>

          <Text className="mt-6 font-display-x text-[34px] leading-[40px] text-white">
            The <Text className="text-accent-500">Collection</Text>
          </Text>
          <View className="mt-2 h-1 w-16 rounded-full bg-accent-500" />

          <Text className="mt-3 text-[15px] leading-5 text-white/85">
            Premium essentials curated for your next journey.
          </Text>
        </OceanHero>
      </Animated.View>

      {/* Floating toolbar — search + sort + filters, like the home booking card */}
      <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
        <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
          {/* Search */}
          <View className="flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk px-4 py-3.5">
            <Ionicons name="search" size={19} color="#00a165" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search collection…"
              placeholderTextColor="#7c8a99"
              returnKeyType="search"
              className="flex-1 py-0 text-[16px] font-body-medium text-ink"
            />
            {query ? (
              <PressableScale onPress={() => setQuery('')} activeScale={0.85} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#7c8a99" />
              </PressableScale>
            ) : null}
          </View>

          {/* Sort / Filters controls */}
          <View className="flex-row items-center gap-2.5">
            <PressableScale
              accessibilityRole="button"
              activeScale={0.96}
              onPress={() => togglePanel('sort')}
              className="flex-1"
            >
              <View
                className={[
                  'flex-row items-center justify-center gap-1.5 rounded-full border px-4 py-2.5',
                  openPanel === 'sort' ? 'border-brand-800 bg-brand-50' : 'border-hairline bg-surface-sunk',
                ].join(' ')}
              >
                <Ionicons name="swap-vertical" size={15} color="#00a165" />
                <Text className="text-[13px] font-body-semibold text-ink" numberOfLines={1}>
                  Sort: {sortLabel}
                </Text>
                <Ionicons
                  name={openPanel === 'sort' ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#7c8a99"
                />
              </View>
            </PressableScale>

            <PressableScale
              accessibilityRole="button"
              activeScale={0.96}
              onPress={() => togglePanel('filters')}
              className="flex-1"
            >
              <View
                className={[
                  'flex-row items-center justify-center gap-1.5 rounded-full border px-4 py-2.5',
                  openPanel === 'filters' ? 'border-brand-800 bg-brand-50' : 'border-hairline bg-surface-sunk',
                ].join(' ')}
              >
                <Ionicons name="options-outline" size={15} color="#00a165" />
                <Text className="text-[13px] font-body-semibold text-ink">Filters</Text>
                {category ? (
                  <View className="h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1">
                    <Text className="text-[10px] font-body-semibold text-white">1</Text>
                  </View>
                ) : (
                  <Ionicons
                    name={openPanel === 'filters' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color="#7c8a99"
                  />
                )}
              </View>
            </PressableScale>
          </View>

          {/* Sort panel */}
          {openPanel === 'sort' ? (
            <View className="gap-2.5">
              <FieldLabel>Sort by</FieldLabel>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pr-4"
              >
                {SORTS.map((s) => (
                  <SelectPill
                    key={s.key}
                    label={s.label}
                    active={sort === s.key}
                    onPress={() => setSort(s.key)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Filters panel — browse by collection */}
          {openPanel === 'filters' && categories.length > 0 ? (
            <View className="gap-2.5">
              <FieldLabel>Collection</FieldLabel>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pr-4"
              >
                <SelectPill label="All" active={category === null} onPress={() => setCategory(null)} />
                {categories.map((c) => (
                  <SelectPill
                    key={c}
                    label={c}
                    active={category === c}
                    onPress={() => setCategory(category === c ? null : c)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* Body */}
      {isLoading ? (
        <View className="mt-6">
          <ListSkeleton count={3} />
        </View>
      ) : isError ? (
        <View className="mt-16 items-center justify-center gap-4 px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="#9aa7ac" />
          <Text className="text-center text-muted">
            Couldn&apos;t load the collection. Check your connection and try again.
          </Text>
          <Button label="Retry" variant="outline" onPress={() => refetch()} />
        </View>
      ) : filtered.length === 0 ? (
        <View className="mt-16 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="bag-handle-outline" size={28} color="#00a165" />
          </View>
          <Text className="text-lg font-display text-ink">
            {query || category ? 'No matching products' : 'No products yet'}
          </Text>
          <Text className="text-center text-sm text-muted">
            {query || category
              ? 'Try a different search or collection.'
              : 'Products posted from the dashboard will appear here. Pull down to refresh.'}
          </Text>
        </View>
      ) : showFlatList ? (
        // Search / single-collection view — full-width cards, one per row.
        <Animated.View entering={enterUp(2)} className="mt-6">
          <View className="flex-row items-baseline justify-between px-5 pb-3">
            <Text className="font-display text-xl text-ink">{category ?? 'Results'}</Text>
            <Text className="text-[13px] text-muted">
              {filtered.length} Premium Item{filtered.length === 1 ? '' : 's'}
            </Text>
          </View>
          {filtered.map((item, index) => (
            <View key={item.id} className="px-5 pb-4">
              <ProductCard product={item} index={index} />
            </View>
          ))}
        </Animated.View>
      ) : (
        // Collections view — one horizontal rail per category, like the home rails.
        sections.map((section, sIndex) => (
          <Animated.View key={section.title} entering={enterUp(2 + sIndex)} className="mt-7">
            <View className="flex-row items-end justify-between px-5 pb-3">
              <View className="flex-1 pr-3">
                <Text className="font-display text-xl text-ink" numberOfLines={1}>
                  {section.title}
                </Text>
                <Text className="mt-0.5 text-[13px] text-muted">
                  {section.items.length} Premium Item{section.items.length === 1 ? '' : 's'}
                </Text>
              </View>
              <PressableScale
                accessibilityRole="button"
                activeScale={0.96}
                onPress={() => {
                  setCategory(section.title);
                  setOpenPanel(null);
                }}
              >
                <View className="flex-row items-center gap-1 rounded-full border border-hairline bg-surface px-3.5 py-2 shadow-card">
                  <Text className="text-[13px] font-body-semibold text-ink">View All</Text>
                  <Ionicons name="chevron-forward" size={14} color="#00a165" />
                </View>
              </PressableScale>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-5"
            >
              {section.items.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} variant="compact" />
              ))}
            </ScrollView>
          </Animated.View>
        ))
      )}

      {/* Footer promo — matches the home "list your property" dark panel */}
      {!isLoading && !isError && filtered.length > 0 ? (
        <Animated.View entering={enterUp(3)} className="mx-5 mt-9">
          <DeepPanel className="flex-row items-center gap-4 rounded-[28px] p-5 shadow-soft">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-accent-500/15">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-500">
                <Ionicons name="pricetags" size={22} color="#0a1a2f" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="font-display-x text-[18px] leading-6 text-white">
                Curated for <Text className="text-accent-500">every trip</Text>
              </Text>
              <Text className="mt-1 text-[13px] leading-5 text-white/80">
                Premium travel essentials, refreshed as new items land.
              </Text>
            </View>
          </DeepPanel>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}
