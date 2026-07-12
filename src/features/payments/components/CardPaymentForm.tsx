import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  brandLabel,
  cardNumberError,
  cvcError,
  cvcLength,
  detectBrand,
  expiryError,
  formatCardNumber,
  formatExpiry,
  isCardValid,
  nameError,
  onlyDigits,
  toCardInput,
  type CardFormValues,
} from '../validation';
import type { CardInput } from '../types';

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

/** Labeled field wrapper matching the shared Input look (label + error line). */
function Field({ label, error, children }: FieldProps) {
  return (
    <View className="w-full gap-1.5">
      <Text className="text-sm font-body-medium text-ink">{label}</Text>
      {children}
      {error ? <Text className="text-xs text-danger">{error}</Text> : null}
    </View>
  );
}

const inputBase = 'rounded-2xl border bg-surface px-4 py-3.5 text-base text-ink';

function borderFor(hasError: boolean, focused: boolean) {
  if (hasError) return 'border-danger';
  if (focused) return 'border-brand-500';
  return 'border-hairline';
}

type FieldKey = 'number' | 'expiry' | 'cvc' | 'name';

export interface CardPaymentFormProps {
  /**
   * Called on every change with the normalized card when *all* fields are valid,
   * or `null` otherwise. Gate your "Pay" button on a non-null value.
   */
  onChange: (card: CardInput | null) => void;
  /**
   * Bump this counter (e.g. on a failed submit attempt) to reveal errors on all
   * fields at once, even ones the user hasn't touched yet.
   */
  showAllErrors?: number;
  /**
   * When true, the card fields stay hidden behind an "Initialize Card Payment
   * Form" button until the user taps it. While collapsed, no card is emitted
   * (so the Pay button stays disabled). Defaults to false (fields shown inline).
   */
  collapsible?: boolean;
}

/**
 * Self-contained, fully-validated card entry: number (brand detection + Luhn),
 * expiry (MM/YY, not past), CVC (length by brand), and cardholder name. Errors
 * show once a field is blurred (or when `showAllErrors` is bumped). Emits the
 * normalized `CardInput` up via `onChange` only when everything is valid.
 *
 * The raw card number is never stored anywhere but this component's local state;
 * it leaves the app only as a Stripe token (see api.ts).
 */
