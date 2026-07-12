import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Animated, Button, enterUp, ListSkeleton, OceanHero, PressableScale } from '@/components/ui';
import { APP_NAME } from '@/constants/config';
import { FeaturedGuideCard, GuidePerks, useGuides, type Guide, type GuideSort } from '@/features/guides';

// App brand mark (same asset the home hero + other tabs use).
const logo = require('../../../assets/images/icon.png');

const SORTS: { key: GuideSort; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_low', label: 'Price: low' },
  { key: 'price_high', label: 'Price: high' },
  { key: 'rating', label: 'Top rated' },
  { key: 'reviews', label: 'Most reviews' },
];

/** All-caps, letter-spaced field label used inside the search card (mirrors home/BNB). */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {children}
    </Text>
  );
}

/**
 * Verified Guides listing.
 *
 * Reads from `GET /api/guides?status=active&include_profiles=true` via
 * `useGuides()`. The screen mirrors the BNB (rentals) page in the app's visual
 * language: a navy hero with a floating search card (city + sort filters), a
 * 2-column guide grid, and a value-prop footer. React Query refetches on focus
 * and pull-to-refresh so newly-approved guides appear without a reload.
 */
export default function GuidesScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useGuides();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string | null>(null);
  const [sort, setSort] = useState<GuideSort>('recommended');

  const allGuides = useMemo(() => data?.data ?? [], [data?.data]);

  // Distinct cities across all guides, for the CITY filter row.
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
        <FeaturedGuideCard guide={item} index={index} />
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

  // CITY selector — "All Cities" plus every distinct city, styled like the home
  // experience pills (active = solid navy, idle = hairline outline).
  const cityPills: { key: string; label: string; icon: string }[] = [
    { key: 'all', label: 'All Cities', icon: 'apps-outline' },
    ...cities.map((c) => ({ key: c, label: c, icon: 'location-outline' })),
  ];

  return (
    <FlatList
      // Single full-width column (matches the home/shop listing cards). A static
      // key forces a fresh FlatList instance across the earlier grid layout so RN
      // never sees numColumns change on a live-mounted list.
      key="guides-list-1col"
      className="flex-1 bg-background"
      data={guides}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f5a623" />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          {/* Hero — deep navy, mirroring the BNB page */}
          <Animated.View entering={enterUp(0)}>
            <OceanHero className="rounded-b-[36px] px-5 pb-16 pt-6">
              <View className="flex-row items-center gap-2.5">
                <Image
                  source={logo}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                  contentFit="contain"
                />
                <Text className="font-display text-base text-white">{APP_NAME}</Text>
              </View>

              {/* LOCAL EXPERTS eyebrow badge */}
              <View className="mt-5 flex-row">
                <View className="flex-row items-center gap-1.5 rounded-full border border-accent-500/50 bg-accent-500/10 px-3 py-1.5">
                  <Ionicons name="sparkles" size={12} color="#f5a623" />
                  <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-accent-400">
                    Local Experts
                  </Text>
                </View>
              </View>

              <Text className="mt-3 font-display-x text-[34px] leading-[40px] text-white">
                Explore With{'\n'}
                <Text className="text-accent-500">Verified Guides</Text>
              </Text>
              <View className="mt-2 h-1 w-16 rounded-full bg-accent-500" />

              <Text className="mt-3 text-[15px] leading-5 text-white/85">
                Local experts for authentic cultural journeys and unforgettable hiking adventures.
              </Text>
            </OceanHero>
          </Animated.View>

          {/* Floating search card — overlaps the hero (home "booking card" pattern) */}
          <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
            <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
                  <Ionicons name="compass" size={22} color="#00a165" />
                </View>
                <View className="flex-1">
                  <Text className="font-display-semibold text-[17px] leading-5 text-ink">
                    Find your guide
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {allGuides.length} verified guide{allGuides.length === 1 ? '' : 's'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1">
                  <Ionicons name="shield-checkmark" size={11} color="#b8710c" />
                  <Text className="text-[11px] font-body-semibold text-accent-700">Verified</Text>
                </View>
              </View>

              {/* SEARCH — name / city / language + accent search button */}
              <View className="gap-2.5">
                <FieldLabel>Search</FieldLabel>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk px-4 py-3.5">
                    <Ionicons name="search" size={19} color="#00a165" />
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      placeholder="Search guides"
                      placeholderTextColor="#7c8a99"
                      returnKeyType="search"
                      textAlignVertical="center"
                      style={{ includeFontPadding: false }}
                      className="flex-1 py-0 text-[16px] font-body-medium text-ink"
                    />
                    {query ? (
                      <PressableScale onPress={() => setQuery('')} activeScale={0.85} hitSlop={8}>
                        <Ionicons name="close-circle" size={18} color="#7c8a99" />
                      </PressableScale>
                    ) : null}
                  </View>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel="Search"
                    onPress={() => Keyboard.dismiss()}
                    activeScale={0.92}
                  >
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 shadow-glow">
                      <Ionicons name="search" size={22} color="#fff" />
                    </View>
                  </PressableScale>
                </View>
              </View>

              {/* CITY — city pills */}
              {cities.length > 0 ? (
                <View className="gap-2.5">
                  <FieldLabel>City</FieldLabel>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2 pr-4"
                  >
                    {cityPills.map((c) => {
                      const active = c.key === 'all' ? city === null : city === c.key;
                      return (
                        <PressableScale
                          key={c.key}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          activeScale={0.94}
                          onPress={() => setCity(c.key === 'all' ? null : c.key)}
                        >
                          <View
                            className={[
                              'flex-row items-center gap-1.5 rounded-full px-4 py-2.5',
                              active ? 'bg-brand-800' : 'border border-hairline bg-surface-sunk',
                            ].join(' ')}
                          >
                            <Ionicons
                              name={c.icon as never}
                              size={15}
                              color={active ? '#f5a623' : '#00a165'}
                            />
                            <Text
                              className={[
                                'text-[13px] font-body-semibold',
                                active ? 'text-white' : 'text-ink',
                              ].join(' ')}
                            >
                              {c.label}
                            </Text>
                          </View>
                        </PressableScale>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {/* SORT — ordering pills */}
              <View className="gap-2.5">
                <FieldLabel>Sort by</FieldLabel>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2 pr-4"
                >
                  {SORTS.map((s) => {
                    const active = sort === s.key;
                    return (
                      <PressableScale
                        key={s.key}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        activeScale={0.94}
                        onPress={() => setSort(s.key)}
                      >
                        <View
                          className={[
                            'rounded-full px-4 py-2.5',
                            active ? 'border border-accent-500 bg-accent-50' : 'border border-hairline bg-surface-sunk',
                          ].join(' ')}
                        >
                          <Text
                            className={[
                              'text-[13px] font-body-semibold',
                              active ? 'text-accent-700' : 'text-ink',
                            ].join(' ')}
                          >
                            {s.label}
                          </Text>
                        </View>
                      </PressableScale>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Animated.View>

          {/* All Verified Guides — section header */}
          <Animated.View entering={enterUp(2)} className="gap-1 px-5 pb-4 pt-7">
            <Text className="font-display-x text-[22px] leading-7 text-ink">All Verified Guides</Text>
            <Text className="text-[13px] leading-5 text-muted">
              {guides.length} expert guide{guides.length === 1 ? '' : 's'} matched
            </Text>
          </Animated.View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-8 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="people-outline" size={28} color="#00a165" />
          </View>
          <Text className="text-lg font-display text-ink">No guides found</Text>
          <Text className="text-center text-sm text-muted">
            {query || city
              ? 'Try a different search or clear the filters.'
              : 'Approved guides will appear here. Pull down to refresh.'}
          </Text>
        </View>
      }
      ListFooterComponent={
        <View className="gap-12 pt-4">
          <GuidePerks />
        </View>
      }
    />
  );
}
