import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Badge, Card, enterUp, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Rental } from '../types';

function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon} size={14} color="#9aa7ac" />
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

export function RentalCard({ rental, index = 0 }: { rental: Rental; index?: number }) {
  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={`/rentals/${rental.id}`} asChild>
        <PressableScale accessibilityRole="button">
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
                className="flex-1 text-base font-semibold text-ink"
                numberOfLines={1}
              >
                {rental.title}
              </Text>
              <Badge label={rental.propertyType} tone="neutral" />
            </View>
            {rental.location?.city ? (
              <Text className="text-sm text-muted">{rental.location.city}</Text>
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
                <Text className="text-xs font-normal text-muted-foreground"> / month</Text>
              </Text>
              {rental.rating != null ? (
                <Text className="text-sm text-neutral-600">★ {formatRating(rental.rating)}</Text>
              ) : null}
            </View>
          </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
