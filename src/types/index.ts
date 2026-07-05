/**
 * Shared domain types for the Grip On Trip marketplace.
 * Feature-specific types live under `src/features/<feature>/types.ts`.
 */

export type ID = string;

export interface Money {
  amount: number;
  /** ISO 4217 currency code, e.g. "USD", "SAR". */
  currency: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface MediaImage {
  id: ID;
  url: string;
  alt?: string;
}

export interface Review {
  id: ID;
  rating: number; // 0–5
  comment: string;
  authorName: string;
  createdAt: string; // ISO date
}

/** The core marketplace verticals, matching the site navigation. */
export type ServiceCategory =
  | 'hotels'
  | 'rentals'
  | 'tours'
  | 'umrah'
  | 'guides'
  | 'shop'
  | 'vehicles'
  | 'moving';

/** Standard shape every listing shares, extended per vertical. */
export interface BaseListing {
  id: ID;
  category: ServiceCategory;
  title: string;
  description: string;
  images: MediaImage[];
  price: Money;
  rating?: number;
  reviewCount?: number;
  location?: GeoLocation;
  featured?: boolean;
}

/** Standard paginated response envelope from the API. */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
