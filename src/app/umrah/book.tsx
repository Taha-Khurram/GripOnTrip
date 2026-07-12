import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, DetailSkeleton, Input, Select } from '@/components/ui';
import { CardPaymentForm, usePayWithCard, type CardInput } from '@/features/payments';
import { useAuthStore } from '@/store/auth.store';
import { formatMoney } from '@/utils/format';
import {
  computeCustomPrice,
  DEFAULT_CUSTOM_CONFIG,
  DEPARTURE_CITIES,
  departureMonths,
  hotelTier,
  PACKAGE_TIERS,
  PackagePicker,
  PilgrimForm,
  UmrahBookingSummary,
  UmrahCustomizer,
  useSubmitUmrahBooking,
  useUmrahPackages,
  type CustomUmrahConfig,
  type Pilgrim,
} from '@/features/umrah';

type Step = 'build' | 'checkout' | 'confirmed';
type PaymentTab = 'card' | 'operator';

const CUSTOM_CHOICE = 'Bespoke Custom Umrah Package';

function newPilgrim(id: string): Pilgrim {
  return {
    id,
    fullName: '',
    passportNumber: '',
    passportExpiry: '',
    dateOfBirth: '',
    gender: 'Male',
    visaAssistance: false,
  };
}

/** Native header back control that returns to the build step (used on checkout). */
function HeaderBack({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} onPress={onPress}>
      <Ionicons name="chevron-back" size={26} color="#0c2b36" />
    </Pressable>
  );
}

/**
 * Primary call-to-action for the flow — a full-width ocean button with a bold
 * label, a supporting line (headcount / total), and a trailing action chip.
 * Handles loading (spinner) and disabled (dimmed, non-interactive) states.
 */
function PrimaryCTA({
  label,
  sublabel,
  icon,
  loading = false,
  disabled = false,
  onPress,
}: {
  label: string;
  sublabel?: string;
  icon: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      onPress={onPress}
      className={[
        'w-full flex-row items-center justify-between rounded-3xl bg-brand-500 px-5 py-4 shadow-glow-ocean',
        off ? 'opacity-50' : 'active:opacity-90',
      ].join(' ')}
    >
      <View className="flex-1 gap-0.5 pr-3">
        <Text className="font-display-x text-lg text-white" numberOfLines={1}>
          {label}
        </Text>
        {sublabel ? (
          <Text className="text-xs font-body-medium text-white/75" numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Ionicons name={icon} size={20} color="#ffffff" />
        </View>
      )}
    </Pressable>
  );
}

/**
 * Umrah booking flow. Reached from the "Book" button on an Umrah package detail
 * page (carries `id` = the package to preselect) or the "Build Custom Package"
 * entry (`custom=1`). One screen, three steps: build → checkout → confirmed.
 * Uses the app's native header (matching the hotel & stays booking flow).
 */
