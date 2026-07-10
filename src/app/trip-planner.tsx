import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Animated, Button, enterUp, PressableScale, SunCTA } from '@/components/ui';

// The AI Trip Planner UI (form + itinerary) is built and lives in
// `@/features/trip-planner`, but its backend (`POST /api/plan-trip`) is not yet
// live, so the screen shows a "coming soon" state instead of the form. Re-enable
// by restoring the form/itinerary flow from git history once the endpoint ships.
export default function TripPlannerScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <Hero onBack={() => router.back()} />

        <View className="gap-6 px-5 pt-8">
          <ComingSoon onExplore={() => router.back()} />
        </View>
      </ScrollView>
    </>
  );
}

/** "Coming soon" placeholder shown until the AI planner backend is live. */
function ComingSoon({ onExplore }: { onExplore: () => void }) {
  return (
    <Animated.View entering={enterUp(1)} className="items-center gap-5 py-8">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-accent-50">
        <Ionicons name="sparkles" size={36} color="#f39024" />
      </View>

      <View className="items-center gap-2">
        <View className="rounded-full bg-accent-100 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-accent-700">
            Coming soon
          </Text>
        </View>
        <Text className="text-center font-display-x text-[26px] leading-8 text-ink">
          AI Trip Planner
        </Text>
        <Text className="max-w-[320px] text-center text-[15px] leading-6 text-muted">
          We&apos;re putting the finishing touches on your personal AI trip planner.
          Soon you&apos;ll get a tailored day-by-day itinerary in seconds — check back
          shortly.
        </Text>
      </View>

      <Button label="Explore Grip On Trip" fullWidth onPress={onExplore} />
    </Animated.View>
  );
}

/** Sun-gradient hero header — mirrors the home AI Trip Planner CTA on a white page. */
function Hero({ onBack }: { onBack: () => void }) {
  return (
    <Animated.View entering={enterUp(0)}>
      <SunCTA className="rounded-b-[32px] px-5 pb-8 pt-14 shadow-glow">
        <PressableScale
          onPress={onBack}
          activeScale={0.9}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </PressableScale>

        <View className="mt-6 h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
          <Ionicons name="sparkles" size={28} color="#fff" />
        </View>

        <Text className="mt-4 font-display-x text-[30px] leading-9 text-white">AI Trip Planner</Text>
        <Text className="mt-2 max-w-[300px] text-[15px] leading-6 text-white/90">
          Personalized day-by-day itineraries, crafted just for you — arriving soon.
        </Text>
      </SunCTA>
    </Animated.View>
  );
}
