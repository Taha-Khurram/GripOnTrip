import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Card, enterUp, ImageBand, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Rental } from '../types';

/** Small brand-tinted spec pill (property type, beds, baths, guests). */
function SpecChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1">
      <Ionicons name={icon} size={12} color="#156473" />
      <Text className="text-xs font-medium text-brand-700">{label}</Text>
    </View>
  );
}

export function RentalCard({ rental, index = 0 }: { rental: Rental; index?: number }) {
  const image = rental.images[0]?.url;
  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={`/rentals/${rental.id}`} asChild>
        <PressableScale accessibilityRole="button">
          <Card className="overflow-hidden p-0 shadow-soft">
            <View>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: 190 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <ImageBand className="h-[190px] items-center justify-center">
                  <Ionicons name="home-outline" size={40} color="rgba(255,255,255,0.85)" />
                </ImageBand>
              )}

              {rental.discountPercent ? (
                <View className="absolute left-3 top-3 rounded-full bg-accent-500 px-3 py-1 shadow-glow">
                  <Text className="text-xs font-body-semibold text-white">
                    {rental.discountPercent}% OFF
                  </Text>
                </View>
              ) : null}

              {/* Floating rating pill */}
              {rental.rating != null ? (
                <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
                  <Ionicons name="star" size={12} color="#f39024" />
                  <Text className="text-xs font-bold text-ink">{formatRating(rental.rating)}</Text>
                </View>
              ) : null}
            </View>

            <View className="gap-2.5 p-4">
              <View className="gap-1">
                <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={1}>
                  {rental.title}
                </Text>
                {rental.location?.city ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                    <Text className="text-sm text-muted" numberOfLines={1}>
                      {rental.location.city}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Spec chips */}
              <View className="flex-row flex-wrap gap-2">
                {rental.propertyType ? (
                  <SpecChip icon="business-outline" label={rental.propertyType} />
                ) : null}
                {rental.bedrooms != null ? (
                  <SpecChip icon="bed-outline" label={`${rental.bedrooms} bd`} />
                ) : null}
                {rental.bathrooms != null ? (
                  <SpecChip icon="water-outline" label={`${rental.bathrooms} ba`} />
                ) : null}
                {rental.maxGuests != null ? (
                  <SpecChip icon="people-outline" label={`${rental.maxGuests} guests`} />
                ) : null}
              </View>

              {/* Price row */}
              <View className="mt-0.5 flex-row items-end justify-between">
                <View className="flex-row items-baseline gap-1.5">
                  <Text className="text-xl font-display-x text-brand-600">
                    {formatMoney(rental.price)}
                  </Text>
                  {rental.originalPrice ? (
                    <Text className="text-xs text-muted-foreground line-through">
                      {formatMoney(rental.originalPrice)}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-muted-foreground">/ month</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#1a7a8c" />
              </View>
            </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
