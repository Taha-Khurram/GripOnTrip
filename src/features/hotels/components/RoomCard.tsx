import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { Badge, PressableScale } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import type { Room } from '../types';

/**
 * A single bookable room. Mirrors the website: each room lives in its own card
 * with an add / minus quantity control. Selecting one or more rooms drives the
 * reservation summary shown further down the page.
 */
export function RoomCard({
  room,
  currency,
  quantity,
  onQuantityChange,
}: {
  room: Room;
  currency: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  const soldOut = !room.available || room.inventory === 0;
  // Cap selection at the listed inventory when known, otherwise allow a sensible max.
  const max = room.inventory && room.inventory > 0 ? room.inventory : 10;
  const selected = quantity > 0;

  return (
    <View
      className={[
        'overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900',
        selected
          ? 'border-brand-500 shadow-glow-ocean'
          : 'border-neutral-100 dark:border-neutral-800',
      ].join(' ')}
    >
      {room.images[0] ? (
        <Image source={{ uri: room.images[0] }} style={{ width: '100%', height: 140 }} contentFit="cover" />
      ) : null}
      <View className="gap-2 p-4">
        <Text className="text-base font-bold text-ink">{room.roomType}</Text>

        <View className="flex-row flex-wrap gap-x-3 gap-y-1.5">
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
          ) : selected ? (
            <View className="flex-row items-center gap-4 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 dark:border-brand-900 dark:bg-brand-900">
              <Pressable hitSlop={8} onPress={() => onQuantityChange(quantity - 1)}>
                <Ionicons name="remove-circle" size={28} color="#1a7a8c" />
              </Pressable>
              <Text className="w-5 text-center text-base font-bold text-ink">{quantity}</Text>
              <Pressable
                hitSlop={8}
                disabled={quantity >= max}
                onPress={() => onQuantityChange(quantity + 1)}
                className={quantity >= max ? 'opacity-30' : ''}
              >
                <Ionicons name="add-circle" size={28} color="#1a7a8c" />
              </Pressable>
            </View>
          ) : (
            <PressableScale
              accessibilityRole="button"
              onPress={() => onQuantityChange(1)}
              className="flex-row items-center gap-1.5 rounded-full border border-brand-500 px-4 py-2"
            >
              <Ionicons name="add" size={16} color="#1a7a8c" />
              <Text className="font-body-semibold text-sm text-brand-500">Add room</Text>
            </PressableScale>
          )}
        </View>

        {selected && room.inventory && room.inventory > 0 ? (
          <Text className="text-xs text-muted-foreground">
            {quantity >= max ? 'Only ' : ''}
            {room.inventory} room{room.inventory === 1 ? '' : 's'} available
          </Text>
        ) : null}
      </View>
    </View>
  );
}
