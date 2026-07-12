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

// The four Umrah value props, mirroring the hero's promise (visa, Haram-front
// stays, Shariah compliance, VIP logistics).
const PERKS: Perk[] = [
  {
    icon: 'document-text',
    badge: 'bg-teal-50',
    color: '#00a165',
    title: 'Visa Processing',
    description: 'End-to-end visa handling with full document support.',
  },
  {
    icon: 'bed',
    badge: 'bg-accent-50',
    color: '#e08d0e',
    title: 'Haram-Front Stays',
    description: 'Luxury hotels steps from the Haram in Makkah & Madinah.',
  },
  {
    icon: 'shield-checkmark',
    badge: 'bg-brand-50',
    color: '#1e3a5f',
    title: 'Shariah-Compliant',
    description: 'Every journey is verified and fully Shariah-compliant.',
  },
  {
    icon: 'car-sport',
    badge: 'bg-teal-50',
    color: '#00a165',
    title: 'VIP Logistics',
    description: 'Private transfers and 24/7 on-ground support throughout.',
  },
];

/**
 * Umrah value-prop grid — the mobile translation of the website's assurance
 * strip, reusing the home `WhyGripOnTrip` card language: a centered header plus a
 * 2×2 grid of white cards with tinted icon badges.
 */
export function UmrahPerks() {
  const rows = [PERKS.slice(0, 2), PERKS.slice(2, 4)];

  return (
    <View className="gap-5">
      <View className="items-center gap-2 px-6">
        <Text className="text-[11px] font-body-semibold uppercase tracking-[2px] text-teal-800">
          Why Pilgrims Choose Us
        </Text>
        <Text className="text-center font-display-x text-[24px] leading-8 text-ink">
          Travel With Absolute Peace of Mind
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
