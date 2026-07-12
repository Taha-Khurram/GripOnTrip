import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Card, enterUp, ImageBand, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { UmrahPackage } from '../types';

/** Small brand-tinted spec pill (nights, stay, transport, visa). */
function SpecChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1">
      <Ionicons name={icon} size={12} color="#037a4e" />
      <Text className="text-xs font-medium text-brand-700" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function UmrahPackageCard({ pkg, index = 0 }: { pkg: UmrahPackage; index?: number }) {
  const image = pkg.images[0]?.url;
  const totalNights = pkg.makkahNights + pkg.madinahNights;
  const location =
    pkg.operatingCities.length > 0 ? pkg.operatingCities.join(' · ') : pkg.departureLocation;

  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={{ pathname: '/umrah/[id]', params: { id: pkg.id } }} asChild>
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
                  <Ionicons name="moon-outline" size={40} color="rgba(255,255,255,0.85)" />
                </ImageBand>
              )}

              {pkg.tag ? (
                <View className="absolute left-3 top-3 rounded-full bg-accent-500 px-3 py-1 shadow-glow">
                  <Text className="text-xs font-body-semibold text-white">{pkg.tag}</Text>
                </View>
              ) : null}

              {/* Floating rating pill */}
              {pkg.rating != null && pkg.rating > 0 ? (
                <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
                  <Ionicons name="star" size={12} color="#f5a623" />
                  <Text className="text-xs font-bold text-ink">{formatRating(pkg.rating)}</Text>
                </View>
              ) : null}
            </View>

            <View className="gap-2.5 p-4">
              <View className="gap-1">
                <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={1}>
                  {pkg.title}
                </Text>
                {location ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                    <Text className="text-sm text-muted" numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Spec chips */}
              <View className="flex-row flex-wrap gap-2">
                {totalNights > 0 ? (
                  <SpecChip icon="moon-outline" label={`${totalNights} nights`} />
                ) : null}
                <SpecChip
                  icon="bed-outline"
                  label={`Makkah ${pkg.makkahNights}N · Madinah ${pkg.madinahNights}N`}
                />
                {pkg.visaIncluded ? (
                  <SpecChip icon="document-text-outline" label="Visa included" />
                ) : null}
                {pkg.transport ? <SpecChip icon="bus-outline" label={pkg.transport} /> : null}
              </View>

              {/* Price row */}
              <View className="mt-0.5 flex-row items-end justify-between">
                <View className="flex-row items-baseline gap-1.5">
                  <Text className="text-xl font-display-x text-brand-600">
                    {formatMoney(pkg.price)}
                  </Text>
                  <Text className="text-xs text-muted-foreground">/ person</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#00a165" />
              </View>
            </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
