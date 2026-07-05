import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchTour, fetchTours } from './api';
import type { TourSearchParams } from './types';

/** Paginated tour-operator search. */
export function useTours(params: TourSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.tours.list(params),
    queryFn: () => fetchTours(params),
  });
}

/** Single tour-operator detail (with its packages). */
export function useTour(id: string) {
  return useQuery({
    queryKey: queryKeys.tours.detail(id),
    queryFn: () => fetchTour(id),
    enabled: Boolean(id),
  });
}
