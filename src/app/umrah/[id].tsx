import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { IMAGE_REQUEST_HEADERS } from '@/api/media';
import { Badge, DetailSkeleton, PressableScale, SunCTA } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import { useRequireAuth } from '@/features/auth';
import { useUmrahPackage } from '@/features/umrah';
import { formatMoney, formatRating } from '@/utils/format';

/**
 * Operator logo as a circular avatar on the warm hero band. Umrah "images" are
 * the agency logo (often an Instagram profile pic) so they read best as an
 * avatar; falls back to a moon glyph when missing or on load failure.
 */
function OperatorLogo({ uri }: { uri?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(uri) && !failed;
  return (
    <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/70 bg-white shadow-card">
      {showImage ? (
        <Image
          source={{ uri, headers: IMAGE_REQUEST_HEADERS }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-brand-50">
          <Ionicons name="moon" size={44} color="#156473" />
        </View>
      )}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

/** A single spec stat tile (nights / stay / transport). */
function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl bg-brand-50 py-3">
      <Ionicons name={icon} size={20} color="#156473" />
      <Text className="text-sm font-body-semibold text-brand-700">{label}</Text>
    </View>
  );
}

/** One city stay block (Makkah / Madinah). */
function StayCard({
  city,
  hotel,
  dist,
  nights,
}: {
  city: string;
  hotel: string;
  dist: string;
  nights: number;
}) {
  return (
    <View className="flex-1 gap-1 rounded-2xl border border-hairline bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name="business-outline" size={16} color="#156473" />
        <Text className="text-sm font-body-semibold text-ink">{city}</Text>
      </View>
      <Text className="text-sm text-muted">{hotel}</Text>
      <Text className="text-xs text-muted-foreground">{dist}</Text>
      <Text className="mt-1 text-xs font-body-semibold text-brand-700">
        {nights} night{nights === 1 ? '' : 's'}
      </Text>
    </View>
  );
}

/** A labelled info row inside the "What's included" card (icon · label · value). */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
        <Ionicons name={icon} size={18} color="#156473" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[11px] font-body-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </Text>
        <Text className="text-sm leading-5 text-ink">{value}</Text>
      </View>
    </View>
  );
}

