import type { BaseListing } from '@/types';

/** A single day of a package itinerary. */
export interface ItineraryDay {
  day: number;
  activity: string;
}

/** One bookable package offered by a tour operator (agency). */
export interface TourPackage {
  id: string;
  name: string;
  description?: string;
  /** Headline price for the package. */
  amount: number;
  priceMin?: number;
  priceMax?: number;
  nights?: number;
  foodPlan?: string;
  hotelRating?: number;
  priceIncludes?: string;
  equipmentRequired?: string;
  attractionPlaces?: string;
  itinerary: ItineraryDay[];
}

/**
 * A tour on Grip On Trip is a travel agency (operator). Its `packages` are the
 * individual trips it sells; `price` mirrors the operator's "starting from" rate.
 */
export interface Tour extends BaseListing {
  category: 'tours';
  agencyName: string;
  bio?: string;
  /** Marketing flag from the operator profile, e.g. "[PREMIUM]". */
  flag?: string;
  startingPrice?: number;
  operatingCities: string[];
  departureLocation?: string;
  returnLocation?: string;
  priceIncludes?: string;
  equipmentRequired?: string;
  contactEmail?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  whatsapp?: string;
  instagram?: string;
  youtube?: string;
  packages: TourPackage[];
}

export interface TourSearchParams {
  city?: string;
  page?: number;
}