export default function UmrahBookScreen() {
  const { id, custom } = useLocalSearchParams<{ id?: string; custom?: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: packages, isLoading } = useUmrahPackages();
  const { mutateAsync, isPending } = useSubmitUmrahBooking();
  const { mutateAsync: payWithCard, isPending: isPaying } = usePayWithCard();

  const months = useMemo(() => departureMonths(new Date()), []);

  const [step, setStep] = useState<Step>('build');
  const [customActive, setCustomActive] = useState(custom === '1');
  const [selectedId, setSelectedId] = useState<string | undefined>(id);
  const [config, setConfig] = useState<CustomUmrahConfig>(DEFAULT_CUSTOM_CONFIG);

  const [departureCity, setDepartureCity] = useState('Lahore');
  const [packageTier, setPackageTier] = useState('all');
  const [departureMonth, setDepartureMonth] = useState(months[0]?.value ?? '');

  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([newPilgrim('pilgrim-1')]);

  const [payment, setPayment] = useState<PaymentTab>('operator');
  const [card, setCard] = useState<CardInput | null>(null);
  const [showCardErrors, setShowCardErrors] = useState(0);
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  if (isLoading || !packages) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Book Umrah' }} />
        <DetailSkeleton />
      </View>
    );
  }

  // Resolve the effective selection at render time (no state-in-effect): with no
  // packages at all we fall back to the bespoke builder; otherwise the first
  // package stands in until the traveller taps another.
  const isCustom = customActive || packages.length === 0;
  const resolvedId = selectedId ?? packages[0]?.id;
  const selectedPackage = packages.find((p) => p.id === resolvedId);
  // Operator that receives the enquiry (custom builds attach to the source /
  // first available operator; the API layer degrades gracefully if it can't).
  const operator = selectedPackage ?? packages.find((p) => p.id === id) ?? packages[0];

  const perPerson = isCustom
    ? computeCustomPrice(config)
    : (selectedPackage?.pricePerPerson ?? 0);
  const total = perPerson * pilgrims.length;

  const packageChoice = isCustom
    ? CUSTOM_CHOICE
    : (selectedPackage?.packageName ?? 'Umrah Package');
  const tierLabel = isCustom
    ? hotelTier(config.hotelTier).shortLabel
    : (selectedPackage?.makkahHotel ?? undefined);
  const makkahNights = isCustom ? config.makkahNights : selectedPackage?.makkahNights;
  const madinahNights = isCustom ? config.madinahNights : selectedPackage?.madinahNights;

  const pilgrimsValid = pilgrims.every(
    (p) => p.fullName.trim().length > 1 && p.passportNumber.trim().length >= 4,
  );
  const validEmail = /\S+@\S+\.\S+/.test(email);
  const contactValid = validEmail && phone.trim().length >= 6;
  const canCheckout = payment === 'operator' || card !== null;
  const busy = isPending || isPaying;

  const summary = (
    <UmrahBookingSummary
      packageChoice={packageChoice}
      departureCity={departureCity}
      departureMonth={departureMonth}
      makkahNights={makkahNights}
      madinahNights={madinahNights}
      hotelTierLabel={tierLabel}
      pilgrims={pilgrims.length}
      total={total}
      isCustom={isCustom}
    />
  );

  const goToCheckout = () => {
    setError(null);
    if (!isCustom && !selectedPackage) {
      setError('Please choose a package or build a custom one.');
      return;
    }
    if (!pilgrimsValid) {
      setError('Add each pilgrim’s full name and passport number to continue.');
      return;
    }
    setStep('checkout');
  };

  const submit = async () => {
    setError(null);
    if (!contactValid) {
      setError('Please add a valid email and phone number.');
      return;
    }
    try {
      // Charge by card first (when chosen) so a decline never records a booking.
      if (payment === 'card') {
        if (!card) {
          setShowCardErrors((n) => n + 1);
          setError('Please enter valid card details to pay now.');
          return;
        }
        await payWithCard({
          card,
          amount: total,
          currency: 'PKR',
          description: `Umrah booking · ${packageChoice}`,
          metadata: {
            agencyId: operator?.agencyId ?? '',
            packageName: packageChoice,
            customerEmail: email.trim(),
          },
        });
      }
      const { bookingId } = await mutateAsync({
        agencyId: operator?.agencyId ?? '',
        agencyName: operator?.agencyName ?? 'Grip On Trip Umrah Desk',
        customerName: pilgrims[0]?.fullName.trim() || user?.name || 'Primary Pilgrim',
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        packageName: packageChoice,
        pilgrims: pilgrims.length,
        departureCity,
        travelPeriod: departureMonth || 'To be confirmed',
        packageAmount: total,
      });
      setBookingRef(bookingId);
      setStep('confirmed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your booking. Please try again.');
    }
  };

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow justify-center gap-6 p-6 pb-10"
      >
        <Stack.Screen
          options={{ headerShown: true, title: 'Booking confirmed', headerBackVisible: false }}
        />
        <View className="items-center gap-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-center font-display-x text-2xl text-ink">
              Umrah Booking Confirmed!
            </Text>
            <Text className="text-center text-sm leading-6 text-muted">
              Reference <Text className="font-bold text-ink">{bookingRef}</Text>. Our Hajj &amp;
              Umrah specialists will verify your details and coordinate the next steps shortly.
            </Text>
          </View>
        </View>

        {summary}

        <View className="gap-3">
          <Button
            label="Back to Umrah packages"
            icon="moon-outline"
            fullWidth
            onPress={() => router.replace('/(tabs)/umrah')}
          />
          <Button label="Done" variant="outline" fullWidth onPress={() => router.back()} />
        </View>
      </ScrollView>
    );
  }

  // ── Checkout ────────────────────────────────────────────────────────────────
  if (step === 'checkout') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 p-5 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Confirm your booking',
            headerLeft: () => <HeaderBack onPress={() => setStep('build')} />,
          }}
        />

        {summary}

        {/* Contact details */}
        <Card className="gap-3">
          <Text className="font-display text-lg text-ink">Contact details</Text>
          <Input
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Phone"
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </Card>

        {/* Payment */}
        <Card className="gap-4">
          <Text className="font-display text-lg text-ink">Payment method</Text>
          <View className="flex-row gap-3">
            <PaymentTile
              active={payment === 'card'}
              icon="card-outline"
              title="Credit/Debit Card"
              subtitle="Pay securely now."
              onPress={() => setPayment('card')}
            />
            <PaymentTile
              active={payment === 'operator'}
              icon="business-outline"
              title="Pay to Operator"
              subtitle="Settle on confirmation."
              onPress={() => setPayment('operator')}
            />
          </View>

          {payment === 'operator' ? (
            <View className="flex-row items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3">
              <Ionicons name="information-circle-outline" size={18} color="#156473" />
              <Text className="flex-1 text-sm text-brand-700">
                No payment is required now. The operator confirms availability, then shares payment
                details for the full amount of{' '}
                <Text className="font-semibold">{formatMoney({ amount: total, currency: 'PKR' })}</Text>.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              <Text className="text-sm text-muted">
                Pay{' '}
                <Text className="font-semibold text-ink">
                  {formatMoney({ amount: total, currency: 'PKR' })}
                </Text>{' '}
                securely by card to confirm your Umrah booking now.
              </Text>
              <CardPaymentForm onChange={setCard} showAllErrors={showCardErrors} />
            </View>
          )}
        </Card>

        {error ? (
          <View className="rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        <PrimaryCTA
          label={payment === 'card' ? `Pay ${formatMoney({ amount: total, currency: 'PKR' })}` : 'Request to Book'}
          sublabel={`${pilgrims.length} ${pilgrims.length === 1 ? 'pilgrim' : 'pilgrims'}`}
          icon={payment === 'card' ? 'card' : 'shield-checkmark'}
          loading={busy}
          disabled={!canCheckout || !contactValid}
          onPress={submit}
        />
        <Text className="-mt-1 text-center text-xs text-muted-foreground">
          {payment === 'card'
            ? 'Your card is charged securely via Stripe to confirm this booking.'
            : 'You won’t be charged until the operator confirms availability.'}
        </Text>
      </ScrollView>
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ headerShown: true, title: 'Book Umrah' }} />

      {/* Trip configuration */}
      <Card className="gap-3">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Select
              label="Departure City"
              value={departureCity}
              options={DEPARTURE_CITIES}
              onChange={setDepartureCity}
            />
          </View>
          <View className="flex-1">
            <Select
              label="Month of Departure"
              value={departureMonth}
              options={months}
              onChange={setDepartureMonth}
            />
          </View>
        </View>
        <Select
          label="Package Tier"
          value={packageTier}
          options={PACKAGE_TIERS}
          onChange={setPackageTier}
        />
      </Card>

      {/* Package selection */}
      <PackagePicker
        packages={packages}
        selectedId={resolvedId}
        customActive={isCustom}
        onSelect={(pid) => {
          setSelectedId(pid);
          setCustomActive(false);
        }}
        onCustom={() => setCustomActive(true)}
      />

      {/* Customizer (only when building bespoke) */}
      {isCustom ? (
        <UmrahCustomizer
          config={config}
          price={perPerson}
          onChange={setConfig}
          onBack={() => setCustomActive(false)}
        />
      ) : null}

      {/* Pilgrims */}
      <PilgrimForm pilgrims={pilgrims} onChange={setPilgrims} />

      {/* Summary */}
      {summary}

      {error ? (
        <View className="rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      <PrimaryCTA
        label="Continue to Checkout"
        sublabel={`${pilgrims.length} ${pilgrims.length === 1 ? 'pilgrim' : 'pilgrims'} · ${formatMoney({ amount: total, currency: 'PKR' })} est. total`}
        icon="arrow-forward"
        onPress={goToCheckout}
      />
    </ScrollView>
  );
}

/** Selectable payment-method tile (shared pattern with the tour/hotel flows). */
function PaymentTile({
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
        <Ionicons name={icon} size={18} color={active ? '#156473' : '#9aa7ac'} />
        <Text className={['flex-1 text-sm font-semibold', active ? 'text-brand-700' : 'text-ink'].join(' ')}>
          {title}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">{subtitle}</Text>
    </Pressable>
  );
}
