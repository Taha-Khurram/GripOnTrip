import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, DateField, Input } from '@/components/ui';
import { AUTH_GATING_ENABLED } from '@/features/auth';
import { useCreateRentalBooking } from '@/features/bookings';
import { CardPaymentForm, usePayWithCard, type CardInput } from '@/features/payments';
import { useRental } from '@/features/rentals';
import { useAuthStore } from '@/store/auth.store';
import { addDays, nightsBetween, toISODate } from '@/utils/date';
import { formatDate, formatMoney } from '@/utils/format';

type DurationType = 'days' | 'months' | 'yearly';
type CancelPolicy = 'non_refundable' | 'refundable';
type PaymentTab = 'card' | 'property';

const DURATIONS: { key: DurationType; label: string }[] = [
  { key: 'days', label: 'Days' },
  { key: 'months', label: 'Months' },
  { key: 'yearly', label: 'Yearly' },
];

/** 11% premium added to the base total when the guest picks a refundable rate. */
const REFUNDABLE_PREMIUM = 0.11;

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
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

/**
 * Request-to-book flow for a BNB property. Mirrors the website's page: pick a
 * rental-duration type + dates, choose a cancellation policy, fill guest
 * details, then pay by card (mock form) or on arrival. On success it shows a
 * confirmation screen. The booking is written to Supabase `rental_bookings`.
 */
