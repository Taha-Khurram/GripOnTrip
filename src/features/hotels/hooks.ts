import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchHotel, fetchHotelReviews, fetchHotelRooms, fetchHotels } from './api';
import type { HotelSearchParams } from './types';

/** Paginated hotel search. */
export function useHotels(params: HotelSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.hotels.list(params),
    queryFn: () => fetchHotels(params),
  });
}

/** Single hotel detail. */
export function useHotel(id: string) {
  return useQuery({
    queryKey: queryKeys.hotels.detail(id),
    queryFn: () => fetchHotel(id),
    enabled: Boolean(id),
  });
}

/** Bookable rooms for a hotel. */
export function useHotelRooms(id: string) {
  return useQuery({
    queryKey: queryKeys.hotels.rooms(id),
    queryFn: () => fetchHotelRooms(id),
    enabled: Boolean(id),
  });
}

/** Guest reviews for a hotel. */
export function useHotelReviews(id: string) {
  return useQuery({
    queryKey: queryKeys.reviews.hotel(id),
    queryFn: () => fetchHotelReviews(id),
    enabled: Boolean(id),
  });
}
