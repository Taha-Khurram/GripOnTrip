import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Badge, Card } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Rental } from '../types';

function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon} size={14} color="#9ca3af" />
      <Text className="text-xs text-neutral-500">{label}</Text>
    </View>
  );
}

export function RentalCard({ rental }: { rental: Rental }) {
  return (
    <Link href={`/rentals/${rental.id}`} asChild>
      <Pressable accessibilityRole="button">
        <Card className="overflow-hidden p-0">
          <Image
            source={{ uri: rental.images[0]?.url }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
            transition={200}
          />
          <View className="gap-1 p-3">
            <View className="flex-row items-center justify-between">
              <Text
                className="flex-1 text-base font-semibold text-neutral-900 dark:text-white"
                numberOfLines={1}
              >
                {rental.title}
              </Text>
              <Badge label={rental.propertyType} tone="neutral" />
            </View>
            {rental.location?.city ? (
              <Text className="text-sm text-neutral-500">{rental.location.city}</Text>
            ) : null}
            <View className="mt-1 flex-row items-center gap-3">
              {rental.bedrooms != null ? (
                <Spec icon="bed-outline" label={`${rental.bedrooms} bd`} />
              ) : null}
              {rental.bathrooms != null ? (
                <Spec icon="water-outline" label={`${rental.bathrooms} ba`} />
              ) : null}
              {rental.maxGuests != null ? (
                <Spec icon="people-outline" label={`${rental.maxGuests} guests`} />
              ) : null}
            </View>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-base font-bold text-brand-600">
                {formatMoney(rental.price)}
                <Text className="text-xs font-normal text-neutral-400"> / month</Text>
              </Text>
              {rental.rating != null ? (
                <Text className="text-sm text-neutral-600">★ {formatRating(rental.rating)}</Text>
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
