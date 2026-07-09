import { useMutation } from '@tanstack/react-query';

import { generateItinerary } from './api';
import type { TripItinerary, TripPreferences } from './types';

/**
 * Generates an itinerary from trip preferences. A mutation (not a query) because
 * it's a user-triggered, side-effecting AI call; the result lives in component
 * state, matching the ephemeral pattern used by the assistant chat.
 */
export function useGenerateItinerary() {
  return useMutation<TripItinerary, Error, TripPreferences>({
    mutationFn: generateItinerary,
  });
}
