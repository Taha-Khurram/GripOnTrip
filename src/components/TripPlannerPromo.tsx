import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { DeepPanel, PressableScale } from '@/components/ui';

// Sample itinerary shown in the frosted preview — real Hunza highlights, mirroring
// the website's "My Dream Trip" showcase card.
const SAMPLE_DAYS = [
  { place: 'Exploring Attabad Lake' },
  { place: 'Exploring Passu Cones' },
  { place: 'Exploring Khunjerab Pass' },
];

/**
 * AI Trip Planner showcase — the mobile translation of the website's
 * "Design Your Perfect Journey" section: navy hero card with the pitch copy and
 * a frosted-glass sample-itinerary preview, ending in a gold CTA into the planner.
 */
export function TripPlannerPromo() {
  return (
    <DeepPanel className="gap-5 rounded-[28px] p-5 shadow-soft">
      {/* Copy */}
      <View className="gap-3">
        <View className="flex-row items-center gap-1.5 self-start rounded-full bg-white/10 px-3 py-1.5">
          <Ionicons name="sparkles" size={13} color="#f5a623" />
          <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-accent-400">
            AI Trip Planner
          </Text>
        </View>
        <Text className="font-display-x text-[24px] leading-7 text-white">
          Design Your Perfect Journey
        </Text>
        <Text className="text-[14px] leading-6 text-white/80">
          Tell us your preferences and we&apos;ll craft a personalized itinerary — from flights to
          hidden gems, we handle it all.
        </Text>
      </View>

      {/* Frosted-glass itinerary preview */}
      <View className="gap-2.5 rounded-3xl border border-white/10 bg-white/10 p-4">
        <View className="flex-row items-center gap-3 pb-1">
          <View className="h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
            <Ionicons name="map" size={20} color="#f5a623" />
          </View>
          <View className="flex-1">
            <Text className="font-display-semibold text-[15px] text-white">My Dream Trip to Hunza</Text>
            <Text className="text-[12px] text-white/70">7 Days • 2 Travelers</Text>
          </View>
        </View>

        {SAMPLE_DAYS.map((d, i) => (
          <View key={d.place} className="flex-row items-center gap-3 rounded-2xl bg-white/5 p-3">
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <Text className="font-display-semibold text-[13px] text-accent-400">{i + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-body-semibold text-[14px] text-white">Day {i + 1}</Text>
              <Text className="text-[12px] text-white/70">{d.place}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View className="flex-row">
        <Link href="/trip-planner" asChild>
          <PressableScale accessibilityRole="button" activeScale={0.95}>
            <View className="flex-row items-center gap-2 rounded-full bg-accent-500 px-5 py-3 shadow-glow">
              <Text className="font-body-semibold text-[14px] text-ink">Start Planning Free</Text>
              <Ionicons name="arrow-forward" size={16} color="#0a1a2f" />
            </View>
          </PressableScale>
        </Link>
      </View>
    </DeepPanel>
  );
}
