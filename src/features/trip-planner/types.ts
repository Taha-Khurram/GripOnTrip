/**
 * Types for the AI Trip Planner — the mobile counterpart of the web planner that
 * collects a few trip preferences and calls `POST /trip-planner/generate` to
 * build a day-by-day itinerary.
 *
 * The generate endpoint is AI-backed, so its response shape isn't perfectly
 * stable. `api.ts` normalizes whatever comes back into {@link TripItinerary},
 * always falling back to the raw markdown so nothing the model returns is lost.
 */

/** How much the traveller wants to spend, matching the web planner's presets. */
export type TripBudget = 'budget' | 'moderate' | 'luxury';

/** How densely to pack each day. */
export type TripPace = 'relaxed' | 'balanced' | 'packed';

/** Preferences collected from the form and sent to `POST /trip-planner/generate`. */
export interface TripPreferences {
  destination: string;
  /** ISO `YYYY-MM-DD`. */
  startDate: string;
  /** ISO `YYYY-MM-DD`. */
  endDate: string;
  travelers: number;
  budget: TripBudget;
  pace: TripPace;
  /** Free-form interest tags, e.g. "Food", "History", "Nature". */
  interests: string[];
  /** Anything else the traveller wants the planner to know. */
  notes?: string;
}

/** A single thing to do, within an {@link ItineraryDay}. */
export interface ItineraryActivity {
  /** e.g. "09:00" or "Morning". Optional — not every activity is time-boxed. */
  time?: string;
  title: string;
  description?: string;
  /** e.g. "Food", "Sightseeing" — used for the leading icon/tint. */
  category?: string;
  /** Rough cost estimate, when the model provides one. */
  cost?: string;
}

/** One day of the trip. */
export interface ItineraryDay {
  /** 1-based day number. */
  day: number;
  /** ISO `YYYY-MM-DD`, when known. */
  date?: string;
  title?: string;
  activities: ItineraryActivity[];
}

/** Normalized itinerary the UI renders. */
export interface TripItinerary {
  title: string;
  summary?: string;
  days: ItineraryDay[];
  /** Raw markdown the model returned, kept as a fallback / "show original" view. */
  markdown: string;
}

/** Selectable interest chips shown on the form. */
export const INTEREST_OPTIONS = [
  'Food',
  'History',
  'Nature',
  'Adventure',
  'Culture',
  'Nightlife',
  'Shopping',
  'Relaxation',
  'Family',
  'Religious',
] as const;

export const BUDGET_OPTIONS: { value: TripBudget; label: string; icon: string }[] = [
  { value: 'budget', label: 'Budget', icon: 'wallet-outline' },
  { value: 'moderate', label: 'Moderate', icon: 'card-outline' },
  { value: 'luxury', label: 'Luxury', icon: 'diamond-outline' },
];

export const PACE_OPTIONS: { value: TripPace; label: string; icon: string }[] = [
  { value: 'relaxed', label: 'Relaxed', icon: 'cafe-outline' },
  { value: 'balanced', label: 'Balanced', icon: 'walk-outline' },
  { value: 'packed', label: 'Packed', icon: 'flash-outline' },
];
