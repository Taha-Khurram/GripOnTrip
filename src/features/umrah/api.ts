import { apiGet, apiPost } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { resolveImageUrl } from '@/api/media';
import type { UmrahBookingInput, UmrahPackage } from './types';

/**
 * Raw `agency_packages` row as returned by
 * `GET /agencies?status=Approved&include_packages=true`. Umrah packages are the
 * rows whose `package_name` starts with "[UMRAH]". Field names are snake_case;
 * everything the UI sees comes from {@link mapUmrahPackage}. Verified against the
 * live web `/umrah` page.
 */
interface RawPackage {
  id: string;
  package_name?: string | null;
  description?: string | null;
  amount?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  nights?: number | null;
  makkah_nights?: number | null;
  madinah_nights?: number | null;
  hotel_rating?: string | number | null;
  food_plan?: string | null;
  breakfast_included?: boolean | null;
  jeep_included?: boolean | null;
  visa_included?: boolean | null;
  is_couple_package?: boolean | null;
  price_includes?: string | null;
}

interface RawAgency {
  id: string;
  agency_name: string;
  agency_logo_url?: string | null;
  more_details?: string | null;
  operating_cities?: string[] | null;
  departure_location?: string | null;
  contact_email?: string | null;
  phone_number?: string | null;
  website_url?: string | null;
  agency_packages?: RawPackage[] | null;
}

interface RawReview {
  id: number | string;
  product_id: string;
  review: string; // JSON-encoded: {"rating":n,"comment":"..."}
}

