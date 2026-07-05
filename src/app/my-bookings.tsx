import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { Badge, Button, Card } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useMyBookings, type MyBooking } from '@/features/bookings';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, formatMoney } from '@/utils/format';

const STATUS_TONE: Record<string, 'brand' | 'accent' | 'success' | 'neutral'> = {
  confirmed: 'success',
  approved: 'success',
  pending: 'accent',
  cancelled: 'neutral',
  rejected: 'neutral',
};

function BookingCard({ booking }: { booking: MyBooking }) {
  return (
    <Card className="flex-row gap-3 overflow-hidden p-0">
      {booking.imageUrl ? (
        <Image source={{ uri: booking.imageUrl }} style={{ width: 96, height: 96 }} contentFit="cover" />
      ) : (
        <View className="h-24 w-24 items-center justify-center bg-brand-50">
          <Ionicons name="bed-outline" size={26} color="#219ebc" />
        </View>
      )}
      <View className="flex-1 gap-1 py-2 pr-3">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-base font-semibold text-neutral-900 dark:text-white" numberOfLines={1}>
            {booking.hotelName ?? 'Hotel booking'}
          </Text>
          <Badge label={booking.status} tone={STATUS_TONE[booking.status.toLowerCase()] ?? 'neutral'} />
        </View>
        <Text className="text-xs text-neutral-500">
          {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
        </Text>
        <Text className="text-xs text-neutral-500">
          {booking.guests} guest{booking.guests === 1 ? '' : 's'}
        </Text>
        <Text className="text-sm font-bold text-brand-600">
          {formatMoney({ amount: booking.totalPrice, currency: booking.currency })}
        </Text>
      </View>
    </Card>
  );
}

export default function MyBookingsScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading, isError, isRefetching, refetch } = useMyBookings();

  if (!isAuthenticated) {
    return (
      <Screen className="justify-center gap-4 px-8">
        <Stack.Screen options={{ title: 'My Bookings' }} />
        <Ionicons name="briefcase-outline" size={40} color="#9ca3af" style={{ alignSelf: 'center' }} />
        <Text className="text-center text-neutral-500">Sign in to see your bookings.</Text>
        <Button label="Sign in" fullWidth onPress={() => router.push('/(auth)/sign-in')} />
      </Screen>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black">
      <Stack.Screen options={{ title: 'My Bookings' }} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#219ebc" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-neutral-500">Couldn&apos;t load your bookings.</Text>
          <Button label="Retry" variant="outline" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(b) => b.id}
          contentContainerClassName="gap-3 p-5"
          renderItem={({ item }) => <BookingCard booking={item} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#219ebc" />}
          ListEmptyComponent={
            <View className="mt-24 items-center gap-3 px-8">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <Ionicons name="briefcase-outline" size={28} color="#219ebc" />
              </View>
              <Text className="text-lg font-bold text-neutral-900 dark:text-white">No bookings yet</Text>
              <Text className="text-center text-sm text-neutral-500">
                When you book a stay it will show up here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
