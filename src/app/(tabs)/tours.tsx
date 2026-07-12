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

import { NewsletterCTA } from '@/components/NewsletterCTA';
import { Animated, Button, enterUp, ListSkeleton, OceanHero, PressableScale } from '@/components/ui';
import { APP_NAME } from '@/constants/config';
import { AgencyCard, PremiumSpotlight, useTours, type Tour } from '@/features/tours';

// App brand mark (same asset the home hero + auth header use).
const logo = require('../../../assets/images/icon.png');

/** All-caps, letter-spaced field label used inside the search card (mirrors home). */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {children}
    </Text>
  );
}

/**
 * Guided Tours listing.
 *
 * Reads from `GET /agencies?status=Approved&include_packages=true` via
 * `useTours()` — the same API the web tours page uses. Anything an approved tour
 * operator posts from the dashboard shows up here; React Query refetches on focus
 * and on pull-to-refresh, so new operators appear without a reload.
 *
 * The header mirrors the marketing site's tours hero ("Plan Your Next Adventure")
 * rebuilt in the app's own visual language: the deep-navy `OceanHero` from the
 * home screen with a floating search card (FIND AGENCY + EXPERTISE) overlapping it.
 */
export default function ToursScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useTours();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string | null>(null);

  const allTours = useMemo(() => data?.data ?? [], [data?.data]);

  // Distinct operating cities across all operators, for the EXPERTISE filter row.
  const cities = useMemo(() => {
    const set = new Set<string>();
    allTours.forEach((t) => t.operatingCities.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [allTours]);

  const tours = useMemo(() => {
    let list = allTours;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.operatingCities.some((c) => c.toLowerCase().includes(q)),
      );
    }
    if (city) list = list.filter((t) => t.operatingCities.includes(city));
    return list;
  }, [allTours, query, city]);

  const renderItem = useCallback(
    ({ item, index }: { item: Tour; index: number }) => (
      <View className="px-5 pb-4">
        <AgencyCard tour={item} index={index} />
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
          Couldn&apos;t load guided tours. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  // EXPERTISE selector — "All" plus every operating city, styled like the home
  // experience pills (active = solid navy, idle = hairline outline).
  const expertise: { key: string; label: string; icon: string }[] = [
    { key: 'all', label: 'Everything', icon: 'apps-outline' },
    ...cities.map((c) => ({ key: c, label: c, icon: 'location-outline' })),
  ];

  return (
    <FlatList
      className="flex-1 bg-background"
      data={tours}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00a165" />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          {/* Hero — deep navy, mirroring the home screen exactly */}
          <Animated.View entering={enterUp(0)}>
            <OceanHero className="rounded-b-[36px] px-5 pb-16 pt-6">
              {/* Brand row — same as home: logo + app name */}
              <View className="flex-row items-center gap-2.5">
                <Image
                  source={logo}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                  contentFit="contain"
                />
                <Text className="font-display text-base text-white">{APP_NAME}</Text>
              </View>

              <Text className="mt-7 font-display-x text-[34px] leading-[40px] text-white">
                Plan Your Next{'\n'}
                <Text className="text-accent-500">Adventure</Text>
              </Text>
              {/* Gold underline accent under the highlighted keyword */}
              <View className="mt-2 h-1 w-16 rounded-full bg-accent-500" />

              <Text className="mt-3 text-[15px] leading-5 text-white/85">
                Connect with the world&apos;s most trusted local experts — tailored experiences,
                verified partners, and unforgettable memories.
              </Text>
            </OceanHero>
          </Animated.View>

          {/* Floating search card — overlaps the hero (home "booking card" pattern) */}
          <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
            <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
              {/* Header — context + brand */}
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
                  <Ionicons name="bus" size={22} color="#00a165" />
                </View>
                <View className="flex-1">
                  <Text className="font-display-semibold text-[17px] leading-5 text-ink">
                    Find your operator
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {allTours.length} verified tour operator{allTours.length === 1 ? '' : 's'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1">
                  <Ionicons name="shield-checkmark" size={11} color="#b8710c" />
                  <Text className="text-[11px] font-body-semibold text-accent-700">Verified</Text>
                </View>
              </View>

              {/* FIND AGENCY — search input + accent search button */}
              <View className="gap-2.5">
                <FieldLabel>Find Agency</FieldLabel>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk px-4 py-3.5">
                    <Ionicons name="search" size={19} color="#00a165" />
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      placeholder="Agency name or city…"
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
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel="Search"
                    onPress={() => Keyboard.dismiss()}
                    activeScale={0.92}
                  >
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 shadow-glow">
                      <Ionicons name="arrow-forward" size={24} color="#fff" />
                    </View>
                  </PressableScale>
                </View>
              </View>

              {/* EXPERTISE — operating-city pills */}
              {cities.length > 0 ? (
                <View className="gap-2.5">
                  <FieldLabel>Expertise</FieldLabel>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2 pr-4"
                  >
                    {expertise.map((exp) => {
                      const active = exp.key === 'all' ? city === null : city === exp.key;
                      return (
                        <PressableScale
                          key={exp.key}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          activeScale={0.94}
                          onPress={() => setCity(exp.key === 'all' ? null : exp.key)}
                        >
                          <View
                            className={[
                              'flex-row items-center gap-1.5 rounded-full px-4 py-2.5',
                              active ? 'bg-brand-800' : 'border border-hairline bg-surface-sunk',
                            ].join(' ')}
                          >
                            <Ionicons
                              name={exp.icon as never}
                              size={15}
                              color={active ? '#f5a623' : '#00a165'}
                            />
                            <Text
                              className={[
                                'text-[13px] font-body-semibold',
                                active ? 'text-white' : 'text-ink',
                              ].join(' ')}
                            >
                              {exp.label}
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

          {/* Premium Spotlight — verified elite operators (renders only if any) */}
          <PremiumSpotlight tours={tours} index={2} />

          {/* Verified Local Agencies — section header */}
          <Animated.View entering={enterUp(3)} className="gap-2 px-5 pb-4 pt-7">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display-x text-[21px] leading-7 text-ink">
                Verified Local Agencies
              </Text>
              <View className="items-center rounded-2xl border border-hairline bg-surface px-3.5 py-1.5 shadow-card">
                <Text className="text-[9px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
                  Display
                </Text>
                <Text className="text-[15px] font-display-semibold text-ink">
                  {tours.length} Item{tours.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            <Text className="text-[13px] leading-5 text-muted">
              Found {tours.length} trusted partner{tours.length === 1 ? '' : 's'}
              {city ? ` in ${city}` : ' matching your criteria'}
            </Text>
          </Animated.View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-16 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="map-outline" size={28} color="#00a165" />
          </View>
          <Text className="text-lg font-display text-ink">No tours found</Text>
          <Text className="text-center text-sm text-muted">
            {query || city
              ? 'Try a different search or clear the filters.'
              : 'Approved tour operators posted from the dashboard will appear here. Pull down to refresh.'}
          </Text>
        </View>
      }
      ListFooterComponent={
        <Animated.View entering={enterUp(1)} className="mt-8 px-5">
          <NewsletterCTA />
        </Animated.View>
      }
    />
  );
}
