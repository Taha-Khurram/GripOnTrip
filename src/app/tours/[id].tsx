import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, Text, TextInput, View } from 'react-native';

import { Badge, Button, Card, DetailSkeleton, Input } from '@/components/ui';
import { useRequireAuth } from '@/features/auth';
import { useCreateAgencyBooking } from '@/features/bookings';
import { useTour } from '@/features/tours';
import type { TourPackage } from '@/features/tours';
import { useAuthStore } from '@/store/auth.store';
import { formatMoney } from '@/utils/format';

function PackageCard({ pkg, onBook }: { pkg: TourPackage; onBook: (pkg: TourPackage) => void }) {
  return (
    <Card className="gap-3 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-lg font-bold text-neutral-900 dark:text-white">{pkg.name}</Text>
        <Text className="text-base font-bold text-brand-600">
          {formatMoney({ amount: pkg.amount, currency: 'PKR' })}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {pkg.nights != null ? (
          <Badge label={`${pkg.nights} night${pkg.nights === 1 ? '' : 's'}`} tone="brand" />
        ) : null}
        {pkg.hotelRating != null ? <Badge label={`${pkg.hotelRating}★ hotels`} tone="neutral" /> : null}
        {pkg.foodPlan ? <Badge label={pkg.foodPlan} tone="neutral" /> : null}
      </View>

      {pkg.description ? (
        <Text className="leading-6 text-neutral-700 dark:text-neutral-300">{pkg.description}</Text>
      ) : null}

      {pkg.attractionPlaces ? (
        <View className="flex-row items-start gap-2">
          <Ionicons name="location-outline" size={16} color="#219ebc" />
          <Text className="flex-1 text-sm text-neutral-600 dark:text-neutral-400">{pkg.attractionPlaces}</Text>
        </View>
      ) : null}

      {pkg.itinerary.length > 0 ? (
        <View className="gap-2">
          <Text className="text-sm font-semibold text-neutral-900 dark:text-white">Itinerary</Text>
          {pkg.itinerary.map((day) => (
            <View key={day.day} className="flex-row gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-50">
                <Text className="text-xs font-bold text-brand-600">{day.day}</Text>
              </View>
              <Text className="flex-1 text-sm leading-5 text-neutral-700 dark:text-neutral-300">{day.activity}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {pkg.priceIncludes ? (
        <View className="gap-1">
          <Text className="text-sm font-semibold text-neutral-900 dark:text-white">Includes</Text>
          <Text className="text-sm leading-5 text-neutral-600 dark:text-neutral-400">{pkg.priceIncludes}</Text>
        </View>
      ) : null}

      <Button label="Book this package" onPress={() => onBook(pkg)} fullWidth />
    </Card>
  );
}

export default function TourDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tour, isLoading, isError } = useTour(id);
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useCreateAgencyBooking();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-black">
        <Stack.Screen options={{ title: 'Tour' }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !tour) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
        <Text className="text-center text-neutral-500">
          Couldn&apos;t load this tour operator. Pull back and try again.
        </Text>
      </View>
    );
  }

  const image = tour.images[0]?.url;
  const contactUrl =
    tour.whatsapp ?? tour.websiteUrl ?? (tour.phoneNumber ? `tel:${tour.phoneNumber}` : undefined);

  const startBooking = (pkg?: TourPackage) => {
    setMessage(pkg ? `I'm interested in the "${pkg.name}" package.` : '');
    requireAuth(() => setOpen(true));
  };

  const submit = async () => {
    setError(null);
    try {
      await mutateAsync({
        agencyId: tour.id,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        message: message.trim() || `Booking enquiry for ${tour.title}`,
      });
      setDone(true);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send your enquiry.');
    }
  };

  const canSubmit = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 6;

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black" contentContainerClassName="pb-8">
      <Stack.Screen options={{ title: tour.title }} />

      {image ? (
        <Image source={{ uri: image }} style={{ width: '100%', height: 220 }} contentFit="cover" />
      ) : (
        <View className="h-52 w-full items-center justify-center bg-brand-50">
          <Ionicons name="map-outline" size={56} color="#219ebc" />
        </View>
      )}

      <View className="gap-3 p-5">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-2xl font-bold text-neutral-900 dark:text-white">{tour.title}</Text>
          {tour.flag ? <Badge label={tour.flag} tone="accent" /> : null}
        </View>

        {tour.operatingCities.length > 0 ? (
          <View className="flex-row items-start gap-2">
            <Ionicons name="navigate-outline" size={16} color="#9ca3af" />
            <Text className="flex-1 text-neutral-500">{tour.operatingCities.join(' · ')}</Text>
          </View>
        ) : null}

        {tour.bio ? <Text className="leading-6 text-neutral-700 dark:text-neutral-300">{tour.bio}</Text> : null}

        {tour.departureLocation || tour.returnLocation ? (
          <View className="flex-row gap-8">
            {tour.departureLocation ? (
              <View className="gap-0.5">
                <Text className="text-xs uppercase text-neutral-400">Departs</Text>
                <Text className="text-sm text-neutral-700 dark:text-neutral-300">{tour.departureLocation}</Text>
              </View>
            ) : null}
            {tour.returnLocation ? (
              <View className="gap-0.5">
                <Text className="text-xs uppercase text-neutral-400">Returns</Text>
                <Text className="text-sm text-neutral-700 dark:text-neutral-300">{tour.returnLocation}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {tour.startingPrice ? (
          <Text className="text-xl font-bold text-brand-600">
            <Text className="text-sm font-normal text-neutral-400">from </Text>
            {formatMoney(tour.price)}
          </Text>
        ) : null}

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label="Book / Enquire" onPress={() => startBooking()} fullWidth />
          </View>
          {contactUrl ? (
            <View className="flex-1">
              <Button label="Contact" variant="outline" onPress={() => Linking.openURL(contactUrl)} fullWidth />
            </View>
          ) : null}
        </View>

        {done ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-green-50 px-4 py-3 dark:bg-green-950">
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text className="flex-1 text-sm text-success">Enquiry sent! The operator will be in touch.</Text>
          </View>
        ) : null}

        {open && isAuthenticated ? (
          <View className="gap-3 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
            <Text className="text-base font-bold text-neutral-900 dark:text-white">Booking enquiry</Text>
            <Input label="Name" value={name} onChangeText={setName} />
            <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <Input label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Message</Text>
              <TextInput
                placeholder="Dates, group size, questions…"
                placeholderTextColor="#9ca3af"
                multiline
                value={message}
                onChangeText={setMessage}
                className="min-h-16 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </View>
            {error ? <Text className="text-xs text-danger">{error}</Text> : null}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button label="Cancel" variant="ghost" onPress={() => setOpen(false)} fullWidth />
              </View>
              <View className="flex-1">
                <Button label="Send enquiry" loading={isPending} disabled={!canSubmit} onPress={submit} fullWidth />
              </View>
            </View>
          </View>
        ) : null}

        {tour.packages.length > 0 ? (
          <View className="mt-2 gap-3">
            <Text className="text-lg font-bold text-neutral-900 dark:text-white">
              Packages ({tour.packages.length})
            </Text>
            {tour.packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onBook={startBooking} />
            ))}
          </View>
        ) : (
          <Text className="mt-2 text-sm text-neutral-500">
            This operator hasn&apos;t published any packages yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
