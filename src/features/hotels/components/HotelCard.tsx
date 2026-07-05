import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Card, enterUp, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Hotel } from '../types';

export function HotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={`/hotels/${hotel.id}`} asChild>
        <PressableScale accessibilityRole="button">
          <Card className="overflow-hidden p-0">
          <View>
            <Image
              source={{ uri: hotel.images[0]?.url }}
              style={{ width: '100%', height: 170 }}
              contentFit="cover"
              transition={200}
            />
            {hotel.discountPercent ? (
              <View className="absolute left-3 top-3 rounded-full bg-danger px-2 py-1">
                <Text className="text-xs font-bold text-white">{hotel.discountPercent}% OFF</Text>
              </View>
            ) : null}
            {hotel.freeCancellation ? (
              <View className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1">
                <Text className="text-xs font-semibold text-white">Free cancellation</Text>
              </View>
            ) : null}
          </View>
          <View className="gap-1 p-3">
            <View className="flex-row items-center justify-between">
              <Text
                className="flex-1 text-base font-semibold text-neutral-900 dark:text-white"
                numberOfLines={1}
              >
                {hotel.title}
              </Text>
              {hotel.rating != null ? (
                <View className="ml-2 flex-row items-center gap-0.5">
                  <Ionicons name="star" size={13} color="#ffb703" />
                  <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {formatRating(hotel.rating)}
                  </Text>
                </View>
              ) : null}
            </View>

            {hotel.location?.city ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={13} color="#9ca3af" />
                <Text className="text-sm text-neutral-500" numberOfLines={1}>
                  {hotel.location.city}
                </Text>
              </View>
            ) : null}

            {hotel.breakfastIncluded ? (
              <Text className="text-xs font-medium text-success">✓ Breakfast included</Text>
            ) : null}

            <View className="mt-1 flex-row items-end justify-between">
              <View className="flex-row items-baseline gap-2">
                <Text className="text-base font-bold text-brand-600">
                  {formatMoney(hotel.price)}
                  <Text className="text-xs font-normal text-neutral-400"> / night</Text>
                </Text>
                {hotel.originalPrice ? (
                  <Text className="text-xs text-neutral-400 line-through">
                    {formatMoney(hotel.originalPrice)}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
