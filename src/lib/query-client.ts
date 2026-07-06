import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide React Query client. Defaults tuned for a mobile marketplace:
 * data stays fresh for a minute, retries are limited, and refetch-on-focus is
 * enabled so listings update when users return to the app.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Centralized query keys keep cache invalidation consistent and typo-free. */
export const queryKeys = {
  hotels: {
    all: ['hotels'] as const,
    list: (params?: object) => ['hotels', 'list', params] as const,
    detail: (id: string) => ['hotels', 'detail', id] as const,
    rooms: (id: string) => ['hotels', 'rooms', id] as const,
  },
  reviews: {
    hotel: (id: string) => ['reviews', 'hotel', id] as const,
  },
  bookings: {
    mine: (userId?: string) => ['bookings', 'mine', userId] as const,
  },
  profile: {
    detail: (userId?: string) => ['profile', 'detail', userId] as const,
    rentalBookings: (userId?: string) => ['profile', 'rental-bookings', userId] as const,
    properties: (userId?: string) => ['profile', 'properties', userId] as const,
    rentalProperties: (userId?: string) => ['profile', 'rental-properties', userId] as const,
  },
  tours: {
    all: ['tours'] as const,
    list: (params?: object) => ['tours', 'list', params] as const,
    detail: (id: string) => ['tours', 'detail', id] as const,
  },
  rentals: {
    all: ['rentals'] as const,
    list: (params?: object) => ['rentals', 'list', params] as const,
    detail: (id: string) => ['rentals', 'detail', id] as const,
  },
  umrah: {
    all: ['umrah'] as const,
    list: (params?: object) => ['umrah', 'list', params] as const,
    detail: (id: string) => ['umrah', 'detail', id] as const,
  },
  guides: {
    all: ['guides'] as const,
    list: (params?: object) => ['guides', 'list', params] as const,
    detail: (id: string) => ['guides', 'detail', id] as const,
  },
  shop: {
    all: ['shop'] as const,
    products: (params?: object) => ['shop', 'products', params] as const,
    product: (id: string) => ['shop', 'product', id] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const;
