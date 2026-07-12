import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, DateField, Input, Stepper } from '@/components/ui';
import { AUTH_GATING_ENABLED } from '@/features/auth';
import { useCreateAgencyBooking } from '@/features/bookings';
import { CardPaymentForm, usePayWithCard, type CardInput } from '@/features/payments';
import { useTour } from '@/features/tours';
import { useAuthStore } from '@/store/auth.store';
import { toISODate } from '@/utils/date';
import { formatDate, formatMoney } from '@/utils/format';

type PaymentTab = 'card' | 'operator';

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
 * Book a specific tour package. Reached from the "Book Now" button on a tour
 * detail page (carries `id` = operator, `packageId` = the chosen package). The
 * traveller picks a departure date and headcount, adds contact details, and
 * chooses to pay by card (mock) or to the operator. Enquiries are written via
 * the agency booking mutation; on success a confirmation screen is shown.
 */
export default function BookTourPackageScreen() {
  const { id, packageId } = useLocalSearchParams<{ id: string; packageId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: tour, isLoading } = useTour(id);
  const { mutateAsync, isPending } = useCreateAgencyBooking();
  const { mutateAsync: payWithCard, isPending: isPaying } = usePayWithCard();

  const today = toISODate(new Date());
  const [travelDate, setTravelDate] = useState(today);
  const [travelers, setTravelers] = useState(1);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState<PaymentTab>('operator');
  const [card, setCard] = useState<CardInput | null>(null);
  const [showCardErrors, setShowCardErrors] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const pkg = tour?.packages.find((p) => p.id === packageId);

  if (isLoading || !tour) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title: 'Book Package' }} />
        <ActivityIndicator color="#00a165" />
      </View>
    );
  }

  if (!pkg) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Stack.Screen options={{ title: 'Book Package' }} />
        <Ionicons name="alert-circle-outline" size={40} color="#9aa7ac" />
        <Text className="text-center text-muted">This package is no longer available.</Text>
        <Button label="Back to tour" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  if (AUTH_GATING_ENABLED && !user) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Stack.Screen options={{ title: 'Book Package' }} />
        <Ionicons name="lock-closed-outline" size={40} color="#9aa7ac" />
        <Text className="text-center text-muted">Please sign in to book this package.</Text>
        <Button label="Sign in" fullWidth onPress={() => router.replace('/(auth)/sign-in')} />
      </View>
    );
  }

  const currency = 'PKR';
  const rate = pkg.amount;
  const total = rate * travelers;
  const paymentLabel = payment === 'card' ? 'Credit/Debit Card' : 'Pay to Operator';

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const detailsValid = name.trim().length > 1 && validEmail && phone.trim().length >= 6;
  const canSubmit = detailsValid && (payment === 'operator' || card !== null);
  const busy = isPending || isPaying;

  const submit = async () => {
    setError(null);
    if (!detailsValid) {
      setError('Please add your name, a valid email, and a phone number.');
      return;
    }
    try {
      // Charge by card first (when chosen) so a decline never records a booking.
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
          description: `Tour package · ${pkg.name}`,
          metadata: { agencyId: tour.id, packageId: pkg.id, customerEmail: email.trim() },
        });
        paymentReference = result.paymentIntentId;
      }
      const note = [
        `Package: ${pkg.name}`,
        `Travel date: ${travelDate}`,
        `Travellers: ${travelers}`,
        `Total: ${formatMoney({ amount: total, currency })}`,
        `Payment: ${payment === 'card' ? 'Card (Stripe) · Paid' : paymentLabel}`,
        paymentReference ? `Payment ref: ${paymentReference}` : '',
        message.trim(),
      ]
        .filter(Boolean)
        .join('\n');
      await mutateAsync({
        agencyId: tour.id,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        message: note,
      });
      setConfirmed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your booking. Please try again.');
    }
  };

  // ── Confirmation ──────────────────────────────────────────────────────────
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
            <Text className="text-center text-sm leading-6 text-muted">
              Your booking for {pkg.name} is pending confirmation from {tour.title}.
            </Text>
          </View>
        </View>

        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="receipt-outline" size={18} color="#037a4e" />
            <Text className="text-base font-semibold text-ink">Booking Summary</Text>
          </View>
          <View className="h-px bg-hairline" />
          <SummaryRow icon="cube-outline" label="Package" value={pkg.name} />
          <SummaryRow icon="business-outline" label="Operator" value={tour.title} />
          <SummaryRow icon="calendar-outline" label="Travel date" value={formatDate(travelDate)} />
          <SummaryRow
            icon="people-outline"
            label="Travellers"
            value={`${travelers} ${travelers === 1 ? 'person' : 'people'}`}
          />
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
            The operator will confirm availability and share the next steps with you shortly.
          </Text>
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to tour"
            onPress={() => router.back()}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4"
          >
            <Ionicons name="arrow-back-outline" size={18} color="#ffffff" />
            <Text className="font-body-semibold text-base text-white">Back to tour</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Browse more tours"
            onPress={() => router.replace('/(tabs)/tours')}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-brand-500 bg-transparent py-4"
          >
            <Ionicons name="bus-outline" size={18} color="#00a165" />
            <Text className="font-body-semibold text-base text-brand-500">Browse more tours</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Booking form ──────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Book Package' }} />

      {/* ── Package summary ───────────────────────────────────────────── */}
      <Card className="gap-2">
        <View className="flex-row items-center gap-1.5 self-start rounded-full bg-brand-50 px-3 py-1">
          <Ionicons name="bus-outline" size={13} color="#037a4e" />
          <Text className="text-xs font-body-semibold uppercase tracking-wide text-brand-700">Tour</Text>
        </View>
        <Text className="text-xl font-display text-ink">{pkg.name}</Text>
        <Text className="text-sm text-muted">{tour.title}</Text>
        <View className="flex-row items-baseline gap-1.5">
          <Text className="font-display-x text-2xl text-brand-600">
            {formatMoney({ amount: rate, currency })}
          </Text>
          <Text className="text-sm text-muted-foreground">per person</Text>
        </View>
      </Card>

      {/* ── Trip details ──────────────────────────────────────────────── */}
      <Card className="gap-4">
        <SectionTitle>Trip details</SectionTitle>
        <DateField
          label="Travel Date"
          value={travelDate}
          min={new Date()}
          onChange={setTravelDate}
        />
        <View className="rounded-2xl border border-hairline bg-surface-sunk px-4">
          <Stepper label="Travellers" value={travelers} min={1} max={30} onChange={setTravelers} />
        </View>
      </Card>

      {/* ── Guest details ─────────────────────────────────────────────── */}
      <Card className="gap-3">
        <SectionTitle>Your details</SectionTitle>
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
          <Text className="text-sm font-body-medium text-ink">Message (Optional)</Text>
          <TextInput
            placeholder="Any special requests or questions…"
            placeholderTextColor="#9aa7ac"
            multiline
            value={message}
            onChangeText={setMessage}
            className="min-h-20 rounded-2xl border border-hairline bg-surface px-4 py-3 text-base text-ink"
            textAlignVertical="top"
          />
        </View>
      </Card>

      {/* ── Payment ───────────────────────────────────────────────────── */}
      <Card className="gap-4">
        <SectionTitle>Payment details</SectionTitle>
        <View className="flex-row gap-3">
          <PaymentMethodTile
            active={payment === 'card'}
            icon="card-outline"
            title="Credit/Debit Card"
            subtitle="Pay securely now."
            onPress={() => setPayment('card')}
          />
          <PaymentMethodTile
            active={payment === 'operator'}
            icon="business-outline"
            title="Pay to Operator"
            subtitle="Settle on confirmation."
            onPress={() => setPayment('operator')}
          />
        </View>

        {payment === 'operator' ? (
          <View className="flex-row items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#037a4e" />
            <Text className="flex-1 text-sm text-brand-700">
              No payment is required now. The operator confirms availability, then shares payment
              details for the full amount of{' '}
              <Text className="font-semibold">{formatMoney({ amount: total, currency })}</Text>.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-sm text-muted">
              Pay{' '}
              <Text className="font-semibold text-ink">
                {formatMoney({ amount: total, currency })}
              </Text>{' '}
              securely by card to book this package now.
            </Text>
            <CardPaymentForm onChange={setCard} showAllErrors={showCardErrors} collapsible />
          </View>
        )}
      </Card>

      {/* ── Price summary + submit ────────────────────────────────────── */}
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            {formatMoney({ amount: rate, currency })} × {travelers}{' '}
            {travelers === 1 ? 'traveller' : 'travellers'}
          </Text>
          <Text className="text-sm font-semibold text-ink">
            {formatMoney({ amount: total, currency })}
          </Text>
        </View>
        <View className="h-px bg-hairline" />
        <View className="flex-row items-baseline justify-between">
          <Text className="text-base font-bold text-ink">Total</Text>
          <Text className="font-display-x text-xl text-brand-600">
            {formatMoney({ amount: total, currency })}
          </Text>
        </View>

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
                  : 'Request to Book'}
              </Text>
            </>
          )}
        </Pressable>

        <Text className="text-center text-xs text-muted-foreground">
          {payment === 'card'
            ? 'Your card is charged securely via Stripe to book this package.'
            : "You won't be charged now — the operator confirms availability first."}
        </Text>
      </Card>
    </ScrollView>
  );
}

/**
 * Selectable payment-method tile — mirrors the shared pattern used by the hotel
 * and BNB booking flows (whole card highlights when active; constant `border-2`
 * so selection never shifts layout).
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
          className={['flex-1 text-sm font-semibold', active ? 'text-brand-700' : 'text-ink'].join(
            ' ',
          )}
        >
          {title}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">{subtitle}</Text>
    </Pressable>
  );
}
