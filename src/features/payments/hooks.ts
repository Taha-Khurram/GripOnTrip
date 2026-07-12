import { useMutation } from '@tanstack/react-query';

import { payWithCard } from './api';
import type { ChargeInput, ChargeResult } from './types';

/**
 * Charge a card once. Wraps the tokenize→charge flow in a React Query mutation
 * so screens get `isPending` / error handling for free and never touch the
 * payments API directly (per the app's "hooks, not raw calls" rule).
 */
export function usePayWithCard() {
  return useMutation<ChargeResult, Error, ChargeInput>({
    mutationFn: payWithCard,
  });
}
