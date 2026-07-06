/**
 * Global auth state (Zustand), backed by Supabase.
 *
 * `hydrate()` loads any persisted session on launch and subscribes to Supabase
 * auth changes; from then on the store mirrors the session. Screens read `user`
 * / `isAuthenticated`; protected reads (bookings, owned listings) use `user.id`.
 */
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { useWishlistStore } from '@/store/wishlist.store';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  role?: string;
}

/** Derive the UI user shape from a Supabase session (metadata-only, sync). */
function mapUser(session: Session | null): AuthUser | null {
  const u = session?.user;
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>;
  const email = u.email ?? meta.email ?? '';
  const name =
    meta.full_name || meta.name || (email ? email.split('@')[0] : 'Traveler');
  return {
    id: u.id,
    email,
    name,
    avatarUrl: meta.avatar_url || meta.picture,
    phone: u.phone || meta.phone,
    role: meta.role,
  };
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  /** True until the initial session load resolves on launch. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  applySession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

let listenerBound = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isHydrating: true,

  hydrate: async () => {
    const { data } = await supabase.auth.getSession();
    get().applySession(data.session);
    set({ isHydrating: false });

    if (!listenerBound) {
      listenerBound = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        get().applySession(session);
      });
    }
  },

  applySession: (session) => {
    const user = mapUser(session);
    set({ session, user, isAuthenticated: Boolean(user) });
    // Load the signed-in user's local wishlist (or the guest one when signed out).
    void useWishlistStore.getState().hydrate(user?.id);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
    void useWishlistStore.getState().hydrate(undefined);
  },
}));
