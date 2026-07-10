import { apiPost } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { formatDate } from '@/utils/format';
import type {
  ItineraryActivity,
  ItineraryDay,
  TripBudget,
  TripItinerary,
  TripPreferences,
} from './types';

/**
 * The generate endpoint (`POST /api/plan-trip`, the same one the web `/plan-tour`
 * page calls) is AI-backed, so its response shape isn't guaranteed. The known
 * good shape is `{ itinerary: [{ day, title, timeline: [{ time, activity }] }] }`,
 * but we also accept:
 *   - `{ success, data: {...} }`  (the app's standard REST envelope)
 *   - `{ itinerary: {...} }` / `{ days: [...] }` / a bare array or object
 *   - `{ content: "..." }` / a bare markdown string
 * Whatever arrives, we keep the raw markdown so nothing is dropped on screen, and
 * when the call fails outright we fall back to a local outline — exactly how the
 * website behaves while its AI backend is unavailable.
 */
type RawGenerateResponse =
  | string
  | RawActivity[]
  | RawDay[]
  | {
      success?: boolean;
      error?: string;
      message?: string;
      data?: unknown;
      itinerary?: unknown;
      days?: unknown;
      title?: string;
      summary?: string;
      overview?: string;
      content?: string;
      markdown?: string;
    };

interface RawDay {
  day?: number;
  date?: string;
  title?: string;
  heading?: string;
  activities?: RawActivity[];
  items?: RawActivity[];
  /** The web `/api/plan-trip` shape. */
  timeline?: RawActivity[];
}

interface RawActivity {
  time?: string;
  title?: string;
  name?: string;
  /** The web `/api/plan-trip` shape: the activity text lives in `activity`. */
  activity?: string;
  description?: string;
  details?: string;
  category?: string;
  type?: string;
  cost?: string | number;
}

const DAY_MS = 86_400_000;

/** Map the app's budget presets to the web planner's labels. */
const BUDGET_LABEL: Record<TripBudget, string> = {
  budget: 'Economy',
  moderate: 'Standard',
  luxury: 'Luxury',
};

function coerceString(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'number') return String(value);
  return undefined;
}

/** Inclusive trip length in whole days; falls back to 3 when dates are unusable. */
function tripLengthDays(prefs: TripPreferences): number {
  const start = Date.parse(prefs.startDate);
  const end = Date.parse(prefs.endDate);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 3;
  return Math.round((end - start) / DAY_MS) + 1;
}

/** ISO date `offset` days after the trip start, when a start date is known. */
function dayDate(startDate: string | undefined, offset: number): string | undefined {
  if (!startDate) return undefined;
  const start = Date.parse(startDate);
  if (Number.isNaN(start)) return undefined;
  return new Date(start + offset * DAY_MS).toISOString().slice(0, 10);
}

/** Preferences → the request body the web `/api/plan-trip` endpoint expects. */
function toRequestBody(prefs: TripPreferences) {
  return {
    destination: prefs.destination,
    duration: `${tripLengthDays(prefs)} Days`,
    travelers: String(prefs.travelers),
    budget: BUDGET_LABEL[prefs.budget] ?? 'Standard',
    interests: prefs.interests,
    // Extra context the AI backend may use; the web form omits these but they are
    // harmless and let the model honour pace / free-form notes / exact dates.
    pace: prefs.pace,
    notes: prefs.notes,
    startDate: prefs.startDate,
    endDate: prefs.endDate,
  };
}

function mapActivity(raw: RawActivity): ItineraryActivity | null {
  const title = coerceString(raw.title ?? raw.name ?? raw.activity);
  if (!title) return null;
  return {
    time: coerceString(raw.time),
    title,
    description: coerceString(raw.description ?? raw.details),
    category: coerceString(raw.category ?? raw.type),
    cost: coerceString(raw.cost),
  };
}

function mapDay(raw: RawDay, index: number, prefs: TripPreferences): ItineraryDay {
  const activities = (raw.activities ?? raw.items ?? raw.timeline ?? [])
    .map(mapActivity)
    .filter((a): a is ItineraryActivity => a != null);
  const day = typeof raw.day === 'number' ? raw.day : index + 1;
  return {
    day,
    // Prefer a server-supplied date, otherwise derive one from the start date.
    date: coerceString(raw.date) ?? dayDate(prefs.startDate, day - 1),
    title: coerceString(raw.title ?? raw.heading),
    activities,
  };
}

