import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, Button, DetailSkeleton, Gallery, Input, Stepper } from '@/components/ui';
import { useRequireAuth } from '@/features/auth';
import { useSubmitUmrahBooking, useUmrahPackage } from '@/features/umrah';
import { useAuthStore } from '@/store/auth.store';
import { formatMoney, formatRating } from '@/utils/format';

function SectionTitle({ children }: { children: string }) {
  return <Text className="text-lg font-display text-ink">{children}</Text>;
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
    <View className="flex-1 gap-1 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
      <View className="flex-row items-center gap-2">
        <Ionicons name="business-outline" size={16} color="#059669" />
        <Text className="text-sm font-bold text-ink">{city}</Text>
      </View>
      <Text className="text-sm text-muted">{hotel}</Text>
      <Text className="text-xs text-muted">{dist}</Text>
      <Text className="mt-1 text-xs font-semibold text-emerald-600">
        {nights} night{nights === 1 ? '' : 's'}
      </Text>
    </View>
  );
}

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 py-1.5">
      <Ionicons name={icon} size={18} color="#059669" />
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="flex-1 text-right text-sm font-medium text-ink">{value}</Text>
    </View>
  );
}

export default function UmrahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pkg, isLoading, isError } = useUmrahPackage(id);
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useSubmitUmrahBooking();

  const scrollRef = useRef<ScrollView>(null);
  const formY = useRef(0);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [pilgrims, setPilgrims] = useState(1);
  const [departureCity, setDepartureCity] = useState('');
  const [travelPeriod, setTravelPeriod] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Umrah Package' }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !pkg) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Stack.Screen options={{ title: 'Umrah Package' }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this Umrah package. Pull back and try again.
        </Text>
      </View>
    );
  }

  const totalNights = pkg.makkahNights + pkg.madinahNights;
  const totalPrice = pkg.pricePerPerson * pilgrims;
  const contactUrl =
    pkg.whatsapp ?? pkg.websiteUrl ?? (pkg.contactPhone ? `tel:${pkg.contactPhone}` : undefined);

  const openForm = () => {
    setDepartureCity((c) => c || pkg.departureLocation || '');
    requireAuth(() => {
      setOpen(true);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ y: Math.max(formY.current - 40, 0), animated: true }),
      );
    });
  };

  const canSubmit =
    name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 6;

  const submit = async () => {
    setError(null);
    try {
      const { bookingId } = await mutateAsync({
        agencyId: pkg.agencyId,
        agencyName: pkg.agencyName,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        packageName: pkg.packageName,
        pilgrims,
        departureCity: departureCity.trim(),
        travelPeriod: travelPeriod.trim() || 'To be confirmed',
        packageAmount: totalPrice,
      });
      setBookingRef(bookingId);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your enquiry.');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: pkg.title }} />
      <ScrollView ref={scrollRef} contentContainerClassName="pb-32">
        <Gallery images={pkg.images.map((i) => i.url)} />

        <View className="gap-4 p-5">
          {/* Title + rating */}
          <View className="gap-1">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-2xl font-display text-ink">{pkg.title}</Text>
              <Badge label={pkg.tag} tone="success" />
            </View>
            <Text className="text-base text-muted">{pkg.packageName}</Text>
            <View className="mt-1 flex-row flex-wrap items-center gap-x-2">
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={14} color="#f39024" />
                <Text className="text-sm font-semibold text-ink">
                  {formatRating(pkg.rating)}
                </Text>
                <Text className="text-sm text-muted">({pkg.reviewCount} reviews)</Text>
              </View>
              {totalNights > 0 ? (
                <Text className="text-sm text-muted">· {totalNights} nights total</Text>
              ) : null}
            </View>
            {pkg.departureLocation ? (
              <View className="mt-1 flex-row items-center gap-1">
                <Ionicons name="airplane-outline" size={15} color="#9aa7ac" />
                <Text className="text-sm text-muted">Departs from {pkg.departureLocation}</Text>
              </View>
            ) : null}
          </View>

          {/* Highlight badges */}
          <View className="flex-row flex-wrap gap-2">
            {pkg.visaIncluded ? <Badge label="Visa included" tone="success" /> : null}
            <Badge label={pkg.meals} tone="brand" />
            {pkg.isCouplePackage ? <Badge label="Couple package" tone="accent" /> : null}
            <Badge label="Ziyarat included" tone="neutral" />
          </View>

          {/* Price */}
          <View className="flex-row items-baseline gap-2">
            <Text className="text-2xl font-display text-emerald-600">{formatMoney(pkg.price)}</Text>
            <Text className="text-sm text-muted-foreground">/ person</Text>
          </View>

          {/* Stay */}
          <View className="gap-2">
            <SectionTitle>Your stay</SectionTitle>
            <View className="flex-row gap-3">
              <StayCard city="Makkah" hotel={pkg.makkahHotel} dist={pkg.makkahHotelDist} nights={pkg.makkahNights} />
              <StayCard city="Madinah" hotel={pkg.madinahHotel} dist={pkg.madinahHotelDist} nights={pkg.madinahNights} />
            </View>
          </View>

          {/* What's included */}
          <View className="gap-1 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
            <SectionTitle>What&apos;s included</SectionTitle>
            <Row icon="bus-outline" label="Transport" value={pkg.transport} />
            <Row icon="restaurant-outline" label="Meals" value={pkg.meals} />
            <Row icon="document-text-outline" label="Visa" value={pkg.visaIncluded ? 'Included' : 'Not included'} />
            <Row icon="walk-outline" label="Ziyarat" value={pkg.ziyarat ? 'Included' : 'Not included'} />
          </View>

          {/* Description */}
          {pkg.description ? (
            <View className="gap-2">
              <SectionTitle>About this package</SectionTitle>
              <Text className="leading-6 text-muted">{pkg.description}</Text>
            </View>
          ) : null}

          {pkg.priceIncludes ? (
            <View className="gap-1">
              <SectionTitle>Price includes</SectionTitle>
              <Text className="text-sm leading-5 text-muted">{pkg.priceIncludes}</Text>
            </View>
          ) : null}

          {/* Confirmation */}
          {bookingRef ? (
            <View className="gap-1 rounded-2xl bg-green-50 p-4 dark:bg-green-950">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text className="text-sm font-bold text-success">Umrah booking request submitted!</Text>
              </View>
              <Text className="text-sm text-muted">
                Reference <Text className="font-bold">{bookingRef}</Text>. Our Hajj &amp; Umrah
                specialists will review the details and coordinate with you shortly.
              </Text>
            </View>
          ) : null}

          {/* Booking enquiry form */}
          {open && isAuthenticated ? (
            <View
              className="gap-3 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800"
              onLayout={(e) => {
                formY.current = e.nativeEvent.layout.y;
              }}
            >
              <Text className="text-base font-bold text-ink">Umrah booking enquiry</Text>
              <Stepper label="Pilgrims" value={pilgrims} onChange={setPilgrims} min={1} max={20} />
              <Input label="Departure city" value={departureCity} onChangeText={setDepartureCity} placeholder="e.g. Islamabad" />
              <Input label="Travel period" value={travelPeriod} onChangeText={setTravelPeriod} placeholder="e.g. October 2026" />
              <Input label="Full name" value={name} onChangeText={setName} />
              <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
              <Input label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

              <View className="flex-row items-center justify-between rounded-xl bg-surface-sunk px-4 py-3">
                <Text className="text-sm text-muted">
                  {pilgrims} × {formatMoney(pkg.price)}
                </Text>
                <Text className="text-base font-bold text-emerald-600">
                  {formatMoney({ amount: totalPrice, currency: pkg.price.currency })}
                </Text>
              </View>

              {error ? <Text className="text-xs text-danger">{error}</Text> : null}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button label="Cancel" variant="ghost" onPress={() => setOpen(false)} fullWidth />
                </View>
                <View className="flex-1">
                  <Button label="Submit request" loading={isPending} disabled={!canSubmit} onPress={submit} fullWidth />
                </View>
              </View>
            </View>
          ) : null}

          {contactUrl ? (
            <Pressable
              className="flex-row items-center justify-center gap-2 py-2"
              onPress={() => Linking.openURL(contactUrl)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#059669" />
              <Text className="text-sm font-semibold text-emerald-600">Contact the operator</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky booking bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-neutral-100 bg-white px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <View>
          <Text className="text-lg font-display text-emerald-600">{formatMoney(pkg.price)}</Text>
          <Text className="text-xs text-muted-foreground">per person</Text>
        </View>
        <Button label={bookingRef ? 'Book again' : 'Book this package'} onPress={openForm} />
      </View>
    </View>
  );
}
