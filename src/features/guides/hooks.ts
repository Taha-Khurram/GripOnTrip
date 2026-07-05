import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchGuide, fetchGuides } from './api';
import type { GuideSearchParams } from './types';

/** Verified-guide listing (optionally filtered by city). */
export function useGuides(params: GuideSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.guides.list(params),
    queryFn: () => fetchGuides(params),
  });
}

/** Single guide detail (selected from the list — the API has no detail route). */
export function useGuide(id: string) {
  return useQuery({
    queryKey: queryKeys.guides.detail(id),
    queryFn: () => fetchGuide(id),
    enabled: Boolean(id),
  });
}
