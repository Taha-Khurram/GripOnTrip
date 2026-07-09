import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';

import { Badge, Button, DateField, Input, Stepper } from '@/components/ui';
import { AUTH_GATING_ENABLED } from '@/features/auth';
import { useCreateHotelBooking } from '@/features/bookings';
import { useHotel, useHotelRooms } from '@/features/hotels';
import { RoomCard } from '@/features/hotels/components/RoomCard';
import { useAuthStore } from '@/store/auth.store';
import { addDays, nightsBetween, parseAvailabilityRange, toISODate } from '@/utils/date';
import { formatDate, formatMoney } from '@/utils/format';

export default function BookHotelScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId?: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: hotel, isLoading } = useHotel(id);
  const { data: rooms = [], isLoading: roomsLoading } = useHotelRooms(id);
  const { mutateAsync, isPending } = useCreateHotelBooking();

  // A room is required (bookings.room_id is NOT NULL). Start from the param, but
  // let the user pick/switch here.
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(roomId || undefined);
  const room = useMemo(() => rooms.find((r) => r.id === selectedRoomId), [rooms, selectedRoomId]);
  const availability = parseAvailabilityRange(hotel?.availabilityDates);

  const initialCheckIn = availability?.start ?? toISODate(new Date());
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(addDays(initialCheckIn, 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [requests, setRequests] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const nightlyRate = room?.pricePerNight ?? hotel?.price.amount ?? 0;
  const nights = nightsBetween(checkIn, checkOut);
  const currency = hotel?.price.currency ?? 'PKR';
  const total = nightlyRate * nights;

  if (isLoading || !hotel) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title: 'Book' }} />
        <ActivityIndicator color="#1a7a8c" />
      </View>
    );
  }

  if (AUTH_GATING_ENABLED && !user) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Stack.Screen options={{ title: 'Book' }} />
        <Ionicons name="lock-closed-outline" size={40} color="#9aa7ac" />
        <Text className="text-center text-muted">Please sign in to complete your booking.</Text>
        <Button label="Sign in" fullWidth onPress={() => router.replace('/(auth)/sign-in')} />
      </View>
    );
  }

  // Every hotel booking needs a room (bookings.room_id is NOT NULL). If the user
  // arrived without one, let them pick; if the hotel has no bookable rooms, guide
  // them to contact the property instead.
  if (!room && !confirmed) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-3 p-5 pb-10">
        <Stack.Screen options={{ title: 'Choose a room' }} />
        <Text className="text-xl font-display text-ink">{hotel.title}</Text>
        {roomsLoading ? (
          <ActivityIndicator color="#1a7a8c" className="mt-8" />
        ) : rooms.length > 0 ? (
          <>
            <Text className="text-sm text-muted">Select a room to continue.</Text>
            {rooms.map((r) => (
              <RoomCard key={r.id} room={r} currency={currency} onSelect={(sel) => setSelectedRoomId(sel.id)} />
            ))}
          </>
        ) : (
          <View className="mt-8 items-center gap-3">
            <Ionicons name="bed-outline" size={40} color="#9aa7ac" />
            <Text className="text-center text-muted">
              This property has no rooms available to book online right now.
            </Text>
            {hotel.phone ? (
              <Button label="Call the property" onPress={() => router.back()} />
            ) : (
              <Button label="Back" variant="outline" onPress={() => router.back()} />
            )}
          </View>
        )}
      </ScrollView>
    );
  }

  if (confirmed) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Stack.Screen options={{ title: 'Booking confirmed' }} />
        <View className="h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
        </View>
        <Text className="text-center text-xl font-display text-ink">
          Booking requested!
        </Text>
        <Text className="text-center text-sm text-muted">
          Your request for {hotel.title} is pending confirmation from the host.
          {hotel.paymentType ? ` Payment: ${hotel.paymentType}.` : ''}
        </Text>
        <View className="w-full gap-3 pt-2">
          <Button label="View my bookings" fullWidth onPress={() => router.replace('/my-bookings')} />
          <Button label="Back to hotel" variant="outline" fullWidth onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const canBook = Boolean(room) && nights > 0 && name.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  const submit = async () => {
    setError(null);
    if (!room) {
      setError('Please select a room first.');
      return;
    }
    try {
      await mutateAsync({
        hotelId: hotel.id,
        roomId: room.id,
        guestName: name.trim(),
        guestEmail: email.trim(),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        children,
        totalPrice: total,
        currency,
        paymentMethod: hotel.paymentType ?? undefined,
        specialRequests: requests.trim() || undefined,
      });
      setConfirmed('ok');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not complete your booking.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 p-5 pb-10" keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Book your stay' }} />

      {/* Summary header */}
      <View className="gap-1">
        <Text className="text-xl font-display text-ink">{hotel.title}</Text>
        {room ? (
          <View className="flex-row items-center gap-2">
            <Badge label={room.roomType} tone="brand" />
            {room.bedType ? <Text className="text-sm text-muted">{room.bedType}</Text> : null}
          </View>
        ) : null}
        <Text className="text-sm text-muted">
          {formatMoney({ amount: nightlyRate, currency })} / night
        </Text>
      </View>

      {/* Dates */}
      <View className="flex-row gap-3">
        <DateField
          label="Check-in"
          value={checkIn}
          min={availability ? new Date(availability.start) : new Date()}
          onChange={(iso) => {
            setCheckIn(iso);
            if (nightsBetween(iso, checkOut) <= 0) setCheckOut(addDays(iso, 1));
          }}
        />
        <DateField label="Check-out" value={checkOut} min={new Date(addDays(checkIn, 1))} onChange={setCheckOut} />
      </View>
      {availability ? (
        <Text className="-mt-2 text-xs text-muted-foreground">
          Available {formatDate(availability.start)} – {formatDate(availability.end)}
        </Text>
      ) : null}

      {/* Guests */}
      <View className="rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
        <Text className="mb-1 text-sm font-semibold text-ink">Guests</Text>
        <Stepper label="Adults" value={adults} onChange={setAdults} min={1} />
        <Stepper label="Children" value={children} onChange={setChildren} />
        {room?.capacity ? (
          <Text className="pt-1 text-xs text-muted-foreground">This room sleeps up to {room.capacity}.</Text>
        ) : null}
      </View>

      {/* Guest details */}
      <View className="gap-3">
        <Input label="Full name" value={name} onChangeText={setName} />
        <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-ink">Special requests</Text>
          <TextInput
            placeholder="Late check-in, extra bed…"
            placeholderTextColor="#9aa7ac"
            multiline
            value={requests}
            onChangeText={setRequests}
            className="min-h-16 rounded-xl border border-hairline bg-white px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
        </View>
      </View>

      {/* Price breakdown */}
      <View className="gap-2 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">
            {formatMoney({ amount: nightlyRate, currency })} × {nights} night{nights === 1 ? '' : 's'}
          </Text>
          <Text className="text-sm text-ink">{formatMoney({ amount: total, currency })}</Text>
        </View>
        <View className="h-px bg-neutral-200 dark:bg-neutral-700" />
        <View className="flex-row justify-between">
          <Text className="text-base font-bold text-ink">Total</Text>
          <Text className="text-base font-bold text-brand-600">{formatMoney({ amount: total, currency })}</Text>
        </View>
        {hotel.paymentType ? (
          <Text className="text-xs text-muted">Payment: {hotel.paymentType}</Text>
        ) : null}
      </View>

      {error ? (
        <View className="rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      <Button
        label={canBook ? `Confirm booking · ${formatMoney({ amount: total, currency })}` : 'Confirm booking'}
        fullWidth
        loading={isPending}
        disabled={!canBook}
        onPress={submit}
      />
      <Text className="text-center text-xs text-muted-foreground">
        You won&apos;t be charged now — the host confirms your request first.
      </Text>
    </ScrollView>
  );
}
