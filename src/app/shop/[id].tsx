import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, DetailSkeleton, Gallery, PressableScale, Stepper } from '@/components/ui';
import { WishlistButton } from '@/components/WishlistButton';
import { useRequireAuth } from '@/features/auth';
import { ProductDescription, productWebUrl, useProduct } from '@/features/shop';
import { formatMoney, formatRating } from '@/utils/format';

function SectionTitle({ children }: { children: string }) {
  return <Text className="font-display text-lg text-ink">{children}</Text>;
}

/** Section header with a title and a trailing hairline divider (Umrah style). */
function SectionHeader({ children }: { children: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <SectionTitle>{children}</SectionTitle>
      <View className="h-px flex-1 bg-hairline" />
    </View>
  );
}

/**
 * A labelled info row inside a bordered detail card (icon · label · value) —
 * matches the Umrah "What's included" card rows.
 */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
        <Ionicons name={icon} size={18} color="#037a4e" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[11px] font-body-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </Text>
        <Text className="text-sm leading-5 text-ink">{value}</Text>
      </View>
    </View>
  );
}

/**
 * Marketplace product detail. Adopts the tour/BNB detail layout — a full-bleed
 * image gallery with floating back + wishlist buttons, a white content sheet
 * that overlaps with a rounded top, and a sticky bottom purchase bar — plus a
 * quantity selector that carries into the on-device checkout.
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading, isError } = useProduct(id);
  const { requireAuth } = useRequireAuth();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-muted">
          Couldn&apos;t load this product. Pull back and try again.
        </Text>
      </View>
    );
  }

  const maxQty = product.stock > 0 ? Math.min(product.stock, 20) : 20;
  const total = { amount: product.price.amount * quantity, currency: product.price.currency };

  const buyNow = () =>
    requireAuth(() =>
      router.push({ pathname: '/shop/checkout', params: { id: product.id, qty: String(quantity) } }),
    );

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Full-bleed gallery with floating back + wishlist buttons */}
        <View>
          <Gallery images={product.images.map((i) => i.url)} height={300} />

          {product.discountPercent ? (
            <View className="absolute left-4 top-14 rounded-full bg-accent-500 px-3 py-1 shadow-glow">
              <Text className="text-xs font-body-semibold text-white">
                -{product.discountPercent}%
              </Text>
            </View>
          ) : null}

          <PressableScale
            onPress={() => router.back()}
            activeScale={0.9}
            className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </PressableScale>
          <View className="absolute right-4 top-12">
            <WishlistButton
              chip
              item={{
                id: product.id,
                category: 'shop',
                title: product.title,
                imageUrl: product.images[0]?.url,
                subtitle: product.brand ?? product.productCategory,
                price: product.price.amount,
                currency: product.price.currency,
              }}
            />
          </View>
        </View>

        {/* Content sheet — overlaps the gallery with a rounded top */}
        <View className="-mt-6 gap-5 rounded-t-[28px] bg-white p-5 pt-6">
          {/* Badges */}
          {product.brand || product.collection || product.productCategory ? (
            <View className="flex-row flex-wrap items-center gap-2">
              {product.brand ? <Badge label={product.brand} tone="brand" /> : null}
              {product.collection ? <Badge label={product.collection} tone="accent" /> : null}
              {product.productCategory ? (
                <Badge label={product.productCategory} tone="neutral" />
              ) : null}
            </View>
          ) : null}

          {/* Title + meta */}
          <View className="gap-1.5">
            <Text className="font-display-x text-2xl leading-8 text-ink">{product.title}</Text>
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
              {product.rating != null && product.rating > 0 ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#f5a623" />
                  <Text className="text-sm font-semibold text-ink">
                    {formatRating(product.rating)}
                  </Text>
                </View>
              ) : null}
              <View className="flex-row items-center gap-1.5">
                <Ionicons
                  name={product.inStock ? 'checkmark-circle' : 'close-circle'}
                  size={15}
                  color={product.inStock ? '#16a34a' : '#ef4444'}
                />
                <Text className={product.inStock ? 'text-sm text-success' : 'text-sm text-danger'}>
                  {product.inStock
                    ? product.stock > 0
                      ? `In stock (${product.stock})`
                      : 'In stock'
                    : 'Sold out'}
                </Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View className="flex-row items-baseline gap-2">
            <Text className="font-display-x text-2xl text-brand-600">
              {formatMoney(product.price)}
            </Text>
            {product.originalPrice ? (
              <Text className="text-base text-muted-foreground line-through">
                {formatMoney(product.originalPrice)}
              </Text>
            ) : null}
            {product.discountPercent ? (
              <Text className="text-sm font-semibold text-danger">
                Save {product.discountPercent}%
              </Text>
            ) : null}
          </View>

          {/* Product details — bordered card of icon rows (Umrah "included" style) */}
          {product.brand ||
          product.productCategory ||
          product.collection ||
          product.colour ||
          product.size ? (
            <View className="gap-2">
              <SectionHeader>Product details</SectionHeader>
              <View className="gap-4 rounded-2xl border border-hairline bg-surface p-4">
                {product.brand ? (
                  <DetailRow icon="business-outline" label="Brand" value={product.brand} />
                ) : null}
                {product.productCategory ? (
                  <DetailRow
                    icon="pricetag-outline"
                    label="Category"
                    value={product.productCategory}
                  />
                ) : null}
                {product.collection ? (
                  <DetailRow icon="albums-outline" label="Collection" value={product.collection} />
                ) : null}
                {product.colour ? (
                  <DetailRow icon="color-palette-outline" label="Colour" value={product.colour} />
                ) : null}
                {product.size ? (
                  <DetailRow icon="resize-outline" label="Size" value={product.size} />
                ) : null}
                <DetailRow
                  icon={product.inStock ? 'checkmark-circle-outline' : 'close-circle-outline'}
                  label="Availability"
                  value={
                    product.inStock
                      ? product.stock > 0
                        ? `In stock (${product.stock} available)`
                        : 'In stock'
                      : 'Sold out'
                  }
                />
              </View>
            </View>
          ) : null}

          {/* Quantity */}
          {product.inStock ? (
            <View className="gap-2">
              <SectionTitle>Quantity</SectionTitle>
              <View className="rounded-2xl border border-hairline bg-surface-sunk px-4">
                <Stepper
                  label={`${formatMoney(product.price)} each`}
                  value={quantity}
                  min={1}
                  max={maxQty}
                  onChange={setQuantity}
                />
              </View>
            </View>
          ) : null}

          {/* Description */}
          {product.description ? (
            <View className="gap-2">
              <SectionHeader>Description</SectionHeader>
              <View className="rounded-2xl border border-hairline bg-surface p-4">
                <ProductDescription markdown={product.description} />
              </View>
            </View>
          ) : null}

          {/* View on web */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View on gripontrip.com"
            onPress={() => Linking.openURL(productWebUrl(product))}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="open-outline" size={16} color="#00a165" />
            <Text className="text-sm font-body-semibold text-brand-600">
              View this item on gripontrip.com
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sticky purchase bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-hairline bg-white px-5 pb-8 pt-3">
        <View>
          <Text className="font-display-x text-xl text-brand-600">{formatMoney(total)}</Text>
          <Text className="text-xs text-muted-foreground">
            {quantity} item{quantity === 1 ? '' : 's'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={product.inStock ? 'Buy now' : 'Sold out'}
          disabled={!product.inStock}
          onPress={buyNow}
          className={[
            'flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 px-8 py-4',
            product.inStock ? '' : 'opacity-50',
          ].join(' ')}
        >
          <Ionicons name="bag-check-outline" size={18} color="#ffffff" />
          <Text className="font-body-semibold text-base text-white">
            {product.inStock ? 'Buy Now' : 'Sold Out'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
