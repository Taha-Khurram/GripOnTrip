import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { IMAGE_REQUEST_HEADERS } from '@/api/media';
import { Badge, DeepPanel, DetailSkeleton, OceanHero, PressableScale } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import { useRequireAuth } from '@/features/auth';
import { useTour } from '@/features/tours';
import type { TourPackage } from '@/features/tours';
import { formatMoney, formatRating } from '@/utils/format';

/**
 * Operator logo as a circular avatar on the branded hero band. Operator logos
 * are small square images (often Instagram profile pics), so they read far
 * better as an avatar than stretched full-bleed. Falls back to a branded icon
 * when the logo is missing or fails to load.
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
          <Ionicons name="business" size={44} color="#00a165" />
        </View>
      )}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

/** A single spec stat tile (packages / nights / cities). */
function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl bg-brand-50 py-3">
      <Ionicons name={icon} size={20} color="#037a4e" />
      <Text className="text-sm font-body-semibold text-brand-700">{label}</Text>
    </View>
  );
}

/** A labelled info row inside the "Trip details" card (icon · label · value). */
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
        <Ionicons name={icon} size={18} color="#037a4e" />
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

/** One spec pill inside the dark package card (nights, food plan, etc.). */
function PackageSpec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="w-1/2 flex-row items-center gap-2 py-1.5">
      <Ionicons name={icon} size={15} color="rgba(255,255,255,0.6)" />
      <Text className="flex-1 text-sm font-body-medium text-white" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Dark, featured package tile (mirrors the website's "Packages Offered" card).
 * DETAILS expands the itinerary/inclusions inline; BOOK NOW opens the package
 * booking flow.
 */
function PackageCard({
  pkg,
  index,
  onBook,
}: {
  pkg: TourPackage;
  index: number;
  onBook: (pkg: TourPackage) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    pkg.itinerary.length > 0 ||
    Boolean(pkg.priceIncludes) ||
    Boolean(pkg.attractionPlaces) ||
    Boolean(pkg.equipmentRequired) ||
    Boolean(pkg.description);

  return (
    <DeepPanel className="rounded-3xl shadow-card">
      <View className="gap-4 p-5">
        {/* Badge row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1">
            <Ionicons name="bus-outline" size={13} color="#ffffff" />
            <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">Tour</Text>
          </View>
          <Text className="text-xs font-body-semibold text-white/40">
            #{String(index + 1).padStart(2, '0')}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-display text-white">{pkg.name}</Text>

        {/* Price */}
        <View className="gap-0.5">
          <Text className="text-[11px] font-body-semibold uppercase tracking-wider text-white/50">
            Per person
          </Text>
          <Text className="text-3xl font-display-x text-white">
            {formatMoney({ amount: pkg.amount, currency: 'PKR' })}
          </Text>
        </View>

        <View className="h-px bg-white/15" />

        {/* Spec grid */}
        <View className="flex-row flex-wrap">
          {pkg.nights != null ? (
            <PackageSpec icon="moon-outline" label={`${pkg.nights} Night${pkg.nights === 1 ? '' : 's'}`} />
          ) : null}
          {pkg.foodPlan ? <PackageSpec icon="restaurant-outline" label={pkg.foodPlan} /> : null}
          {pkg.hotelRating != null ? (
            <PackageSpec icon="star-outline" label={`${pkg.hotelRating}★ Hotels`} />
          ) : null}
          {pkg.equipmentRequired ? (
            <PackageSpec icon="construct-outline" label={pkg.equipmentRequired} />
          ) : null}
        </View>

        {/* Expandable details */}
        {expanded && hasDetails ? (
          <View className="gap-4 rounded-2xl bg-white/10 p-4">
            {pkg.description ? (
              <Text className="text-sm leading-6 text-white/85">{pkg.description}</Text>
            ) : null}

            {pkg.attractionPlaces ? (
              <View className="gap-1">
                <Text className="text-xs font-body-semibold uppercase tracking-wide text-white/50">
                  Attractions
                </Text>
                <Text className="text-sm leading-5 text-white/85">{pkg.attractionPlaces}</Text>
              </View>
            ) : null}

            {pkg.itinerary.length > 0 ? (
              <View className="gap-2">
                <Text className="text-xs font-body-semibold uppercase tracking-wide text-white/50">
                  Itinerary
                </Text>
                {pkg.itinerary.map((day) => (
                  <View key={day.day} className="flex-row gap-3">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-white/15">
                      <Text className="text-xs font-bold text-white">{day.day}</Text>
                    </View>
                    <Text className="flex-1 text-sm leading-6 text-white/85">{day.activity}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {pkg.priceIncludes ? (
              <View className="gap-1">
                <Text className="text-xs font-body-semibold uppercase tracking-wide text-white/50">
                  Includes
                </Text>
                <Text className="text-sm leading-5 text-white/85">{pkg.priceIncludes}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Actions */}
        <View className="flex-row gap-3">
          {hasDetails ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={expanded ? 'Hide package details' : 'Show package details'}
              onPress={() => setExpanded((v) => !v)}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-white/95 py-3.5"
            >
              <Text className="text-base font-body-semibold text-brand-800">Details</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#0f4c54" />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Book ${pkg.name}`}
            onPress={() => onBook(pkg)}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-accent-500 py-3.5"
          >
            <Text className="text-base font-body-semibold text-white">Book Now</Text>
          </Pressable>
        </View>
      </View>
    </DeepPanel>
  );
}

/**
 * Tour operator detail page. Adopts the BNB detail layout — a full-bleed gallery
 * with a floating back button, a white content sheet that overlaps with a
 * rounded top, spec tiles, and a sticky bottom CTA — while keeping the
 * tour-specific "Packages Offered" cards and the custom-quote flow.
 */
export default function TourDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: tour, isLoading, isError } = useTour(id);
  const { requireAuth } = useRequireAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !tour) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this tour operator. Pull back and try again.
        </Text>
      </View>
    );
  }

  const fromPrice = tour.startingPrice ?? tour.price.amount ?? 0;
  const packageCount = tour.packages.length;
  const nights = tour.packages
    .map((p) => p.nights)
    .filter((n): n is number => n != null && n > 0);
  const minNights = nights.length > 0 ? Math.min(...nights) : undefined;

  const contactUrl =
    tour.whatsapp ?? tour.websiteUrl ?? (tour.phoneNumber ? `tel:${tour.phoneNumber}` : undefined);

  const requestQuote = () =>
    requireAuth(() => router.push({ pathname: '/tours/enquiry', params: { id: tour.id } }));

  const bookPackage = (pkg: TourPackage) =>
    requireAuth(() =>
      router.push({ pathname: '/tours/book', params: { id: tour.id, packageId: pkg.id } }),
    );

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Branded hero band with the operator logo + floating buttons */}
        <View>
          <OceanHero className="h-64 items-center justify-center gap-3 px-6 pb-8">
            <OperatorLogo uri={tour.images[0]?.url} />
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
              <Ionicons name="checkmark-circle" size={13} color="#ffffff" />
              <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">
                Verified Operator
              </Text>
            </View>
          </OceanHero>
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
                id: tour.id,
                category: 'tours',
                title: tour.title,
                imageUrl: tour.images[0]?.url,
                subtitle: tour.operatingCities[0],
                price: fromPrice,
                currency: 'PKR',
              }}
            />
          </View>
        </View>

        {/* Content sheet — overlaps the gallery with a rounded top */}
        <View className="-mt-6 gap-5 rounded-t-[28px] bg-white p-5 pt-6">
          {/* Title + meta */}
          <View className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display-x text-2xl leading-8 text-ink">{tour.title}</Text>
              {tour.flag ? <Badge label={tour.flag} tone="accent" /> : null}
            </View>
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
              {tour.rating != null ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#f5a623" />
                  <Text className="text-sm font-semibold text-ink">{formatRating(tour.rating)}</Text>
                </View>
              ) : null}
              {tour.operatingCities.length > 0 ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted" numberOfLines={1}>
                    {tour.operatingCities.join(' · ')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Price */}
          {fromPrice > 0 ? (
            <View className="flex-row items-baseline gap-2">
              <Text className="text-sm text-muted-foreground">from</Text>
              <Text className="font-display-x text-2xl text-brand-600">
                {formatMoney({ amount: fromPrice, currency: 'PKR' })}
              </Text>
              <Text className="text-sm text-muted-foreground">/ person</Text>
            </View>
          ) : null}

          {/* Specs */}
          {packageCount > 0 || minNights != null || tour.operatingCities.length > 0 ? (
            <View className="flex-row gap-3">
              {packageCount > 0 ? (
                <Spec
                  icon="cube-outline"
                  label={`${packageCount} package${packageCount === 1 ? '' : 's'}`}
                />
              ) : null}
              {minNights != null ? (
                <Spec icon="moon-outline" label={`from ${minNights} night${minNights === 1 ? '' : 's'}`} />
              ) : null}
              {tour.operatingCities.length > 0 ? (
                <Spec
                  icon="location-outline"
                  label={`${tour.operatingCities.length} cit${tour.operatingCities.length === 1 ? 'y' : 'ies'}`}
                />
              ) : null}
            </View>
          ) : null}

          {/* About */}
          {tour.bio ? (
            <View className="gap-2">
              <SectionTitle>About this operator</SectionTitle>
              <Text className="leading-6 text-muted">{tour.bio}</Text>
            </View>
          ) : null}

          {/* Trip details */}
          {tour.departureLocation ||
          tour.returnLocation ||
          tour.priceIncludes ||
          tour.equipmentRequired ? (
            <View className="gap-2">
              <SectionTitle>Trip details</SectionTitle>
              <View className="gap-4 rounded-2xl border border-hairline bg-surface p-4">
                {tour.departureLocation ? (
                  <DetailRow
                    icon="airplane-outline"
                    label="Departs from"
                    value={tour.departureLocation}
                  />
                ) : null}
                {tour.returnLocation ? (
                  <DetailRow icon="flag-outline" label="Returns to" value={tour.returnLocation} />
                ) : null}
                {tour.priceIncludes ? (
                  <DetailRow
                    icon="checkmark-circle-outline"
                    label="Price includes"
                    value={tour.priceIncludes}
                  />
                ) : null}
                {tour.equipmentRequired ? (
                  <DetailRow
                    icon="construct-outline"
                    label="Equipment required"
                    value={tour.equipmentRequired}
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          {contactUrl ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Contact operator"
              onPress={() => Linking.openURL(contactUrl)}
              className="flex-row items-center gap-2"
            >
              <Ionicons name="call-outline" size={16} color="#00a165" />
              <Text className="text-sm font-body-semibold text-brand-600">
                Contact operator directly
              </Text>
            </Pressable>
          ) : null}

          {/* Packages */}
          {packageCount > 0 ? (
            <View className="gap-4">
              <View className="flex-row items-center gap-3">
                <SectionTitle>Packages Offered</SectionTitle>
                <View className="h-px flex-1 bg-hairline" />
              </View>
              {tour.packages.map((pkg, i) => (
                <PackageCard key={pkg.id} pkg={pkg} index={i} onBook={bookPackage} />
              ))}
            </View>
          ) : (
            <View className="gap-2">
              <SectionTitle>Packages Offered</SectionTitle>
              <Text className="text-sm text-muted">
                This operator hasn&apos;t published any packages yet. Request a custom quote below.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky quote bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-hairline bg-white px-5 pb-8 pt-3">
        {fromPrice > 0 ? (
          <View>
            <Text className="font-display-x text-xl text-brand-600">
              {formatMoney({ amount: fromPrice, currency: 'PKR' })}
            </Text>
            <Text className="text-xs text-muted-foreground">from / person</Text>
          </View>
        ) : (
          <View>
            <Text className="font-body-semibold text-base text-ink">Custom quote</Text>
            <Text className="text-xs text-muted-foreground">Replies within 24 hrs</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Request a custom quote"
          onPress={requestQuote}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-4"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#ffffff" />
          <Text className="font-body-semibold text-base text-white">Request Custom Quote</Text>
        </Pressable>
      </View>
    </View>
  );
}
