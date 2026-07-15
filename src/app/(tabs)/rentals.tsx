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
import {
  FeaturedDestinations,
  PropertyCard,
  RentalPerks,
  useRentals,
  type Rental,
} from '@/features/rentals';

// App brand mark (same asset the home hero + tours page use).
const logo = require('../../../assets/images/icon.png');

/** Sentinel used to pad the grid to an even count so the last row aligns. */
type GridItem = Rental | { id: string; spacer: true };
const isSpacer = (item: GridItem): item is { id: string; spacer: true } => 'spacer' in item;

/** All-caps, letter-spaced field label used inside the search card (mirrors home). */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {children}
    </Text>
  );
}

/**
 * BNB listing (vacation rentals — "BNB" matches the website's tab).
 *
 * Reads from `GET /rentals` via `useRentals()`. The screen mirrors the marketing
 * site's rentals page rebuilt in the app's visual language (the tours-page
 * treatment): a navy hero with a floating search card + property-type pills, a
 * 2-column property grid, featured destinations, a value-prop grid and the
 * newsletter CTA.
 */
export default function RentalsScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useRentals();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string | null>(null);

  const allRentals = useMemo(() => data?.data ?? [], [data?.data]);

  // Distinct property types across all listings, for the TYPE filter row.
  const propertyTypes = useMemo(() => {
    const set = new Set<string>();
    allRentals.forEach((r) => r.propertyType && set.add(r.propertyType));
    return Array.from(set).sort();
  }, [allRentals]);

  const rentals = useMemo(() => {
    let list = allRentals;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.propertyType.toLowerCase().includes(q) ||
          (r.location?.city?.toLowerCase().includes(q) ?? false),
      );
    }
    if (type) list = list.filter((r) => r.propertyType === type);
    return list;
  }, [allRentals, query, type]);

  // Pad to an even count so a lone final card doesn't stretch full-width.
  const gridData = useMemo<GridItem[]>(
    () => (rentals.length % 2 === 1 ? [...rentals, { id: '__spacer__', spacer: true }] : rentals),
    [rentals],
  );

  const renderItem = useCallback(({ item, index }: { item: GridItem; index: number }) => {
    if (isSpacer(item)) return <View className="flex-1" />;
    return (
      <View className="flex-1 pb-4">
        <PropertyCard rental={item} index={index} />
      </View>
    );
  }, []);

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

  // TYPE selector — "All Homes" plus every distinct property type, styled like
  // the home experience pills (active = solid navy, idle = hairline outline).
  const types: { key: string; label: string; icon: string }[] = [
    { key: 'all', label: 'All Homes', icon: 'apps-outline' },
    ...propertyTypes.map((t) => ({ key: t, label: t, icon: 'home-outline' })),
  ];

  return (
    <FlatList
      className="flex-1 bg-background"
      data={gridData}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={{ paddingHorizontal: 20, gap: 14 }}
      contentContainerClassName="pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f5a623" />
      }
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      ListHeaderComponent={
        <>
          {/* Hero — deep navy, mirroring the tours page */}
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

              {/* PREMIUM LIVING eyebrow badge */}
              <View className="mt-5 flex-row">
                <View className="flex-row items-center gap-1.5 rounded-full border border-accent-500/50 bg-accent-500/10 px-3 py-1.5">
                  <Ionicons name="sparkles" size={12} color="#f5a623" />
                  <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-accent-400">
                    Premium Living
                  </Text>
                </View>
              </View>

              <Text className="mt-3 font-display-x text-[34px] leading-[40px] text-white">
                Find Your{'\n'}
                <Text className="text-accent-500">Perfect Residence</Text>
              </Text>
              <View className="mt-2 h-1 w-16 rounded-full bg-accent-500" />

              <Text className="mt-3 text-[15px] leading-5 text-white/85">
                Discover exceptionally designed properties verified for maximum comfort and style.
              </Text>
            </OceanHero>
          </Animated.View>

          {/* Floating search card — overlaps the hero (home "booking card" pattern) */}
          <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
            <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
                  <Ionicons name="home" size={22} color="#00a165" />
                </View>
                <View className="flex-1">
                  <Text className="font-display-semibold text-[17px] leading-5 text-ink">
                    Find your stay
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {allRentals.length} verified propert{allRentals.length === 1 ? 'y' : 'ies'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1">
                  <Ionicons name="shield-checkmark" size={11} color="#b8710c" />
                  <Text className="text-[11px] font-body-semibold text-accent-700">Verified</Text>
                </View>
              </View>

              {/* WHERE — destination search + accent search button */}
              <View className="gap-2.5">
                <FieldLabel>Where</FieldLabel>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk px-4 py-3.5">
                    <Ionicons name="location-outline" size={19} color="#00a165" />
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      placeholder="Search destinations…"
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

              {/* TYPE — property-type pills */}
              {propertyTypes.length > 0 ? (
                <View className="gap-2.5">
                  <FieldLabel>Type</FieldLabel>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2 pr-4"
                  >
                    {types.map((t) => {
                      const active = t.key === 'all' ? type === null : type === t.key;
                      return (
                        <PressableScale
                          key={t.key}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          activeScale={0.94}
                          onPress={() => setType(t.key === 'all' ? null : t.key)}
                        >
                          <View
                            className={[
                              'flex-row items-center gap-1.5 rounded-full px-4 py-2.5',
                              active ? 'bg-brand-800' : 'border border-hairline bg-surface-sunk',
                            ].join(' ')}
                          >
                            <Ionicons
                              name={t.icon as never}
                              size={15}
                              color={active ? '#f5a623' : '#00a165'}
                            />
                            <Text
                              className={[
                                'text-[13px] font-body-semibold',
                                active ? 'text-white' : 'text-ink',
                              ].join(' ')}
                            >
                              {t.label}
                            </Text>
                          </View>
                        </PressableScale>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          </Animated.View>

          {/* All Available Homes — section header */}
          <Animated.View entering={enterUp(2)} className="gap-1 px-5 pb-4 pt-7">
            <Text className="font-display-x text-[22px] leading-7 text-ink">All Available Homes</Text>
            <Text className="text-[13px] leading-5 text-muted">
              {rentals.length} stunning propert{rentals.length === 1 ? 'y' : 'ies'} matched
            </Text>
          </Animated.View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-8 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="home-outline" size={28} color="#00a165" />
          </View>
          <Text className="text-lg font-display text-ink">No properties found</Text>
          <Text className="text-center text-sm text-muted">
            {query || type
              ? 'Try a different search or clear the filters.'
              : 'New BNB properties posted from the dashboard will appear here. Pull down to refresh.'}
          </Text>
        </View>
      }
      ListFooterComponent={
        <View className="gap-12 pt-4">
          <FeaturedDestinations rentals={allRentals} index={0} />
          <RentalPerks />
        </View>
      }
    />
  );
}
