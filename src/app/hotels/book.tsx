import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Badge, Button, Card, DateField, Input, Stepper } from '@/components/ui';
import { AUTH_GATING_ENABLED } from '@/features/auth';
import { useCreateHotelBooking } from '@/features/bookings';
import {
  nightlySubtotal,
  parseSelection,
  selectedRooms,
  totalRoomCount,
  useHotel,
  useHotelRooms,
  type RoomQuantities,
} from '@/features/hotels';
import { RoomCard } from '@/features/hotels/components/RoomCard';
import { PaymentOption, type PaymentMode } from '@/features/hotels/components/PaymentOption';
import { CardPaymentForm, usePayWithCard, type CardInput } from '@/features/payments';
import { useAuthStore } from '@/store/auth.store';
import { addDays, nightsBetween, parseAvailabilityRange, toISODate } from '@/utils/date';
import { formatDate, formatMoney } from '@/utils/format';

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

function PriceRow({
  label,
  value,
  valueClassName = 'text-sm font-semibold text-ink',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className={valueClassName}>{value}</Text>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color="#9aa7ac" />
        <Text className="text-sm text-muted">{label}</Text>
      </View>
      <Text className="flex-1 text-right text-sm font-semibold text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function BookHotelScreen() {
  const {
    id,
    roomId,
    selection,
    checkIn: checkInParam,
    checkOut: checkOutParam,
    payment: paymentParam,
  } = useLocalSearchParams<{
    id: string;
    roomId?: string;
    selection?: string;
    checkIn?: string;
    checkOut?: string;
    payment?: string;
  }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: hotel, isLoading } = useHotel(id);
  const { data: rooms = [], isLoading: roomsLoading } = useHotelRooms(id);
  const { mutateAsync, isPending } = useCreateHotelBooking();
  const { mutateAsync: payWithCard, isPending: isPaying } = usePayWithCard();

  // Seed the selection from the params: prefer the multi-room `selection` string,
  // then fall back to a single `roomId`. The user can still adjust it here.
  const [quantities, setQuantities] = useState<RoomQuantities>(() => {
    const parsed = parseSelection(selection);
    if (Object.keys(parsed).length > 0) return parsed;
    return roomId ? { [roomId]: 1 } : {};
  });

  const chosen = useMemo(() => selectedRooms(rooms, quantities), [rooms, quantities]);
  const roomCount = totalRoomCount(quantities);
  const primaryRoom = chosen[0]?.room;
  const availability = parseAvailabilityRange(hotel?.availabilityDates);

  // Seed the stay/payment from the detail page when provided, otherwise fall back
  // to the availability window / today.
  const initialCheckIn = checkInParam || availability?.start || toISODate(new Date());
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(checkOutParam || addDays(initialCheckIn, 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [arrivalTime, setArrivalTime] = useState('');
  const [requests, setRequests] = useState('');
  const [payment, setPayment] = useState<PaymentMode>(paymentParam === 'online' ? 'online' : 'property');
  const [card, setCard] = useState<CardInput | null>(null);
  const [showCardErrors, setShowCardErrors] = useState(0);
  const [showAmenities, setShowAmenities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const nights = nightsBetween(checkIn, checkOut);
  const currency = hotel?.price.currency ?? 'PKR';
  const nightlyRate = chosen.length > 0 ? nightlySubtotal(rooms, quantities) : hotel?.price.amount ?? 0;
  const total = nightlyRate * nights;

  const setRoomQuantity = (rId: string, quantity: number) =>
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[rId];
      else next[rId] = quantity;
      return next;
    });

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
  if (chosen.length === 0 && !confirmed) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-3 p-5 pb-10">
        <Stack.Screen options={{ title: 'Choose a room' }} />
        <Text className="text-xl font-display text-ink">{hotel.title}</Text>
        {roomsLoading ? (
          <ActivityIndicator color="#1a7a8c" className="mt-8" />
        ) : rooms.length > 0 ? (
          <>
            <Text className="text-sm text-muted">Select one or more rooms to continue.</Text>
            {rooms.map((r) => (
              <RoomCard
                key={r.id}
                room={r}
                currency={currency}
                quantity={quantities[r.id] ?? 0}
                onQuantityChange={(q) => setRoomQuantity(r.id, q)}
              />
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
    const guestSummary = `${adults} adult${adults === 1 ? '' : 's'}${
      children > 0 ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''
    }`;
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow justify-center gap-6 p-6 pb-10"
      >
        <Stack.Screen options={{ title: 'Booking confirmed' }} />

        {/* Success header */}
        <View className="items-center gap-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-center font-display-x text-2xl text-ink">Booking Requested!</Text>
            <Text className="text-center text-sm text-muted">
              Your request for {hotel.title} is pending confirmation from the host.
            </Text>
          </View>
        </View>

        {/* Booking summary */}
        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="receipt-outline" size={18} color="#156473" />
            <Text className="text-base font-semibold text-ink">Booking Summary</Text>
          </View>
          <View className="h-px bg-hairline" />
          <SummaryRow icon="business-outline" label="Property" value={hotel.title} />
          {primaryRoom ? (
            <SummaryRow icon="bed-outline" label="Room" value={primaryRoom.roomType} />
          ) : null}
          {roomCount > 1 ? (
            <SummaryRow icon="albums-outline" label="Rooms" value={`${roomCount} rooms`} />
          ) : null}
          <SummaryRow icon="calendar-outline" label="Check-in" value={formatDate(checkIn)} />
          <SummaryRow icon="calendar-clear-outline" label="Check-out" value={formatDate(checkOut)} />
          <SummaryRow icon="moon-outline" label="Nights" value={`${nights} night${nights === 1 ? '' : 's'}`} />
          <SummaryRow icon="people-outline" label="Guests" value={guestSummary} />
          <SummaryRow
            icon="card-outline"
            label="Payment"
            value={payment === 'online' ? 'Card (Stripe) · Paid' : 'Pay at Property'}
          />
          <View className="h-px bg-hairline" />
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-ink">Total</Text>
            <Text className="font-display-x text-xl text-brand-600">
              {formatMoney({ amount: total, currency })}
            </Text>
          </View>
        </Card>

        {/* Next-step note */}
        <View className="flex-row items-start gap-2 rounded-2xl bg-brand-50 px-4 py-3">
          <Ionicons name="information-circle-outline" size={18} color="#156473" />
          <Text className="flex-1 text-sm text-brand-700">
            {payment === 'property'
              ? 'Pay the full amount when you arrive at the property.'
              : 'Payment received — your card was charged successfully. A receipt has been sent by Stripe.'}
          </Text>
        </View>

        {/* CTAs — same pure-className Pressable pattern as the Confirm & Pay button.
            Backgrounds/borders come from `bg-*`/`border-*` classes (never inline
            `style`), so they paint reliably on native. */}
        <View className="gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View my bookings"
            onPress={() => router.replace('/my-bookings')}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4"
          >
            <Ionicons name="albums-outline" size={18} color="#ffffff" />
            <Text className="font-body-semibold text-base text-white">View My Bookings</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to hotel"
            onPress={() => router.back()}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-brand-500 bg-transparent py-4"
          >
            <Ionicons name="arrow-back-outline" size={18} color="#1a7a8c" />
            <Text className="font-body-semibold text-base text-brand-500">Back to Hotel</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Signed-in users book with their account details; guests must supply name/email.
  const needsGuestDetails = !user;
  const canBook =
    chosen.length > 0 &&
    nights > 0 &&
    (!needsGuestDetails || (name.trim().length > 1 && /\S+@\S+\.\S+/.test(email))) &&
    (payment !== 'online' || card !== null);
  const busy = isPending || isPaying;

  const primaryMax =
    primaryRoom?.inventory && primaryRoom.inventory > 0 ? primaryRoom.inventory : 10;

  const submit = async () => {
    setError(null);
    if (!primaryRoom) {
      setError('Please select a room first.');
      return;
    }
    if (nights <= 0) {
      setError('Please pick a check-out date after your check-in date.');
      return;
    }
    const notes = [
      arrivalTime.trim() ? `Estimated arrival: ${arrivalTime.trim()}` : '',
      requests.trim(),
    ]
      .filter(Boolean)
      .join('\n');
    const guestEmail = (user?.email ?? email).trim();
    try {
      // Charge the card first when paying online — only write the booking once
      // the money has actually moved, so a decline never creates a paid record.
      let paymentReference: string | undefined;
      if (payment === 'online') {
        if (!card) {
          setShowCardErrors((n) => n + 1);
          setError('Please enter valid card details to pay online.');
          return;
        }
        const result = await payWithCard({
          card,
          amount: total,
          currency,
          description: `Hotel booking · ${hotel.title}`,
          metadata: { hotelId: hotel.id, roomId: primaryRoom.id, guestEmail },
        });
        paymentReference = result.paymentIntentId;
      }
      await mutateAsync({
        hotelId: hotel.id,
        roomId: primaryRoom.id,
        guestName: (user?.name ?? name).trim() || 'Guest',
        guestEmail,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        children,
        totalPrice: total,
        currency,
        paymentMethod: payment === 'online' ? 'Card (Stripe)' : 'Pay at Property',
        paymentStatus: payment === 'online' ? 'paid' : 'pending',
        paymentReference,
        specialRequests: notes || undefined,
      });
      setConfirmed('ok');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not complete your booking.');
    }
  };

  const roomImage = primaryRoom?.images[0] ?? hotel.images[0]?.url;
  const reviewAmenities = primaryRoom?.amenities.length ? primaryRoom.amenities : hotel.amenities;
  const cancellation = hotel.freeCancellation ? 'Free cancellation' : 'Not Applicable';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Confirm your booking' }} />

      {/* ── Card 1 · Your Stay ─────────────────────────────────────── */}
      <Card className="gap-4">
        <SectionTitle>Your Stay</SectionTitle>

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
          <DateField
            label="Check-out"
            value={checkOut}
            min={new Date(addDays(checkIn, 1))}
            onChange={setCheckOut}
          />
        </View>
        {availability ? (
          <Text className="-mt-2 text-xs text-muted-foreground">
            Available {formatDate(availability.start)} – {formatDate(availability.end)}
          </Text>
        ) : null}

        <View className="gap-1 rounded-2xl border border-hairline p-1">
          {roomCount <= 1 && primaryRoom ? (
            <Stepper
              label="Rooms"
              value={roomCount}
              min={1}
              max={primaryMax}
              onChange={(v) => setRoomQuantity(primaryRoom.id, v)}
            />
          ) : (
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-base text-ink">Rooms</Text>
              <Text className="text-base font-semibold text-ink">{roomCount}</Text>
            </View>
          )}
          <Stepper label="Adults" value={adults} onChange={setAdults} min={1} />
          <Stepper label="Children" value={children} onChange={setChildren} />
        </View>
        {primaryRoom?.inventory && primaryRoom.inventory > 0 ? (
          <Text className="-mt-2 text-xs text-muted-foreground">
            Max {primaryRoom.inventory} available
          </Text>
        ) : null}

        {/* Additional information */}
        <View className="h-px bg-hairline" />
        <View className="flex-row items-center gap-2">
          <Ionicons name="information-circle-outline" size={18} color="#156473" />
          <Text className="text-base font-semibold text-ink">Additional Information</Text>
        </View>
        <Text className="-mt-2 text-xs text-muted-foreground">Help the hotel prepare for your arrival.</Text>

        <Input
          label="Estimated Arrival Time"
          placeholder="Select or type your arrival time (e.g. 10:30 AM)"
          value={arrivalTime}
          onChangeText={setArrivalTime}
        />

        <View className="gap-1.5">
          <Text className="text-sm font-body-medium text-ink">Special Requests</Text>
          <TextInput
            placeholder="e.g. Quiet room, late check-in, dietary requirements…"
            placeholderTextColor="#9aa7ac"
            multiline
            value={requests}
            onChangeText={setRequests}
            className="min-h-20 rounded-2xl border border-hairline bg-surface px-4 py-3 text-base text-ink"
          />
        </View>

        {needsGuestDetails ? (
          <View className="gap-3">
            <View className="h-px bg-hairline" />
            <Text className="text-base font-semibold text-ink">Your Details</Text>
            <Input label="Full name" value={name} onChangeText={setName} />
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        ) : null}
      </Card>

      {/* ── Card 2 · Payment Method ────────────────────────────────── */}
      <Card className="gap-4">
        <SectionTitle>Payment Method</SectionTitle>
        <View className="flex-row gap-3">
          <PaymentOption
            active={payment === 'online'}
            icon="card-outline"
            title="Pay Online"
            subtitle="Secure immediate booking confirmation."
            onPress={() => setPayment('online')}
          />
          <PaymentOption
            active={payment === 'property'}
            icon="business-outline"
            title="Pay at Property"
            subtitle="Pay when you arrive. Subject to setup."
            onPress={() => setPayment('property')}
          />
        </View>
        {payment === 'property' ? (
          <View className="rounded-2xl border border-dashed border-hairline bg-surface-sunk/50 p-4">
            <Text className="text-center text-sm text-muted">
              No payment required now. You will pay the full amount of{' '}
              <Text className="font-semibold text-ink">
                {formatMoney({ amount: total, currency })}
              </Text>{' '}
              when you arrive at the property.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-sm text-muted">
              Pay{' '}
              <Text className="font-semibold text-ink">
                {formatMoney({ amount: total, currency })}
              </Text>{' '}
              securely by card to confirm your booking instantly.
            </Text>
            <CardPaymentForm onChange={setCard} showAllErrors={showCardErrors} />
          </View>
        )}
      </Card>

      {/* ── Card 3 · Review Property ───────────────────────────────── */}
      <Card className="gap-3">
        <SectionTitle>Review Property</SectionTitle>
        <View className="overflow-hidden rounded-2xl bg-surface-sunk">
          {roomImage ? (
            <Image source={{ uri: roomImage }} style={{ width: '100%', height: 160 }} contentFit="cover" />
          ) : (
            <View className="h-40 items-center justify-center gap-2 bg-surface-sunk">
              <Ionicons name="image-outline" size={30} color="#9aa7ac" />
              <Text className="text-xs uppercase tracking-wide text-muted-foreground">
                No image available
              </Text>
            </View>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-xs uppercase tracking-wide text-muted-foreground">{hotel.title}</Text>
          <Text className="font-display text-xl text-ink">{primaryRoom?.roomType ?? 'Room'}</Text>
          {hotel.location?.city || hotel.location?.address ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={14} color="#9aa7ac" />
              <Text className="text-sm text-muted">
                {hotel.location?.city ?? hotel.location?.address}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {primaryRoom?.bedType ? <Badge label={primaryRoom.bedType} tone="neutral" /> : null}
          {primaryRoom?.capacity != null ? (
            <Badge label={`Max ${primaryRoom.capacity}`} tone="success" />
          ) : null}
          {roomCount > 1 ? <Badge label={`${roomCount} rooms`} tone="brand" /> : null}
        </View>

        {reviewAmenities.length > 0 ? (
          <>
            <Pressable
              className="flex-row items-center justify-between pt-1"
              onPress={() => setShowAmenities((v) => !v)}
            >
              <Text className="text-sm font-semibold text-brand-600">View Amenities</Text>
              <Ionicons
                name={showAmenities ? 'chevron-down' : 'chevron-forward'}
                size={18}
                color="#1a7a8c"
              />
            </Pressable>
            {showAmenities ? (
              <View className="flex-row flex-wrap gap-2">
                {reviewAmenities.map((a) => (
                  <View key={a} className="rounded-full bg-brand-50 px-3 py-1.5">
                    <Text className="text-xs font-medium text-brand-700">{a}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </Card>

      {/* ── Card 4 · Price Details ─────────────────────────────────── */}
      <Card className="gap-3">
        <SectionTitle>Price Details</SectionTitle>
        <PriceRow label="Cancellation Policy" value={cancellation} />
        {chosen.map(({ room, quantity }) => (
          <PriceRow
            key={room.id}
            label={`${nights} Night${nights === 1 ? '' : 's'} × ${quantity} ${room.roomType}`}
            value={formatMoney({ amount: room.pricePerNight * quantity * nights, currency })}
          />
        ))}
        <PriceRow label="Service Fee" value="Free" />
        <PriceRow label="Taxes" value="Included" valueClassName="text-sm font-semibold text-green-600" />

        <View className="h-px bg-hairline" />
        <View className="flex-row items-baseline justify-between">
          <Text className="text-base font-bold text-ink">Total</Text>
          <Text className="font-display-x text-xl text-brand-600">
            {formatMoney({ amount: total, currency })}
          </Text>
        </View>

        {error ? (
          <View className="rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        {/* Confirm CTA — solid brand-blue background via a `bg-*` className (NOT an
            inline `style`). This matches the proven PaymentOption/Button pattern; the
            background paints reliably. Do NOT add a `style` function here — mixing a
            style function with className makes NativeWind drop one of them and the
            button renders invisible. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Confirm & Pay"
          accessibilityState={{ disabled: !canBook || busy, busy }}
          disabled={!canBook || busy}
          onPress={submit}
          className={[
            'w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4',
            !canBook || busy ? 'opacity-50' : '',
          ].join(' ')}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="shield-checkmark-outline" size={18} color="#ffffff" />
              <Text className="text-center font-body-semibold text-base text-white">
                {payment === 'online'
                  ? `Pay ${formatMoney({ amount: total, currency })}`
                  : 'Confirm & Book'}
              </Text>
            </>
          )}
        </Pressable>
        <Text className="text-center text-xs text-muted-foreground">
          {payment === 'online'
            ? 'Your card is charged securely via Stripe to confirm this booking.'
            : "You won't be charged now — the host confirms your request first."}
        </Text>
      </Card>
    </ScrollView>
  );
}
