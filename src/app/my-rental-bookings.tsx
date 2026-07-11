import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Animated, Badge, Button, Card, ImageBand, OceanHero, enterUp } from '@/components/ui';
import { EmptyState } from '@/components/layout/EmptyState';
import { SignInGate } from '@/components/layout/SignInGate';
import { APP_NAME } from '@/constants/config';
import { useMyRentalBookings, type MyRentalBooking } from '@/features/profile';
import { nightsBetween } from '@/utils/date';
import { formatDate, formatMoney } from '@/utils/format';

// App brand mark — same asset the home hero + auth header use.
const logo = require('../../assets/images/icon.png');

const STATUS_TONE: Record<string, 'brand' | 'accent' | 'success' | 'neutral'> = {
  confirmed: 'success',
  approved: 'success',
  pending: 'accent',
  cancelled: 'neutral',
  rejected: 'neutral',
};

/** "pending" → "Pending" — the API returns lowercase status strings. */
const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Brand-tinted pill, matching the amenity chips on the Hotels & Stays card. */
function Chip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1">
      <Ionicons name={icon} size={12} color="#156473" />
      <Text className="text-xs font-medium text-brand-700" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Detail row matching the Booking-Confirmed page's summary style. */
function DetailRow({
  icon,
  label,
  value,
  valueClassName = 'flex-1 text-right text-sm font-semibold text-ink',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color="#9aa7ac" />
        <Text className="text-sm text-muted">{label}</Text>
      </View>
      <Text className={valueClassName} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function RentalBookingCard({ booking, index }: { booking: MyRentalBooking; index: number }) {
  const [open, setOpen] = useState(false);
  const nights = nightsBetween(booking.startDate, booking.endDate);

  // Rotate the chevron 180° as the card opens; kept in sync with `open` on tap.
  const spin = useSharedValue(0);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 180}deg` }],
  }));

  const toggle = () => {
    spin.value = withTiming(open ? 0 : 1, { duration: 200 });
    setOpen((o) => !o);
  };

  return (
    <Animated.View entering={enterUp(index)} layout={LinearTransition.duration(260)}>
      <Card className="overflow-hidden p-0 shadow-soft">
        {/* Summary — tap anywhere to expand */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityHint="Shows full booking details"
          onPress={toggle}
        >
          <View>
            {booking.imageUrl ? (
              <Image
                source={{ uri: booking.imageUrl }}
                style={{ width: '100%', height: 180 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <ImageBand className="h-[180px] items-center justify-center">
                <Ionicons name="home-outline" size={40} color="rgba(255,255,255,0.85)" />
              </ImageBand>
            )}

            {/* Floating status pill */}
            <View className="absolute right-3 top-3">
              <Badge
                label={titleCase(booking.status)}
                tone={STATUS_TONE[booking.status.toLowerCase()] ?? 'neutral'}
              />
            </View>
          </View>

          <View className="gap-2.5 p-4">
            <View className="gap-1">
              <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={1}>
                {booking.propertyTitle ?? 'Rental booking'}
              </Text>
              {booking.city ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted" numberOfLines={1}>
                    {booking.city}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Stay chips */}
            <View className="flex-row flex-wrap gap-2">
              <Chip
                icon="calendar-outline"
                label={`${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`}
              />
              <Chip icon="moon-outline" label={`${nights} night${nights === 1 ? '' : 's'}`} />
            </View>

            {/* Price row + dropdown affordance */}
            <View className="mt-0.5 flex-row items-end justify-between">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="text-xl font-display-x text-brand-600">
                  {formatMoney({ amount: booking.totalPrice, currency: booking.currency })}
                </Text>
                <Text className="text-xs text-muted-foreground">total</Text>
              </View>
              <Animated.View style={chevronStyle}>
                <Ionicons name="chevron-down" size={20} color="#1a7a8c" />
              </Animated.View>
            </View>
          </View>
        </Pressable>

        {/* Expanded details — borderless, styled like the Booking-Confirmed summary */}
        {open ? (
          <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(140)}
            className="gap-3 px-4 pb-4"
          >
            <DetailRow icon="log-in-outline" label="Check-in" value={formatDate(booking.startDate)} />
            <DetailRow icon="log-out-outline" label="Check-out" value={formatDate(booking.endDate)} />
            <DetailRow icon="moon-outline" label="Nights" value={`${nights} night${nights === 1 ? '' : 's'}`} />
            <DetailRow
              icon="pricetag-outline"
              label="Reference"
              value={`#${booking.id.slice(0, 8).toUpperCase()}`}
            />
            {booking.createdAt ? (
              <DetailRow icon="time-outline" label="Requested on" value={formatDate(booking.createdAt)} />
            ) : null}

            {booking.message ? (
              <View className="gap-1 rounded-2xl bg-surface-sunk/60 p-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted">Your note</Text>
                </View>
                <Text className="text-sm text-ink">{booking.message}</Text>
              </View>
            ) : null}

            <View className="h-px bg-hairline" />
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-ink">Total</Text>
              <Text className="font-display-x text-lg text-brand-600">
                {formatMoney({ amount: booking.totalPrice, currency: booking.currency })}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

/** Curved ocean hero — mirrors the home screen's header (logo + big title). */
function RentalBookingsHero({ count }: { count?: number }) {
  return (
    <Animated.View entering={enterUp(0)}>
      <OceanHero className="rounded-b-[36px] px-5 pb-8 pt-6">
        <View className="flex-row items-center gap-2.5">
          <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
          <Text className="font-display text-base text-white">{APP_NAME}</Text>
        </View>

        <Text className="mt-6 font-display-x text-[32px] leading-[38px] text-white">Rental Stays</Text>
        <Text className="mt-2 text-[15px] leading-5 text-white/90">
          {count && count > 0
            ? `${count} rental booking${count === 1 ? '' : 's'} · upcoming & past stays`
            : 'Your vacation-rental requests, all in one place.'}
        </Text>
      </OceanHero>
    </Animated.View>
  );
}

function RentalBookingsList() {
  const { data, isLoading, isError, isRefetching, refetch } = useMyRentalBookings();
  const bookings = data ?? [];

  return (
    <FlatList
      data={bookings}
      keyExtractor={(b) => b.id}
      contentContainerClassName="pb-10"
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <View className="px-5 pb-4">
          <RentalBookingCard booking={item} index={index} />
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a7a8c" />
      }
      ListHeaderComponent={
        <>
          <RentalBookingsHero count={bookings.length} />
          {bookings.length > 0 ? (
            <View className="flex-row items-baseline justify-between px-5 pb-3 pt-7">
              <Text className="font-display text-xl text-ink">All rentals</Text>
              <Text className="text-xs text-muted">
                {bookings.length} booking{bookings.length === 1 ? '' : 's'}
              </Text>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="items-center justify-center py-24">
            <ActivityIndicator color="#1a7a8c" />
          </View>
        ) : isError ? (
          <View className="items-center gap-4 px-8 py-16">
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load your rental bookings"
              message="Something went wrong on our end."
            />
            <Button label="Retry" variant="outline" onPress={() => refetch()} />
          </View>
        ) : (
          <View className="px-8 py-16">
            <EmptyState
              icon="home-outline"
              title="No rental bookings yet"
              message="Requests you make on vacation rentals will show up here."
            />
          </View>
        )
      }
    />
  );
}

export default function MyRentalBookingsScreen() {
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'My Rental Bookings' }} />
      <SignInGate icon="home-outline" message="Sign in to see your rental bookings.">
        <RentalBookingsList />
      </SignInGate>
    </View>
  );
}
