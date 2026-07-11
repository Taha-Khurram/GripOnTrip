import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ListHero } from '@/components/layout/ListHero';
import { ListSkeleton } from '@/components/ui';
import { GuideCard, useGuides, type Guide } from '@/features/guides';
import { HotelCard, useHotels, type Hotel } from '@/features/hotels';
import { ProductCard, useProducts, type Product } from '@/features/shop';
import { RentalCard, useRentals, type Rental } from '@/features/rentals';
import { TourCard, useTours, type Tour } from '@/features/tours';
import { UmrahPackageCard, useUmrahPackages, type UmrahPackage } from '@/features/umrah';

type FilterKey = 'all' | 'hotels' | 'rentals' | 'tours' | 'umrah' | 'guides' | 'shop';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hotels', label: 'Hotels' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'tours', label: 'Tours' },
  { key: 'umrah', label: 'Umrah' },
  { key: 'guides', label: 'Guides' },
  { key: 'shop', label: 'Marketplace' },
];

/** True if any of the given text fields contains the (already lowercased) query. */
function hit(q: string, fields: (string | number | null | undefined)[]): boolean {
  return fields.some((f) => f != null && String(f).toLowerCase().includes(q));
}

/**
 * Unified search across every vertical. Pulls each catalog (React Query caches
 * these, so repeat visits are instant) and filters client-side against the query,
 * grouping matches by vertical. Reached from the home search field (`?q=`).
 */
