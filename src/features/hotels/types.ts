import type { BaseListing, Money } from '@/types';

export interface Hotel extends BaseListing {
  category: 'hotels';
  starRating: number;
  amenities: string[];
  nearbyAttractions: string[];
  /** Undiscounted nightly rate, when a discount is active. */
  originalPrice?: Money;
  /** Percentage off (0–100), derived from actual vs discounted price. */
  discountPercent?: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  /** e.g. "Cash, Pay at property". */
  paymentType?: string;
  isAvailable: boolean;
  /** Postgres tsrange string, e.g. "[2026-04-24,2026-12-01)". */
  availabilityDates?: string;
  propertyType?: string;
  phone?: string;
  /** True for owner-direct listings (no external handoff URL). */
  directBooking: boolean;
  externalBookingUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  /** Bank-transfer details, when the owner accepts direct transfer. */
  bank?: { name?: string; accountTitle?: string; accountNumber?: string };
}

/** A bookable room within a hotel (`GET /hotels/{id}/rooms`). */
export interface Room {
  id: string;
  hotelId: string;
  roomType: string;
  description?: string;
  pricePerNight: number;
  capacity?: number;
  bedType?: string;
  roomSizeSqft?: number;
  amenities: string[];
  images: string[];
  available: boolean;
  inventory?: number;
}

export interface HotelSearchParams {
  destination?: string;
  /** Filter by city (matches the web `?city=` param used by the AI assistant). */
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}

/** Client-side filters applied on the hotels list screen. */
export interface HotelFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  sort?: 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';
}
