/**
 * Booking submission — local stub (no backend).
 *
 * The public REST API is read-only and the app no longer talks to Supabase, so
 * these resolve immediately and the booking screens show a local confirmation.
 * Wire real persistence here if/when a booking endpoint is available.
 */
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

export async function fetchMyBookings(): Promise<MyBooking[]> {
  return [];
}
