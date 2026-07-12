import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { WishlistButton } from '@/components/WishlistButton';
import { Animated, enterUp, ImageBand, PressableScale } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import type { Rental } from '../types';

/**
 * Compact half-width property card for the BNB grid — mirrors the marketing
 * site's rental card: image with a wishlist heart, then category · city, title,
 * bed/bath line and the day rate. Designed to sit in a 2-column FlatList.
 */
export function PropertyCard({ rental, index = 0 }: { rental: Rental; index?: number }) {
  const image = rental.images[0]?.url;
  const city = rental.location?.city;
  const perDay = rental.pricePerDay != null && rental.pricePerDay > 0;
  const priceAmount = perDay ? rental.pricePerDay! : rental.price.amount;

  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={`/rentals/${rental.id}`} asChild>
        <PressableScale accessibilityRole="button" activeScale={0.97}>
          <View className="gap-2.5">
            {/* Image */}
            <View className="overflow-hidden rounded-3xl">
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: 150 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <ImageBand className="h-[150px] items-center justify-center gap-1">
                  <Ionicons name="image-outline" size={30} color="rgba(255,255,255,0.9)" />
                  <Text className="text-[10px] font-body-semibold uppercase tracking-wide text-white/90">
                    No image available
                  </Text>
                </ImageBand>
              )}

              {rental.discountPercent ? (
                <View className="absolute left-2.5 top-2.5 rounded-full bg-accent-500 px-2.5 py-1 shadow-glow">
                  <Text className="text-[11px] font-body-semibold text-white">
                    {rental.discountPercent}% OFF
                  </Text>
                </View>
              ) : null}

              <View className="absolute right-2.5 top-2.5 h-9 w-9 items-center justify-center rounded-full bg-white shadow-card">
                <WishlistButton
                  size={18}
                  item={{
                    id: rental.id,
                    category: 'rentals',
                    title: rental.title,
                    imageUrl: image,
                    subtitle: city,
                    price: rental.price.amount,
                    currency: rental.price.currency,
                  }}
                />
              </View>
            </View>

            {/* Details */}
            <View className="gap-1 px-0.5">
              <Text
                className="text-[11px] font-body-semibold uppercase tracking-[0.5px] text-brand-600"
                numberOfLines={1}
              >
                {rental.propertyType}
                {city ? ` · ${city}` : ''}
              </Text>
              <Text className="text-[14px] font-display-semibold leading-5 text-ink" numberOfLines={2}>
                {rental.title}
              </Text>

              <View className="mt-1 flex-row items-end justify-between gap-2">
                <Text className="text-[12px] text-muted" numberOfLines={1}>
                  {rental.bedrooms ?? 1} bed · {rental.bathrooms ?? 1} bath
                </Text>
                <View className="flex-row items-baseline">
                  <Text className="text-[13px] font-display-x text-ink">
                    {formatMoney({ amount: priceAmount, currency: rental.price.currency })}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground">/{perDay ? 'day' : 'mo'}</Text>
                </View>
              </View>
            </View>
          </View>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
