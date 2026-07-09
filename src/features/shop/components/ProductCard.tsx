import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Card, enterUp, ImageBand, PressableScale } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import type { Product } from '../types';

/**
 * Grid cell for the marketplace list. Half-width by design — wrap it in a
 * `flex-1` row (see the shop screen) so two sit side by side, like the web.
 */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const image = product.images[0]?.url;
  return (
    <Animated.View entering={enterUp(index)} className="flex-1">
      <Link href={{ pathname: '/shop/[id]', params: { id: product.id } }} asChild>
        <PressableScale accessibilityRole="button" className="flex-1">
          <Card className="overflow-hidden p-0">
          <View>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: 150 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <ImageBand className="h-[150px] items-center justify-center">
                <Ionicons name="bag-handle-outline" size={34} color="rgba(255,255,255,0.85)" />
              </ImageBand>
            )}
            {product.discountPercent ? (
              <View className="absolute left-2 top-2 rounded-full bg-accent-500 px-2.5 py-0.5">
                <Text className="text-xs font-body-semibold text-white">-{product.discountPercent}%</Text>
              </View>
            ) : null}
            {!product.inStock ? (
              <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-brand-900/45">
                <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">Sold out</Text>
              </View>
            ) : null}
          </View>

          <View className="gap-1 p-3">
            {product.brand ? (
              <Text className="text-xs font-body-medium uppercase text-muted-foreground" numberOfLines={1}>
                {product.brand}
              </Text>
            ) : null}
            <Text
              className="text-sm font-display-semibold text-ink"
              numberOfLines={2}
            >
              {product.title}
            </Text>
            <View className="mt-1 flex-row items-baseline gap-2">
              <Text className="text-base font-bold text-brand-600">{formatMoney(product.price)}</Text>
              {product.originalPrice ? (
                <Text className="text-xs text-muted-foreground line-through">
                  {formatMoney(product.originalPrice)}
                </Text>
              ) : null}
            </View>
          </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
