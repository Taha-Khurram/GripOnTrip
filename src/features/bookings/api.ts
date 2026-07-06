/**
 * Bookings — reads are wired to Supabase (same project as the website); the
 * write flows remain local stubs until the booking submission endpoints are
 * finalized. "My bookings" surfaces hotel/stay reservations for the signed-in
 * user (including any made on the web under the same account).
 */
import { resolveImageUrl } from '@/api/media';
import { supabase } from '@/lib/supabase';
import type {
  AgencyBookingInput,
  GuideBookingInput,
  HotelBookingInput,
  MyBooking,
  RentalBookingInput,
} from './types';

export async function createHotelBooking(_input: HotelBookingInput) {
  return { id: 'local' };
}

export async function createRentalBooking(_input: RentalBookingInput) {
  return { id: 'local' };
}

export async function createAgencyBooking(_input: AgencyBookingInput) {
  return { id: 'local' };
}

export async function createGuideBooking(_input: GuideBookingInput) {
  return { id: 'local' };
}

interface RawHotelBooking {
  id: string | number;
  hotel_id: string | number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests?: number | null;
  adults?: number | null;
  children?: number | null;
  total_price?: number | null;
  currency?: string | null;
  status?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
  hotels?: { name?: string | null; images_url?: string[] | null; city?: string | null } | null;
}

/** The signed-in user's hotel bookings, newest first. */
export async function fetchMyBookings(userId: string): Promise<MyBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, hotels(name, images_url, city)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return (data as RawHotelBooking[]).map((b) => {
    const image = b.hotels?.images_url?.find(Boolean);
    const guests = b.number_of_guests ?? (b.adults ?? 0) + (b.children ?? 0);
    return {
      id: String(b.id),
      hotelId: String(b.hotel_id),
      hotelName: b.hotels?.name ?? undefined,
      city: b.hotels?.city ?? undefined,
      imageUrl: image ? resolveImageUrl(image) : undefined,
      checkInDate: b.check_in_date,
      checkOutDate: b.check_out_date,
      guests: guests > 0 ? guests : 1,
      totalPrice: b.total_price ?? 0,
      currency: b.currency ?? 'PKR',
      status: b.status ?? 'pending',
      paymentStatus: b.payment_status ?? undefined,
      createdAt: b.created_at ?? new Date().toISOString(),
    };
  });
}
