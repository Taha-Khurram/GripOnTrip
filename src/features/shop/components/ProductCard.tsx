import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import type { Product } from '../types';

/**
 * Grid cell for the marketplace list. Half-width by design — wrap it in a
 * `flex-1` row (see the shop screen) so two sit side by side, like the web.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={{ pathname: '/shop/[id]', params: { id: product.id } }} asChild>
      <Pressable accessibilityRole="button" className="flex-1">
        <Card className="overflow-hidden p-0">
          <View>
            <Image
              source={{ uri: product.images[0]?.url }}
              style={{ width: '100%', height: 150 }}
              contentFit="cover"
              transition={200}
            />
            {product.discountPercent ? (
              <View className="absolute left-2 top-2 rounded-full bg-accent-500 px-2 py-0.5">
                <Text className="text-xs font-bold text-white">-{product.discountPercent}%</Text>
              </View>
            ) : null}
            {!product.inStock ? (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <Text className="text-xs font-bold uppercase tracking-wide text-white">Sold out</Text>
              </View>
            ) : null}
          </View>

          <View className="gap-1 p-3">
            {product.brand ? (
              <Text className="text-xs font-medium uppercase text-neutral-400" numberOfLines={1}>
                {product.brand}
              </Text>
            ) : null}
            <Text
              className="text-sm font-semibold text-neutral-900 dark:text-white"
              numberOfLines={2}
            >
              {product.title}
            </Text>
            <View className="mt-1 flex-row items-baseline gap-2">
              <Text className="text-base font-bold text-brand-600">{formatMoney(product.price)}</Text>
              {product.originalPrice ? (
                <Text className="text-xs text-neutral-400 line-through">
                  {formatMoney(product.originalPrice)}
                </Text>
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