export default function BookRentalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: rental, isLoading } = useRental(id);
  const { mutateAsync, isPending } = useCreateRentalBooking();
  const { mutateAsync: payWithCard, isPending: isPaying } = usePayWithCard();

  const today = toISODate(new Date());
  const [duration, setDuration] = useState<DurationType>('days');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(today, 7));
  const [policy, setPolicy] = useState<CancelPolicy>('non_refundable');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState<PaymentTab>('property');
  const [card, setCard] = useState<CardInput | null>(null);
  const [showCardErrors, setShowCardErrors] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (isLoading || !rental) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title: 'Request to Book' }} />
        <ActivityIndicator color="#00a165" />
      </View>
    );
  }

  if (AUTH_GATING_ENABLED && !user) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Stack.Screen options={{ title: 'Request to Book' }} />
        <Ionicons name="lock-closed-outline" size={40} color="#9aa7ac" />
        <Text className="text-center text-muted">Please sign in to request this property.</Text>
        <Button label="Sign in" fullWidth onPress={() => router.replace('/(auth)/sign-in')} />
      </View>
    );
  }

  const currency = rental.price.currency;
  const monthly = rental.price.amount;
  const daily = rental.pricePerDay ?? Math.round(monthly / 30);
  const days = Math.max(nightsBetween(start, end), 1);

  const { units, unitLabel, rate } =
    duration === 'days'
      ? { units: days, unitLabel: 'day', rate: daily }
      : duration === 'months'
        ? { units: Math.max(Math.round(days / 30), 1), unitLabel: 'month', rate: monthly }
        : { units: Math.max(Math.round(days / 365), 1), unitLabel: 'year', rate: monthly * 12 };

  const base = rate * units;
  const premium = policy === 'refundable' ? Math.round(base * REFUNDABLE_PREMIUM) : 0;
  const total = base + premium;

  const durationSummary = `${units} ${unitLabel}${units === 1 ? '' : 's'}`;
  const policyLabel = policy === 'refundable' ? 'Refundable' : 'Non-refundable';
  const paymentLabel = payment === 'card' ? 'Credit/Debit Card' : 'Pay at Property';

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const detailsValid = name.trim().length > 1 && validEmail && nightsBetween(start, end) > 0;
  const canSubmit = detailsValid && (payment === 'property' || card !== null);
  const busy = isPending || isPaying;

  const submit = async () => {
    setError(null);
    if (!detailsValid) {
      setError('Please add your name, a valid email, and a valid date range.');
      return;
    }
    try {
      // Charge by card first (when chosen), so a decline never records a booking.
      let paymentReference: string | undefined;
      if (payment === 'card') {
        if (!card) {
          setShowCardErrors((n) => n + 1);
          setError('Please enter valid card details to pay now.');
          return;
        }
        const result = await payWithCard({
          card,
          amount: total,
          currency,
          description: `BNB booking · ${rental.title}`,
          metadata: { propertyId: rental.id, customerEmail: email.trim() },
        });
        paymentReference = result.paymentIntentId;
      }
      const note = [
        `Cancellation: ${policyLabel}`,
        `Payment: ${paymentLabel}`,
        paymentReference ? `Payment ref: ${paymentReference}` : '',
        message.trim(),
      ]
        .filter(Boolean)
        .join('\n');
      await mutateAsync({
        propertyId: rental.id,
        startDate: start,
        endDate: end,
        durationType: duration,
        durationValue: units,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim() || undefined,
        totalPrice: total,
        message: note,
      });
      setConfirmed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your booking request.');
    }
  };

  // ── Confirmation ────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow justify-center gap-6 p-6 pb-10"
      >
        <Stack.Screen options={{ title: 'Booking confirmed', headerBackVisible: false }} />

        <View className="items-center gap-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-center font-display-x text-2xl text-ink">Booking Requested!</Text>
            <Text className="text-center text-sm text-muted">
              Your request for {rental.title} is pending confirmation from the host.
            </Text>
          </View>
        </View>

        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="receipt-outline" size={18} color="#037a4e" />
            <Text className="text-base font-semibold text-ink">Booking Summary</Text>
          </View>
          <View className="h-px bg-hairline" />
          <SummaryRow icon="home-outline" label="Property" value={rental.title} />
          <SummaryRow icon="time-outline" label="Duration" value={durationSummary} />
          <SummaryRow icon="calendar-outline" label="Start" value={formatDate(start)} />
          <SummaryRow icon="calendar-clear-outline" label="End" value={formatDate(end)} />
          <SummaryRow icon="shield-checkmark-outline" label="Cancellation" value={policyLabel} />
          <SummaryRow icon="card-outline" label="Payment" value={paymentLabel} />
          <View className="h-px bg-hairline" />
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-ink">Total</Text>
            <Text className="font-display-x text-xl text-brand-600">
              {formatMoney({ amount: total, currency })}
            </Text>
          </View>
        </Card>

        <View className="flex-row items-start gap-2 rounded-2xl bg-brand-50 px-4 py-3">
          <Ionicons name="information-circle-outline" size={18} color="#037a4e" />
          <Text className="flex-1 text-sm text-brand-700">
            {payment === 'property'
              ? 'No payment required now — the host collects the full amount when you arrive.'
              : 'The host will confirm your reservation and share payment details shortly.'}
          </Text>
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View my rental bookings"
            onPress={() => router.replace('/my-rental-bookings')}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4"
          >
            <Ionicons name="albums-outline" size={18} color="#ffffff" />
            <Text className="font-body-semibold text-base text-white">View My Bookings</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to BNB"
            onPress={() => router.replace('/(tabs)/rentals')}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-brand-500 bg-transparent py-4"
          >
            <Ionicons name="home-outline" size={18} color="#00a165" />
            <Text className="font-body-semibold text-base text-brand-500">Browse more BNBs</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Booking form ────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Request to Book' }} />

      {/* ── Card 1 · Your trip ────────────────────────────────────────── */}
      <Card className="gap-4">
        <SectionTitle>Your trip</SectionTitle>

        <View className="gap-1.5">
          <Text className="text-sm font-body-medium text-ink">Rental Duration Type</Text>
          <View className="flex-row gap-1 rounded-2xl border border-hairline bg-surface-sunk p-1">
            {DURATIONS.map((d) => {
              const active = duration === d.key;
              return (
                <Pressable
                  key={d.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setDuration(d.key)}
                  className={[
                    'flex-1 items-center rounded-xl py-2.5',
                    active ? 'bg-brand-500' : 'bg-transparent',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-sm font-body-semibold',
                      active ? 'text-white' : 'text-muted',
                    ].join(' ')}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-row gap-3">
          <DateField
            label="Start Date"
            value={start}
            min={new Date()}
            onChange={(iso) => {
              setStart(iso);
              if (nightsBetween(iso, end) <= 0) setEnd(addDays(iso, 1));
            }}
          />
          <DateField
            label="End Date"
            value={end}
            min={new Date(addDays(start, 1))}
            onChange={setEnd}
          />
        </View>
        <Text className="-mt-2 text-xs text-muted-foreground">
          {durationSummary} · {formatDate(start)} → {formatDate(end)}
        </Text>
      </Card>

      {/* ── Card 2 · Cancellation policy ──────────────────────────────── */}
      <Card className="gap-3">
        <SectionTitle>Cancellation policy</SectionTitle>
        <PolicyOption
          active={policy === 'non_refundable'}
          title="Non-refundable"
          subtitle="Free cancellation for 24 hours. After that, the reservation is non-refundable."
          onPress={() => setPolicy('non_refundable')}
        />
        <PolicyOption
          active={policy === 'refundable'}
          title="Refundable"
          subtitle="Free cancellation until 5 days before check-in. Total includes an 11% premium."
          onPress={() => setPolicy('refundable')}
        />
      </Card>

      {/* ── Card 3 · Guest Details ────────────────────────────────────── */}
      <Card className="gap-3">
        <SectionTitle>Guest Details</SectionTitle>
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
        <View className="gap-1.5">
          <Text className="text-sm font-body-medium text-ink">Message to Host (Optional)</Text>
          <TextInput
            placeholder="Let the host know why you're traveling…"
            placeholderTextColor="#9aa7ac"
            multiline
            value={message}
            onChangeText={setMessage}
            className="min-h-20 rounded-2xl border border-hairline bg-surface px-4 py-3 text-base text-ink"
          />
        </View>
      </Card>

      {/* ── Card 4 · Payment details ──────────────────────────────────── */}
      <Card className="gap-4">
        <SectionTitle>Payment details</SectionTitle>

        {/* Method — same tile pattern as the hotels booking flow. */}
        <View className="flex-row gap-3">
          <PaymentMethodTile
            active={payment === 'card'}
            icon="card-outline"
            title="Credit/Debit Card"
            subtitle="Pay securely now."
            onPress={() => setPayment('card')}
          />
          <PaymentMethodTile
            active={payment === 'property'}
            icon="home-outline"
            title="Pay at Property"
            subtitle="Pay on arrival."
            onPress={() => setPayment('property')}
          />
        </View>

        {payment === 'property' ? (
          <View className="flex-row items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#037a4e" />
            <Text className="flex-1 text-sm text-brand-700">
              No payment is required now. The host will collect the full amount of{' '}
              <Text className="font-semibold">{formatMoney({ amount: total, currency })}</Text> when
              you arrive at the property.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-sm text-muted">
              Pay{' '}
              <Text className="font-semibold text-ink">
                {formatMoney({ amount: total, currency })}
              </Text>{' '}
              securely by card to request this property now.
            </Text>
            <CardPaymentForm onChange={setCard} showAllErrors={showCardErrors} collapsible />
          </View>
        )}
      </Card>

      {/* ── Card 5 · Price summary + submit ───────────────────────────── */}
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            {formatMoney({ amount: rate, currency })} × {durationSummary}
          </Text>
          <Text className="text-sm font-semibold text-ink">
            {formatMoney({ amount: base, currency })}
          </Text>
        </View>
        {premium > 0 ? (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">Refundable premium (11%)</Text>
            <Text className="text-sm font-semibold text-ink">
              {formatMoney({ amount: premium, currency })}
            </Text>
          </View>
        ) : null}
        <View className="h-px bg-hairline" />
        <View className="flex-row items-baseline justify-between">
          <Text className="text-base font-bold text-ink">Total</Text>
          <Text className="font-display-x text-xl text-brand-600">
            {formatMoney({ amount: total, currency })}
          </Text>
        </View>

        <Text className="text-xs text-muted-foreground">
          By selecting the button below, you agree to the Host&apos;s Ground Rules, the platform&apos;s
          Terms of Service, and the selected Cancellation Policy.
        </Text>

        {error ? (
          <View className="rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={payment === 'card' ? 'Book and pay' : 'Request to book'}
          accessibilityState={{ disabled: !canSubmit || busy, busy }}
          disabled={!canSubmit || busy}
          onPress={submit}
          className={[
            'w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4',
            !canSubmit || busy ? 'opacity-50' : '',
          ].join(' ')}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name={payment === 'card' ? 'card-outline' : 'shield-checkmark-outline'}
                size={18}
                color="#ffffff"
              />
              <Text className="font-body-semibold text-base text-white">
                {payment === 'card'
                  ? `Pay ${formatMoney({ amount: total, currency })}`
                  : 'Request to book'}
              </Text>
            </>
          )}
        </Pressable>

        <Text className="text-center text-xs text-muted-foreground">
          {payment === 'card'
            ? 'Your card is charged securely via Stripe to request this property.'
            : "You won't be charged now — the host confirms your request first."}
        </Text>
      </Card>
    </ScrollView>
  );
}

/**
 * Cancellation-policy option — no radio control; the selected state is shown by
 * the brand outline + tinted fill (and a trailing checkmark for clarity).
 */
function PolicyOption({
  active,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={[
        'flex-row items-start justify-between gap-3 rounded-2xl border-2 p-4',
        active ? 'border-brand-500 bg-brand-50' : 'border-hairline bg-surface',
      ].join(' ')}
    >
      <View className="flex-1 gap-0.5">
        <Text className={['text-base font-semibold', active ? 'text-brand-700' : 'text-ink'].join(' ')}>
          {title}
        </Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>
      {active ? (
        <Ionicons name="checkmark-circle" size={20} color="#037a4e" style={{ marginTop: 2 }} />
      ) : null}
    </Pressable>
  );
}

/**
 * Selectable payment-method tile — mirrors the app's shared `PaymentOption`
 * (whole card highlights when active; constant `border-2` so selection never
 * shifts layout) so the BNB flow reads identically to the hotels flow.
 */
function PaymentMethodTile({
  active,
  icon,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={[
        'flex-1 gap-2 rounded-2xl border-2 p-3.5',
        active ? 'border-brand-500 bg-brand-50' : 'border-hairline bg-surface',
      ].join(' ')}
    >
      <View className="flex-row items-center gap-1.5">
        <Ionicons name={icon} size={18} color={active ? '#037a4e' : '#9aa7ac'} />
        <Text
          className={[
            'flex-1 text-sm font-semibold',
            active ? 'text-brand-700' : 'text-ink',
          ].join(' ')}
        >
          {title}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">{subtitle}</Text>
    </Pressable>
  );
}
