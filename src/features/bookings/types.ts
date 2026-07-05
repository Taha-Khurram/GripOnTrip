/** Payloads for the three Supabase booking tables (columns verified live). */

export interface HotelBookingInput {
  hotelId: string;
  roomId?: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  totalPrice: number;
  currency: string;
  paymentMethod?: string;
  specialRequests?: string;
}

export interface RentalBookingInput {
  propertyId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  message?: string;
}

export interface AgencyBookingInput {
  agencyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
}

export interface GuideBookingInput {
  guideId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  totalPrice: number;
  currency: string;
  message?: string;
}

/** A hotel booking as read back for the "My bookings" screen. */
export interface MyBooking {
  id: string;
  hotelId: string;
  hotelName?: string;
  city?: string;
  imageUrl?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
}