/** Pull the day array out of the various envelopes the endpoint may return. */
function extractDays(raw: unknown): RawDay[] | undefined {
  if (Array.isArray(raw)) return raw as RawDay[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.itinerary)) return obj.itinerary as RawDay[];
    if (Array.isArray(obj.days)) return obj.days as RawDay[];
    if (obj.data && typeof obj.data === 'object') return extractDays(obj.data);
  }
  return undefined;
}

/** Render a structured itinerary back to markdown for the raw/fallback view. */
function daysToMarkdown(days: ItineraryDay[]): string {
  return days
    .map((d) => {
      const header = `**Day ${d.day}${d.date ? ` · ${formatDate(d.date)}` : ''}${
        d.title ? ` — ${d.title}` : ''
      }**`;
      const lines = d.activities.map(
        (a) => `- ${a.time ? `**${a.time}** ` : ''}${a.title}${a.description ? ` — ${a.description}` : ''}`,
      );
      return [header, ...lines].join('\n');
    })
    .join('\n\n');
}

function defaultTitle(prefs: TripPreferences): string {
  return prefs.destination ? `Trip to ${prefs.destination}` : 'Your itinerary';
}

function normalize(raw: RawGenerateResponse, prefs: TripPreferences): TripItinerary {
  // Unwrap a bare markdown string.
  if (typeof raw === 'string') {
    return { title: defaultTitle(prefs), days: [], markdown: raw.trim() };
  }
  if (!Array.isArray(raw) && raw.error) throw new Error(raw.error);

  const rawDays = extractDays(raw);
  if (Array.isArray(rawDays) && rawDays.length > 0) {
    const days = rawDays.map((d, i) => mapDay(d, i, prefs));
    const meta = (Array.isArray(raw) ? {} : raw) as {
      title?: string;
      summary?: string;
      overview?: string;
      markdown?: string;
      content?: string;
    };
    return {
      title: coerceString(meta.title) ?? defaultTitle(prefs),
      summary: coerceString(meta.summary ?? meta.overview),
      days,
      markdown: coerceString(meta.markdown ?? meta.content) ?? daysToMarkdown(days),
    };
  }

  // No structured days — fall back to whatever text the model produced.
  const obj = (Array.isArray(raw) ? {} : raw) as {
    title?: string;
    summary?: string;
    overview?: string;
    content?: string;
    markdown?: string;
    message?: string;
  };
  return {
    title: coerceString(obj.title) ?? defaultTitle(prefs),
    summary: coerceString(obj.summary ?? obj.overview),
    days: [],
    markdown:
      coerceString(obj.markdown) ??
      coerceString(obj.content) ??
      coerceString(obj.message) ??
      '',
  };
}

/**
 * A locally-built starter itinerary, used when the AI backend is unavailable.
 * Mirrors the website's own graceful degradation (its `/plan-tour` page builds
 * the same shape client-side when `POST /api/plan-trip` errors) so the feature
 * still produces something useful instead of a hard failure.
 */
function fallbackItinerary(prefs: TripPreferences): TripItinerary {
  const days: ItineraryDay[] = Array.from({ length: tripLengthDays(prefs) }, (_, i) => ({
    day: i + 1,
    date: dayDate(prefs.startDate, i),
    title: `Exploring ${prefs.destination || 'your destination'}`,
    activities: [
      { time: '09:00 AM', title: 'Breakfast at a well-loved local spot', category: 'Food' },
      { time: '11:00 AM', title: 'Sightseeing and exploration', category: 'Sightseeing' },
      { time: '01:00 PM', title: 'Lunch at a traditional restaurant', category: 'Food' },
      { time: '04:00 PM', title: 'Visit key landmarks', category: 'Sightseeing' },
      { time: '08:00 PM', title: 'Dinner & evening out', category: 'Nightlife' },
    ],
  }));
  return {
    title: defaultTitle(prefs),
    summary:
      'Our AI planner is temporarily unavailable, so here is a starter outline you can customize.',
    days,
    markdown: daysToMarkdown(days),
  };
}

/** Collect preferences → `POST /api/plan-trip` → normalized itinerary. */
export async function generateItinerary(prefs: TripPreferences): Promise<TripItinerary> {
  try {
    const res = await apiPost<RawGenerateResponse>(
      endpoints.tripPlanner.generate,
      toRequestBody(prefs),
    );
    const itinerary = normalize(res, prefs);
    if (itinerary.days.length > 0 || itinerary.markdown) return itinerary;
  } catch {
    // Network error, 5xx, or an `{ error }` payload — fall through to the local
    // outline so the planner degrades gracefully, just like the website.
  }
  return fallbackItinerary(prefs);
}
