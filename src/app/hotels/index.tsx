import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';

import { WhyGripOnTrip } from '@/components/WhyGripOnTrip';
import { Animated, Button, enterUp, ListSkeleton, OceanHero, PressableScale } from '@/components/ui';
import { APP_NAME } from '@/constants/config';
import { FeaturedHotelCard, useHotels, type Hotel, type HotelFilters } from '@/features/hotels';

// App brand mark (same asset the home hero + other tabs use).
const logo = require('../../../assets/images/icon.png');

type SortKey = NonNullable<HotelFilters['sort']>;
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price-asc', label: 'Price ↑' },
  { key: 'price-desc', label: 'Price ↓' },
  { key: 'rating-desc', label: 'Top rated' },
];

/** All-caps, letter-spaced field label used inside the search card (mirrors home). */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {children}
    </Text>
  );
}

/** Amenity toggle pill — home experience-pill styling (active = solid navy). */
function TogglePill({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
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
          'flex-row items-center gap-1.5 rounded-full px-4 py-2.5',
          active ? 'bg-brand-800' : 'border border-hairline bg-surface-sunk',
        ].join(' ')}
      >
        <Ionicons name={icon} size={15} color={active ? '#f5a623' : '#00a165'} />
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
 * Hotels & Stays listing, rebuilt in the home screen's visual language: a navy
 * hero with a floating search card (amenity toggles + sort), a full-width stay
 * grid and the "Built for Modern Travelers" value-prop footer. Reads all
 * approved hotels from `GET /hotels`, then applies search / filters / sort on
 * the client. React Query refetches on focus + pull-to-refresh.
 */
export default function HotelsListScreen() {
  const router = useRouter();
  const { data, isLoading, isError, isRefetching, refetch } = useHotels();
  const [query, setQuery] = useState('');
  const [breakfast, setBreakfast] = useState(false);
  const [freeCancel, setFreeCancel] = useState(false);
  const [sort, setSort] = useState<SortKey>('recommended');

  const allHotels = useMemo(() => data?.data ?? [], [data?.data]);

  const hotels = useMemo(() => {
    let list = allHotels;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.location?.city?.toLowerCase().includes(q) ||
          h.location?.address?.toLowerCase().includes(q),
      );
    }
    if (breakfast) list = list.filter((h) => h.breakfastIncluded);
    if (freeCancel) list = list.filter((h) => h.freeCancellation);

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price.amount - b.price.amount);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price.amount - a.price.amount);
    else if (sort === 'rating-desc') sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted;
  }, [allHotels, query, breakfast, freeCancel, sort]);

  const renderItem = useCallback(
    ({ item, index }: { item: Hotel; index: number }) => (
      <View className="px-5 pb-4">
        <FeaturedHotelCard hotel={item} index={index} />
      </View>
    ),
    [],
  );

  // Hero — deep navy, mirroring the home page (with a floating back button since
  // this is a pushed stack screen).
  const hero = (
    <Animated.View entering={enterUp(0)}>
      <View>
        <OceanHero className="rounded-b-[36px] px-5 pb-16 pt-6">
          <View className="flex-row items-center gap-2.5">
            <Image
              source={logo}
              style={{ width: 36, height: 36, borderRadius: 18 }}
              contentFit="contain"
            />
            <Text className="font-display text-base text-white">{APP_NAME}</Text>
          </View>

          {/* ZERO COMMISSION eyebrow badge */}
          <View className="mt-5 flex-row">
            <View className="flex-row items-center gap-1.5 rounded-full border border-accent-500/50 bg-accent-500/10 px-3 py-1.5">
              <Ionicons name="sparkles" size={12} color="#f5a623" />
              <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-accent-400">
                Verified Stays
              </Text>
            </View>
          </View>

          <Text className="mt-3 font-display-x text-[34px] leading-[40px] text-white">
            Find Your{'\n'}
            <Text className="text-accent-500">Perfect Stay</Text>
          </Text>
          <View className="mt-2 h-1 w-16 rounded-full bg-accent-500" />

          <Text className="mt-3 text-[15px] leading-5 text-white/85">
            Direct prices, zero commission — handpicked hotels and stays for every trip.
          </Text>
        </OceanHero>

        <PressableScale
          onPress={() => router.back()}
          activeScale={0.9}
          className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/30"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </PressableScale>
      </View>
    </Animated.View>
  );

  // Floating search card — overlaps the hero (home "booking card" pattern).
  const searchCard = (
    <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
      <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
            <Ionicons name="bed" size={22} color="#00a165" />
          </View>
          <View className="flex-1">
            <Text className="font-display-semibold text-[17px] leading-5 text-ink">
              Find your stay
            </Text>
            <Text className="text-[12px] text-muted">
              {allHotels.length} verified stay{allHotels.length === 1 ? '' : 's'}
            </Text>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1">
            <Ionicons name="pricetag" size={11} color="#b8710c" />
            <Text className="text-[11px] font-body-semibold text-accent-700">0% fees</Text>
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
                placeholder="Search by city or hotel…"
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

        {/* FILTERS — amenity toggles */}
        <View className="gap-2.5">
          <FieldLabel>Filters</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            <TogglePill
              label="Breakfast"
              icon="cafe-outline"
              active={breakfast}
              onPress={() => setBreakfast((v) => !v)}
            />
            <TogglePill
              label="Free cancellation"
              icon="checkmark-circle-outline"
              active={freeCancel}
              onPress={() => setFreeCancel((v) => !v)}
            />
          </View>
        </View>

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
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        {hero}
        {searchCard}
        <View className="pt-6">
          <ListSkeleton count={4} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        {hero}
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="#9aa7ac" />
          <Text className="text-center text-muted">
            Couldn&apos;t load hotels &amp; stays. Check your connection and try again.
          </Text>
          <Button label="Retry" variant="outline" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        className="flex-1 bg-background"
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f5a623" />}
        ListHeaderComponent={
          <>
            {hero}
            {searchCard}

            {/* All Available Stays — section header */}
            <Animated.View entering={enterUp(2)} className="gap-1 px-5 pb-4 pt-7">
              <Text className="font-display-x text-[22px] leading-7 text-ink">
                All Available Stays
              </Text>
              <Text className="text-[13px] leading-5 text-muted">
                {hotels.length} stay{hotels.length === 1 ? '' : 's'} matched
              </Text>
            </Animated.View>
          </>
        }
        ListEmptyComponent={
          <View className="mt-8 items-center justify-center gap-3 px-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <Ionicons name="bed-outline" size={28} color="#00a165" />
            </View>
            <Text className="text-lg font-display text-ink">No stays match</Text>
            <Text className="text-center text-sm text-muted">
              Try clearing filters or searching a different city.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View className="pt-6">
            <WhyGripOnTrip />
          </View>
        }
      />
    </>
  );
}
