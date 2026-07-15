import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, Input } from '@/components/ui';
import { AUTH_GATING_ENABLED } from '@/features/auth';
import { CardPaymentForm, usePayWithCard, type CardInput } from '@/features/payments';
import { useProduct, usePlaceOrder, type OrderPaymentMethod } from '@/features/shop';
import { useAuthStore } from '@/store/auth.store';
import { formatMoney } from '@/utils/format';

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
 * Product checkout. Reached from the "Buy Now" button on a product detail page
 * (carries `id` = product, `qty` = quantity). The buyer confirms the order,
 * enters delivery + contact details, and pays by card (Stripe) or cash on
 * delivery. A card charge is taken first so a decline never records an order;
 * on success a confirmation screen with the order reference is shown.
 */
export default function ProductCheckoutScreen() {
  const { id, qty } = useLocalSearchParams<{ id: string; qty?: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: product, isLoading } = useProduct(id);
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();
  const { mutateAsync: payWithCard, isPending: isPaying } = usePayWithCard();

  const quantity = Math.max(1, Number(qty) || 1);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<OrderPaymentMethod>('cod');
  const [card, setCard] = useState<CardInput | null>(null);
  const [showCardErrors, setShowCardErrors] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  if (isLoading || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title: 'Checkout' }} />
        <ActivityIndicator color="#00a165" />
      </View>
    );
  }

  if (AUTH_GATING_ENABLED && !user) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Stack.Screen options={{ title: 'Checkout' }} />
        <Ionicons name="lock-closed-outline" size={40} color="#9aa7ac" />
        <Text className="text-center text-muted">Please sign in to complete your order.</Text>
        <Button label="Sign in" fullWidth onPress={() => router.replace('/(auth)/sign-in')} />
      </View>
    );
  }

  const currency = product.price.currency;
  const unit = product.price.amount;
  const total = unit * quantity;
  const image = product.images[0]?.url;
  const paymentLabel = payment === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery';

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const detailsValid =
    name.trim().length > 1 &&
    validEmail &&
    phone.trim().length >= 6 &&
    address.trim().length > 4 &&
    city.trim().length > 1;
  const canSubmit = detailsValid && (payment === 'cod' || card !== null);
  const busy = isPending || isPaying;

  const submit = async () => {
    setError(null);
    if (!detailsValid) {
      setError('Please add your name, a valid email, phone, delivery address and city.');
      return;
    }
    try {
      // Charge by card first (when chosen) so a decline never records an order.
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
          description: `Order · ${quantity} × ${product.title}`,
          metadata: { productId: product.id, quantity: String(quantity), customerEmail: email.trim() },
        });
        paymentReference = result.paymentIntentId;
      }
      const order = await placeOrder({
        productId: product.id,
        productTitle: product.title,
        quantity,
        unitPrice: unit,
        currency,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: address.trim(),
        city: city.trim(),
        paymentMethod: payment,
        paymentReference,
        notes: notes.trim() || undefined,
      });
      setReference(order.reference);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place your order. Please try again.');
    }
  };

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (reference) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow justify-center gap-6 p-6 pb-10"
      >
        <Stack.Screen options={{ title: 'Order confirmed', headerBackVisible: false }} />

        <View className="items-center gap-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-center font-display-x text-2xl text-ink">Order Placed!</Text>
            <Text className="text-center text-sm leading-6 text-muted">
              Thanks {name.split(' ')[0] || 'there'} — your order is confirmed. We&apos;ve emailed the
              details to {email.trim()}.
            </Text>
          </View>
          <View className="flex-row items-center gap-2 rounded-full bg-brand-50 px-4 py-2">
            <Ionicons name="receipt-outline" size={15} color="#037a4e" />
            <Text className="text-sm font-body-semibold text-brand-700">Order {reference}</Text>
          </View>
        </View>

        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="cube-outline" size={18} color="#037a4e" />
            <Text className="text-base font-semibold text-ink">Order Summary</Text>
          </View>
          <View className="h-px bg-hairline" />
          <SummaryRow icon="pricetag-outline" label="Item" value={product.title} />
          <SummaryRow icon="layers-outline" label="Quantity" value={`${quantity}`} />
          <SummaryRow icon="location-outline" label="Deliver to" value={`${address.trim()}, ${city.trim()}`} />
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
            {payment === 'card'
              ? 'Payment received. Your order will be prepared and shipped shortly.'
              : 'Please keep the exact amount ready — you pay on delivery.'}
          </Text>
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue shopping"
            onPress={() => router.replace('/(tabs)/shop')}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4"
          >
            <Ionicons name="bag-handle-outline" size={18} color="#ffffff" />
            <Text className="font-body-semibold text-base text-white">Continue shopping</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-12"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Stack.Screen options={{ title: 'Checkout' }} />

      {/* ── Order summary ─────────────────────────────────────────────── */}
      <Card className="flex-row gap-3 p-3">
        <View className="h-20 w-20 overflow-hidden rounded-2xl bg-brand-50">
          {image ? (
            <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="bag-handle-outline" size={28} color="#00a165" />
            </View>
          )}
        </View>
        <View className="flex-1 justify-center gap-1">
          {product.brand ? (
            <Text className="text-[11px] font-body-medium uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </Text>
          ) : null}
          <Text className="text-base font-display-semibold text-ink" numberOfLines={2}>
            {product.title}
          </Text>
          <View className="flex-row items-baseline gap-1.5">
            <Text className="font-display-x text-lg text-brand-600">{formatMoney(product.price)}</Text>
            <Text className="text-xs text-muted-foreground">× {quantity}</Text>
          </View>
        </View>
      </Card>

      {/* ── Delivery details ──────────────────────────────────────────── */}
      <Card className="gap-3">
        <SectionTitle>Delivery details</SectionTitle>
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
        <Input
          label="Delivery Address"
          placeholder="House, street, area"
          value={address}
          onChangeText={setAddress}
        />
        <Input label="City" placeholder="City" value={city} onChangeText={setCity} />
        <View className="gap-1.5">
          <Text className="text-sm font-body-medium text-ink">Order Notes (Optional)</Text>
          <TextInput
            placeholder="Any delivery instructions…"
            placeholderTextColor="#9aa7ac"
            multiline
            value={notes}
            onChangeText={setNotes}
            className="min-h-20 rounded-2xl border border-hairline bg-surface px-4 py-3 text-base text-ink"
            textAlignVertical="top"
          />
        </View>
      </Card>

      {/* ── Payment ───────────────────────────────────────────────────── */}
      <Card className="gap-4">
        <SectionTitle>Payment method</SectionTitle>
        <View className="flex-row gap-3">
          <PaymentMethodTile
            active={payment === 'card'}
            icon="card-outline"
            title="Credit/Debit Card"
            subtitle="Pay securely now."
            onPress={() => setPayment('card')}
          />
          <PaymentMethodTile
            active={payment === 'cod'}
            icon="cash-outline"
            title="Cash on Delivery"
            subtitle="Pay when it arrives."
            onPress={() => setPayment('cod')}
          />
        </View>

        {payment === 'cod' ? (
          <View className="flex-row items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#037a4e" />
            <Text className="flex-1 text-sm text-brand-700">
              Pay{' '}
              <Text className="font-semibold">{formatMoney({ amount: total, currency })}</Text> in cash
              to the courier when your order is delivered.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-sm text-muted">
              Pay{' '}
              <Text className="font-semibold text-ink">
                {formatMoney({ amount: total, currency })}
              </Text>{' '}
              securely by card to place your order now.
            </Text>
            <CardPaymentForm onChange={setCard} showAllErrors={showCardErrors} collapsible />
          </View>
        )}
      </Card>

      {/* ── Price summary + submit ────────────────────────────────────── */}
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            {formatMoney(product.price)} × {quantity} {quantity === 1 ? 'item' : 'items'}
          </Text>
          <Text className="text-sm font-semibold text-ink">
            {formatMoney({ amount: total, currency })}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">Delivery</Text>
          <Text className="text-sm font-semibold text-success">Free</Text>
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
          accessibilityLabel={payment === 'card' ? 'Pay and place order' : 'Place order'}
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
                name={payment === 'card' ? 'card-outline' : 'bag-check-outline'}
                size={18}
                color="#ffffff"
              />
              <Text className="font-body-semibold text-base text-white">
                {payment === 'card'
                  ? `Pay ${formatMoney({ amount: total, currency })}`
                  : 'Place Order'}
              </Text>
            </>
          )}
        </Pressable>

        <Text className="text-center text-xs text-muted-foreground">
          {payment === 'card'
            ? 'Your card is charged securely via Stripe to place this order.'
            : "You won't be charged now — pay in cash when your order arrives."}
        </Text>
      </Card>
    </ScrollView>
  );
}

/**
 * Selectable payment-method tile — mirrors the shared pattern used by the tour
 * and hotel booking flows (whole card highlights when active; constant
 * `border-2` so selection never shifts layout).
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
          className={['flex-1 text-sm font-semibold', active ? 'text-brand-700' : 'text-ink'].join(' ')}
        >
          {title}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">{subtitle}</Text>
    </Pressable>
  );
}
