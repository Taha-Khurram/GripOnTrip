import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useAuthStore } from '@/store/auth.store';

/**
 * Master switch for action-time auth gating. Set to `true` to require sign-in
 * before booking / reviewing. Currently OFF — actions run without the auth
 * screens (auth code stays wired for a later flip).
 */
export const AUTH_GATING_ENABLED = false;

/**
 * Action-time auth gating. Browsing is public; protected actions (book, review)
 * call `requireAuth(cb)` — when gating is enabled and the user is signed out
 * they're routed to the sign-in modal, otherwise `cb` runs immediately.
 * Returns whether the action was allowed to proceed.
 */
export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const requireAuth = useCallback(
    (onAuthed?: () => void) => {
      if (!AUTH_GATING_ENABLED || isAuthenticated) {
        onAuthed?.();
        return true;
      }
      router.push('/(auth)/sign-in');
      return false;
    },
    [isAuthenticated, router],
  );

  return { isAuthenticated, requireAuth };
}
