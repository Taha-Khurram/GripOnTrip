import type { BaseListing } from '@/types';

/**
 * A bookable Umrah package.
 *
 * Umrah has no dedicated backend table: on gripontrip.com an Umrah package is an
 * `agency_packages` row whose `package_name` is prefixed with "[UMRAH]", offered
 * by an approved tour agency. The fields below mirror the shape the web `/umrah`
 * page derives from that raw row (Makkah/Madinah stay, transport, meals, visa).
 */
export interface UmrahPackage extends BaseListing {
  category: 'umrah';
  /** Package title with the "[UMRAH]" prefix stripped. */
  packageName: string;
  /** Marketing tag shown on the card — always "Umrah Operator" on web. */
  tag: string;
  reviewCount: number;

  /** Makkah stay. */
  makkahHotel: string;
  makkahHotelDist: string;
  makkahNights: number;
  /** Madinah stay. */
  madinahHotel: string;
  madinahHotelDist: string;
  madinahNights: number;

  transport: string;
  ziyarat: boolean;
  visaIncluded: boolean;
  meals: string;

  /** Headline per-pilgrim price (PKR). */
  pricePerPerson: number;

  /** Owning agency, used for the booking enquiry. */
  agencyId: string;
  agencyName: string;
  departureLocation?: string;
  operatingCities: string[];
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  websiteUrl?: string;
  priceIncludes?: string;
  isCouplePackage: boolean;
}

/** Filters applied on the Umrah listing screen. */
export interface UmrahFilters {
  query?: string;
  sort?: 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';
}

export type Gender = 'Male' | 'Female';

/**
 * One pilgrim/passenger on an Umrah booking. Mirrors the fields the web
 * "Pilgrim & Passenger Information" form collects (passport identity + optional
 * visa-assistance and document uploads).
 */
export interface Pilgrim {
  /** Local, stable id for list rendering. */
  id: string;
  fullName: string;
  passportNumber: string;
  /** ISO `YYYY-MM-DD` (or free text while editing). */
  passportExpiry: string;
  dateOfBirth: string;
  gender: Gender;
  visaAssistance: boolean;
  /** Local upload flags — the app only tracks that a document was attached. */
  passportUploaded?: boolean;
  photoUploaded?: boolean;
}

/**
 * A self-assembled ("Bespoke") Umrah package. Drives {@link computeCustomPrice}
 * and the customizer card. `hotelTier` / `transport` / `meals` are the `value`
 * keys of the option lists in `pricing.ts`.
 */
export interface CustomUmrahConfig {
  makkahNights: number;
  madinahNights: number;
  hotelTier: string;
  transport: string;
  meals: string;
  visaAssistance: boolean;
  ziyarat: boolean;
}

/** Payload the web sends to `POST /agencies/{id}/bookings` for an Umrah enquiry. */
export interface UmrahBookingInput {
  agencyId: string;
  agencyName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageName: string;
  pilgrims: number;
  departureCity: string;
  travelPeriod: string;
  packageAmount: number;
}