export function CardPaymentForm({
  onChange,
  showAllErrors = 0,
  collapsible = false,
}: CardPaymentFormProps) {
  const now = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(!collapsible);
  const [values, setValues] = useState<CardFormValues>({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    number: false,
    expiry: false,
    cvc: false,
    name: false,
  });
  const [focused, setFocused] = useState<FieldKey | null>(null);

  // Update a field and emit the normalized card (or null) straight from the
  // handler — no effect needed. `onChange` is a stable state setter in callers.
  const change = (next: CardFormValues) => {
    setValues(next);
    onChange(isCardValid(next, now) ? toCardInput(next) : null);
  };

  // A failed submit attempt (parent bumps `showAllErrors`) forces every error to
  // show even on fields the user hasn't blurred yet.
  const forceShow = showAllErrors > 0;
  const reveal = (key: FieldKey) => touched[key] || forceShow;

  const brand = detectBrand(values.number);
  const numberErr = reveal('number') ? cardNumberError(values.number) : undefined;
  const expiryErr = reveal('expiry') ? expiryError(values.expiry, now) : undefined;
  const cvcErr = reveal('cvc') ? cvcError(values.cvc, values.number) : undefined;
  const nameErr = reveal('name') ? nameError(values.name) : undefined;

  const markTouched = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));

  // Collapsed state: keep the card fields hidden behind a deliberate tap so the
  // user reviews the price/details first. Nothing is emitted while collapsed.
  if (collapsible && !open) {
    return (
      <View className="items-center gap-3 rounded-2xl border border-dashed border-hairline bg-surface-sunk/50 p-5">
        <Text className="text-center text-sm text-muted">
          Review the details, then initialize the secure card payment form.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Initialize card payment form"
          onPress={() => setOpen(true)}
          className="flex-row items-center gap-2 rounded-2xl border border-brand-500 bg-transparent px-5 py-3"
        >
          <Ionicons name="lock-closed-outline" size={16} color="#037a4e" />
          <Text className="font-body-semibold text-sm text-brand-700">
            Initialize Card Payment Form
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {/* Cardholder name */}
      <Field label="Cardholder Name" error={nameErr}>
        <TextInput
          placeholder="Name on card"
          placeholderTextColor="#9aa7ac"
          autoCapitalize="words"
          autoComplete="cc-name"
          textContentType="creditCardName"
          value={values.name}
          onChangeText={(t) => change({ ...values, name: t })}
          onFocus={() => setFocused('name')}
          onBlur={() => {
            setFocused(null);
            markTouched('name');
          }}
          className={[inputBase, borderFor(!!nameErr, focused === 'name')].join(' ')}
        />
      </Field>

      {/* Card number + brand chip */}
      <Field label="Card Number" error={numberErr}>
        <View className="relative justify-center">
          <TextInput
            placeholder="1234 5678 9012 3456"
            placeholderTextColor="#9aa7ac"
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="cc-number"
            textContentType="creditCardNumber"
            value={formatCardNumber(values.number)}
            onChangeText={(t) => change({ ...values, number: onlyDigits(t) })}
            onFocus={() => setFocused('number')}
            onBlur={() => {
              setFocused(null);
              markTouched('number');
            }}
            className={[inputBase, 'pr-24', borderFor(!!numberErr, focused === 'number')].join(' ')}
          />
          {values.number.length >= 2 ? (
            <View className="absolute right-3 flex-row items-center gap-1 rounded-lg bg-brand-50 px-2 py-1">
              <Ionicons name="card" size={14} color="#037a4e" />
              <Text className="text-xs font-body-semibold text-brand-700">
                {brand === 'unknown' ? 'Card' : brandLabel(brand)}
              </Text>
            </View>
          ) : null}
        </View>
      </Field>

      {/* Expiry + CVC */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="Expiry (MM/YY)" error={expiryErr}>
            <TextInput
              placeholder="MM/YY"
              placeholderTextColor="#9aa7ac"
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={formatExpiry(values.expiry)}
              onChangeText={(t) => change({ ...values, expiry: onlyDigits(t).slice(0, 4) })}
              onFocus={() => setFocused('expiry')}
              onBlur={() => {
                setFocused(null);
                markTouched('expiry');
              }}
              maxLength={5}
              className={[inputBase, borderFor(!!expiryErr, focused === 'expiry')].join(' ')}
            />
          </Field>
        </View>
        <View className="flex-1">
          <Field label="CVC" error={cvcErr}>
            <TextInput
              placeholder={cvcLength(values.number) === 4 ? '1234' : '123'}
              placeholderTextColor="#9aa7ac"
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="cc-csc"
              textContentType="creditCardSecurityCode"
              secureTextEntry
              value={values.cvc}
              onChangeText={(t) =>
                change({ ...values, cvc: onlyDigits(t).slice(0, cvcLength(values.number)) })
              }
              onFocus={() => setFocused('cvc')}
              onBlur={() => {
                setFocused(null);
                markTouched('cvc');
              }}
              maxLength={4}
              className={[inputBase, borderFor(!!cvcErr, focused === 'cvc')].join(' ')}
            />
          </Field>
        </View>
      </View>

      {/* Trust note — mirrors the reassurance copy the old mock forms showed. */}
      <View className="flex-row items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3">
        <Ionicons name="lock-closed" size={16} color="#037a4e" />
        <Text className="flex-1 text-xs text-brand-700">
          Your card is encrypted and sent directly to Stripe. We never see or store your full card
          number.
        </Text>
      </View>
    </View>
  );
}
