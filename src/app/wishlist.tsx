import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

import { Animated, Card, PressableScale, enterUp } from '@/components/ui';
import { EmptyState } from '@/components/layout/EmptyState';
import { SignInGate } from '@/components/layout/SignInGate';
import { WishlistButton } from '@/components/WishlistButton';
import { useWishlistStore, type WishlistItem } from '@/store/wishlist.store';
import type { ServiceCategory } from '@/types';
import { formatMoney } from '@/utils/format';

const CATEGORY_ROUTE: Partial<Record<ServiceCategory, string>> = {
  hotels: '/hotels',
  rentals: '/rentals',
  tours: '/tours',
  umrah: '/umrah',
  guides: '/guides',
  shop: '/shop',
};

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  hotels: 'bed-outline',
  rentals: 'home-outline',
  tours: 'map-outline',
  umrah: 'moon-outline',
  guides: 'person-outline',
  shop: 'bag-outline',
};

const CATEGORY_LABEL: Record<string, string> = {
  hotels: 'Stay',
  rentals: 'Rental',
  tours: 'Tour',
  umrah: 'Umrah',
  guides: 'Guide',
  shop: 'Product',
};

function WishlistRow({ item, index }: { item: WishlistItem; index: number }) {
  const router = useRouter();
  const base = CATEGORY_ROUTE[item.category];

  return (
    <Animated.View entering={enterUp(index)}>
      <Card className="flex-row gap-3 overflow-hidden p-0">
        <PressableScale
          activeScale={0.99}
          className="flex-1 flex-row gap-3"
          onPress={() => base && router.push(`${base}/${item.id}` as never)}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: 104, height: 104 }} contentFit="cover" />
          ) : (
            <View className="h-[104px] w-[104px] items-center justify-center bg-brand-50 dark:bg-brand-500/15">
              <Ionicons name={CATEGORY_ICON[item.category] ?? 'heart-outline'} size={26} color="#1a7a8c" />
            </View>
          )}
          <View className="flex-1 justify-center gap-1 py-2.5 pr-2">
            <View className="self-start rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
              <Text className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                {CATEGORY_LABEL[item.category] ?? item.category}
              </Text>
            </View>
            <Text className="text-base font-semibold text-ink" numberOfLines={1}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text className="text-xs text-muted" numberOfLines={1}>
                {item.subtitle}
              </Text>
            ) : null}
            {item.price != null ? (
              <Text className="text-sm font-bold text-brand-600">
                {formatMoney({ amount: item.price, currency: item.currency ?? 'PKR' })}
              </Text>
            ) : null}
          </View>
        </PressableScale>
        <View className="justify-center pr-3">
          <WishlistButton item={item} />
        </View>
      </Card>
    </Animated.View>
  );
}

export default function WishlistScreen() {
  const items = useWishlistStore((s) => s.items);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'My Wishlist' }} />
      <SignInGate icon="heart-outline" message="Sign in to see items you've saved.">
        <FlatList
          data={items}
          keyExtractor={(it) => `${it.category}:${it.id}`}
          contentContainerClassName="gap-3 p-5"
          renderItem={({ item, index }) => <WishlistRow item={item} index={index} />}
          ListEmptyComponent={
            <View className="mt-24">
              <EmptyState
                icon="heart-outline"
                title="Your wishlist is empty"
                message="Tap the heart on any stay, rental, or tour to save it here."
              />
            </View>
          }
        />
      </SignInGate>
    </View>
  );
}