export default function UmrahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: pkg, isLoading, isError } = useUmrahPackage(id);
  const { requireAuth } = useRequireAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !pkg) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this Umrah package. Pull back and try again.
        </Text>
      </View>
    );
  }

  const totalNights = pkg.makkahNights + pkg.madinahNights;
  const location =
    pkg.operatingCities.length > 0 ? pkg.operatingCities.join(' · ') : pkg.departureLocation;
  const contactUrl =
    pkg.whatsapp ?? pkg.websiteUrl ?? (pkg.contactPhone ? `tel:${pkg.contactPhone}` : undefined);

  const book = () =>
    requireAuth(() => router.push({ pathname: '/umrah/book', params: { id: pkg.id } }));

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Warm hero band with the operator avatar + floating buttons */}
        <View>
          <SunCTA className="h-64 items-center justify-center gap-3 px-6 pb-8">
            <OperatorLogo uri={pkg.images[0]?.url} />
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
              <Ionicons name="checkmark-circle" size={13} color="#ffffff" />
              <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">
                Verified Umrah Operator
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
                id: pkg.id,
                category: 'umrah',
                title: pkg.title,
                imageUrl: pkg.images[0]?.url,
                subtitle: pkg.packageName,
                price: pkg.pricePerPerson,
                currency: pkg.price.currency,
              }}
            />
          </View>
        </View>

        {/* Content sheet — overlaps the hero with a rounded top */}
        <View className="-mt-6 gap-5 rounded-t-[28px] bg-white p-5 pt-6">
          {/* Title + meta */}
          <View className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display-x text-2xl leading-8 text-ink">{pkg.title}</Text>
              <Badge label={pkg.tag} tone="accent" />
            </View>
            <Text className="text-base text-muted">{pkg.packageName}</Text>
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={14} color="#f39024" />
                <Text className="text-sm font-semibold text-ink">{formatRating(pkg.rating)}</Text>
                <Text className="text-sm text-muted">({pkg.reviewCount} reviews)</Text>
              </View>
              {location ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted" numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Price */}
          <View className="flex-row items-baseline gap-2">
            <Text className="font-display-x text-2xl text-brand-600">{formatMoney(pkg.price)}</Text>
            <Text className="text-sm text-muted-foreground">/ person</Text>
          </View>

          {/* Specs */}
          <View className="flex-row gap-3">
            {totalNights > 0 ? <Spec icon="moon-outline" label={`${totalNights} nights`} /> : null}
            {pkg.visaIncluded ? <Spec icon="document-text-outline" label="Visa incl." /> : null}
            <Spec icon="walk-outline" label="Ziyarat" />
          </View>

          {/* Highlight badges */}
          <View className="flex-row flex-wrap gap-2">
            {pkg.visaIncluded ? <Badge label="Visa included" tone="success" /> : null}
            <Badge label={pkg.meals} tone="brand" />
            {pkg.isCouplePackage ? <Badge label="Couple package" tone="accent" /> : null}
            <Badge label="Ziyarat included" tone="neutral" />
          </View>

          {/* Stay */}
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <SectionTitle>Your stay</SectionTitle>
              <View className="h-px flex-1 bg-hairline" />
            </View>
            <View className="flex-row gap-3">
              <StayCard
                city="Makkah"
                hotel={pkg.makkahHotel}
                dist={pkg.makkahHotelDist}
                nights={pkg.makkahNights}
              />
              <StayCard
                city="Madinah"
                hotel={pkg.madinahHotel}
                dist={pkg.madinahHotelDist}
                nights={pkg.madinahNights}
              />
            </View>
          </View>

          {/* What's included */}
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <SectionTitle>What&apos;s included</SectionTitle>
              <View className="h-px flex-1 bg-hairline" />
            </View>
            <View className="gap-4 rounded-2xl border border-hairline bg-surface p-4">
              <DetailRow icon="bus-outline" label="Transport" value={pkg.transport} />
              <DetailRow icon="restaurant-outline" label="Meals" value={pkg.meals} />
              <DetailRow
                icon="document-text-outline"
                label="Visa"
                value={pkg.visaIncluded ? 'Included' : 'Not included'}
              />
              <DetailRow
                icon="walk-outline"
                label="Ziyarat"
                value={pkg.ziyarat ? 'Included' : 'Not included'}
              />
            </View>
          </View>

          {/* Description */}
          {pkg.description ? (
            <View className="gap-2">
              <View className="flex-row items-center gap-3">
                <SectionTitle>About this package</SectionTitle>
                <View className="h-px flex-1 bg-hairline" />
              </View>
              <Text className="leading-6 text-muted">{pkg.description}</Text>
            </View>
          ) : null}

          {pkg.priceIncludes ? (
            <View className="gap-1">
              <SectionTitle>Price includes</SectionTitle>
              <Text className="text-sm leading-5 text-muted">{pkg.priceIncludes}</Text>
            </View>
          ) : null}

          {contactUrl ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Contact operator"
              onPress={() => Linking.openURL(contactUrl)}
              className="flex-row items-center gap-2"
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#156473" />
              <Text className="text-sm font-body-semibold text-brand-700">
                Contact the operator directly
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky booking bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-hairline bg-white px-5 pb-8 pt-3">
        <View>
          <Text className="font-display-x text-xl text-brand-600">{formatMoney(pkg.price)}</Text>
          <Text className="text-xs text-muted-foreground">per person</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Book this package"
          onPress={book}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-4 shadow-glow"
        >
          <Ionicons name="moon-outline" size={18} color="#ffffff" />
          <Text className="font-body-semibold text-base text-white">Book this package</Text>
        </Pressable>
      </View>
    </View>
  );
}
