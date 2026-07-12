import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Card, enterUp, ImageBand, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Product } from '../types';

/** Small brand-tinted spec pill (category, colour, size). */
function SpecChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1">
      <Ionicons name={icon} size={12} color="#037a4e" />
      <Text className="text-xs font-medium text-brand-700" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Full-width marketplace card — matches the Hotels & Stays listing card. */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const image = product.images[0]?.url;
  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={{ pathname: '/shop/[id]', params: { id: product.id } }} asChild>
        <PressableScale accessibilityRole="button">
          <Card className="overflow-hidden p-0 shadow-soft">
            <View>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: 190 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <ImageBand className="h-[190px] items-center justify-center">
                  <Ionicons name="bag-handle-outline" size={40} color="rgba(255,255,255,0.85)" />
                </ImageBand>
              )}

              {product.discountPercent ? (
                <View className="absolute left-3 top-3 rounded-full bg-accent-500 px-3 py-1 shadow-glow">
                  <Text className="text-xs font-body-semibold text-white">
                    {product.discountPercent}% OFF
                  </Text>
                </View>
              ) : null}

              {/* Floating rating pill */}
              {product.rating != null && product.rating > 0 ? (
                <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
                  <Ionicons name="star" size={12} color="#f5a623" />
                  <Text className="text-xs font-bold text-ink">{formatRating(product.rating)}</Text>
                </View>
              ) : null}

              {!product.inStock ? (
                <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-brand-900/45">
                  <Text className="text-xs font-body-semibold uppercase tracking-wide text-white">
                    Sold out
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="gap-2.5 p-4">
              <View className="gap-1">
                {product.brand ? (
                  <Text
                    className="text-xs font-body-medium uppercase tracking-wide text-muted-foreground"
                    numberOfLines={1}
                  >
                    {product.brand}
                  </Text>
                ) : null}
                <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={2}>
                  {product.title}
                </Text>
              </View>

              {/* Spec chips */}
              {product.productCategory || product.colour || product.size ? (
                <View className="flex-row flex-wrap gap-2">
                  {product.productCategory ? (
                    <SpecChip icon="pricetag-outline" label={product.productCategory} />
                  ) : null}
                  {product.colour ? (
                    <SpecChip icon="color-palette-outline" label={product.colour} />
                  ) : null}
                  {product.size ? (
                    <SpecChip icon="resize-outline" label={product.size} />
                  ) : null}
                </View>
              ) : null}

              {/* Price row */}
              <View className="mt-0.5 flex-row items-end justify-between">
                <View className="flex-row items-baseline gap-1.5">
                  <Text className="text-xl font-display-x text-brand-600">
                    {formatMoney(product.price)}
                  </Text>
                  {product.originalPrice ? (
                    <Text className="text-xs text-muted-foreground line-through">
                      {formatMoney(product.originalPrice)}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#00a165" />
              </View>
            </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
