import type { BaseListing, Money } from '@/types';

export interface Rental extends BaseListing {
  category: 'rentals';
  /** e.g. "Apartment", "Villa", "Residence". */
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  amenities: string[];
  /** Rentals are priced per month; `price` holds the monthly rate. */
  priceUnit: 'month';
  originalPrice?: Money;
  discountPercent?: number;
  externalBookingUrl?: string;
}

export interface RentalSearchParams {
  city?: string;
  guests?: number;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}
