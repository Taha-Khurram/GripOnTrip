import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth.store';
import {
  createAgencyBooking,
  createGuideBooking,
  createHotelBooking,
  createRentalBooking,
  fetchMyBookings,
} from './api';

export function useCreateHotelBooking() {
  return useMutation({ mutationFn: createHotelBooking });
}

export function useCreateRentalBooking() {
  return useMutation({ mutationFn: createRentalBooking });
}

export function useCreateAgencyBooking() {
  return useMutation({ mutationFn: createAgencyBooking });
}

export function useCreateGuideBooking() {
  return useMutation({ mutationFn: createGuideBooking });
}

/** The signed-in user's bookings. Disabled while logged out. */
export function useMyBookings() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: queryKeys.bookings.mine(userId),
    queryFn: fetchMyBookings,
    enabled: Boolean(userId),
  });
}