/** API envelope: `{ success, data }` (no pagination metadata). */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface MoreDetails {
  bio?: string;
  whatsapp?: string;
  instagram?: string;
  youtube?: string;
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

const UMRAH_PREFIX = '[UMRAH]';
/** Site-relative hero used by the web when an agency has no logo. */
const UMRAH_HERO = '/img/umrah-hero.png';

/**
 * Normalize one `[UMRAH]` agency package into an {@link UmrahPackage}. Mirrors
 * the exact derivation the web `/umrah` page performs.
 */
function mapUmrahPackage(agency: RawAgency, pkg: RawPackage): UmrahPackage {
  const id = String(pkg.id);
  const details = parseMoreDetails(agency.more_details);
  const nights = pkg.nights ?? 0;
  const hotelRating = pkg.hotel_rating ?? '4';
  const pricePerPerson = pkg.price_min ?? pkg.price_max ?? pkg.amount ?? 0;
  const currency = 'PKR';

  const images = agency.agency_logo_url
    ? [resolveImageUrl(agency.agency_logo_url), resolveImageUrl(UMRAH_HERO)]
    : [resolveImageUrl(UMRAH_HERO)];

  return {
    id,
    category: 'umrah',
    title: agency.agency_name ?? 'Umrah Operator',
    packageName: (pkg.package_name ?? '').replace(/^\[UMRAH\]\s*/, '') || 'Umrah Package',
    description:
      pkg.description ||
      `Dynamic spiritual Umrah tour packages managed and verified under the expertise of ${agency.agency_name}.`,
    images: images.map((url, index) => ({ id: `${id}-${index}`, url })),
    price: { amount: pricePerPerson, currency },
    // Default rating until reviews are aggregated (web uses 4.8 as the seed).
    rating: pkg.hotel_rating ? Number(pkg.hotel_rating) || 4.8 : 4.8,
    reviewCount: 0,
    tag: 'Umrah Operator',

    makkahHotel: pkg.makkah_nights ? `${hotelRating}-Star Makkah Hotel` : 'Comfortable hotel',
    makkahHotelDist: 'Walking distance',
    makkahNights: pkg.makkah_nights ?? Math.ceil(nights / 2),
    madinahHotel: pkg.madinah_nights ? `${hotelRating}-Star Madinah Hotel` : 'Standard hotel',
    madinahHotelDist: 'Near Haram Courtyard',
    madinahNights: pkg.madinah_nights ?? Math.floor(nights / 2),

    transport: pkg.jeep_included ? 'Private GMC / SUV Transfer' : 'Shared AC Coach Transport',
    ziyarat: true,
    visaIncluded: pkg.visa_included ?? true,
    meals:
      pkg.food_plan || (pkg.breakfast_included ? 'Breakfast Buffet Included' : 'Self-Catering'),

    pricePerPerson,

    agencyId: String(agency.id),
    agencyName: agency.agency_name ?? 'Umrah Operator',
    departureLocation: agency.departure_location ?? undefined,
    operatingCities: agency.operating_cities ?? [],
    contactPhone: agency.phone_number ?? undefined,
    contactEmail: agency.contact_email ?? undefined,
    whatsapp: details.whatsapp ?? undefined,
    websiteUrl: agency.website_url ?? undefined,
    priceIncludes: pkg.price_includes ?? undefined,
    isCouplePackage: Boolean(pkg.is_couple_package),
  };
}

/** Parse the nested rating out of a raw review's JSON `review` field. */
function reviewRating(raw: RawReview): number | null {
  try {
    const parsed = JSON.parse(raw.review) as { rating?: number };
    const n = Number(parsed.rating);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Aggregate reviews onto packages by `product_id`, matching the web: average the
 * ratings and count them. The public `/reviews` endpoint returns the full set,
 * so we filter client-side by the package ids we care about.
 */
async function applyReviews(packages: UmrahPackage[]): Promise<UmrahPackage[]> {
  if (packages.length === 0) return packages;
  const ids = new Set(packages.map((p) => p.id));
  let reviews: RawReview[] = [];
  try {
    const res = await apiGet<ApiEnvelope<RawReview[]>>(endpoints.reviews.list);
    reviews = res.data ?? [];
  } catch {
    return packages; // reviews are non-critical; show seed ratings on failure
  }

  const byProduct = new Map<string, number[]>();
  for (const r of reviews) {
    const pid = String(r.product_id);
    if (!ids.has(pid)) continue;
    const rating = reviewRating(r);
    if (rating == null) continue;
    const list = byProduct.get(pid) ?? [];
    list.push(rating);
    byProduct.set(pid, list);
  }

  return packages.map((p) => {
    const ratings = byProduct.get(p.id);
    if (!ratings || ratings.length === 0) return p;
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return { ...p, rating: Number(avg.toFixed(1)), reviewCount: ratings.length };
  });
}

/** Query params the web `/umrah` page always sends (same as the tours feed). */
const LIST_PARAMS = { status: 'Approved', include_packages: true } as const;

async function fetchAgencies(): Promise<RawAgency[]> {
  const res = await apiGet<ApiEnvelope<RawAgency[]>>(endpoints.umrah.agencies, LIST_PARAMS);
  return res.data ?? [];
}

/** Flatten approved agencies into their `[UMRAH]`-prefixed packages. */
function extractUmrahPackages(agencies: RawAgency[]): UmrahPackage[] {
  const out: UmrahPackage[] = [];
  for (const agency of agencies) {
    for (const pkg of agency.agency_packages ?? []) {
      if ((pkg.package_name ?? '').startsWith(UMRAH_PREFIX)) {
        out.push(mapUmrahPackage(agency, pkg));
      }
    }
  }
  return out;
}

/** All published Umrah packages, with review ratings aggregated in. */
export async function fetchUmrahPackages(): Promise<UmrahPackage[]> {
  const packages = extractUmrahPackages(await fetchAgencies());
  return applyReviews(packages);
}

/** A single Umrah package by id (resolved from the same agencies feed). */
export async function fetchUmrahPackage(id: string): Promise<UmrahPackage | undefined> {
  const packages = await fetchUmrahPackages();
  return packages.find((p) => p.id === id);
}

/**
 * Submit an Umrah booking enquiry — the same call the web makes:
 * `POST /agencies/{agencyId}/bookings`. Builds the identical structured message
 * the web sends. Returns the server booking reference, or a locally-generated
 * "GOT-UMR-" reference if the write can't be persisted (the web falls back the
 * same way).
 */
export async function submitUmrahBooking(input: UmrahBookingInput): Promise<{ bookingId: string }> {
  const message = [
    '🕋 Spiritual Umrah Journey Inquiry Details:',
    `- Departure City: ${input.departureCity || 'N/A'}`,
    `- Travel Period: ${input.travelPeriod}`,
    `- Selected Package: ${input.packageName}`,
    `- Pilgrims Count: ${input.pilgrims} Person(s)`,
    `- Total Estimated Amount: ${input.packageAmount} PKR`,
  ].join('\n');

  const body = {
    agency_name: input.agencyName,
    customer_name: input.customerName || 'Primary Booker',
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    message,
    package_amount: input.packageAmount,
    status: 'Pending approval',
  };

  const fallback = `GOT-UMR-${Math.floor(1e5 + 9e5 * Math.random())}`;
  try {
    const res = await apiPost<ApiEnvelope<{ booking_id?: string }[]>>(
      endpoints.umrah.booking(input.agencyId),
      body,
    );
    if (res.success) return { bookingId: res.data?.[0]?.booking_id ?? fallback };
    return { bookingId: fallback };
  } catch {
    // The public REST layer is read-only in some environments; degrade to a
    // local confirmation so the enquiry flow always completes for the user.
    return { bookingId: fallback };
  }
}
