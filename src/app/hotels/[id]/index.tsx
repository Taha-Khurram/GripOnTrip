import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, Button, DetailSkeleton, Gallery, PressableScale } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import { useHotel, useHotelReviews, useHotelRooms, type Room } from '@/features/hotels';
import { RoomCard } from '@/features/hotels/components/RoomCard';
import { ReviewsSection } from '@/features/reviews';
import { AmenityGrid } from '@/utils/amenities';
import { formatMoney, formatRating } from '@/utils/format';

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const roomsY = useRef(0);

  const { data: hotel, isLoading, isError } = useHotel(id);
  const { data: rooms = [] } = useHotelRooms(id);
  const { data: reviews = [] } = useHotelReviews(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !hotel) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this hotel. Pull back and try again.
        </Text>
      </View>
    );
  }

  const openBooking = (room?: Room) =>
    router.push({
      pathname: '/hotels/[id]/book',
      params: { id: hotel.id, roomId: room?.id ?? '' },
    });

  const scrollToRooms = () =>
    scrollRef.current?.scrollTo({ y: Math.max(roomsY.current - 60, 0), animated: true });

  const cheapestRoom = rooms.length
    ? rooms.reduce((min, r) => (r.pricePerNight < min.pricePerNight ? r : min), rooms[0])
    : undefined;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView ref={scrollRef} contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Gallery with floating back button */}
        <View>
          <Gallery images={hotel.images.map((i) => i.url)} />
          <PressableScale
            onPress={() => router.back()}
            activeScale={0.9}
            className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </PressableScale>
        </View>

        {/* Content sheet — overlaps the gallery with a rounded top */}
        <View className="-mt-6 gap-4 rounded-t-[28px] bg-white p-5 pt-6">
          {/* Title + rating */}
          <View className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display-x text-2xl leading-8 text-ink">{hotel.title}</Text>
              <View className="flex-row items-center gap-3">
                <WishlistButton
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
                {hotel.directBooking ? <Badge label="0% commission" tone="success" /> : null}
              </View>
            </View>
            <View className="flex-row flex-wrap items-center gap-x-2">
              {hotel.rating != null ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#f39024" />
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

          {/* Check-in / out */}
          {hotel.checkInTime || hotel.checkOutTime ? (
            <View className="flex-row gap-3">
              {hotel.checkInTime ? (
                <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk/50 p-3.5">
                  <Ionicons name="log-in-outline" size={20} color="#156473" />
                  <View>
                    <Text className="text-xs uppercase tracking-wide text-muted-foreground">Check-in</Text>
                    <Text className="text-sm font-semibold text-ink">{hotel.checkInTime}</Text>
                  </View>
                </View>
              ) : null}
              {hotel.checkOutTime ? (
                <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk/50 p-3.5">
                  <Ionicons name="log-out-outline" size={20} color="#156473" />
                  <View>
                    <Text className="text-xs uppercase tracking-wide text-muted-foreground">Check-out</Text>
                    <Text className="text-sm font-semibold text-ink">{hotel.checkOutTime}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

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
                    <Ionicons name="pin-outline" size={13} color="#1a7a8c" />
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
                <RoomCard key={room.id} room={room} currency={hotel.price.currency} onSelect={openBooking} />
              ))
            ) : (
              <Text className="text-sm text-muted">
                No individual rooms listed — you can still request to book below.
              </Text>
            )}
          </View>

          {/* Bank transfer info */}
          {hotel.bank?.accountNumber ? (
            <View className="gap-1 rounded-2xl border border-hairline bg-surface-sunk/50 p-4">
              <SectionTitle>Bank transfer</SectionTitle>
              {hotel.bank.name ? <Text className="text-sm text-muted">{hotel.bank.name}</Text> : null}
              {hotel.bank.accountTitle ? (
                <Text className="text-sm text-muted">{hotel.bank.accountTitle}</Text>
              ) : null}
              <Text className="text-sm font-semibold text-ink">{hotel.bank.accountNumber}</Text>
            </View>
          ) : null}

          {/* Reviews */}
          <ReviewsSection hotelId={hotel.id} reviews={reviews} />

          {hotel.phone ? (
            <Pressable
              className="flex-row items-center justify-center gap-2 py-2"
              onPress={() => Linking.openURL(`tel:${hotel.phone}`)}
            >
              <Ionicons name="call-outline" size={16} color="#1a7a8c" />
              <Text className="text-sm font-semibold text-brand-600">Call the property</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky booking bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-hairline bg-white px-5 pb-8 pt-3">
        <View>
          <Text className="font-display-x text-xl text-brand-600">
            {formatMoney(
              cheapestRoom
                ? { amount: cheapestRoom.pricePerNight, currency: hotel.price.currency }
                : hotel.price,
            )}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {rooms.length > 0 ? 'from / night' : '/ night'}
          </Text>
        </View>
        {hotel.externalBookingUrl ? (
          <Button label="Book on partner site" onPress={() => Linking.openURL(hotel.externalBookingUrl!)} />
        ) : rooms.length > 0 ? (
          <Button label="Select room" onPress={scrollToRooms} />
        ) : hotel.phone ? (
          <Button label="Call to book" onPress={() => Linking.openURL(`tel:${hotel.phone}`)} />
        ) : (
          <Button label="Request to book" onPress={() => openBooking()} />
        )}
      </View>
    </View>
  );
}
