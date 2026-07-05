import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Badge, Card, enterUp, PressableScale } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import { icons8 } from '@/utils/icons8';
import type { Tour, TourPackage } from '../types';

/** Compact preview of one package (name · nights · price). */
function PackageChip({ pkg }: { pkg: TourPackage }) {
  return (
    <View className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-800/60">
      <Text className="text-xs font-semibold text-neutral-800 dark:text-neutral-100" numberOfLines={1}>
        {pkg.name}
      </Text>
      <View className="mt-0.5 flex-row items-center gap-2">
        {pkg.nights != null ? (
          <Text className="text-[11px] text-neutral-500">
            {pkg.nights} night{pkg.nights === 1 ? '' : 's'}
          </Text>
        ) : null}
        <Text className="text-[11px] font-bold text-brand-600">
          {formatMoney({ amount: pkg.amount, currency: 'PKR' })}
        </Text>
      </View>
    </View>
  );
}

export function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  const image = tour.images[0]?.url;
  const packageCount = tour.packages.length;
  const preview = tour.packages.slice(0, 3);

  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={`/tours/${tour.id}`} asChild>
        <PressableScale accessibilityRole="button">
          <Card className="gap-3">
          {/* Operator header */}
          <View className="flex-row items-center gap-3">
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: 52, height: 52, borderRadius: 14 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-50">
                <Image source={{ uri: icons8('bus') }} style={{ width: 34, height: 34 }} contentFit="contain" />
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-base font-bold text-neutral-900 dark:text-white" numberOfLines={1}>
                  {tour.title}
                </Text>
                {tour.flag ? <Badge label={tour.flag} tone="accent" /> : null}
              </View>
              {tour.operatingCities.length > 0 ? (
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={13} color="#9ca3af" />
                  <Text className="flex-1 text-xs text-neutral-500" numberOfLines={1}>
                    {tour.operatingCities.join(' · ')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Package previews */}
          {preview.length > 0 ? (
            <View className="gap-2">
              {preview.map((pkg) => (
                <PackageChip key={pkg.id} pkg={pkg} />
              ))}
            </View>
          ) : null}

          {/* Footer: starting price + package count */}
          <View className="flex-row items-center justify-between">
            {tour.startingPrice ? (
              <Text className="text-base font-bold text-brand-600">
                <Text className="text-xs font-normal text-neutral-400">from </Text>
                {formatMoney(tour.price)}
              </Text>
            ) : (
              <View />
            )}
            <View className="flex-row items-center gap-1">
              <Ionicons name="cube-outline" size={14} color="#219ebc" />
              <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {packageCount} package{packageCount === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
