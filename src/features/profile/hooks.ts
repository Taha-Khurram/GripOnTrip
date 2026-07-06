import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth.store';
import {
  deleteRentalProperty,
  fetchMyProperties,
  fetchMyRentalBookings,
  fetchMyRentalProperties,
  fetchProfile,
  updateProfile,
} from './api';
import type { ProfileUpdateInput } from './types';

/** The signed-in user's profile row. Disabled while logged out. */
export function useProfile() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: () => fetchProfile(userId!),
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => updateProfile(userId!, input),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.profile.detail(userId), profile);
      // `updateProfile` also calls supabase.auth.updateUser, which fires a
      // USER_UPDATED event — the auth store listener refreshes the cached
      // user's name/avatar from that automatically.
    },
  });
}

export function useMyRentalBookings() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: queryKeys.profile.rentalBookings(userId),
    queryFn: () => fetchMyRentalBookings(userId!),
    enabled: Boolean(userId),
  });
}

export function useMyProperties() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: queryKeys.profile.properties(userId),
    queryFn: () => fetchMyProperties(userId!),
    enabled: Boolean(userId),
  });
}

export function useMyRentalProperties() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: queryKeys.profile.rentalProperties(userId),
    queryFn: () => fetchMyRentalProperties(userId!),
    enabled: Boolean(userId),
  });
}

export function useDeleteRentalProperty() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRentalProperty(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.profile.rentalProperties(userId) }),
  });
}
