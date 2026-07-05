import { Stack } from 'expo-router';

import { ComingSoon } from '@/components/layout/ComingSoon';

export default function TripPlannerScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'AI Trip Planner' }} />
      <ComingSoon
        title="AI Trip Planner"
        icon="sparkles"
        note="Collect trip preferences and call POST /trip-planner/generate to build an itinerary."
      />
    </>
  );
}
