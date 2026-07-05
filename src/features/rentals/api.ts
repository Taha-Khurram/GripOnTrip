import { apiGet } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { resolveImageUrl } from '@/api/media';
import type { Paginated } from '@/types';
import type { Rental, RentalSearchParams } from './types';

/**
 * Raw rental record as returned by `GET /rentals` on gripontrip.com. Field
 * names are snake_case and differ from our normalized {@link Rental}; the UI
 * only ever sees the output of {@link mapRental}. Verified against the live web
 * client's rental card component.
 */
interface RawRental {
  id: number | string;
  title: string;
  images_url?: string[] | null;
  price_per_month?: number | null;
  discounted_price?: number | null;
  actual_price?: number | null;
  address?: string | null;
  city?: string | null;
  currency?: string | null;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  max_guests?: number | null;
  amenities?: string[] | null;
  rating?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  external_booking_url?: string | null;
}

/** API envelope: `{ success, data }` (no pagination metadata). */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/** Normalize a raw API record into the app's {@link Rental} shape. */
function mapRental(raw: RawRental): Rental {
  const id = String(raw.id);
  const rating = raw.rating ?? undefined;
  const currency = raw.currency ?? 'PKR';
  const monthly = raw.price_per_month ?? raw.discounted_price ?? raw.actual_price ?? 0;
  const original = raw.actual_price ?? undefined;
  const hasDiscount = original != null && monthly < original;
  return {
    id,
    category: 'rentals',
    title: raw.title ?? 'Untitled rental',
    description: raw.address ?? '',
    images: (raw.images_url ?? []).map((url, index) => ({
      id: `${id}-${index}`,
      url: resolveImageUrl(url),
    })),
    price: { amount: monthly, currency },
    originalPrice: hasDiscount ? { amount: original!, currency } : undefined,
    discountPercent: hasDiscount ? Math.round((1 - monthly / original!) * 100) : undefined,
    externalBookingUrl: raw.external_booking_url ?? undefined,
    priceUnit: 'month',
    rating,
    location:
      raw.city || raw.address || raw.latitude != null
        ? {
            latitude: raw.latitude ?? 0,
            longitude: raw.longitude ?? 0,
            address: raw.address ?? undefined,
            city: raw.city ?? undefined,
          }
        : undefined,
    propertyType: raw.property_type ?? 'Residence',
    bedrooms: raw.bedrooms ?? undefined,
    bathrooms: raw.bathrooms ?? undefined,
    maxGuests: raw.max_guests ?? undefined,
    amenities: raw.amenities ?? [],
  };
}

export async function fetchRentals(
  params: RentalSearchParams = {},
): Promise<Paginated<Rental>> {
  const res = await apiGet<ApiEnvelope<RawRental[]>>(endpoints.rentals.list, params);
  const items = (res.data ?? []).map(mapRental);
  return {
    data: items,
    page: params.page ?? 1,
    pageSize: items.length,
    total: items.length,
    hasMore: false,
  };
}

export async function fetchRental(id: string): Promise<Rental> {
  const res = await apiGet<ApiEnvelope<RawRental>>(endpoints.rentals.detail(id));
  return mapRental(res.data);
}
