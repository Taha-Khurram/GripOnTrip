import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, Text, View } from 'react-native';

import { Badge, Button, DetailSkeleton, Gallery } from '@/components/ui';
import { ProductDescription, productWebUrl, useProduct } from '@/features/shop';
import { formatMoney, formatRating } from '@/utils/format';

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-xs uppercase text-neutral-400">{label}</Text>
      <Text className="text-sm text-neutral-700 dark:text-neutral-300">{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-black">
        <Stack.Screen options={{ title: 'Product' }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
        <Stack.Screen options={{ title: 'Product' }} />
        <Text className="text-center text-neutral-500">
          Couldn&apos;t load this product. Pull back and try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ title: product.title }} />
      <ScrollView contentContainerClassName="pb-32">
        <Gallery images={product.images.map((i) => i.url)} />

        <View className="gap-4 p-5">
          <View className="flex-row flex-wrap items-center gap-2">
            {product.brand ? <Badge label={product.brand} tone="brand" /> : null}
            {product.collection ? <Badge label={product.collection} tone="accent" /> : null}
            {product.productCategory ? <Badge label={product.productCategory} tone="neutral" /> : null}
          </View>

          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">{product.title}</Text>

          <View className="flex-row items-baseline gap-3">
            <Text className="text-2xl font-bold text-brand-600">{formatMoney(product.price)}</Text>
            {product.originalPrice ? (
              <Text className="text-base text-neutral-400 line-through">
                {formatMoney(product.originalPrice)}
              </Text>
            ) : null}
            {product.discountPercent ? (
              <View className="rounded-full bg-accent-50 px-2 py-0.5">
                <Text className="text-xs font-bold text-accent-700">-{product.discountPercent}%</Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name={product.inStock ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={product.inStock ? '#16a34a' : '#ef4444'}
              />
              <Text
                className={product.inStock ? 'text-sm text-success' : 'text-sm text-danger'}
              >
                {product.inStock
                  ? product.stock > 0
                    ? `In stock (${product.stock})`
                    : 'In stock'
                  : 'Sold out'}
              </Text>
            </View>
            {product.rating != null ? (
              <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                ★ {formatRating(product.rating)}
              </Text>
            ) : null}
          </View>

          {product.colour || product.size ? (
            <View className="flex-row gap-8">
              {product.colour ? <Attribute label="Colour" value={product.colour} /> : null}
              {product.size ? <Attribute label="Size" value={product.size} /> : null}
            </View>
          ) : null}

          {product.description ? (
            <View className="gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <ProductDescription markdown={product.description} />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky action bar — purchase completes on gripontrip.com */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between gap-3 border-t border-neutral-100 bg-white px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-lg font-bold text-brand-600">{formatMoney(product.price)}</Text>
          {product.originalPrice ? (
            <Text className="text-xs text-neutral-400 line-through">
              {formatMoney(product.originalPrice)}
            </Text>
          ) : null}
        </View>
        <Button
          label={product.inStock ? 'Buy on gripontrip.com' : 'View on gripontrip.com'}
          onPress={() => Linking.openURL(productWebUrl(product))}
        />
      </View>
    </View>
  );
}
