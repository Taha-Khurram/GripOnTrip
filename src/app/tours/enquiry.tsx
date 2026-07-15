import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { DateField, DetailSkeleton, Input } from '@/components/ui';
import { useCreateAgencyBooking } from '@/features/bookings';
import { useTour } from '@/features/tours';
import { useAuthStore } from '@/store/auth.store';
import { toISODate } from '@/utils/date';

/** Delay before auto-returning to the tour detail page after a successful send. */
const RETURN_DELAY_MS = 1900;

/**
 * "Request an Inquiry" — the custom-quote form reached from a tour operator's
 * detail page. Submits an agency enquiry, shows a success state, then returns to
 * the detail page automatically.
 */
export default function TourEnquiryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: tour, isLoading, isError } = useTour(id);
  const { mutateAsync, isPending } = useCreateAgencyBooking();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [travelDate, setTravelDate] = useState('');
  const [message, setMessage] = useState('I am requesting a general quote for travel services.');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Auto-return to the detail page once the enquiry is sent.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Request an Inquiry' }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !tour) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Stack.Screen options={{ title: 'Request an Inquiry' }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this operator. Pull back and try again.
        </Text>
      </View>
    );
  }

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const canSubmit = name.trim().length > 1 && validEmail && phone.trim().length >= 6;

  const submit = async () => {
    setError(null);
    try {
      const note = [travelDate ? `Preferred travel date: ${travelDate}` : null, message.trim()]
        .filter(Boolean)
        .join('\n');
      await mutateAsync({
        agencyId: tour.id,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        message: note || `Custom quote enquiry for ${tour.title}`,
      });
      setDone(true);
      timer.current = setTimeout(() => router.back(), RETURN_DELAY_MS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send your request. Please try again.');
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-background px-8">
        <Stack.Screen options={{ title: 'Request sent', headerBackVisible: false }} />
        <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
          <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
        </View>
        <View className="items-center gap-2">
          <Text className="text-center font-display-x text-2xl text-ink">Request Sent!</Text>
          <Text className="text-center text-sm leading-6 text-muted">
            Your inquiry has been sent to{' '}
            <Text className="font-body-semibold text-ink">{tour.title}</Text>. They usually reply
            within 24 hours.
          </Text>
        </View>
        <ActivityIndicator color="#00a165" />
        <Text className="text-xs text-muted-foreground">Returning to the tour…</Text>
      </View>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-5 p-5 pb-12"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Stack.Screen options={{ title: 'Request an Inquiry' }} />

      <View className="gap-1">
        <Text className="font-display-x text-2xl text-ink">Request an Inquiry</Text>
        <Text className="text-sm text-muted">
          Connecting with <Text className="font-body-semibold text-brand-600">{tour.title}</Text>
        </Text>
      </View>

      <View className="h-px bg-hairline" />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input label="Full Name" placeholder="Ali Khan" value={name} onChangeText={setName} />
        </View>
        <View className="flex-1">
          <Input
            label="Phone"
            placeholder="03xx xxxxxxx"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>

      <Input
        label="Email"
        placeholder="ali@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <DateField
        label="Travel Date"
        value={travelDate || toISODate(new Date())}
        min={new Date()}
        onChange={setTravelDate}
      />

      <View className="gap-1.5">
        <Text className="text-sm font-body-medium text-ink">Message</Text>
        <TextInput
          placeholder="Tell the operator about your trip…"
          placeholderTextColor="#9aa7ac"
          multiline
          value={message}
          onChangeText={setMessage}
          className="min-h-28 rounded-2xl border border-hairline bg-surface px-4 py-3 text-base text-ink"
          textAlignVertical="top"
        />
      </View>

      {error ? (
        <View className="rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send request"
        accessibilityState={{ disabled: !canSubmit || isPending, busy: isPending }}
        disabled={!canSubmit || isPending}
        onPress={submit}
        className={[
          'w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4',
          !canSubmit || isPending ? 'opacity-50' : '',
        ].join(' ')}
      >
        {isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="mail-outline" size={18} color="#ffffff" />
            <Text className="font-body-semibold text-base text-white">Send Request</Text>
          </>
        )}
      </Pressable>

      <Text className="text-center text-xs text-muted-foreground">
        Your details are shared only with this operator so they can prepare a quote.
      </Text>
    </ScrollView>
  );
}
