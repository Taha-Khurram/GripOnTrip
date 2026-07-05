import { apiGet } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { resolveImageUrl } from '@/api/media';
import type { Paginated } from '@/types';
import type { Guide, GuideSearchParams } from './types';

/**
 * Raw guide record as returned by `GET /api/guides` on gripontrip.com. Field
 * names are snake_case and differ from our normalized {@link Guide}; the UI only
 * ever sees the output of {@link mapGuide}. Verified against the live web guides
 * page (`/api/guides?status=active&include_profiles=true`).
 */
interface RawGuideProfile {
  id?: string;
  avatar_url?: string | null;
  name?: string | null;
}

interface RawGuide {
  id: number | string;
  user_id?: string | null;
  name?: string | null;
  city?: string | null;
  bio?: string | null;
  daily_rate?: number | null;
  experience_years?: number | null;
  languages?: string[] | null;
  image_url?: string | null;
  rating?: number | null;
  review_count?: number | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  status?: string | null;
  /** Joined via `include_profiles=true` — carries the account avatar/name. */
  profiles?: RawGuideProfile | null;
}

/** API envelope: `{ success, data }` (no pagination metadata). */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/**
 * Languages arrive as a string array where each entry may itself be a
 * comma-joined list, e.g. `["Urdu,Pashto,Punjabi"]`. Split, trim, and dedupe so
 * the UI can render one chip per language.
 */
function normalizeLanguages(raw?: string[] | null): string[] {
  if (!raw) return [];
  const out: string[] = [];
  for (const entry of raw) {
    for (const part of String(entry).split(',')) {
      const lang = part.trim();
      if (lang && !out.includes(lang)) out.push(lang);
    }
  }
  return out;
}

/** Normalize a raw guide record into the app's {@link Guide} shape. */
function mapGuide(raw: RawGuide): Guide {
  const id = String(raw.id);
  const name = raw.name?.trim() || raw.profiles?.name?.trim() || 'Guide';
  const dailyRate = raw.daily_rate ?? 0;
  // Guides may set their own photo; fall back to the linked account avatar.
  const rawImage = raw.image_url ?? raw.profiles?.avatar_url ?? undefined;
  const image = rawImage ? resolveImageUrl(rawImage) : undefined;
  const city = raw.city?.trim() || undefined;

  return {
    id,
    category: 'guides',
    title: name,
    name,
    description: raw.bio ?? '',
    bio: raw.bio?.trim() || undefined,
    images: image ? [{ id: `${id}-photo`, url: image }] : [],
    imageUrl: image,
    price: { amount: dailyRate, currency: 'PKR' },
    dailyRate,
    experienceYears: raw.experience_years ?? undefined,
    languages: normalizeLanguages(raw.languages),
    rating: raw.rating ?? 0,
    reviewCount: raw.review_count ?? 0,
    isVerified: Boolean(raw.is_verified),
    createdAt: raw.created_at ?? undefined,
    location:
      city != null
        ? { latitude: 0, longitude: 0, city, address: undefined }
        : undefined,
  };
}

/** Query params the web guides page always sends. */
const LIST_PARAMS = { status: 'active', include_profiles: true } as const;

export async function fetchGuides(
  params: GuideSearchParams = {},
): Promise<Paginated<Guide>> {
  const query: Record<string, unknown> = { ...LIST_PARAMS };
  if (params.city && params.city !== 'all') query.city = params.city;

  const res = await apiGet<ApiEnvelope<RawGuide[]>>(endpoints.guides.list, query);
  const items = (res.data ?? []).map(mapGuide);
  return {
    data: items,
    page: params.page ?? 1,
    pageSize: items.length,
    total: items.length,
    hasMore: false,
  };
}

/**
 * A single guide. The public API has no `/guides/{id}` detail endpoint (it 404s),
 * so — exactly like the web guide page — we read the full list and select by id.
 */
export async function fetchGuide(id: string): Promise<Guide> {
  const res = await apiGet<ApiEnvelope<RawGuide[]>>(endpoints.guides.list, LIST_PARAMS);
  const raw = (res.data ?? []).find((g) => String(g.id) === String(id));
  if (!raw) throw new Error('Guide not found');
  return mapGuide(raw);
}
