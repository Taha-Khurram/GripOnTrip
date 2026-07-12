import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Animated, DeepPanel, enterUp, PressableScale } from '@/components/ui';
import { formatCompactMoney, formatRating } from '@/utils/format';
import type { UmrahPackage } from '../types';

// Soft ambient shadow (mirrors `shadow-soft`). Applied via inline style because a
// `shadow-*` class on a cssInterop'd Animated.View crashes native.
const CARD_SHADOW = {
  shadowColor: '#0a1a2f',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.14,
  shadowRadius: 20,
  elevation: 8,
} as const;

/** Frosted operator-logo badge over the card hero (falls back to a moon icon). */
function LogoBadge({ pkg }: { pkg: UmrahPackage }) {
  const [failed, setFailed] = useState(false);
  const uri = failed ? undefined : pkg.images[0]?.url;

  return (
    <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/90 p-1">
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: 46, height: 46, borderRadius: 14 }}
          contentFit="contain"
          transition={200}
          onError={() => setFailed(true)}
        />
      ) : (
        <Ionicons name="moon" size={24} color="#00a165" />
      )}
    </View>
  );
}

/** Frosted spec chip on the dark card surface. */
function Chip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-white/12 bg-white/10 px-3 py-1.5">
      <Ionicons name={icon} size={13} color="#a9c2dd" />
      <Text className="text-[12px] font-body-medium text-white" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Umrah package card, styled to match the home/tours featured panel: an immersive
 * navy `DeepPanel` with a frosted logo badge, rating, the operator + package name,
 * frosted spec chips (nights, stay split, visa, transport) and a gold price + CTA.
 */
export function UmrahPackageCard({ pkg, index = 0 }: { pkg: UmrahPackage; index?: number }) {
  const totalNights = pkg.makkahNights + pkg.madinahNights;
  const location =
    pkg.operatingCities.length > 0 ? pkg.operatingCities.join(' · ') : pkg.departureLocation;

  return (
    <Animated.View
      entering={enterUp(index)}
      style={CARD_SHADOW}
      className="overflow-hidden rounded-[28px] bg-brand-900"
    >
      <DeepPanel className="absolute inset-0" />
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-900/40" />

      <Link href={{ pathname: '/umrah/[id]', params: { id: pkg.id } }} asChild>
        <PressableScale accessibilityRole="button" activeScale={0.98}>
          <View className="gap-4 p-5">
            {/* Top row — logo badge + rating */}
            <View className="flex-row items-start justify-between">
              <LogoBadge pkg={pkg} />
              {pkg.rating != null && pkg.rating > 0 ? (
                <View className="flex-row items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 shadow-glow">
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text className="text-[12px] font-body-semibold text-white">
                    {formatRating(pkg.rating)}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Headline + package name + location */}
            <View className="gap-1.5">
              <Text className="font-display-x text-[23px] leading-7 text-white" numberOfLines={2}>
                {pkg.title}
              </Text>
              {pkg.packageName ? (
                <Text className="text-[13px] font-body-medium text-accent-400" numberOfLines={1}>
                  {pkg.packageName}
                </Text>
              ) : null}
              {location ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location" size={13} color="#a9c2dd" />
                  <Text className="text-[13px] text-white/80" numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Spec chips */}
            <View className="flex-row flex-wrap gap-2">
              {totalNights > 0 ? <Chip icon="moon-outline" label={`${totalNights} nights`} /> : null}
              <Chip
                icon="bed-outline"
                label={`Makkah ${pkg.makkahNights}N · Madinah ${pkg.madinahNights}N`}
              />
              {pkg.visaIncluded ? <Chip icon="document-text-outline" label="Visa included" /> : null}
              {pkg.transport ? <Chip icon="bus-outline" label={pkg.transport} /> : null}
            </View>

            {/* Price + CTA */}
            <View className="flex-row items-center justify-between border-t border-white/10 pt-3.5">
              <View className="flex-shrink">
                <Text className="text-[10px] font-body-semibold uppercase tracking-[1px] text-white/50">
                  Starting from
                </Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="font-display-x text-[20px] text-accent-500">
                    {formatCompactMoney(pkg.price)}
                  </Text>
                  <Text className="text-[11px] text-white/50">/person</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 shadow-glow">
                <Text className="text-[12px] font-body-semibold uppercase tracking-wide text-ink">
                  View Package
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#0a1a2f" />
              </View>
            </View>
          </View>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
