import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Badge, Card } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import { icons8 } from '@/utils/icons8';
import type { UmrahPackage } from '../types';

function Feature({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon} size={13} color="#059669" />
      <Text className="text-[11px] text-neutral-600 dark:text-neutral-300" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function UmrahPackageCard({ pkg }: { pkg: UmrahPackage }) {
  const image = pkg.images[0]?.url;
  const totalNights = pkg.makkahNights + pkg.madinahNights;

  return (
    <Link href={{ pathname: '/umrah/[id]', params: { id: pkg.id } }} asChild>
      <Pressable accessibilityRole="button">
        <Card className="overflow-hidden p-0">
          <View>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: 160 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View className="h-40 w-full items-center justify-center bg-emerald-50">
                <Image source={{ uri: icons8('kaaba', 'color') }} style={{ width: 56, height: 56 }} contentFit="contain" />
              </View>
            )}
            <View className="absolute left-3 top-3">
              <Badge label={pkg.tag} tone="success" />
            </View>
            {totalNights > 0 ? (
              <View className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1">
                <Text className="text-xs font-semibold text-white">{totalNights} nights</Text>
              </View>
            ) : null}
          </View>

          <View className="gap-1.5 p-3">
            <View className="flex-row items-center justify-between gap-2">
              <Text
                className="flex-1 text-base font-bold text-neutral-900 dark:text-white"
                numberOfLines={1}
              >
                {pkg.title}
              </Text>
              <View className="flex-row items-center gap-0.5">
                <Ionicons name="star" size={13} color="#f59e0b" />
                <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  {formatRating(pkg.rating)}
                </Text>
                {pkg.reviewCount > 0 ? (
                  <Text className="text-xs text-neutral-400"> ({pkg.reviewCount})</Text>
                ) : null}
              </View>
            </View>

            <Text className="text-sm text-neutral-500" numberOfLines={1}>
              {pkg.packageName}
            </Text>

            <View className="mt-0.5 flex-row flex-wrap gap-x-3 gap-y-1">
              <Feature icon="bed-outline" label={`Makkah ${pkg.makkahNights}N · Madinah ${pkg.madinahNights}N`} />
            </View>
            <View className="flex-row flex-wrap gap-x-3 gap-y-1">
              {pkg.visaIncluded ? <Feature icon="document-text-outline" label="Visa included" /> : null}
              <Feature icon="bus-outline" label={pkg.transport} />
            </View>

            <View className="mt-1 flex-row items-end justify-between">
              <Text className="text-base font-bold text-emerald-600">
                {formatMoney(pkg.price)}
                <Text className="text-xs font-normal text-neutral-400"> / person</Text>
              </Text>
              {pkg.departureLocation ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="airplane-outline" size={13} color="#9ca3af" />
                  <Text className="text-xs text-neutral-500">{pkg.departureLocation}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
