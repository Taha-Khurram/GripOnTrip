import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchRental, fetchRentals } from './api';
import type { RentalSearchParams } from './types';

/** Paginated rental search. */
export function useRentals(params: RentalSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.rentals.list(params),
    queryFn: () => fetchRentals(params),
  });
}

/** Single rental detail. */
export function useRental(id: string) {
  return useQuery({
    queryKey: queryKeys.rentals.detail(id),
    queryFn: () => fetchRental(id),
    enabled: Boolean(id),
  });
}
