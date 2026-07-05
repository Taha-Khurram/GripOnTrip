import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchUmrahPackage, fetchUmrahPackages, submitUmrahBooking } from './api';

/** All published Umrah packages (from approved agencies, `[UMRAH]`-prefixed). */
export function useUmrahPackages() {
  return useQuery({
    queryKey: queryKeys.umrah.list(),
    queryFn: fetchUmrahPackages,
  });
}

/** A single Umrah package by id. */
export function useUmrahPackage(id: string) {
  return useQuery({
    queryKey: queryKeys.umrah.detail(id),
    queryFn: () => fetchUmrahPackage(id),
    enabled: Boolean(id),
  });
}

/** Submit an Umrah booking enquiry (same call the web makes). */
export function useSubmitUmrahBooking() {
  return useMutation({ mutationFn: submitUmrahBooking });
}
