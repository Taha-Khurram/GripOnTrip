import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: createHotelBooking,
    // Refresh the dashboard so the new reservation shows up right away.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.mine(userId) });
    },
  });
}

export function useCreateRentalBooking() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: createRentalBooking,
    // Surface the new reservation under "My Rental Bookings" right away.
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.profile.rentalBookings(userId),
      });
    },
  });
}

export function useCreateAgencyBooking() {
  return useMutation({ mutationFn: createAgencyBooking });
}

export function useCreateGuideBooking() {
  return useMutation({ mutationFn: createGuideBooking });
}

/** The signed-in user's hotel bookings. Disabled while logged out. */
export function useMyBookings() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: queryKeys.bookings.mine(userId),
    queryFn: () => fetchMyBookings(userId!),
    enabled: Boolean(userId),
  });
}
