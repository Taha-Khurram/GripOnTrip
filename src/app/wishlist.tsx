import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

import { Animated, Card, ImageBand, OceanHero, PressableScale, enterUp } from '@/components/ui';
import { EmptyState } from '@/components/layout/EmptyState';
import { SignInGate } from '@/components/layout/SignInGate';
import { WishlistButton } from '@/components/WishlistButton';
import { APP_NAME } from '@/constants/config';
import { useWishlistStore, type WishlistItem } from '@/store/wishlist.store';
import type { ServiceCategory } from '@/types';
import { formatMoney } from '@/utils/format';

// App brand mark — same asset the home hero + auth header use.
const logo = require('../../assets/images/icon.png');

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

/** Curved ocean hero — mirrors the home screen's header (logo + big title). */
function WishlistHero({ count }: { count?: number }) {
  return (
    <Animated.View entering={enterUp(0)}>
      <OceanHero className="rounded-b-[36px] px-5 pb-8 pt-6">
        <View className="flex-row items-center gap-2.5">
          <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
          <Text className="font-display text-base text-white">{APP_NAME}</Text>
        </View>

        <Text className="mt-6 font-display-x text-[32px] leading-[38px] text-white">Your Wishlist</Text>
        <Text className="mt-2 text-[15px] leading-5 text-white/90">
          {count && count > 0
            ? `${count} saved item${count === 1 ? '' : 's'} · ready when you are`
            : 'Everything you love, saved in one place.'}
        </Text>
      </OceanHero>
    </Animated.View>
  );
}

/** Vertical card matching the Hotels & Stays / My Bookings card style. */
function WishlistCard({ item, index }: { item: WishlistItem; index: number }) {
  const router = useRouter();
  const base = CATEGORY_ROUTE[item.category];
  const icon = CATEGORY_ICON[item.category] ?? 'heart-outline';
  const label = CATEGORY_LABEL[item.category] ?? item.category;

  return (
    <Animated.View entering={enterUp(index)}>
      <Card className="overflow-hidden p-0 shadow-soft">
        <PressableScale
          accessibilityRole="button"
          onPress={() => base && router.push(`${base}/${item.id}` as never)}
        >
          <View>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: 180 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <ImageBand className="h-[180px] items-center justify-center">
                <Ionicons name={icon} size={40} color="rgba(255,255,255,0.85)" />
              </ImageBand>
            )}

            {/* Category pill */}
            <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
              <Ionicons name={icon} size={12} color="#156473" />
              <Text className="text-xs font-body-semibold text-ink">{label}</Text>
            </View>
          </View>

          <View className="gap-2.5 p-4">
            <View className="gap-1">
              <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={1}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted" numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Price row */}
            <View className="mt-0.5 flex-row items-end justify-between">
              {item.price != null ? (
                <Text className="text-xl font-display-x text-brand-600">
                  {formatMoney({ amount: item.price, currency: item.currency ?? 'PKR' })}
                </Text>
              ) : (
                <Text className="text-sm font-medium text-muted">View details</Text>
              )}
              <Ionicons name="chevron-forward" size={20} color="#1a7a8c" />
            </View>
          </View>
        </PressableScale>

        {/* Heart chip — sits above the pressable so taps don't navigate */}
        <View className="absolute right-3 top-3">
          <WishlistButton item={item} chip />
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
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View className="px-5 pb-4">
              <WishlistCard item={item} index={index} />
            </View>
          )}
          ListHeaderComponent={
            <>
              <WishlistHero count={items.length} />
              {items.length > 0 ? (
                <View className="flex-row items-baseline justify-between px-5 pb-3 pt-7">
                  <Text className="font-display text-xl text-ink">Saved items</Text>
                  <Text className="text-xs text-muted">
                    {items.length} item{items.length === 1 ? '' : 's'}
                  </Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            <View className="px-8 py-16">
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
