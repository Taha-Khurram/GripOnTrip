import { apiGet } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { resolveImageUrl } from '@/api/media';
import type { Paginated } from '@/types';
import type { Tour, TourPackage, TourSearchParams } from './types';

/**
 * Raw agency record as returned by `GET /agencies` on gripontrip.com. Field
 * names are snake_case and differ from our normalized {@link Tour}; the UI only
 * ever sees the output of {@link mapTour}. Verified against the live web tours
 * page (`/api/agencies?status=Approved&include_packages=true`).
 */
interface RawTourPackage {
  id: string;
  package_name?: string | null;
  description?: string | null;
  amount?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  nights?: number | null;
  food_plan?: string | null;
  hotel_rating?: string | number | null;
  price_includes?: string | null;
  equipment_required?: string | null;
  attraction_places?: string | null;
  tour_plan?: { day: number; activity: string }[] | null;
}

interface RawAgency {
  id: string;
  agency_name: string;
  agency_logo_url?: string | null;
  starting_price?: number | null;
  more_details?: string | null;
  operating_cities?: string[] | null;
  head_office_address?: string | null;
  departure_location?: string | null;
  return_location?: string | null;
  price_includes?: string | null;
  equipment_required?: string | null;
  contact_email?: string | null;
  phone_number?: string | null;
  website_url?: string | null;
  agency_packages?: RawTourPackage[] | null;
}

/** API envelope: `{ success, data }` (no pagination metadata). */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/** `more_details` is a JSON-encoded string of extra profile fields. */
interface MoreDetails {
  flag?: string;
  bio?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
}

function parseMoreDetails(raw?: string | null): MoreDetails {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as MoreDetails) : {};
  } catch {
    return {};
  }
}

function mapPackage(raw: RawTourPackage): TourPackage {
  const hotelRating =
    raw.hotel_rating == null ? undefined : Number(raw.hotel_rating) || undefined;
  return {
    id: String(raw.id),
    name: raw.package_name ?? 'Tour package',
    description: raw.description ?? undefined,
    amount: raw.amount ?? raw.price_min ?? 0,
    priceMin: raw.price_min ?? undefined,
    priceMax: raw.price_max ?? undefined,
    nights: raw.nights ?? undefined,
    foodPlan: raw.food_plan ?? undefined,
    hotelRating,
    priceIncludes: raw.price_includes ?? undefined,
    equipmentRequired: raw.equipment_required ?? undefined,
    attractionPlaces: raw.attraction_places ?? undefined,
    itinerary: (raw.tour_plan ?? []).filter((d) => d && d.activity),
  };
}

/** Normalize a raw agency record into the app's {@link Tour} shape. */
function mapTour(raw: RawAgency): Tour {
  const id = String(raw.id);
  const details = parseMoreDetails(raw.more_details);
  const city = raw.operating_cities?.[0] ?? undefined;
  // Flags arrive bracket-wrapped, e.g. "[PREMIUM]".
  const flag = details.flag?.replace(/[[\]]/g, '').trim() || undefined;

  return {
    id,
    category: 'tours',
    title: raw.agency_name ?? 'Tour operator',
    description: details.bio ?? raw.head_office_address ?? '',
    images: raw.agency_logo_url
      ? [{ id: `${id}-logo`, url: resolveImageUrl(raw.agency_logo_url) }]
      : [],
    price: {
      amount: raw.starting_price ?? 0,
      currency: 'PKR',
    },
    location:
      city || raw.head_office_address
        ? {
            latitude: 0,
            longitude: 0,
            address: raw.head_office_address ?? undefined,
            city,
          }
        : undefined,
    agencyName: raw.agency_name ?? 'Tour operator',
    bio: details.bio ?? undefined,
    flag,
    startingPrice: raw.starting_price ?? undefined,
    operatingCities: raw.operating_cities ?? [],
    departureLocation: raw.departure_location ?? undefined,
    returnLocation: raw.return_location ?? undefined,
    priceIncludes: raw.price_includes ?? undefined,
    equipmentRequired: raw.equipment_required ?? undefined,
    contactEmail: raw.contact_email ?? undefined,
    phoneNumber: raw.phone_number ?? undefined,
    websiteUrl: raw.website_url ?? undefined,
    whatsapp: details.whatsapp ?? undefined,
    instagram: details.instagram ?? undefined,
    youtube: details.youtube ?? undefined,
    packages: (raw.agency_packages ?? []).map(mapPackage),
  };
}

/** Query params the web tours page always sends. */
const LIST_PARAMS = { status: 'Approved', include_packages: true } as const;

export async function fetchTours(
  params: TourSearchParams = {},
): Promise<Paginated<Tour>> {
  const res = await apiGet<ApiEnvelope<RawAgency[]>>(endpoints.tours.list, {
    ...LIST_PARAMS,
    ...params,
  });
  const items = (res.data ?? []).map(mapTour);
  return {
    data: items,
    page: params.page ?? 1,
    pageSize: items.length,
    total: items.length,
    hasMore: false,
  };
}

export async function fetchTour(id: string): Promise<Tour> {
  const res = await apiGet<ApiEnvelope<RawAgency>>(endpoints.tours.detail(id));
  return mapTour(res.data);
}
