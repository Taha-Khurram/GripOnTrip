import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { Badge, Button } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import type { Room } from '../types';

/** A single bookable room, with a "Select" CTA that starts the booking flow. */
export function RoomCard({
  room,
  currency,
  onSelect,
}: {
  room: Room;
  currency: string;
  onSelect: (room: Room) => void;
}) {
  const soldOut = !room.available || room.inventory === 0;
  return (
    <View className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {room.images[0] ? (
        <Image source={{ uri: room.images[0] }} style={{ width: '100%', height: 140 }} contentFit="cover" />
      ) : null}
      <View className="gap-2 p-4">
        <Text className="text-base font-bold text-ink">{room.roomType}</Text>

        <View className="flex-row flex-wrap gap-2">
          {room.capacity != null ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="people-outline" size={14} color="#9aa7ac" />
              <Text className="text-xs text-muted">Sleeps {room.capacity}</Text>
            </View>
          ) : null}
          {room.bedType ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={14} color="#9aa7ac" />
              <Text className="text-xs text-muted">{room.bedType}</Text>
            </View>
          ) : null}
          {room.roomSizeSqft ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="resize-outline" size={14} color="#9aa7ac" />
              <Text className="text-xs text-muted">{room.roomSizeSqft} sqft</Text>
            </View>
          ) : null}
        </View>

        {room.amenities.length > 0 ? (
          <Text className="text-xs text-muted" numberOfLines={2}>
            {room.amenities.slice(0, 5).join(' · ')}
          </Text>
        ) : null}

        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-lg font-display text-brand-600">
            {formatMoney({ amount: room.pricePerNight, currency })}
            <Text className="text-xs font-normal text-muted-foreground"> / night</Text>
          </Text>
          {soldOut ? (
            <Badge label="Sold out" tone="neutral" />
          ) : (
            <Button label="Select" size="sm" onPress={() => onSelect(room)} />
          )}
        </View>
      </View>
    </View>
  );
}
