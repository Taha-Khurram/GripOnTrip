import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { createReview } from './api';

/** Submit a review, then refresh the hotel's review list. */
export function useCreateReview(hotelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reviews.hotel(hotelId) }),
  });
}
