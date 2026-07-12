import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { Badge, Button, DateField, DetailSkeleton, Input } from '@/components/ui';
import { useRequireAuth } from '@/features/auth';
import { useCreateGuideBooking } from '@/features/bookings';
import { useGuide } from '@/features/guides';
import { useAuthStore } from '@/store/auth.store';
import { addDays, nightsBetween, toISODate } from '@/utils/date';
import { formatMoney, formatRating } from '@/utils/format';
import { icons8 } from '@/utils/icons8';

function Fact({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl border border-neutral-100 py-3 dark:border-neutral-800">
      <Ionicons name={icon} size={20} color="#00a165" />
      <Text className="text-base font-bold text-ink">{value}</Text>
      <Text className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Text>
    </View>
  );
}

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: guide, isLoading, isError } = useGuide(id);
  const { requireAuth } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useCreateGuideBooking();

  const today = toISODate(new Date());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(today, 1));
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // A one-day hire counts as 1 day; nightsBetween gives the span, min 1.
  const days = Math.max(1, nightsBetween(start, end));
  const total = useMemo(() => (guide ? guide.dailyRate * days : 0), [guide, days]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Guide' }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !guide) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center text-muted">
          Couldn&apos;t load this guide. Pull back and try again.
        </Text>
      </View>
    );
  }

  const image = guide.imageUrl;

  const submit = async () => {
    setError(null);
    try {
      await mutateAsync({
        guideId: guide.id,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        startDate: start,
        endDate: end,
        days,
        totalPrice: total,
        currency: guide.price.currency,
        message: message.trim() || `Guide enquiry for ${guide.name}`,
      });
      setDone(true);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send your enquiry.');
    }
  };

  const canSubmit =
    name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 6;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-8">
      <Stack.Screen options={{ title: guide.name }} />

      {/* Profile header */}
      <View className="items-center gap-3 px-5 pt-6">
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 104, height: 104, borderRadius: 52 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="items-center justify-center rounded-full bg-brand-50" style={{ width: 104, height: 104 }}>
            <Image source={{ uri: icons8('map-marker') }} style={{ width: 56, height: 56 }} contentFit="contain" />
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-display text-ink">{guide.name}</Text>
          {guide.isVerified ? <Badge label="Verified" tone="success" /> : null}
        </View>

        <View className="flex-row items-center gap-3">
          {guide.city ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={15} color="#9aa7ac" />
              <Text className="text-muted">{guide.city}</Text>
            </View>
          ) : null}
          {guide.reviewCount > 0 || guide.rating > 0 ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#f5a623" />
              <Text className="text-muted">
                {formatRating(guide.rating)} · {guide.reviewCount} review{guide.reviewCount === 1 ? '' : 's'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="gap-4 p-5">
        {/* Key facts */}
        <View className="flex-row gap-3">
          <Fact icon="cash-outline" label="Per day" value={formatMoney(guide.price)} />
          {guide.experienceYears != null ? (
            <Fact
              icon="ribbon-outline"
              label="Experience"
              value={`${guide.experienceYears} yr${guide.experienceYears === 1 ? '' : 's'}`}
            />
          ) : null}
          {guide.languages.length > 0 ? (
            <Fact icon="chatbubbles-outline" label="Languages" value={String(guide.languages.length)} />
          ) : null}
        </View>

        {guide.languages.length > 0 ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">Speaks</Text>
            <View className="flex-row flex-wrap gap-2">
              {guide.languages.map((lang) => (
                <Badge key={lang} label={lang} tone="neutral" />
              ))}
            </View>
          </View>
        ) : null}

        {guide.bio ? (
          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-ink">About</Text>
            <Text className="leading-6 text-muted">{guide.bio}</Text>
          </View>
        ) : null}

        {done ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-green-50 px-4 py-3 dark:bg-green-950">
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text className="flex-1 text-sm text-success">
              Enquiry sent! {guide.name.split(' ')[0]} will be in touch about availability.
            </Text>
          </View>
        ) : null}

        {/* Booking enquiry */}
        {open ? (
          <View className="gap-3 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
            <Text className="text-base font-bold text-ink">Hire this guide</Text>
            <Input label="Name" value={name} onChangeText={setName} />
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <View className="flex-row gap-3">
              <DateField label="From" value={start} min={new Date()} onChange={setStart} />
              <DateField label="To" value={end} min={new Date(addDays(start, 1))} onChange={setEnd} />
            </View>
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-ink">Message</Text>
              <TextInput
                placeholder="Where you're headed, group size, questions…"
                placeholderTextColor="#9aa7ac"
                multiline
                value={message}
                onChangeText={setMessage}
                className="min-h-16 rounded-xl border border-hairline bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </View>

            <View className="flex-row items-center justify-between rounded-xl bg-surface-sunk px-4 py-3">
              <Text className="text-sm text-muted">
                {formatMoney(guide.price)} × {days} day{days === 1 ? '' : 's'}
              </Text>
              <Text className="text-base font-bold text-brand-600">
                {formatMoney({ amount: total, currency: guide.price.currency })}
              </Text>
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
        ) : done ? (
          <Button label="Enquiry sent" disabled onPress={() => {}} fullWidth />
        ) : (
          <Button label="Hire / Enquire" onPress={() => requireAuth(() => setOpen(true))} fullWidth />
        )}
      </View>
    </ScrollView>
  );
}
