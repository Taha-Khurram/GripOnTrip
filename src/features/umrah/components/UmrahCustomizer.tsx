import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Card, Select, Toggle } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import {
  HOTEL_TIERS,
  MADINAH_NIGHT_OPTIONS,
  MAKKAH_NIGHT_OPTIONS,
  MEAL_OPTIONS,
  TRANSPORT_OPTIONS,
} from '../pricing';
import type { CustomUmrahConfig } from '../types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-1 gap-1.5">
      <Text className="text-xs font-body-semibold uppercase tracking-wide text-muted">{label}</Text>
      {children}
    </View>
  );
}

/**
 * Bespoke Umrah Package Customizer. A controlled card: it owns no state — the
 * parent holds the {@link CustomUmrahConfig} and re-renders with the live
 * per-pilgrim `price` (from `computeCustomPrice`).
 */
export function UmrahCustomizer({
  config,
  price,
  onChange,
  onBack,
}: {
  config: CustomUmrahConfig;
  price: number;
  onChange: (config: CustomUmrahConfig) => void;
  onBack: () => void;
}) {
  const set = <K extends keyof CustomUmrahConfig>(key: K, value: CustomUmrahConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
          <Ionicons name="compass" size={20} color="#156473" />
        </View>
        <Text className="flex-1 text-lg font-display text-ink">Package Customizer</Text>
      </View>
      <View className="h-px bg-hairline" />

      {/* Nights */}
      <View className="flex-row gap-3">
        <Field label="Nights in Makkah">
          <Select
            value={config.makkahNights}
            options={MAKKAH_NIGHT_OPTIONS}
            onChange={(v) => set('makkahNights', v)}
          />
        </Field>
        <Field label="Nights in Madinah">
          <Select
            value={config.madinahNights}
            options={MADINAH_NIGHT_OPTIONS}
            onChange={(v) => set('madinahNights', v)}
          />
        </Field>
      </View>

      {/* Hotel + transport */}
      <Field label="Hotel Accommodation Tier">
        <Select
          value={config.hotelTier}
          options={HOTEL_TIERS}
          onChange={(v) => set('hotelTier', v)}
        />
      </Field>
      <Field label="Ground Transport Upgrade">
        <Select
          value={config.transport}
          options={TRANSPORT_OPTIONS}
          onChange={(v) => set('transport', v)}
        />
      </Field>

      {/* Meals */}
      <Field label="Meal Plan Option">
        <Select value={config.meals} options={MEAL_OPTIONS} onChange={(v) => set('meals', v)} />
      </Field>

      {/* Toggles */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Toggle
            value={config.visaAssistance}
            onChange={(v) => set('visaAssistance', v)}
            label={`Visa Processing Assistance${config.visaAssistance ? '' : ' (Disabled)'}`}
          />
        </View>
        <View className="flex-1">
          <Toggle
            value={config.ziyarat}
            onChange={(v) => set('ziyarat', v)}
            label="Holy Ziyarats Tours"
          />
        </View>
      </View>

      {/* Info */}
      <View className="flex-row items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3">
        <Ionicons name="information-circle" size={18} color="#156473" />
        <Text className="flex-1 text-sm leading-5 text-brand-700">
          You have selected customized stays. Makkah hotel choice will be in the closest front row
          for 5-star, and within 300m for 4-star properties. Flights are added at final checkout if
          requested.
        </Text>
      </View>

      <View className="h-px bg-hairline" />

      {/* Footer: back + price */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          className="rounded-2xl border border-hairline px-4 py-2.5"
        >
          <Text className="text-sm font-body-semibold text-muted">Back to Standard Packages</Text>
        </Pressable>
        <View className="items-end">
          <Text className="text-xs text-muted-foreground">Est. Custom Price (Per Person)</Text>
          <Text className="font-display-x text-2xl text-brand-600">
            {formatMoney({ amount: price, currency: 'PKR' })}
          </Text>
        </View>
      </View>
    </Card>
  );
}
