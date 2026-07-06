/**
 * Wishlist — client-side, per user (mirrors the website, which keeps the
 * wishlist in browser storage rather than a backend table).
 *
 * Each entry stores enough of a snapshot to render a card without another
 * network call; the detail screens still re-fetch live data by id/category.
 * Persisted in AsyncStorage under a per-user key so switching accounts (or
 * signing out to the guest list) keeps wishlists separate.
 */
import { create } from 'zustand';

import { storage } from '@/lib/storage';
import type { ServiceCategory } from '@/types';

export interface WishlistItem {
  id: string;
  category: ServiceCategory;
  title: string;
  imageUrl?: string;
  subtitle?: string;
  price?: number;
  currency?: string;
}

/** Stable key for an item across categories (ids are only unique per vertical). */
export function wishlistKey(category: ServiceCategory, id: string): string {
  return `${category}:${id}`;
}

function storageKey(userId?: string): string {
  return `got.wishlist.${userId ?? 'guest'}`;
}

interface WishlistState {
  /** Which user's list is currently loaded (undefined = guest). */
  ownerId?: string;
  items: WishlistItem[];
  hydrate: (userId?: string) => Promise<void>;
  has: (category: ServiceCategory, id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (category: ServiceCategory, id: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ownerId: undefined,
  items: [],

  hydrate: async (userId) => {
    const items = (await storage.getJSON<WishlistItem[]>(storageKey(userId))) ?? [];
    set({ ownerId: userId, items });
  },

  has: (category, id) =>
    get().items.some((it) => it.category === category && it.id === id),

  toggle: (item) => {
    const { items, ownerId } = get();
    const exists = items.some((it) => it.category === item.category && it.id === item.id);
    const next = exists
      ? items.filter((it) => !(it.category === item.category && it.id === item.id))
      : [item, ...items];
    set({ items: next });
    void storage.setJSON(storageKey(ownerId), next);
  },

  remove: (category, id) => {
    const { items, ownerId } = get();
    const next = items.filter((it) => !(it.category === category && it.id === id));
    set({ items: next });
    void storage.setJSON(storageKey(ownerId), next);
  },

  clear: () => {
    const { ownerId } = get();
    set({ items: [] });
    void storage.setJSON(storageKey(ownerId), []);
  },
}));
