import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, Text, TextInput, View } from 'react-native';

import { Badge, Button, DateField, DetailSkeleton, Gallery } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import { useRequireAuth } from '@/features/auth';
import { useCreateRentalBooking } from '@/features/bookings';
import { useRental } from '@/features/rentals';
import { useAuthStore } from '@/store/auth.store';
import { AmenityGrid } from '@/utils/amenities';
import { addDays, toISODate } from '@/utils/date';
import { formatMoney, formatRating } from '@/utils/format';

function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="items-center gap-1">
      <Ionicons name={icon} size={20} color="#219ebc" />
      <Text className="text-sm text-neutral-700 dark:text-neutral-300">{label}</Text>
    </View>
  );
}

export default function RentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { data: rental, isLoading, isError } = useRental(id);
  const { mutateAsync, isPending } = useCreateRentalBooking();

  const today = toISODate(new Date());
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(today, 30));
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-black">
        <Stack.Screen options={{ title: 'Rental' }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !rental) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
        <Text className="text-center text-neutral-500">
          Couldn&apos;t load this rental. Pull back and try again.
        </Text>
      </View>
    );
  }

  const submit = async () => {
    setError(null);
    try {
      await mutateAsync({
        propertyId: rental.id,
        startDate: start,
        endDate: end,
        totalPrice: rental.price.amount,
        message: message.trim() || `Booking request from ${user?.name ?? 'a guest'}`,
      });
      setDone(true);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send your request.');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ title: rental.title }} />
      <ScrollView contentContainerClassName="pb-32">
        <Gallery images={rental.images.map((i) => i.url)} />
        <View className="gap-4 p-5">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-2xl font-bold text-neutral-900 dark:text-white">{rental.title}</Text>
            <View className="flex-row items-center gap-3">
              <WishlistButton
                item={{
                  id: rental.id,
                  category: 'rentals',
                  title: rental.title,
                  imageUrl: rental.images[0]?.url,
                  subtitle: rental.location?.city,
                  price: rental.price.amount,
                  currency: rental.price.currency,
                }}
              />
              <Badge label={rental.propertyType} tone="neutral" />
            </View>
          </View>

          <Text className="text-neutral-500">
            {rental.location?.city}
            {rental.rating != null ? ` · ★ ${formatRating(rental.rating)}` : ''}
          </Text>

          {rental.bedrooms != null || rental.bathrooms != null || rental.maxGuests != null ? (
            <View className="flex-row gap-8">
              {rental.bedrooms != null ? <Spec icon="bed-outline" label={`${rental.bedrooms} bed`} /> : null}
              {rental.bathrooms != null ? <Spec icon="water-outline" label={`${rental.bathrooms} bath`} /> : null}
              {rental.maxGuests != null ? <Spec icon="people-outline" label={`${rental.maxGuests} guests`} /> : null}
            </View>
          ) : null}

          {rental.amenities.length > 0 ? (
            <View className="gap-2">
              <Text className="text-lg font-bold text-neutral-900 dark:text-white">Amenities</Text>
              <AmenityGrid amenities={rental.amenities} />
            </View>
          ) : null}

          {rental.description ? (
            <Text className="leading-6 text-neutral-700 dark:text-neutral-300">{rental.description}</Text>
          ) : null}

          {/* Request-to-book form */}
          {open && isAuthenticated ? (
            <View className="gap-3 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
              <Text className="text-base font-bold text-neutral-900 dark:text-white">Request dates</Text>
              <View className="flex-row gap-3">
                <DateField label="Move-in" value={start} min={new Date()} onChange={setStart} />
                <DateField label="Move-out" value={end} min={new Date(addDays(start, 1))} onChange={setEnd} />
              </View>
              <TextInput
                placeholder="Message to the owner (optional)"
                placeholderTextColor="#9ca3af"
                multiline
                value={message}
                onChangeText={setMessage}
                className="min-h-16 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              {error ? <Text className="text-xs text-danger">{error}</Text> : null}
              <Button label="Send request" loading={isPending} onPress={submit} fullWidth />
            </View>
          ) : null}

          {done ? (
            <View className="flex-row items-center gap-2 rounded-xl bg-green-50 px-4 py-3 dark:bg-green-950">
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <Text className="flex-1 text-sm text-success">
                Request sent! The owner will reply about availability.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-neutral-100 bg-white px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-lg font-bold text-brand-600">
            {formatMoney(rental.price)}
            <Text className="text-xs font-normal text-neutral-400"> / month</Text>
          </Text>
          {rental.originalPrice ? (
            <Text className="text-xs text-neutral-400 line-through">{formatMoney(rental.originalPrice)}</Text>
          ) : null}
        </View>
        {rental.externalBookingUrl ? (
          <Button label="Enquire" onPress={() => Linking.openURL(rental.externalBookingUrl!)} />
        ) : done ? (
          <Button label="Requested" disabled onPress={() => {}} />
        ) : (
          <Button label="Request to book" onPress={() => requireAuth(() => setOpen(true))} />
        )}
      </View>
    </View>
  );
}