export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [filter, setFilter] = useState<FilterKey>('all');

  const hotels = useHotels();
  const rentals = useRentals();
  const tours = useTours();
  const umrah = useUmrahPackages();
  const guides = useGuides();
  const products = useProducts();

  const q = query.trim().toLowerCase();
  const active = q.length > 0;

  const hotelHits = useMemo<Hotel[]>(
    () =>
      !active
        ? []
        : (hotels.data?.data ?? []).filter((h) =>
            hit(q, [h.title, h.location?.city, h.location?.address, h.propertyType, ...h.amenities]),
          ),
    [active, q, hotels.data],
  );

  const rentalHits = useMemo<Rental[]>(
    () =>
      !active
        ? []
        : (rentals.data?.data ?? []).filter((r) =>
            hit(q, [r.title, r.location?.city, r.propertyType, ...r.amenities]),
          ),
    [active, q, rentals.data],
  );

  const tourHits = useMemo<Tour[]>(
    () =>
      !active
        ? []
        : (tours.data?.data ?? []).filter((t) =>
            hit(q, [t.title, t.bio, ...t.operatingCities, ...t.packages.map((p) => p.name)]),
          ),
    [active, q, tours.data],
  );

  const umrahHits = useMemo<UmrahPackage[]>(
    () =>
      !active
        ? []
        : (umrah.data ?? []).filter((u) =>
            hit(q, [u.title, u.packageName, u.agencyName, u.makkahHotel, u.madinahHotel, ...u.operatingCities]),
          ),
    [active, q, umrah.data],
  );

  const guideHits = useMemo<Guide[]>(
    () =>
      !active
        ? []
        : (guides.data?.data ?? []).filter((g) =>
            hit(q, [g.name, g.city, g.bio, ...g.languages]),
          ),
    [active, q, guides.data],
  );

  const productHits = useMemo<Product[]>(
    () =>
      !active
        ? []
        : (products.data?.data ?? []).filter((p) =>
            hit(q, [p.title, p.brand, p.productCategory, p.collection, ...p.tags]),
          ),
    [active, q, products.data],
  );

  const counts: Record<Exclude<FilterKey, 'all'>, number> = {
    hotels: hotelHits.length,
    rentals: rentalHits.length,
    tours: tourHits.length,
    umrah: umrahHits.length,
    guides: guideHits.length,
    shop: productHits.length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const loading =
    active &&
    (hotels.isLoading ||
      rentals.isLoading ||
      tours.isLoading ||
      umrah.isLoading ||
      guides.isLoading ||
      products.isLoading);

  const showAll = filter === 'all';
  const cap = showAll ? 4 : undefined;
  const show = (key: FilterKey) => showAll || filter === key;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-background">
        {/* Search hero — same ListHero used by the vertical listing pages */}
        <ListHero
          variant="ocean"
          icon="compass-outline"
          eyebrow="Search"
          title="Search Everything"
          subtitle="Explore hotels, rentals, tours, guides & more — all in one place."
          query={query}
          onChangeQuery={setQuery}
          placeholder="Search hotels, tours, guides…"
          autoFocus={!params.q}
          onBack={() => router.back()}
        />

        {/* Vertical filter chips */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 12 }}
          >
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              const count = f.key === 'all' ? total : counts[f.key];
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  className={[
                    'flex-row items-center gap-1.5 rounded-full border px-3.5 py-2',
                    isActive ? 'border-brand-500 bg-brand-500' : 'border-hairline bg-white',
                  ].join(' ')}
                >
                  <Text
                    className={['text-xs font-semibold', isActive ? 'text-white' : 'text-muted'].join(' ')}
                  >
                    {f.label}
                  </Text>
                  {active ? (
                    <View
                      className={[
                        'rounded-full px-1.5',
                        isActive ? 'bg-white/25' : 'bg-brand-50',
                      ].join(' ')}
                    >
                      <Text
                        className={[
                          'text-[10px] font-bold',
                          isActive ? 'text-white' : 'text-brand-700',
                        ].join(' ')}
                      >
                        {count}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!active ? (
            <EmptyPrompt />
          ) : loading ? (
            <ListSkeleton count={3} />
          ) : total === 0 ? (
            <NoResults query={query} />
          ) : (
            <>
              <Text className="px-5 pb-1 pt-2 text-sm text-muted">
                {total} result{total === 1 ? '' : 's'} for &ldquo;{query.trim()}&rdquo;
              </Text>

              {show('hotels') ? (
                <Section
                  label="Hotels & Stays"
                  icon="bed-outline"
                  count={hotelHits.length}
                  cap={cap}
                  onViewAll={() => setFilter('hotels')}
                  items={hotelHits}
                  keyFor={(h) => h.id}
                  renderItem={(h, i) => <HotelCard hotel={h} index={i} />}
                />
              ) : null}

              {show('rentals') ? (
                <Section
                  label="Vacation Rentals"
                  icon="home-outline"
                  count={rentalHits.length}
                  cap={cap}
                  onViewAll={() => setFilter('rentals')}
                  items={rentalHits}
                  keyFor={(r) => r.id}
                  renderItem={(r, i) => <RentalCard rental={r} index={i} />}
                />
              ) : null}

              {show('tours') ? (
                <Section
                  label="Guided Tours"
                  icon="bus-outline"
                  count={tourHits.length}
                  cap={cap}
                  onViewAll={() => setFilter('tours')}
                  items={tourHits}
                  keyFor={(t) => t.id}
                  renderItem={(t, i) => <TourCard tour={t} index={i} />}
                />
              ) : null}

              {show('umrah') ? (
                <Section
                  label="Umrah Packages"
                  icon="moon-outline"
                  count={umrahHits.length}
                  cap={cap}
                  onViewAll={() => setFilter('umrah')}
                  items={umrahHits}
                  keyFor={(u) => u.id}
                  renderItem={(u, i) => <UmrahPackageCard pkg={u} index={i} />}
                />
              ) : null}

              {show('guides') ? (
                <Section
                  label="Verified Guides"
                  icon="person-outline"
                  count={guideHits.length}
                  cap={cap}
                  onViewAll={() => setFilter('guides')}
                  items={guideHits}
                  keyFor={(g) => g.id}
                  renderItem={(g, i) => <GuideCard guide={g} index={i} />}
                />
              ) : null}

              {show('shop') ? (
                <Section
                  label="Marketplace"
                  icon="bag-outline"
                  count={productHits.length}
                  cap={cap}
                  onViewAll={() => setFilter('shop')}
                  items={productHits}
                  keyFor={(p) => p.id}
                  renderItem={(p, i) => <ProductCard product={p} index={i} />}
                />
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

interface SectionProps<T> {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  count: number;
  /** Cap the number of cards shown (used in the combined "All" view). */
  cap?: number;
  onViewAll: () => void;
  items: T[];
  keyFor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

/** One vertical's block of results with a header, count, and optional "View all". */
function Section<T>({ label, icon, count, cap, onViewAll, items, keyFor, renderItem }: SectionProps<T>) {
  if (items.length === 0) return null;
  const shown = cap != null ? items.slice(0, cap) : items;
  const more = count - shown.length;

  return (
    <View className="pt-3">
      <View className="flex-row items-center justify-between px-5 pb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name={icon} size={16} color="#1a7a8c" />
          <Text className="font-display text-lg text-ink">{label}</Text>
          <View className="rounded-full bg-brand-50 px-2 py-0.5">
            <Text className="text-xs font-semibold text-brand-700">{count}</Text>
          </View>
        </View>
        {more > 0 ? (
          <Pressable onPress={onViewAll} hitSlop={8} className="flex-row items-center gap-0.5">
            <Text className="text-sm font-medium text-brand-600">View all</Text>
            <Ionicons name="chevron-forward" size={14} color="#1a7a8c" />
          </Pressable>
        ) : null}
      </View>

      {shown.map((item, i) => (
        <View key={keyFor(item)} className="px-5 pb-4">
          {renderItem(item, i)}
        </View>
      ))}

      {more > 0 ? (
        <Pressable onPress={onViewAll} className="mx-5 -mt-1 mb-2 items-center rounded-2xl border border-hairline bg-white py-3">
          <Text className="text-sm font-medium text-brand-600">
            View all {count} in {label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Shown before the traveller has typed anything. */
function EmptyPrompt() {
  return (
    <View className="mt-24 items-center justify-center gap-3 px-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <Ionicons name="search" size={28} color="#1a7a8c" />
      </View>
      <Text className="text-lg font-display text-ink">Search everything</Text>
      <Text className="text-center text-sm leading-6 text-muted">
        Find hotels, rentals, tours, Umrah packages, guides and marketplace items — all in one place.
      </Text>
    </View>
  );
}

/** Shown when a query returns nothing across all verticals. */
function NoResults({ query }: { query: string }) {
  return (
    <View className="mt-24 items-center justify-center gap-3 px-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <Ionicons name="sad-outline" size={28} color="#9aa7ac" />
      </View>
      <Text className="text-lg font-display text-ink">No matches</Text>
      <Text className="text-center text-sm leading-6 text-muted">
        Nothing matched &ldquo;{query.trim()}&rdquo;. Try a city, a hotel name, or a category.
      </Text>
    </View>
  );
}
