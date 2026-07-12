import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

interface Feature {
  icon: IconName;
  /** Tinted badge background class + matching icon color. */
  badge: string;
  color: string;
  title: string;
  description: string;
}

// The four brand pillars, mirroring the website's "Built for Modern Travelers"
// section. Icon badges use the app palette: navy, gold and Medium Spring Green.
const FEATURES: Feature[] = [
  {
    icon: 'globe-outline',
    badge: 'bg-brand-50',
    color: '#1e3a5f',
    title: 'All in One Platform',
    description: 'Hotels, rentals, guides, Umrah and shopping — everything you need to travel, in one app.',
  },
  {
    icon: 'sparkles',
    badge: 'bg-accent-50',
    color: '#e08d0e',
    title: 'AI Trip Planner',
    description: 'Smart, personalized itineraries and recommendations powered by AI in seconds.',
  },
  {
    icon: 'shield-checkmark',
    badge: 'bg-teal-50',
    color: '#00a165',
    title: 'Verified & Secure',
    description: 'Every listing is verified. Your payments and data are protected by enterprise-grade security.',
  },
  {
    icon: 'headset-outline',
    badge: 'bg-brand-50',
    color: '#1e3a5f',
    title: '24/7 Support',
    description: 'Real-time assistance from our travel experts, whenever you need it.',
  },
];

/**
 * "Built for Modern Travelers" — the value-prop grid. A centered header plus a
 * 2×2 grid of white feature cards with tinted icon badges, matching the website
 * section and the app's card design language.
 */
export function WhyGripOnTrip() {
  // Render in rows of two so each card is a reliable half-width flex child
  // (flex-1 splits the row evenly and equalizes height — a real 2×2 grid).
  const rows = [FEATURES.slice(0, 2), FEATURES.slice(2, 4)];

  return (
    <View className="gap-5">
      <View className="items-center gap-2 px-6">
        <Text className="text-[11px] font-body-semibold uppercase tracking-[2px] text-teal-800">
          Why Grip On Trip
        </Text>
        <Text className="text-center font-display-x text-[26px] leading-8 text-ink">
          Built for Modern Travelers
        </Text>
        <Text className="text-center text-[14px] leading-6 text-muted">
          AI-powered tools, zero commission pricing, verified providers, and 24/7 support in one
          seamless platform.
        </Text>
      </View>

      <View className="gap-3 px-5">
        {rows.map((row, r) => (
          <View key={r} className="flex-row gap-3">
            {row.map((f) => (
              <View
                key={f.title}
                className="flex-1 gap-3 rounded-3xl border border-hairline bg-surface p-4 shadow-card"
              >
                <View
                  className={['h-12 w-12 items-center justify-center rounded-2xl', f.badge].join(' ')}
                >
                  <Ionicons name={f.icon} size={24} color={f.color} />
                </View>
                <View className="gap-1.5">
                  <Text className="font-display-semibold text-[15px] leading-5 text-ink">
                    {f.title}
                  </Text>
                  <Text className="text-[12.5px] leading-[18px] text-muted">{f.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
