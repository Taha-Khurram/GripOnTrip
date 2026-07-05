import { apiGet } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { resolveImageUrl } from '@/api/media';
import type { Paginated } from '@/types';
import type { Hotel, HotelSearchParams, Room } from './types';

/**
 * Raw hotel record as returned by `GET /hotels` on gripontrip.com. Field names
 * are snake_case and differ from our normalized {@link Hotel}; everything the UI
 * consumes is produced by {@link mapHotel}.
 */
interface RawHotel {
  id: number | string;
  name: string;
  images_url?: string[] | null;
  actual_price?: number | null;
  discounted_price?: number | null;
  address?: string | null;
  rating?: number | null;
  reviews?: string | number | null;
  amenities?: string[] | null;
  nearby_attractions?: string[] | null;
  breakfast_included?: boolean | null;
  free_cancellation?: boolean | null;
  payment_type?: string | null;
  is_available?: boolean | null;
  availability_dates?: string | null;
  city?: string | null;
  currency?: string | null;
  property_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: number | string | null;
  contact_phone?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  external_booking_url?: string | null;
  bank_name?: string | null;
  account_title?: string | null;
  account_number?: string | null;
}

interface RawRoom {
  id: string;
  hotel_id: number | string;
  room_type?: string | null;
  description?: string | null;
  price_per_night?: number | null;
  capacity?: number | null;
  bed_type?: string | null;
  room_size_sqft?: number | null;
  amenities?: string[] | null;
  images_url?: string[] | null;
  availability?: boolean | null;
  inventory?: number | null;
}

interface RawReview {
  id: number | string;
  product_id: string;
  review: string; // JSON-encoded: {"rating":n,"comment":"..."}
  user_name?: string | null;
  user_phone?: string | null;
  created_at: string;
}

export interface HotelReview {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

/** API envelope: `{ success, data }` (no pagination metadata). */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/** Normalize a raw API record into the app's {@link Hotel} shape. */
function mapHotel(raw: RawHotel): Hotel {
  const id = String(raw.id);
  const rating = raw.rating ?? undefined;
  const currency = raw.currency ?? 'PKR';
  const actual = raw.actual_price ?? undefined;
  const discounted = raw.discounted_price ?? undefined;
  const price = discounted ?? actual ?? 0;
  const hasDiscount = actual != null && discounted != null && discounted < actual;

  return {
    id,
    category: 'hotels',
    title: raw.name ?? 'Untitled stay',
    description: raw.address ?? '',
    images: (raw.images_url ?? []).map((url, index) => ({
      id: `${id}-${index}`,
      url: resolveImageUrl(url),
    })),
    price: { amount: price, currency },
    originalPrice: hasDiscount ? { amount: actual!, currency } : undefined,
    discountPercent: hasDiscount ? Math.round((1 - discounted! / actual!) * 100) : undefined,
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
    starRating: rating != null ? Math.round(rating) : 0,
    amenities: raw.amenities ?? [],
    nearbyAttractions: raw.nearby_attractions ?? [],
    breakfastIncluded: Boolean(raw.breakfast_included),
    freeCancellation: Boolean(raw.free_cancellation),
    paymentType: raw.payment_type ?? undefined,
    isAvailable: raw.is_available ?? true,
    availabilityDates: raw.availability_dates ?? undefined,
    propertyType: raw.property_type ?? undefined,
    phone: raw.contact_phone ?? (raw.phone != null ? String(raw.phone) : undefined),
    // Owner-direct when the booking isn't handed off to an external URL.
    directBooking: !raw.external_booking_url,
    externalBookingUrl: raw.external_booking_url ?? undefined,
    checkInTime: raw.check_in_time ?? undefined,
    checkOutTime: raw.check_out_time ?? undefined,
    bank:
      raw.bank_name || raw.account_title || raw.account_number
        ? {
            name: raw.bank_name ?? undefined,
            accountTitle: raw.account_title ?? undefined,
            accountNumber: raw.account_number ?? undefined,
          }
        : undefined,
  };
}

function mapRoom(raw: RawRoom): Room {
  return {
    id: String(raw.id),
    hotelId: String(raw.hotel_id),
    roomType: raw.room_type ?? 'Room',
    description: raw.description ?? undefined,
    pricePerNight: raw.price_per_night ?? 0,
    capacity: raw.capacity ?? undefined,
    bedType: raw.bed_type ?? undefined,
    roomSizeSqft: raw.room_size_sqft ?? undefined,
    amenities: raw.amenities ?? [],
    images: (raw.images_url ?? []).map(resolveImageUrl),
    available: raw.availability ?? false,
    inventory: raw.inventory ?? undefined,
  };
}

function mapReview(raw: RawReview): HotelReview | null {
  let rating = 0;
  let comment = '';
  try {
    const parsed = JSON.parse(raw.review) as { rating?: number; comment?: string };
    rating = Number(parsed.rating) || 0;
    comment = parsed.comment ?? '';
  } catch {
    comment = raw.review ?? '';
  }
  if (!comment && !rating) return null;
  return {
    id: String(raw.id),
    rating,
    comment,
    authorName: raw.user_name || 'Guest',
    createdAt: raw.created_at,
  };
}

export async function fetchHotels(
  params: HotelSearchParams = {},
): Promise<Paginated<Hotel>> {
  const res = await apiGet<ApiEnvelope<RawHotel[]>>(endpoints.hotels.list, params);
  const items = (res.data ?? []).map(mapHotel);
  return { data: items, page: params.page ?? 1, pageSize: items.length, total: items.length, hasMore: false };
}

export async function fetchHotel(id: string): Promise<Hotel> {
  const res = await apiGet<ApiEnvelope<RawHotel>>(endpoints.hotels.detail(id));
  return mapHotel(res.data);
}

export async function fetchHotelRooms(id: string): Promise<Room[]> {
  const res = await apiGet<ApiEnvelope<RawRoom[]>>(endpoints.hotels.rooms(id));
  return (res.data ?? []).map(mapRoom);
}

export async function fetchHotelReviews(id: string): Promise<HotelReview[]> {
  const res = await apiGet<ApiEnvelope<RawReview[]>>(endpoints.reviews.list, { hotel_id: id });
  return (res.data ?? []).map(mapReview).filter((r): r is HotelReview => r != null);
}
