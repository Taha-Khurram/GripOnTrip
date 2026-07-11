import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import type { UmrahPackage } from '../types';

/**
 * "Choose your journey" card. Lets the traveller pick one of the operator's
 * ready-made packages or switch to the bespoke customizer. Selection uses a
 * constant `border-2` so highlighting never shifts layout (same convention as
 * the payment tiles in the tour/hotel booking flows).
 */
export function PackagePicker({
  packages,
  selectedId,
  customActive,
  onSelect,
  onCustom,
}: {
  packages: UmrahPackage[];
  selectedId?: string;
  customActive: boolean;
  onSelect: (id: string) => void;
  onCustom: () => void;
}) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <Text className="text-lg font-display text-ink">Choose your package</Text>
        <View className="h-px flex-1 bg-hairline" />
      </View>
      <Text className="-mt-1 text-sm text-muted">
        Select a ready-made package or build your own bespoke journey.
      </Text>

      {packages.map((pkg) => {
        const active = !customActive && pkg.id === selectedId;
        const nights = pkg.makkahNights + pkg.madinahNights;
        return (
          <Pressable
            key={pkg.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(pkg.id)}
            className={[
              'flex-row items-center gap-3 rounded-2xl border-2 p-3.5',
              active ? 'border-brand-500 bg-brand-50' : 'border-hairline bg-surface',
            ].join(' ')}
          >
            <View
              className={[
                'h-10 w-10 items-center justify-center rounded-full',
                active ? 'bg-brand-500' : 'bg-brand-50',
              ].join(' ')}
            >
              <Ionicons name="moon" size={18} color={active ? '#ffffff' : '#156473'} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-body-semibold text-ink" numberOfLines={1}>
                {pkg.packageName}
              </Text>
              <Text className="text-xs text-muted" numberOfLines={1}>
                {pkg.title}
                {nights > 0 ? ` · ${nights} nights` : ''}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-display-x text-brand-600">
                {formatMoney(pkg.price)}
              </Text>
              <Text className="text-xs text-muted-foreground">/ person</Text>
            </View>
            {active ? (
              <Ionicons name="checkmark-circle" size={20} color="#1a7a8c" />
            ) : (
              <Ionicons name="ellipse-outline" size={20} color="#d9ccb2" />
            )}
          </Pressable>
        );
      })}

      {/* Bespoke option */}
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: customActive }}
        onPress={onCustom}
        className={[
          'flex-row items-center gap-3 rounded-2xl border-2 border-dashed p-3.5',
          customActive ? 'border-accent-500 bg-accent-50' : 'border-hairline bg-surface',
        ].join(' ')}
      >
        <View
          className={[
            'h-10 w-10 items-center justify-center rounded-full',
            customActive ? 'bg-accent-500' : 'bg-accent-50',
          ].join(' ')}
        >
          <Ionicons name="construct-outline" size={18} color={customActive ? '#ffffff' : '#f39024'} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-body-semibold text-ink">Build a Custom Package</Text>
          <Text className="text-xs text-muted">Tailor nights, hotels, transport & meals.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9aa7ac" />
      </Pressable>
    </Card>
  );
}
