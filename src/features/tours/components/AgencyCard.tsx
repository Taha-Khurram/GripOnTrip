import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { IMAGE_REQUEST_HEADERS } from '@/api/media';
import { Animated, DeepPanel, enterUp, PressableScale } from '@/components/ui';
import { formatCompactMoney, formatRating } from '@/utils/format';
import type { Tour, TourPackage } from '../types';

/** How many package rows to show inline before the "See all" link takes over. */
const MAX_PACKAGES = 2;

// Soft ambient shadow (mirrors the `shadow-soft` token). Applied via inline style
// rather than a `shadow-*` className: on native, a shadow utility on a cssInterop'd
// Animated.View crashes with "Couldn't find a navigation context".
const CARD_SHADOW = {
  shadowColor: '#0a1a2f',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.14,
  shadowRadius: 20,
  elevation: 8,
} as const;

/** Frosted logo badge shown over the card hero (falls back to a bus icon). */
function LogoBadge({ tour }: { tour: Tour }) {
  const [failed, setFailed] = useState(false);
  const uri = failed ? undefined : tour.images[0]?.url;

  return (
    <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/90 p-1">
      {uri ? (
        <Image
          source={{ uri, headers: IMAGE_REQUEST_HEADERS }}
          style={{ width: 46, height: 46, borderRadius: 14 }}
          contentFit="contain"
          transition={200}
          onError={() => setFailed(true)}
        />
      ) : (
        <Ionicons name="bus" size={24} color="#00a165" />
      )}
    </View>
  );
}

/** A single package line: name + spec chips on the left, price on the right. */
function PackageRow({ pkg }: { pkg: TourPackage }) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
      <View className="flex-1 gap-1.5">
        <Text className="text-[14px] font-body-semibold text-white" numberOfLines={1}>
          {pkg.name}
        </Text>
        <View className="flex-row items-center gap-2.5">
          {pkg.nights != null && pkg.nights > 0 ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={13} color="#a9c2dd" />
              <Text className="text-[11px] font-body-medium text-white/70">{pkg.nights}N</Text>
            </View>
          ) : null}
          {pkg.foodPlan ? <Ionicons name="cafe-outline" size={13} color="#f7ae3d" /> : null}
          {pkg.equipmentRequired ? (
            <Ionicons name="car-outline" size={13} color="#a9c2dd" />
          ) : null}
        </View>
      </View>
      {pkg.amount > 0 ? (
        <Text className="font-display-x text-[15px] text-accent-500">
          {formatCompactMoney({ amount: pkg.amount, currency: 'PKR' })}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * "Verified Local Agencies" listing card, styled to match the home screen's
 * featured panel (`FeaturedCategories` → `ExpandedPanel`): an immersive navy
 * `DeepPanel` with a bottom-weighted gradient, a frosted badge, a big display
 * title, and gold-accent pill actions. The operator's route, cities and package
 * preview sit on frosted chips over the same dark surface.
 */
export function AgencyCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  const packageCount = tour.packages.length;
  const cityCount = tour.operatingCities.length;
  const from = tour.departureLocation ?? tour.operatingCities[0] ?? tour.location?.city;
  const to = tour.returnLocation ?? tour.operatingCities[0] ?? from;
  const place = tour.operatingCities[0] ?? tour.location?.city ?? 'Please contact provider';

  return (
    <Animated.View
      entering={enterUp(index)}
      style={CARD_SHADOW}
      className="overflow-hidden rounded-[28px] bg-brand-900"
    >
      {/* Navy gradient base + bottom-weighted overlay — the featured-panel look */}
      <DeepPanel className="absolute inset-0" />
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-900/40" />

      <View className="gap-4 p-5">
        {/* Top row — frosted logo badge + rating pill */}
        <View className="flex-row items-start justify-between">
          <LogoBadge tour={tour} />
          {tour.rating != null ? (
            <View className="flex-row items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 shadow-glow">
              <Ionicons name="star" size={12} color="#fff" />
              <Text className="text-[12px] font-body-semibold text-white">
                {formatRating(tour.rating)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Headline + location */}
        <View className="gap-1.5">
          <Text className="font-display-x text-[24px] leading-7 text-white" numberOfLines={2}>
            {tour.title}
          </Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location" size={14} color="#a9c2dd" />
            <Text className="text-[13px] text-white/80" numberOfLines={1}>
              {place}
            </Text>
          </View>
        </View>

        {/* Route + cities — frosted chips */}
        <View className="flex-row flex-wrap items-center gap-2">
          <View className="flex-shrink flex-row items-center gap-1.5 rounded-full border border-white/12 bg-white/10 px-3 py-1.5">
            <Ionicons name="compass-outline" size={14} color="#f5a623" />
            <Text className="flex-shrink text-[12px] font-body-medium text-white" numberOfLines={1}>
              {from ?? '—'}
            </Text>
            <Ionicons name="arrow-forward" size={11} color="#a9c2dd" />
            <Text className="flex-shrink text-[12px] font-body-medium text-white" numberOfLines={1}>
              {to ?? '—'}
            </Text>
          </View>
          {cityCount > 0 ? (
            <View className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5">
              <Text className="text-[12px] font-body-semibold text-accent-400">
                {cityCount} {cityCount === 1 ? 'city' : 'cities'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Packages preview */}
        {packageCount > 0 ? (
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-white/50">
                Packages
              </Text>
              <Link href={`/tours/${tour.id}`} asChild>
                <PressableScale accessibilityRole="link" activeScale={0.94}>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[12px] font-body-semibold text-white">
                      See all {packageCount}
                    </Text>
                    <Ionicons name="arrow-forward" size={13} color="#f5a623" />
                  </View>
                </PressableScale>
              </Link>
            </View>
            {tour.packages.slice(0, MAX_PACKAGES).map((pkg) => (
              <PackageRow key={pkg.id} pkg={pkg} />
            ))}
          </View>
        ) : null}

        {/* Actions — frosted Profile + gold Quote (featured accent language) */}
        <View className="flex-row gap-3 pt-1">
          <View className="flex-1">
            <Link href={`/tours/${tour.id}`} asChild>
              <PressableScale accessibilityRole="button" activeScale={0.96}>
                <View className="w-full flex-row items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 py-3">
                  <Ionicons name="compass-outline" size={15} color="#fff" />
                  <Text className="text-[13px] font-body-semibold text-white">Profile</Text>
                </View>
              </PressableScale>
            </Link>
          </View>
          <View className="flex-1">
            <Link href={{ pathname: '/tours/enquiry', params: { id: tour.id } }} asChild>
              <PressableScale accessibilityRole="button" activeScale={0.96}>
                <View className="w-full flex-row items-center justify-center gap-2 rounded-full bg-accent-500 py-3 shadow-glow">
                  <Ionicons name="mail-outline" size={15} color="#fff" />
                  <Text className="text-[13px] font-body-semibold text-white">Quote</Text>
                </View>
              </PressableScale>
            </Link>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
