import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth.store';
import {
  createRentalProperty,
  deleteRentalProperty,
  fetchMyProperties,
  fetchMyRentalBookings,
  fetchMyRentalProperties,
  fetchProfile,
  fetchRentalProperty,
  updateProfile,
  updateRentalProperty,
} from './api';
import type { ProfileUpdateInput, RentalPropertyInput } from './types';

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

export function useCreateRentalProperty() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RentalPropertyInput) => createRentalProperty(userId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.rentalProperties(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.profile.properties(userId) });
    },
  });
}

/** Full editable rental listing — used to prefill the edit form. */
export function useRentalProperty(id?: string) {
  return useQuery({
    queryKey: ['profile', 'rental-property', id] as const,
    queryFn: () => fetchRentalProperty(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateRentalProperty() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RentalPropertyInput }) =>
      updateRentalProperty(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.rentalProperties(userId) });
      qc.invalidateQueries({ queryKey: ['profile', 'rental-property', id] });
    },
  });
}
