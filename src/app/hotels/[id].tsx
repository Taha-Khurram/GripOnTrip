import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, Button, DateField, DetailSkeleton, PressableScale, SunCTA } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import {
  encodeSelection,
  nightlySubtotal,
  selectedRooms,
  totalRoomCount,
  useHotel,
  useHotelReviews,
  useHotelRooms,
  type RoomQuantities,
} from '@/features/hotels';
import { PaymentOption, type PaymentMode } from '@/features/hotels/components/PaymentOption';
import { RoomCard } from '@/features/hotels/components/RoomCard';
import { ReviewsSection } from '@/features/reviews';
import { AmenityGrid } from '@/utils/amenities';
import { addDays, nightsBetween, parseAvailabilityRange, toISODate } from '@/utils/date';
import { formatDate, formatMoney, formatRating } from '@/utils/format';

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

/**
 * Property photo as a circular avatar on the warm hero band — mirrors the Umrah
 * package hero. Falls back to a bed glyph when there's no image or it fails.
 */
function HeroImage({ uri }: { uri?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(uri) && !failed;
  return (
    <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/70 bg-white shadow-card">
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-brand-50">
          <Ionicons name="bed" size={44} color="#037a4e" />
        </View>
      )}
    </View>
  );
}

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const roomsY = useRef(0);
  const [quantities, setQuantities] = useState<RoomQuantities>({});
  // Dates default to the hotel's availability window (derived below), until the
  // guest picks their own — tracked by `datesTouched` so we don't need an effect.
  const [pickedCheckIn, setPickedCheckIn] = useState<string | null>(null);
  const [pickedCheckOut, setPickedCheckOut] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMode>('property');

  const { data: hotel, isLoading, isError } = useHotel(id);
  const { data: rooms = [] } = useHotelRooms(id);
  const { data: reviews = [] } = useHotelReviews(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !hotel) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-muted">
          Couldn&apos;t load this hotel. Pull back and try again.
        </Text>
      </View>
    );
  }

  const currency = hotel.price.currency;
  const chosen = selectedRooms(rooms, quantities);
  const roomCount = totalRoomCount(quantities);
  const subtotal = nightlySubtotal(rooms, quantities);
  const availability = parseAvailabilityRange(hotel.availabilityDates);
  // Effective stay dates: the guest's pick, else the availability start / today.
  const checkIn = pickedCheckIn ?? availability?.start ?? toISODate(new Date());
  const checkOut = pickedCheckOut ?? addDays(checkIn, 1);
  const nights = nightsBetween(checkIn, checkOut);
  const stayTotal = subtotal * Math.max(nights, 1);

  const setRoomQuantity = (roomId: string, quantity: number) =>
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[roomId];
      else next[roomId] = quantity;
      return next;
    });

  // Reserve carries the current room selection + stay + payment choice to the
  // booking screen so it opens pre-filled. Without an explicit selection (e.g. a
  // hotel with no bookable rooms), fall back to a single room so the flow can start.
  const reserve = (roomId?: string) =>
    router.push({
      pathname: '/hotels/book',
      params: {
        id: hotel.id,
        roomId: roomId ?? '',
        selection: encodeSelection(quantities),
        checkIn,
        checkOut,
        payment,
      },
    });

  const scrollToRooms = () =>
    scrollRef.current?.scrollTo({ y: Math.max(roomsY.current - 60, 0), animated: true });

  const cheapestRoom = rooms.length
    ? rooms.reduce((min, r) => (r.pricePerNight < min.pricePerNight ? r : min), rooms[0])
    : undefined;

  return (
    <View className="flex-1 bg-white">
      <ScrollView ref={scrollRef} contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Warm hero band with the property avatar + floating buttons */}
        <View>
          <SunCTA className="h-64 items-center justify-center gap-3 px-6 pb-8">
            <HeroImage uri={hotel.images[0]?.url} />
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
              <Ionicons name="checkmark-circle" size={13} color="#ffffff" />
              <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">
                {hotel.propertyType ?? 'Verified Stay'}
              </Text>
            </View>
          </SunCTA>
          <PressableScale
            onPress={() => router.back()}
            activeScale={0.9}
            className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </PressableScale>
          <View className="absolute right-4 top-12">
            <WishlistButton
              chip
              item={{
                id: hotel.id,
                category: 'hotels',
                title: hotel.title,
                imageUrl: hotel.images[0]?.url,
                subtitle: hotel.location?.city ?? hotel.location?.address,
                price: hotel.price.amount,
                currency: hotel.price.currency,
              }}
            />
          </View>
        </View>

        {/* Content sheet — overlaps the gallery with a rounded top */}
        <View className="-mt-6 gap-4 rounded-t-[28px] bg-white p-5 pt-6">
          {/* Title + rating */}
          <View className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display-x text-2xl leading-8 text-ink">{hotel.title}</Text>
              {hotel.directBooking ? <Badge label="0% commission" tone="success" /> : null}
            </View>
            <View className="flex-row flex-wrap items-center gap-x-2">
              {hotel.rating != null ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#f5a623" />
                  <Text className="text-sm font-semibold text-ink">{formatRating(hotel.rating)}</Text>
                  <Text className="text-sm text-muted">({reviews.length} reviews)</Text>
                </View>
              ) : null}
              {hotel.propertyType ? (
                <Text className="text-sm text-muted">· {hotel.propertyType}</Text>
              ) : null}
            </View>
            {hotel.location?.address ? (
              <View className="mt-1 flex-row items-start gap-1">
                <Ionicons name="location-outline" size={15} color="#9aa7ac" />
                <Text className="flex-1 text-sm text-muted">{hotel.location.address}</Text>
              </View>
            ) : null}
          </View>

          {/* Highlight badges */}
          <View className="flex-row flex-wrap gap-2">
            {hotel.breakfastIncluded ? <Badge label="Breakfast included" tone="success" /> : null}
            {hotel.freeCancellation ? <Badge label="Free cancellation" tone="brand" /> : null}
            {hotel.paymentType ? <Badge label={hotel.paymentType} tone="neutral" /> : null}
            {!hotel.isAvailable ? <Badge label="Currently unavailable" tone="neutral" /> : null}
          </View>

          {/* Price */}
          <View className="flex-row items-baseline gap-2">
            <Text className="font-display-x text-2xl text-brand-600">{formatMoney(hotel.price)}</Text>
            <Text className="text-sm text-muted-foreground">/ night</Text>
            {hotel.originalPrice ? (
              <Text className="text-sm text-muted-foreground line-through">
                {formatMoney(hotel.originalPrice)}
              </Text>
            ) : null}
            {hotel.discountPercent ? (
              <Text className="text-sm font-semibold text-danger">Save {hotel.discountPercent}%</Text>
            ) : null}
          </View>

          {/* Amenities */}
          {hotel.amenities.length > 0 ? (
            <View className="gap-2">
              <SectionTitle>Amenities</SectionTitle>
              <AmenityGrid amenities={hotel.amenities} />
            </View>
          ) : null}

          {/* Nearby attractions */}
          {hotel.nearbyAttractions.length > 0 ? (
            <View className="gap-2">
              <SectionTitle>Nearby</SectionTitle>
              <View className="flex-row flex-wrap gap-2">
                {hotel.nearbyAttractions.map((a) => (
                  <View
                    key={a}
                    className="flex-row items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5"
                  >
                    <Ionicons name="pin-outline" size={13} color="#00a165" />
                    <Text className="text-xs font-medium text-brand-700">{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Rooms */}
          <View
            className="gap-3"
            onLayout={(e) => {
              roomsY.current = e.nativeEvent.layout.y;
            }}
          >
            <SectionTitle>Choose your room</SectionTitle>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  currency={currency}
                  quantity={quantities[room.id] ?? 0}
                  onQuantityChange={(q) => setRoomQuantity(room.id, q)}
                />
              ))
            ) : (
              <Text className="text-sm text-muted">
                No individual rooms listed — you can still request to book below.
              </Text>
            )}
          </View>

          {/* Reservation summary — appears once a room is selected, mirroring the website. */}
          {chosen.length > 0 ? (
            <View className="gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-900/40">
              <View className="flex-row items-center gap-2">
                <Ionicons name="cart-outline" size={18} color="#037a4e" />
                <Text className="font-display text-base text-ink">Your selection</Text>
              </View>

              <View className="gap-2">
                {chosen.map(({ room, quantity }) => (
                  <View key={room.id} className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-sm text-ink">
                      {quantity} × {room.roomType}
                    </Text>
                    <Text className="text-sm font-semibold text-ink">
                      {formatMoney({ amount: room.pricePerNight * quantity, currency })}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="h-px bg-brand-100 dark:bg-brand-900" />

              {/* Dates */}
              <View className="gap-1.5">
                <Text className="text-sm font-body-semibold text-ink">Your stay</Text>
                <View className="flex-row gap-3">
                  <DateField
                    label="Check-in"
                    value={checkIn}
                    min={availability ? new Date(availability.start) : new Date()}
                    onChange={(iso) => {
                      setPickedCheckIn(iso);
                      if (nightsBetween(iso, checkOut) <= 0) setPickedCheckOut(addDays(iso, 1));
                    }}
                  />
                  <DateField
                    label="Check-out"
                    value={checkOut}
                    min={new Date(addDays(checkIn, 1))}
                    onChange={setPickedCheckOut}
                  />
                </View>
                <Text className="text-xs text-muted-foreground">
                  {nights} night{nights === 1 ? '' : 's'} · {formatDate(checkIn)} → {formatDate(checkOut)}
                  {availability
                    ? `  ·  Available ${formatDate(availability.start)} – ${formatDate(availability.end)}`
                    : ''}
                </Text>
              </View>

              <View className="h-px bg-brand-100 dark:bg-brand-900" />

              {/* Payment method */}
              <View className="gap-2">
                <Text className="text-sm font-body-semibold text-ink">Payment method</Text>
                <View className="flex-row gap-3">
                  <PaymentOption
                    active={payment === 'online'}
                    icon="card-outline"
                    title="Pay Online"
                    subtitle="Instant confirmation."
                    onPress={() => setPayment('online')}
                  />
                  <PaymentOption
                    active={payment === 'property'}
                    icon="business-outline"
                    title="Pay at Property"
                    subtitle="Pay on arrival."
                    onPress={() => setPayment('property')}
                  />
                </View>
              </View>

              <View className="h-px bg-brand-100 dark:bg-brand-900" />

              {/* Total */}
              <View className="flex-row items-baseline justify-between">
                <Text className="text-base font-bold text-ink">
                  Total{' '}
                  <Text className="text-xs font-normal text-muted-foreground">
                    ({roomCount} room{roomCount === 1 ? '' : 's'} · {nights} night{nights === 1 ? '' : 's'})
                  </Text>
                </Text>
                <Text className="font-display-x text-xl text-brand-600">
                  {formatMoney({ amount: stayTotal, currency })}
                </Text>
              </View>

              {/* Continue CTA — solid blue, centered white label. Background is set
                  via inline style (not a `bg-*` class) so it renders reliably on the
                  reanimated/NativeWind pressable. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue to book"
                onPress={() => reserve()}
                style={{ backgroundColor: '#037a4e' }}
                className="w-full flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-90"
              >
                <Text className="text-center font-body-semibold text-base text-white">
                  Continue to book
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </Pressable>
            </View>
          ) : null}

          {/* Reviews */}
          <ReviewsSection hotelId={hotel.id} reviews={reviews} />

          {hotel.phone ? (
            <Pressable
              className="flex-row items-center justify-center gap-2 py-2"
              onPress={() => Linking.openURL(`tel:${hotel.phone}`)}
            >
              <Ionicons name="call-outline" size={16} color="#00a165" />
              <Text className="text-sm font-semibold text-brand-600">Call the property</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky booking bar — reflects the live room selection. */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-hairline bg-white px-5 pb-8 pt-3">
        <View>
          <Text className="font-display-x text-xl text-brand-600">
            {formatMoney({
              amount: roomCount > 0 ? stayTotal : cheapestRoom?.pricePerNight ?? hotel.price.amount,
              currency,
            })}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {roomCount > 0
              ? `${roomCount} room${roomCount === 1 ? '' : 's'} · ${nights} night${nights === 1 ? '' : 's'}`
              : rooms.length > 0
                ? 'from / night'
                : '/ night'}
          </Text>
        </View>
        {hotel.externalBookingUrl ? (
          <Button label="Book on partner site" onPress={() => Linking.openURL(hotel.externalBookingUrl!)} />
        ) : roomCount > 0 ? (
          <Button label="Continue" icon="arrow-forward" onPress={() => reserve()} />
        ) : rooms.length > 0 ? (
          <Button label="Select room" onPress={scrollToRooms} />
        ) : hotel.phone ? (
          <Button label="Call to book" onPress={() => Linking.openURL(`tel:${hotel.phone}`)} />
        ) : (
          <Button label="Request to book" onPress={() => reserve()} />
        )}
      </View>
    </View>
  );
}
