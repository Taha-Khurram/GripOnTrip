import type { BaseListing } from '@/types';

/**
 * A verified local guide on Grip On Trip. Mirrors the `guides` record served by
 * `GET /api/guides` on gripontrip.com. `price` carries the guide's daily rate so
 * the shared listing UI (which reads `price`) works unchanged.
 */
export interface Guide extends BaseListing {
  category: 'guides';
  name: string;
  city?: string;
  bio?: string;
  /** Rate per day (PKR). */
  dailyRate: number;
  experienceYears?: number;
  /** Spoken languages, normalized to individual entries. */
  languages: string[];
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt?: string;
}

/** How the web guides page lets users sort the list. */
export type GuideSort = 'recommended' | 'price_low' | 'price_high' | 'rating' | 'reviews';

export interface GuideSearchParams {
  /** Filter by operating city (matches the web `?city=` param). */
  city?: string;
  page?: number;
}
