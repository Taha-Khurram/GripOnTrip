import { apiPost } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { formatDate } from '@/utils/format';
import type { ItineraryActivity, ItineraryDay, TripItinerary, TripPreferences } from './types';

/**
 * The generate endpoint is AI-backed and its response shape isn't guaranteed, so
 * we accept the shapes it's known to return and normalize defensively:
 *   - `{ success, data: {...} }`  (the app's standard REST envelope)
 *   - `{ itinerary: {...} }` / a bare itinerary object
 *   - `{ content: "..." }` / a bare markdown string
 * Whatever arrives, we keep the raw markdown so nothing is dropped on screen.
 */
type RawGenerateResponse =
  | string
  | {
      success?: boolean;
      error?: string;
      message?: string;
      data?: unknown;
      itinerary?: unknown;
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
}

interface RawActivity {
  time?: string;
  title?: string;
  name?: string;
  activity?: string;
  description?: string;
  details?: string;
  category?: string;
  type?: string;
  cost?: string | number;
}

function coerceString(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'number') return String(value);
  return undefined;
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

function mapDay(raw: RawDay, index: number): ItineraryDay {
  const activities = (raw.activities ?? raw.items ?? [])
    .map(mapActivity)
    .filter((a): a is ItineraryActivity => a != null);
  return {
    day: typeof raw.day === 'number' ? raw.day : index + 1,
    date: coerceString(raw.date),
    title: coerceString(raw.title ?? raw.heading),
    activities,
  };
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

function normalize(raw: RawGenerateResponse, prefs: TripPreferences): TripItinerary {
  // Unwrap a bare string or the standard `{ success, data }` envelope.
  if (typeof raw === 'string') {
    return { title: defaultTitle(prefs), days: [], markdown: raw.trim() };
  }
  if (raw.error) throw new Error(raw.error);

  const payload = (raw.data ?? raw.itinerary ?? raw) as {
    title?: string;
    summary?: string;
    overview?: string;
    days?: RawDay[];
    itinerary?: RawDay[];
    content?: string;
    markdown?: string;
  };

  const rawDays = payload.days ?? payload.itinerary;
  if (Array.isArray(rawDays) && rawDays.length > 0) {
    const days = rawDays.map(mapDay);
    return {
      title: coerceString(payload.title) ?? defaultTitle(prefs),
      summary: coerceString(payload.summary ?? payload.overview),
      days,
      markdown: coerceString(payload.markdown ?? payload.content) ?? daysToMarkdown(days),
    };
  }

  // No structured days — fall back to whatever text the model produced.
  const markdown =
    coerceString(payload.markdown) ??
    coerceString(payload.content) ??
    coerceString(raw.markdown) ??
    coerceString(raw.content) ??
    coerceString(raw.message) ??
    '';
  return {
    title: coerceString(payload.title) ?? defaultTitle(prefs),
    summary: coerceString(payload.summary ?? payload.overview),
    days: [],
    markdown,
  };
}

function defaultTitle(prefs: TripPreferences): string {
  return prefs.destination ? `Trip to ${prefs.destination}` : 'Your itinerary';
}

/** Collect preferences → `POST /trip-planner/generate` → normalized itinerary. */
export async function generateItinerary(prefs: TripPreferences): Promise<TripItinerary> {
  const res = await apiPost<RawGenerateResponse>(endpoints.tripPlanner.generate, prefs);
  const itinerary = normalize(res, prefs);
  if (itinerary.days.length === 0 && !itinerary.markdown) {
    throw new Error('The planner did not return an itinerary. Please try again.');
  }
  return itinerary;
}
