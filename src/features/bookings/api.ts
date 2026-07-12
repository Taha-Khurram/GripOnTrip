/**
 * Bookings — reads and the hotel write flow are wired to Supabase (same project
 * as the website). The rental/agency/guide write flows remain local stubs until
 * their submission endpoints are finalized. "My bookings" surfaces hotel/stay
 * reservations for the signed-in user (including any made on the web under the
 * same account).
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

/**
 * Create a hotel booking in Supabase. Attaches the signed-in user's id when
 * available so it surfaces under "My bookings"; falls back to a guest booking
 * (name + email satisfy the `chk_user_or_guest` constraint) when signed out.
 * `room_id` is NOT NULL, so a room must have been selected upstream.
 */
export async function createHotelBooking(input: HotelBookingInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guests = input.adults + input.children;

  // When a card charge already succeeded upstream we record the Stripe
  // reference alongside the guest's notes so it's reconcilable from the booking.
  const notes = [
    input.specialRequests?.trim(),
    input.paymentReference ? `Payment ref: ${input.paymentReference}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      hotel_id: input.hotelId,
      room_id: input.roomId,
      user_id: user?.id ?? null,
      guest_name: input.guestName,
      guest_email: input.guestEmail,
      check_in_date: input.checkInDate,
      check_out_date: input.checkOutDate,
      number_of_guests: guests > 0 ? guests : 1,
      adults: input.adults,
      children: input.children,
      total_price: input.totalPrice,
      currency: input.currency,
      status: 'pending',
      payment_status: input.paymentStatus ?? 'pending',
      payment_method: input.paymentMethod ?? null,
      special_requests: notes || null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return { id: String(data.id) };
}

/**
 * Create a BNB (rental) booking in Supabase. `rental_bookings` RLS requires an
 * authenticated session, so we attach the signed-in user's id. Column names
 * mirror the verified table schema (snake_case).
 */
export async function createRentalBooking(input: RentalBookingInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('rental_bookings')
    .insert({
      property_id: input.propertyId,
      user_id: user?.id ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      duration_type: input.durationType,
      duration_value: input.durationValue,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone ?? null,
      total_price: input.totalPrice,
      status: 'pending',
      message: input.message ?? null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return { id: String(data.id) };
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
