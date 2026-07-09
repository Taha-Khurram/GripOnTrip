import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Animated, Button, enterUp, PressableScale, SunCTA } from '@/components/ui';
import {
  ItineraryView,
  TripPlannerForm,
  useGenerateItinerary,
  type TripItinerary,
  type TripPlannerFormHandle,
  type TripPreferences,
} from '@/features/trip-planner';

export default function TripPlannerScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const formRef = useRef<TripPlannerFormHandle>(null);
  const { mutate, isPending } = useGenerateItinerary();
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = (prefs: TripPreferences) => {
    setError(null);
    mutate(prefs, {
      onSuccess: (result) => {
        setItinerary(result);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      },
      onError: (e) =>
        setError(e instanceof Error ? e.message : 'Could not build your itinerary. Please try again.'),
    });
  };

  const reset = () => {
    setItinerary(null);
    setError(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-white"
        contentContainerClassName="pb-16"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Hero onBack={() => router.back()} />

        <View className="gap-6 px-5 pt-6">
          {itinerary ? (
            <>
              <ItineraryView itinerary={itinerary} />
              <Button label="Plan another trip" variant="outline" fullWidth onPress={reset} />
            </>
          ) : (
            <>
              {error ? (
                <Animated.View
                  entering={enterUp(0)}
                  className="flex-row items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5"
                >
                  <Ionicons name="alert-circle" size={18} color="#dc2626" />
                  <Text className="flex-1 text-sm leading-5 text-danger">{error}</Text>
                </Animated.View>
              ) : null}

              <TripPlannerForm ref={formRef} onSubmit={generate} />

              {/* Generate button — plain, self-contained, always visible at the end of the form.
                  The colored background lives on an inner View so it always paints, regardless
                  of how Pressable's own style is handled on the device. */}
              <Pressable
                accessibilityRole="button"
                disabled={isPending}
                onPress={() => formRef.current?.submit()}
                style={{ opacity: isPending ? 0.6 : 1 }}
              >
                <View
                  style={{
                    backgroundColor: '#f39024',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    gap: 7,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 22,
                  }}
                >
                  {isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={16} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                        Generate itinerary
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </>
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
          Tell us a few details and we&apos;ll craft a personalized day-by-day itinerary in seconds.
        </Text>
      </SunCTA>
    </Animated.View>
  );
}
