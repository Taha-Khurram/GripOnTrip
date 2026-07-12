import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Badge, Button, DateField, DetailSkeleton, Input, PressableScale, SunCTA } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import { useRequireAuth } from '@/features/auth';
import { useCreateGuideBooking } from '@/features/bookings';
import { useGuide } from '@/features/guides';
import { useAuthStore } from '@/store/auth.store';
import { addDays, nightsBetween, toISODate } from '@/utils/date';
import { formatMoney, formatRating } from '@/utils/format';

/**
 * Guide photo as a circular avatar on the warm hero band — mirrors the Umrah
 * operator avatar. Falls back to a person glyph when there's no image or it
 * fails to load.
 */
function GuideAvatar({ uri }: { uri?: string }) {
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
          <Ionicons name="person" size={44} color="#037a4e" />
        </View>
      )}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

/** Section header with a title and a trailing hairline divider (Umrah style). */
function SectionHeader({ children }: { children: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <SectionTitle>{children}</SectionTitle>
      <View className="h-px flex-1 bg-hairline" />
    </View>
  );
}

/** A single spec stat tile (experience / languages / reviews). */
function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl bg-brand-50 py-3">
      <Ionicons name={icon} size={20} color="#037a4e" />
      <Text className="text-sm font-body-semibold text-brand-700">{label}</Text>
    </View>
  );
}

/** A labelled info row inside the "Guide details" card (icon · label · value). */
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

/**
 * Guide detail page. Adopts the Umrah detail layout — a warm hero band with the
 * guide's avatar and floating back + wishlist buttons, a white content sheet
 * overlapping with a rounded top (spec tiles, divider section headers, a
 * bordered "Guide details" card, bio), and a sticky bottom "Hire" bar that
 * reveals the enquiry form.
 */
