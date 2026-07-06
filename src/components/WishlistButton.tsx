import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useWishlistStore, type WishlistItem } from '@/store/wishlist.store';

interface WishlistButtonProps {
  item: WishlistItem;
  size?: number;
  /** Rounded translucent chip behind the heart (for use over imagery). */
  chip?: boolean;
}

/** Heart toggle that adds/removes an item from the local wishlist. */
export function WishlistButton({ item, size = 22, chip = false }: WishlistButtonProps) {
  const saved = useWishlistStore((s) => s.has(item.category, item.id));
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      hitSlop={8}
      onPress={() => toggle(item)}
      className={
        chip
          ? 'h-10 w-10 items-center justify-center rounded-full bg-black/40 active:opacity-70'
          : 'active:opacity-70'
      }
    >
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size}
        color={saved ? '#ef4444' : chip ? '#fff' : '#9ca3af'}
      />
    </Pressable>
  );
}
