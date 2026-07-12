import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

/** How the guest intends to pay for a hotel booking. */
export type PaymentMode = 'online' | 'property';

/**
 * A selectable payment-method tile. There's no radio dot — the whole card
 * highlights (brand border + tinted fill) when active. Shared between the hotel
 * detail page's reservation summary and the full booking screen so both read
 * identically. Border width is constant (`border-2`) so selecting never shifts layout.
 */
export function PaymentOption({
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
        {/* `flex-1` lets the title wrap instead of overflowing the half-width card. */}
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
