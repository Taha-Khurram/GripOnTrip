/**
 * Global auth state (Zustand) — currently a lightweight local stub.
 *
 * Auth is intentionally disabled: the app browses the public REST API and does
 * not sign users in. This store keeps the same shape the UI expects (so screens
 * that reference `user` still work) without any backend. Re-introduce a real
 * provider here later if sign-in is needed.
 */
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until the initial (no-op) hydrate resolves on launch. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: false,

  hydrate: async () => {
    set({ isHydrating: false });
  },

  signOut: async () => {
    set({ user: null, isAuthenticated: false });
  },
}));
