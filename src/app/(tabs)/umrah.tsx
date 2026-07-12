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
import {
  UmrahPackageCard,
  UmrahPerks,
  useUmrahPackages,
  type UmrahFilters,
  type UmrahPackage,
} from '@/features/umrah';

// App brand mark (same asset the home hero + tours/BNB pages use).
const logo = require('../../../assets/images/icon.png');

type SortKey = NonNullable<UmrahFilters['sort']>;
const SORTS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'recommended', label: 'Recommended', icon: 'sparkles-outline' },
  { key: 'price-asc', label: 'Price: Low', icon: 'arrow-up-outline' },
  { key: 'price-desc', label: 'Price: High', icon: 'arrow-down-outline' },
  { key: 'rating-desc', label: 'Top Rated', icon: 'star-outline' },
];

/** All-caps, letter-spaced field label used inside the search card (mirrors home). */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {children}
    </Text>
  );
}

/**
 * Umrah Packages listing.
 *
 * Reads the SAME approved-agencies feed as the web `/umrah` page and shows the
 * packages whose name is prefixed "[UMRAH]". The screen mirrors the marketing
 * site's Umrah page rebuilt in the app's visual language (the tours/BNB
 * treatment): a navy hero with a floating search card + sort pills, immersive
 * package cards, a value-prop grid and the newsletter CTA.
 */
export default function UmrahScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useUmrahPackages();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('recommended');

  const allPackages = useMemo(() => data ?? [], [data]);

  const packages = useMemo(() => {
    let list = allPackages;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.packageName.toLowerCase().includes(q) ||
          p.operatingCities.some((c) => c.toLowerCase().includes(q)) ||
          (p.departureLocation?.toLowerCase().includes(q) ?? false),
      );
    }
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
    else if (sort === 'rating-desc') sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted;
  }, [allPackages, query, sort]);

  const renderItem = useCallback(
    ({ item, index }: { item: UmrahPackage; index: number }) => (
      <View className="px-5 pb-4">
        <UmrahPackageCard pkg={item} index={index} />
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
          Couldn&apos;t load Umrah packages. Check your connection and try again.
        </Text>
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f5a623" />
      }
      ListHeaderComponent={
        <>
          {/* Hero — deep navy, mirroring the tours/BNB pages */}
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

              {/* Service eyebrow badge */}
              <View className="mt-5 flex-row">
                <View className="flex-row items-center gap-1.5 rounded-full border border-accent-500/50 bg-accent-500/10 px-3 py-1.5">
                  <Ionicons name="moon" size={12} color="#f5a623" />
                  <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-accent-400">
                    Premium Umrah Booking
                  </Text>
                </View>
              </View>

              <Text className="mt-3 font-display-x text-[30px] leading-9 text-white">
                Begin Your Sacred Journey{'\n'}
                <Text className="text-accent-500">With Absolute Peace of Mind</Text>
              </Text>
              <View className="mt-2.5 h-1 w-16 rounded-full bg-accent-500" />

              <Text className="mt-3 text-[15px] leading-5 text-white/85">
                Embark on a customized, Shariah-compliant spiritual retreat — we manage your visa,
                luxury Haram-front hotel stays, and VIP logistics.
              </Text>
            </OceanHero>
          </Animated.View>

          {/* Floating search card — overlaps the hero (home "booking card" pattern) */}
          <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
            <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
                  <Ionicons name="moon" size={22} color="#00a165" />
                </View>
                <View className="flex-1">
                  <Text className="font-display-semibold text-[17px] leading-5 text-ink">
                    Find your package
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {allPackages.length} verified package{allPackages.length === 1 ? '' : 's'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1">
                  <Ionicons name="shield-checkmark" size={11} color="#b8710c" />
                  <Text className="text-[11px] font-body-semibold text-accent-700">Verified</Text>
                </View>
              </View>

              {/* SEARCH — operator / package / city */}
              <View className="gap-2.5">
                <FieldLabel>Search</FieldLabel>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk px-4 py-3.5">
                    <Ionicons name="search" size={19} color="#00a165" />
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      placeholder="Operator, package or city…"
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
                      <Ionicons name="search" size={22} color="#fff" />
                    </View>
                  </PressableScale>
                </View>
              </View>

              {/* SORT — order pills */}
              <View className="gap-2.5">
                <FieldLabel>Sort By</FieldLabel>
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
                            'flex-row items-center gap-1.5 rounded-full px-4 py-2.5',
                            active ? 'bg-brand-800' : 'border border-hairline bg-surface-sunk',
                          ].join(' ')}
                        >
                          <Ionicons
                            name={s.icon as never}
                            size={15}
                            color={active ? '#f5a623' : '#00a165'}
                          />
                          <Text
                            className={[
                              'text-[13px] font-body-semibold',
                              active ? 'text-white' : 'text-ink',
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

          {/* Available Packages — section header */}
          <Animated.View entering={enterUp(2)} className="gap-1 px-5 pb-4 pt-7">
            <Text className="font-display-x text-[22px] leading-7 text-ink">Available Packages</Text>
            <Text className="text-[13px] leading-5 text-muted">
              {packages.length} Umrah package{packages.length === 1 ? '' : 's'} ready for you
            </Text>
          </Animated.View>
        </>
      }
      ListEmptyComponent={
        <View className="mt-8 items-center justify-center gap-3 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-50">
            <Ionicons name="moon-outline" size={28} color="#f5a623" />
          </View>
          <Text className="text-lg font-display text-ink">No Umrah packages found</Text>
          <Text className="text-center text-sm text-muted">
            {query
              ? 'Try a different search.'
              : 'Verified partner agencies haven’t published any Umrah packages yet. Pull down to refresh.'}
          </Text>
        </View>
      }
      ListFooterComponent={
        <View className="gap-12 pt-4">
          <UmrahPerks />
          <View className="px-5">
            <NewsletterCTA />
          </View>
        </View>
      }
    />
  );
}
