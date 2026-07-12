import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Animated, DeepPanel, enterUp, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Hotel } from '../types';

/**
 * Full-width hotel card styled like the home page's featured-category "hero"
 * panel: a full-bleed photo with a bottom-weighted navy gradient, a frosted-
 * glass icon badge, a big display title and a dark pill CTA with a gold arrow.
 * Floating discount + rating badges sit at the top. Links to the hotel detail.
 */
export function FeaturedHotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  const image = hotel.images[0]?.url;
  const city = hotel.location?.city ?? hotel.location?.address;

  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={`/hotels/${hotel.id}`} asChild>
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
                <Ionicons name="bed-outline" size={56} color="rgba(255,255,255,0.45)" />
              </View>
            )}

            {/* Simulated dark gradient overlay (stacked bottom-weighted navy bands) */}
            <View pointerEvents="none" className="absolute inset-0 bg-brand-900/20" />
            <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-3/4 bg-brand-900/30" />
            <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-900/60" />

            {/* Floating top badges */}
            <View className="absolute inset-x-0 top-0 flex-row items-center justify-between p-4">
              {hotel.discountPercent ? (
                <View className="rounded-full bg-accent-500 px-3 py-1 shadow-glow">
                  <Text className="text-xs font-body-semibold text-white">
                    {hotel.discountPercent}% OFF
                  </Text>
                </View>
              ) : (
                <View />
              )}
              {hotel.rating != null ? (
                <View className="flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
                  <Ionicons name="star" size={12} color="#f5a623" />
                  <Text className="text-xs font-bold text-ink">{formatRating(hotel.rating)}</Text>
                </View>
              ) : null}
            </View>

            {/* Bottom content */}
            <View className="flex-1 justify-end gap-3 p-5">
              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15">
                <Ionicons name="bed" size={24} color="#fff" />
              </View>

              <View className="gap-1.5">
                <Text className="font-display-x text-[25px] leading-7 text-white" numberOfLines={1}>
                  {hotel.title}
                </Text>
                <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                  {city ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text className="text-[13px] text-white/85" numberOfLines={1}>
                        {city}
                      </Text>
                    </View>
                  ) : null}
                  {hotel.breakfastIncluded ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="cafe-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text className="text-[13px] text-white/85">Breakfast</Text>
                    </View>
                  ) : null}
                  {hotel.freeCancellation ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="checkmark-circle-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text className="text-[13px] text-white/85">Free cancellation</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Price + CTA pill row */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-baseline gap-1.5">
                  <Text className="font-display-x text-xl text-white">{formatMoney(hotel.price)}</Text>
                  {hotel.originalPrice ? (
                    <Text className="text-xs text-white/60 line-through">
                      {formatMoney(hotel.originalPrice)}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-white/70">/ night</Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-brand-900 px-4 py-2.5">
                  <Text className="text-[13px] font-body-semibold text-white">View Details</Text>
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
