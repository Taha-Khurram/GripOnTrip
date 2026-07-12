import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

interface Perk {
  icon: IconName;
  /** Tinted badge background class + matching icon color. */
  badge: string;
  color: string;
  title: string;
  description: string;
}

// The four guide value props, mirroring the BNB feature strip.
const PERKS: Perk[] = [
  {
    icon: 'shield-checkmark',
    badge: 'bg-teal-50',
    color: '#00a165',
    title: 'Verified Experts',
    description: 'Every guide is vetted for credentials and genuine local knowledge.',
  },
  {
    icon: 'lock-closed',
    badge: 'bg-accent-50',
    color: '#e08d0e',
    title: 'Secure Booking',
    description: 'Protected payments with instant booking confirmation.',
  },
  {
    icon: 'compass',
    badge: 'bg-brand-50',
    color: '#1e3a5f',
    title: 'Local Insight',
    description: 'Authentic cultural and hiking experiences off the beaten path.',
  },
  {
    icon: 'call',
    badge: 'bg-teal-50',
    color: '#00a165',
    title: '24/7 Support',
    description: 'On-demand help before and during your trip.',
  },
];

/**
 * Guides value-prop grid — the guide equivalent of the BNB `RentalPerks` strip,
 * reusing the same card language: a centered header plus a 2×2 grid of white
 * cards with tinted icon badges.
 */
export function GuidePerks() {
  const rows = [PERKS.slice(0, 2), PERKS.slice(2, 4)];

  return (
    <View className="gap-5">
      <View className="items-center gap-2 px-6">
        <Text className="text-[11px] font-body-semibold uppercase tracking-[2px] text-teal-800">
          Why Book With Us
        </Text>
        <Text className="text-center font-display-x text-[24px] leading-8 text-ink">
          Guided by Local Experts
        </Text>
      </View>

      <View className="gap-3 px-5">
        {rows.map((row, r) => (
          <View key={r} className="flex-row gap-3">
            {row.map((p) => (
              <View
                key={p.title}
                className="flex-1 gap-3 rounded-3xl border border-hairline bg-surface p-4 shadow-card"
              >
                <View
                  className={['h-12 w-12 items-center justify-center rounded-2xl', p.badge].join(' ')}
                >
                  <Ionicons name={p.icon} size={24} color={p.color} />
                </View>
                <View className="gap-1.5">
                  <Text className="font-display-semibold text-[15px] leading-5 text-ink">
                    {p.title}
                  </Text>
                  <Text className="text-[12.5px] leading-[18px] text-muted">{p.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