export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: guide, isLoading, isError } = useGuide(id);
  const { requireAuth } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useCreateGuideBooking();

  const scrollRef = useRef<ScrollView>(null);
  const formY = useRef(0);

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
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !guide) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this guide. Pull back and try again.
        </Text>
      </View>
    );
  }

  const currency = guide.price.currency;

  const openEnquiry = () =>
    requireAuth(() => {
      setOpen(true);
      // Reveal the form beneath the fold.
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ y: Math.max(formY.current - 40, 0), animated: true }),
      );
    });

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
        currency,
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
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView ref={scrollRef} contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Warm hero band with the guide avatar + floating buttons */}
        <View>
          <SunCTA className="h-64 items-center justify-center gap-3 px-6 pb-8">
            <GuideAvatar uri={guide.imageUrl} />
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
              <Ionicons name="checkmark-circle" size={13} color="#ffffff" />
              <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">
                {guide.isVerified ? 'Verified Guide' : 'Local Guide'}
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
                id: guide.id,
                category: 'guides',
                title: guide.name,
                imageUrl: guide.imageUrl,
                subtitle: guide.city,
                price: guide.dailyRate,
                currency,
              }}
            />
          </View>
        </View>

        {/* Content sheet — overlaps the hero with a rounded top */}
        <View className="-mt-6 gap-5 rounded-t-[28px] bg-white p-5 pt-6">
          {/* Title + meta */}
          <View className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display-x text-2xl leading-8 text-ink">{guide.name}</Text>
              {guide.isVerified ? <Badge label="Verified" tone="accent" /> : null}
            </View>
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
              {guide.rating > 0 ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#f5a623" />
                  <Text className="text-sm font-semibold text-ink">{formatRating(guide.rating)}</Text>
                  <Text className="text-sm text-muted">({guide.reviewCount} reviews)</Text>
                </View>
              ) : null}
              {guide.city ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted" numberOfLines={1}>
                    {guide.city}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Price */}
          {guide.dailyRate > 0 ? (
            <View className="flex-row items-baseline gap-2">
              <Text className="font-display-x text-2xl text-brand-600">{formatMoney(guide.price)}</Text>
              <Text className="text-sm text-muted-foreground">/ day</Text>
            </View>
          ) : null}

          {/* Specs */}
          {guide.experienceYears != null || guide.languages.length > 0 || guide.reviewCount > 0 ? (
            <View className="flex-row gap-3">
              {guide.experienceYears != null ? (
                <Spec
                  icon="ribbon-outline"
                  label={`${guide.experienceYears} yr${guide.experienceYears === 1 ? '' : 's'}`}
                />
              ) : null}
              {guide.languages.length > 0 ? (
                <Spec
                  icon="language-outline"
                  label={`${guide.languages.length} language${guide.languages.length === 1 ? '' : 's'}`}
                />
              ) : null}
              {guide.reviewCount > 0 ? (
                <Spec icon="star-outline" label={`${guide.reviewCount} review${guide.reviewCount === 1 ? '' : 's'}`} />
              ) : null}
            </View>
          ) : null}

          {/* Highlight badges */}
          <View className="flex-row flex-wrap gap-2">
            {guide.isVerified ? <Badge label="Verified expert" tone="success" /> : null}
            <Badge label="Local guide" tone="brand" />
            {guide.experienceYears != null && guide.experienceYears >= 5 ? (
              <Badge label="Highly experienced" tone="accent" />
            ) : null}
          </View>

          {/* Guide details */}
          {guide.city || guide.experienceYears != null || guide.languages.length > 0 ? (
            <View className="gap-2">
              <SectionHeader>Guide details</SectionHeader>
              <View className="gap-4 rounded-2xl border border-hairline bg-surface p-4">
                {guide.city ? (
                  <DetailRow icon="location-outline" label="Based in" value={guide.city} />
                ) : null}
                {guide.experienceYears != null ? (
                  <DetailRow
                    icon="ribbon-outline"
                    label="Experience"
                    value={`${guide.experienceYears} year${guide.experienceYears === 1 ? '' : 's'}`}
                  />
                ) : null}
                {guide.languages.length > 0 ? (
                  <DetailRow
                    icon="language-outline"
                    label="Languages"
                    value={guide.languages.join(', ')}
                  />
                ) : null}
                {guide.dailyRate > 0 ? (
                  <DetailRow
                    icon="cash-outline"
                    label="Daily rate"
                    value={`${formatMoney(guide.price)} / day`}
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          {/* About */}
          {guide.bio ? (
            <View className="gap-2">
              <SectionHeader>About this guide</SectionHeader>
              <Text className="leading-6 text-muted">{guide.bio}</Text>
            </View>
          ) : null}

          {done ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-green-50 px-4 py-3">
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <Text className="flex-1 text-sm text-success">
                Enquiry sent! {guide.name.split(' ')[0]} will be in touch about availability.
              </Text>
            </View>
          ) : null}

          {/* Enquiry form (revealed by the sticky "Hire" bar) */}
          {open ? (
            <View
              className="gap-3"
              onLayout={(e) => {
                formY.current = e.nativeEvent.layout.y;
              }}
            >
              <SectionHeader>Hire this guide</SectionHeader>
              <View className="gap-3 rounded-2xl border border-hairline bg-surface p-4">
                <Input label="Full Name" placeholder="Your full name" value={name} onChangeText={setName} />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label="Email"
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label="Phone"
                      placeholder="Phone number"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <DateField label="From" value={start} min={new Date()} onChange={setStart} />
                  <DateField label="To" value={end} min={new Date(addDays(start, 1))} onChange={setEnd} />
                </View>
                <View className="gap-1.5">
                  <Text className="text-sm font-body-medium text-ink">Message (Optional)</Text>
                  <TextInput
                    placeholder="Where you're headed, group size, questions…"
                    placeholderTextColor="#9aa7ac"
                    multiline
                    value={message}
                    onChangeText={setMessage}
                    className="min-h-20 rounded-2xl border border-hairline bg-surface px-4 py-3 text-base text-ink"
                    textAlignVertical="top"
                  />
                </View>

                <View className="flex-row items-center justify-between rounded-2xl bg-surface-sunk px-4 py-3">
                  <Text className="text-sm text-muted">
                    {formatMoney(guide.price)} × {days} day{days === 1 ? '' : 's'}
                  </Text>
                  <Text className="font-display-x text-lg text-brand-600">
                    {formatMoney({ amount: total, currency })}
                  </Text>
                </View>

                {error ? <Text className="text-xs text-danger">{error}</Text> : null}

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button label="Cancel" variant="ghost" fullWidth onPress={() => setOpen(false)} />
                  </View>
                  <View className="flex-1">
                    <Button
                      label="Send enquiry"
                      loading={isPending}
                      disabled={!canSubmit}
                      fullWidth
                      onPress={submit}
                    />
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky hire bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-hairline bg-white px-5 pb-8 pt-3">
        <View>
          {guide.dailyRate > 0 ? (
            <>
              <Text className="font-display-x text-xl text-brand-600">{formatMoney(guide.price)}</Text>
              <Text className="text-xs text-muted-foreground">per day</Text>
            </>
          ) : (
            <>
              <Text className="font-body-semibold text-base text-ink">Custom rate</Text>
              <Text className="text-xs text-muted-foreground">Enquire for pricing</Text>
            </>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={done ? 'Enquiry sent' : 'Hire this guide'}
          disabled={done}
          onPress={openEnquiry}
          className={[
            'flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-4 shadow-glow',
            done ? 'opacity-50' : '',
          ].join(' ')}
        >
          <Ionicons name={done ? 'checkmark-done-outline' : 'compass-outline'} size={18} color="#ffffff" />
          <Text className="font-body-semibold text-base text-white">
            {done ? 'Enquiry sent' : 'Hire this guide'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
