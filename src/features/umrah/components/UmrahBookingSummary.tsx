import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { formatMoney } from '@/utils/format';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-body-semibold text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Assurance({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name="shield-checkmark" size={15} color="#156473" />
      <Text className="flex-1 text-xs text-brand-700">{label}</Text>
    </View>
  );
}

/** Booking Summary card — the running totals + trust cues shown alongside the form. */
export function UmrahBookingSummary({
  packageChoice,
  departureCity,
  departureMonth,
  makkahNights,
  madinahNights,
  hotelTierLabel,
  pilgrims,
  total,
  isCustom,
}: {
  packageChoice: string;
  departureCity: string;
  departureMonth: string;
  makkahNights?: number;
  madinahNights?: number;
  hotelTierLabel?: string;
  pilgrims: number;
  total: number;
  isCustom: boolean;
}) {
  const monthLabel = departureMonth.split(' ')[0] || departureMonth;

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <Text className="text-lg font-display text-ink">Booking Summary</Text>
        <View className="h-px flex-1 bg-hairline" />
      </View>

      <View className="gap-1">
        <Text className="text-xs font-body-semibold uppercase tracking-wide text-muted">
          Package Choice
        </Text>
        <Text className="text-base font-display-semibold text-ink">{packageChoice}</Text>
      </View>

      <View className="flex-row gap-6">
        <View className="gap-1">
          <Text className="text-xs font-body-semibold uppercase tracking-wide text-muted">
            Departing From
          </Text>
          <Text className="text-base font-body-semibold text-ink">{departureCity || '—'}</Text>
        </View>
        <View className="gap-1">
          <Text className="text-xs font-body-semibold uppercase tracking-wide text-muted">
            Departure Month
          </Text>
          <Text className="text-base font-body-semibold text-ink">{monthLabel}</Text>
        </View>
      </View>

      <View className="h-px bg-hairline" />

      {isCustom ? (
        <View className="gap-2">
          {makkahNights != null ? (
            <Row label="Custom Makkah Nights" value={`${makkahNights} Nights`} />
          ) : null}
          {madinahNights != null ? (
            <Row label="Custom Madinah Nights" value={`${madinahNights} Nights`} />
          ) : null}
          {hotelTierLabel ? <Row label="Hotel Accommodation" value={hotelTierLabel} /> : null}
        </View>
      ) : (
        <View className="gap-2">
          {makkahNights != null && madinahNights != null ? (
            <Row label="Total Nights" value={`${makkahNights + madinahNights} Nights`} />
          ) : null}
          {hotelTierLabel ? <Row label="Accommodation" value={hotelTierLabel} /> : null}
        </View>
      )}

      <View className="h-px bg-hairline" />

      <View className="gap-1">
        <Text className="text-xs font-body-semibold uppercase tracking-wide text-muted">
          Total Price ({pilgrims} {pilgrims === 1 ? 'Pilgrim' : 'Pilgrims'})
        </Text>
        <Text className="font-display-x text-3xl text-brand-600">
          {formatMoney({ amount: total, currency: 'PKR' })}
        </Text>
      </View>
      <Text className="-mt-2 text-xs leading-4 text-muted-foreground">
        * Starting price estimate. Final price may vary based on customization and travel options.
      </Text>

      <View className="gap-2 rounded-2xl bg-brand-50 p-4">
        <Assurance label="Ministry of Hajj & Umrah Compliant" />
        <Assurance label="Secure 256-Bit SSL Booking" />
        <Assurance label="Free Cancellation within 48 Hours" />
      </View>
    </Card>
  );
}
