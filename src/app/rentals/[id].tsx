import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, Button, DetailSkeleton, PressableScale, SunCTA } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import { useRequireAuth } from '@/features/auth';
import { useRental } from '@/features/rentals';
import { AmenityGrid } from '@/utils/amenities';
import { formatMoney, formatRating } from '@/utils/format';

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

/**
 * Property photo as a circular avatar on the warm hero band — mirrors the Umrah
 * package hero. Falls back to a home glyph when there's no image or it fails.
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
          <Ionicons name="home" size={44} color="#156473" />
        </View>
      )}
    </View>
  );
}

/** A single spec stat (bedrooms / bathrooms / guests). */
function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl bg-brand-50 py-3">
      <Ionicons name={icon} size={20} color="#156473" />
      <Text className="text-sm font-body-semibold text-brand-700">{label}</Text>
    </View>
  );
}

/**
 * BNB detail page. Shows the gallery, specs, amenities and description, then a
 * sticky "Book this property" bar that opens the request-to-book flow
 * (`/rentals/book`). External listings link out to the partner site instead.
 */
export default function RentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const { data: rental, isLoading, isError } = useRental(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !rental) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this property. Pull back and try again.
        </Text>
      </View>
    );
  }

  const book = () =>
    requireAuth(() =>
      router.push({ pathname: '/rentals/book', params: { id: rental.id } }),
    );

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Warm hero band with the property avatar + floating buttons */}
        <View>
          <SunCTA className="h-64 items-center justify-center gap-3 px-6 pb-8">
            <HeroImage uri={rental.images[0]?.url} />
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
              <Ionicons name="checkmark-circle" size={13} color="#ffffff" />
              <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">
                Verified Rental
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
                id: rental.id,
                category: 'rentals',
                title: rental.title,
                imageUrl: rental.images[0]?.url,
                subtitle: rental.location?.city,
                price: rental.price.amount,
                currency: rental.price.currency,
              }}
            />
          </View>
        </View>

        {/* Content sheet — overlaps the gallery with a rounded top */}
        <View className="-mt-6 gap-5 rounded-t-[28px] bg-white p-5 pt-6">
          {/* Title + meta */}
          <View className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display-x text-2xl leading-8 text-ink">
                {rental.title}
              </Text>
              <Badge label={rental.propertyType} tone="neutral" />
            </View>
            <View className="flex-row flex-wrap items-center gap-x-2">
              {rental.rating != null ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#f39024" />
                  <Text className="text-sm font-semibold text-ink">
                    {formatRating(rental.rating)}
                  </Text>
                </View>
              ) : null}
              {rental.location?.city ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted">{rental.location.city}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Price */}
          <View className="flex-row items-baseline gap-2">
            <Text className="font-display-x text-2xl text-brand-600">
              {formatMoney(rental.price)}
            </Text>
            <Text className="text-sm text-muted-foreground">/ month</Text>
            {rental.originalPrice ? (
              <Text className="text-sm text-muted-foreground line-through">
                {formatMoney(rental.originalPrice)}
              </Text>
            ) : null}
            {rental.discountPercent ? (
              <Text className="text-sm font-semibold text-danger">
                Save {rental.discountPercent}%
              </Text>
            ) : null}
          </View>

          {/* Specs */}
          {rental.bedrooms != null || rental.bathrooms != null || rental.maxGuests != null ? (
            <View className="flex-row gap-3">
              {rental.bedrooms != null ? (
                <Spec icon="bed-outline" label={`${rental.bedrooms} bed`} />
              ) : null}
              {rental.bathrooms != null ? (
                <Spec icon="water-outline" label={`${rental.bathrooms} bath`} />
              ) : null}
              {rental.maxGuests != null ? (
                <Spec icon="people-outline" label={`${rental.maxGuests} guests`} />
              ) : null}
            </View>
          ) : null}

          {/* Amenities */}
          {rental.amenities.length > 0 ? (
            <View className="gap-2">
              <SectionTitle>Amenities</SectionTitle>
              <AmenityGrid amenities={rental.amenities} />
            </View>
          ) : null}

          {/* Description */}
          {rental.description ? (
            <View className="gap-2">
              <SectionTitle>About this property</SectionTitle>
              <Text className="leading-6 text-muted">{rental.description}</Text>
            </View>
          ) : null}

          {rental.location?.address ? (
            <View className="gap-2">
              <SectionTitle>Location</SectionTitle>
              <View className="flex-row items-start gap-1.5">
                <Ionicons name="location-outline" size={16} color="#9aa7ac" />
                <Text className="flex-1 text-sm text-muted">{rental.location.address}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky booking bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-hairline bg-white px-5 pb-8 pt-3">
        <View>
          <Text className="font-display-x text-xl text-brand-600">
            {formatMoney(rental.price)}
          </Text>
          <Text className="text-xs text-muted-foreground">/ month</Text>
        </View>
        {rental.externalBookingUrl ? (
          <Button
            label="Book on partner site"
            onPress={() => Linking.openURL(rental.externalBookingUrl!)}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Book this property"
            onPress={book}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-4"
          >
            <Ionicons name="calendar-outline" size={18} color="#ffffff" />
            <Text className="font-body-semibold text-base text-white">Book this property</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
