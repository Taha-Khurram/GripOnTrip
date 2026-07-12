import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Animated, DeepPanel, enterUp, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Guide } from '../types';

/**
 * Full-width guide card styled like the home page's featured-category "hero"
 * panel: a full-bleed photo with a bottom-weighted navy gradient, a frosted-
 * glass icon badge, a big display name and a dark pill CTA with a gold arrow.
 * Floating verified + rating badges sit at the top. Links to the guide detail.
 */
export function FeaturedGuideCard({ guide, index = 0 }: { guide: Guide; index?: number }) {
  const image = guide.imageUrl;
  const languages = guide.languages.slice(0, 2);

  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={{ pathname: '/guides/[id]', params: { id: guide.id } }} asChild>
        <PressableScale accessibilityRole="button" activeScale={0.98}>
          <View className="h-72 w-full overflow-hidden rounded-[28px]">
            {/* Navy gradient base — also the fallback if the photo is missing */}
            <DeepPanel className="absolute inset-0" />
            {image ? (
              <Image
                source={{ uri: image }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={250}
              />
            ) : (
              <View className="absolute inset-0 items-center justify-center">
                <Ionicons name="person-outline" size={56} color="rgba(255,255,255,0.45)" />
              </View>
            )}

            {/* Simulated dark gradient overlay (stacked bottom-weighted navy bands) */}
            <View pointerEvents="none" className="absolute inset-0 bg-brand-900/20" />
            <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-3/4 bg-brand-900/30" />
            <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-900/60" />

            {/* Floating top badges */}
            <View className="absolute inset-x-0 top-0 flex-row items-center justify-between p-4">
              {guide.isVerified ? (
                <View className="flex-row items-center gap-1 rounded-full bg-accent-500 px-3 py-1 shadow-glow">
                  <Ionicons name="checkmark-circle" size={13} color="#fff" />
                  <Text className="text-xs font-body-semibold text-white">Verified</Text>
                </View>
              ) : (
                <View />
              )}
              {guide.rating > 0 ? (
                <View className="flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
                  <Ionicons name="star" size={12} color="#f5a623" />
                  <Text className="text-xs font-bold text-ink">{formatRating(guide.rating)}</Text>
                </View>
              ) : null}
            </View>

            {/* Bottom content */}
            <View className="flex-1 justify-end gap-3 p-5">
              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15">
                <Ionicons name="person" size={24} color="#fff" />
              </View>

              <View className="gap-1.5">
                <Text className="font-display-x text-[25px] leading-7 text-white" numberOfLines={1}>
                  {guide.name}
                </Text>
                <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                  {guide.city ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text className="text-[13px] text-white/85">{guide.city}</Text>
                    </View>
                  ) : null}
                  {guide.experienceYears != null ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="ribbon-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text className="text-[13px] text-white/85">
                        {guide.experienceYears} yr{guide.experienceYears === 1 ? '' : 's'} exp
                      </Text>
                    </View>
                  ) : null}
                  {languages.length > 0 ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="language-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text className="text-[13px] text-white/85" numberOfLines={1}>
                        {languages.join(', ')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Price + CTA pill row */}
              <View className="flex-row items-center justify-between">
                {guide.dailyRate > 0 ? (
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="text-xs text-white/70">from</Text>
                    <Text className="font-display-x text-xl text-white">
                      {formatMoney(guide.price)}
                    </Text>
                    <Text className="text-xs text-white/70">/ day</Text>
                  </View>
                ) : (
                  <View />
                )}
                <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-brand-900 px-4 py-2.5">
                  <Text className="text-[13px] font-body-semibold text-white">View Profile</Text>
                  <Ionicons name="arrow-forward" size={15} color="#f5a623" />
                </View>
              </View>
            </View>
          </View>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
