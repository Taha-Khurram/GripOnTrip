import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { IMAGE_REQUEST_HEADERS } from '@/api/media';
import { Animated, Card, enterUp, ImageBand, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Tour } from '../types';

/** Small brand-tinted spec pill (package count, nights). */
function SpecChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1">
      <Ionicons name={icon} size={12} color="#037a4e" />
      <Text className="text-xs font-medium text-brand-700">{label}</Text>
    </View>
  );
}

export function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = imageFailed ? undefined : tour.images[0]?.url;
  const packageCount = tour.packages.length;
  // Shortest package length, when any package advertises nights.
  const nights = tour.packages
    .map((p) => p.nights)
    .filter((n): n is number => n != null && n > 0);
  const minNights = nights.length > 0 ? Math.min(...nights) : undefined;
  const flag = tour.flag?.replace(/[[\]]/g, '').trim();

  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={`/tours/${tour.id}`} asChild>
        <PressableScale accessibilityRole="button">
          <Card className="overflow-hidden p-0 shadow-soft">
            <View>
              {image ? (
                <Image
                  source={{ uri: image, headers: IMAGE_REQUEST_HEADERS }}
                  style={{ width: '100%', height: 190 }}
                  contentFit="cover"
                  transition={200}
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <ImageBand className="h-[190px] items-center justify-center">
                  <Ionicons name="bus-outline" size={40} color="rgba(255,255,255,0.85)" />
                </ImageBand>
              )}

              {flag ? (
                <View className="absolute left-3 top-3 rounded-full bg-accent-500 px-3 py-1 shadow-glow">
                  <Text className="text-xs font-body-semibold text-white">{flag}</Text>
                </View>
              ) : null}

              {/* Floating rating pill */}
              {tour.rating != null ? (
                <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
                  <Ionicons name="star" size={12} color="#f5a623" />
                  <Text className="text-xs font-bold text-ink">{formatRating(tour.rating)}</Text>
                </View>
              ) : null}
            </View>

            <View className="gap-2.5 p-4">
              <View className="gap-1">
                <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={1}>
                  {tour.title}
                </Text>
                {tour.operatingCities.length > 0 ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                    <Text className="text-sm text-muted" numberOfLines={1}>
                      {tour.operatingCities.join(' · ')}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Spec chips */}
              {packageCount > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  <SpecChip
                    icon="cube-outline"
                    label={`${packageCount} package${packageCount === 1 ? '' : 's'}`}
                  />
                  {minNights != null ? (
                    <SpecChip
                      icon="moon-outline"
                      label={`from ${minNights} night${minNights === 1 ? '' : 's'}`}
                    />
                  ) : null}
                </View>
              ) : null}

              {/* Price row */}
              <View className="mt-0.5 flex-row items-end justify-between">
                {tour.price.amount > 0 ? (
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="text-xs text-muted-foreground">from</Text>
                    <Text className="text-xl font-display-x text-brand-600">
                      {formatMoney(tour.price)}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                <Ionicons name="chevron-forward" size={20} color="#00a165" />
              </View>
            </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
