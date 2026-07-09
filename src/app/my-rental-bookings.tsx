import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { Animated, Badge, Button, Card, enterUp } from '@/components/ui';
import { EmptyState } from '@/components/layout/EmptyState';
import { SignInGate } from '@/components/layout/SignInGate';
import { useMyRentalBookings, type MyRentalBooking } from '@/features/profile';
import { formatDate, formatMoney } from '@/utils/format';

const STATUS_TONE: Record<string, 'brand' | 'accent' | 'success' | 'neutral'> = {
  confirmed: 'success',
  approved: 'success',
  pending: 'accent',
  cancelled: 'neutral',
  rejected: 'neutral',
};

function RentalBookingCard({ booking, index }: { booking: MyRentalBooking; index: number }) {
  return (
    <Animated.View entering={enterUp(index)}>
      <Card className="flex-row gap-3 overflow-hidden p-0">
        {booking.imageUrl ? (
          <Image source={{ uri: booking.imageUrl }} style={{ width: 104, height: 104 }} contentFit="cover" />
        ) : (
          <View className="h-[104px] w-[104px] items-center justify-center bg-brand-50 dark:bg-brand-500/15">
            <Ionicons name="home-outline" size={26} color="#1a7a8c" />
          </View>
        )}
        <View className="flex-1 gap-1 py-2.5 pr-3">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>
              {booking.propertyTitle ?? 'Rental booking'}
            </Text>
            <Badge label={booking.status} tone={STATUS_TONE[booking.status.toLowerCase()] ?? 'neutral'} />
          </View>
          {booking.city ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={13} color="#9aa7ac" />
              <Text className="text-xs text-muted">{booking.city}</Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#9aa7ac" />
            <Text className="text-xs text-muted">
              {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
            </Text>
          </View>
          <Text className="mt-0.5 text-sm font-bold text-brand-600">
            {formatMoney({ amount: booking.totalPrice, currency: booking.currency })}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

function RentalBookingsList() {
  const { data, isLoading, isError, isRefetching, refetch } = useMyRentalBookings();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#1a7a8c" />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <EmptyState icon="cloud-offline-outline" title="Couldn't load your rental bookings" message="Something went wrong on our end." />
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(b) => b.id}
      contentContainerClassName="gap-3 p-5"
      renderItem={({ item, index }) => <RentalBookingCard booking={item} index={index} />}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a7a8c" />}
      ListEmptyComponent={
        <View className="mt-24">
          <EmptyState
            icon="home-outline"
            title="No rental bookings yet"
            message="Requests you make on vacation rentals will show up here."
          />
        </View>
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
