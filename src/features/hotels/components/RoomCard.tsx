import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { DeepPanel, PressableScale } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import type { Room } from '../types';

/** One spec pill inside the dark room card (capacity, bed, size). */
function RoomSpec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="w-1/2 flex-row items-center gap-2 py-1.5">
      <Ionicons name={icon} size={15} color="rgba(255,255,255,0.6)" />
      <Text className="flex-1 text-sm font-body-medium text-white" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/**
 * A single bookable room, styled like the tour page's "Packages Offered" card:
 * a dark navy tile with a badge row, title, per-night price, a spec grid and an
 * add / quantity action. Selecting one or more rooms drives the reservation
 * summary shown further down the hotel detail page.
 */
export function RoomCard({
  room,
  currency,
  quantity,
  onQuantityChange,
  index = 0,
}: {
  room: Room;
  currency: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  index?: number;
}) {
  const soldOut = !room.available || room.inventory === 0;
  // Cap selection at the listed inventory when known, otherwise allow a sensible max.
  const max = room.inventory && room.inventory > 0 ? room.inventory : 10;
  const selected = quantity > 0;

  return (
    <DeepPanel
      className="rounded-3xl shadow-card"
      // Teal glow when selected — applied via inline style (not a conditional
      // `shadow-*` class, which crashes native inside Expo Router).
      style={selected ? { boxShadow: '0px 12px 32px rgba(26, 122, 140, 0.35)' } : undefined}
    >
      <View className="gap-4 p-5">
        {/* Badge row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1">
            <Ionicons name="bed-outline" size={13} color="#ffffff" />
            <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">Room</Text>
          </View>
          <Text className="text-xs font-body-semibold text-white/40">
            #{String(index + 1).padStart(2, '0')}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-display text-white">{room.roomType}</Text>

        {/* Price */}
        <View className="gap-0.5">
          <Text className="text-[11px] font-body-semibold uppercase tracking-wider text-white/50">
            Per night
          </Text>
          <Text className="text-3xl font-display-x text-white">
            {formatMoney({ amount: room.pricePerNight, currency })}
          </Text>
        </View>

        <View className="h-px bg-white/15" />

        {/* Spec grid */}
        {room.capacity != null || room.bedType || room.roomSizeSqft ? (
          <View className="flex-row flex-wrap">
            {room.capacity != null ? (
              <RoomSpec icon="people-outline" label={`Sleeps ${room.capacity}`} />
            ) : null}
            {room.bedType ? <RoomSpec icon="bed-outline" label={room.bedType} /> : null}
            {room.roomSizeSqft ? (
              <RoomSpec icon="resize-outline" label={`${room.roomSizeSqft} sqft`} />
            ) : null}
            {room.inventory && room.inventory > 0 ? (
              <RoomSpec
                icon="cube-outline"
                label={`${room.inventory} room${room.inventory === 1 ? '' : 's'} left`}
              />
            ) : null}
          </View>
        ) : null}

        {/* Amenities */}
        {room.amenities.length > 0 ? (
          <Text className="text-sm leading-5 text-white/70" numberOfLines={2}>
            {room.amenities.slice(0, 6).join(' · ')}
          </Text>
        ) : null}

        {/* Action */}
        {soldOut ? (
          <View className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3.5">
            <Ionicons name="close-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text className="text-base font-body-semibold text-white/70">Sold out</Text>
          </View>
        ) : selected ? (
          <View className="flex-row items-center justify-between rounded-2xl bg-white/10 px-5 py-2.5">
            <Text className="text-sm font-body-semibold text-white">In your stay</Text>
            <View className="flex-row items-center gap-5">
              <Pressable hitSlop={8} onPress={() => onQuantityChange(quantity - 1)}>
                <Ionicons name="remove-circle" size={30} color="#f5a623" />
              </Pressable>
              <Text className="w-5 text-center text-lg font-bold text-white">{quantity}</Text>
              <Pressable
                hitSlop={8}
                disabled={quantity >= max}
                onPress={() => onQuantityChange(quantity + 1)}
                className={quantity >= max ? 'opacity-30' : ''}
              >
                <Ionicons name="add-circle" size={30} color="#f5a623" />
              </Pressable>
            </View>
          </View>
        ) : (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Add ${room.roomType}`}
            onPress={() => onQuantityChange(1)}
            className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-accent-500 py-3.5"
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text className="text-base font-body-semibold text-white">Add Room</Text>
          </PressableScale>
        )}
      </View>
    </DeepPanel>
  );
}
