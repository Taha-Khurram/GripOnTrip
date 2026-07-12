import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { Animated, Badge, Card, ImageBand, OceanHero, PressableScale, enterUp } from '@/components/ui';
import { EmptyState } from '@/components/layout/EmptyState';
import { SignInGate } from '@/components/layout/SignInGate';
import { APP_NAME } from '@/constants/config';
import {
  useDeleteRentalProperty,
  useMyRentalProperties,
  type MyRentalProperty,
} from '@/features/profile';
import { formatMoney } from '@/utils/format';

// App brand mark — same asset the home hero + auth header use.
const logo = require('../../assets/images/icon.png');

function statusTone(status?: string): 'brand' | 'accent' | 'success' | 'neutral' {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'active' || s === 'available') return 'success';
  if (s === 'pending' || s === 'review') return 'accent';
  return 'neutral';
}

const titleCase = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/** Small brand-tinted spec chip (beds / baths / guests). */
function SpecChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1">
      <Ionicons name={icon} size={12} color="#037a4e" />
      <Text className="text-xs font-medium text-brand-700">{label}</Text>
    </View>
  );
}

/** Vertical card matching the Hotels & Stays listing card, with edit + delete. */
function PropertyCard({ property, index }: { property: MyRentalProperty; index: number }) {
  const router = useRouter();
  const { mutate: remove, isPending: deleting } = useDeleteRentalProperty();

  const confirmDelete = () => {
    Alert.alert(
      'Delete listing?',
      `“${property.title}” will be permanently removed. This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove(property.id) },
      ],
    );
  };

  return (
    <Animated.View entering={enterUp(index)}>
      <Card className="overflow-hidden p-0 shadow-soft">
        <PressableScale
          accessibilityRole="button"
          onPress={() => router.push(`/rentals/${property.id}` as never)}
        >
          <View>
            {property.imageUrl ? (
              <Image
                source={{ uri: property.imageUrl }}
                style={{ width: '100%', height: 180 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <ImageBand className="h-[180px] items-center justify-center">
                <Ionicons name="home-outline" size={40} color="rgba(255,255,255,0.85)" />
              </ImageBand>
            )}

            {property.status ? (
              <View className="absolute right-3 top-3">
                <Badge label={titleCase(property.status)} tone={statusTone(property.status)} />
              </View>
            ) : null}
          </View>

          <View className="gap-2.5 p-4">
            <View className="gap-1">
              <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={1}>
                {property.title}
              </Text>
              {property.city ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                  <Text className="text-sm text-muted" numberOfLines={1}>
                    {property.city}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {property.bedrooms != null ? (
                <SpecChip icon="bed-outline" label={`${property.bedrooms} bed`} />
              ) : null}
              {property.bathrooms != null ? (
                <SpecChip icon="water-outline" label={`${property.bathrooms} bath`} />
              ) : null}
              {property.maxGuests != null ? (
                <SpecChip icon="people-outline" label={`${property.maxGuests} guests`} />
              ) : null}
            </View>

            <View className="mt-0.5 flex-row items-baseline gap-1">
              <Text className="text-xl font-display-x text-brand-600">
                {formatMoney({ amount: property.pricePerMonth, currency: property.currency })}
              </Text>
              <Text className="text-xs text-muted-foreground">/ month</Text>
            </View>
          </View>
        </PressableScale>

        {/* Actions — edit + delete. Layout on inner Views so the icon + label stay
            inline (a flex-row className on a raw Pressable can be dropped on native). */}
        <View className="flex-row gap-3 border-t border-hairline p-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit listing"
            onPress={() => router.push({ pathname: '/list-property', params: { id: property.id } })}
            className="flex-1"
          >
            <View className="w-full flex-row items-center justify-center gap-1.5 rounded-xl border border-brand-500 py-3">
              <Ionicons name="create-outline" size={16} color="#00a165" />
              <Text numberOfLines={1} className="font-body-semibold text-sm text-brand-600">
                Edit
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
            disabled={deleting}
            onPress={confirmDelete}
            className="flex-1"
          >
            <View
              className={[
                'w-full flex-row items-center justify-center gap-1.5 rounded-xl bg-red-50 py-3',
                deleting ? 'opacity-50' : '',
              ].join(' ')}
            >
              {deleting ? (
                <ActivityIndicator color="#dc2626" size="small" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  <Text numberOfLines={1} className="font-body-semibold text-sm text-danger">
                    Delete
                  </Text>
                </>
              )}
            </View>
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}

/** Ocean hero with the "List your property" CTA. */
function PropertiesHero({ count }: { count?: number }) {
  const router = useRouter();
  return (
    <Animated.View entering={enterUp(0)}>
      <OceanHero className="rounded-b-[36px] px-5 pb-8 pt-6">
        <View className="flex-row items-center gap-2.5">
          <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
          <Text className="font-display text-base text-white">{APP_NAME}</Text>
        </View>

        <Text className="mt-6 font-display-x text-[32px] leading-[38px] text-white">Your Properties</Text>
        <Text className="mt-2 text-[15px] leading-5 text-white/90">
          {count && count > 0
            ? `${count} listing${count === 1 ? '' : 's'} · manage & list your places.`
            : 'List your place and start hosting travellers.'}
        </Text>

        {/* List your property — layout on the inner View so the icon + label stay inline */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="List your property"
          onPress={() => router.push('/list-property')}
          className="mt-5"
        >
          <View className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-white py-3.5">
            <Ionicons name="add-circle-outline" size={20} color="#037a4e" />
            <Text numberOfLines={1} className="font-body-semibold text-base text-brand-600">
              List Your Property
            </Text>
          </View>
        </Pressable>
      </OceanHero>
    </Animated.View>
  );
}

function PropertiesList() {
  const { data, isLoading, isError, isRefetching, refetch } = useMyRentalProperties();
  const properties = data ?? [];

  return (
    <FlatList
      data={properties}
      keyExtractor={(p) => p.id}
      contentContainerClassName="pb-10"
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <View className="px-5 pb-4">
          <PropertyCard property={item} index={index} />
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00a165" />
      }
      ListHeaderComponent={
        <>
          <PropertiesHero count={properties.length} />
          {properties.length > 0 ? (
            <View className="flex-row items-baseline justify-between px-5 pb-3 pt-7">
              <Text className="font-display text-xl text-ink">All properties</Text>
              <Text className="text-xs text-muted">
                {properties.length} listing{properties.length === 1 ? '' : 's'}
              </Text>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="items-center justify-center py-24">
            <ActivityIndicator color="#00a165" />
          </View>
        ) : isError ? (
          <View className="items-center gap-4 px-8 py-16">
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load your properties"
              message="Something went wrong on our end."
            />
          </View>
        ) : (
          <View className="px-8 py-16">
            <EmptyState
              icon="business-outline"
              title="No properties yet"
              message="Tap “List Your Property” above to add your first listing."
            />
          </View>
        )
      }
    />
  );
}

export default function MyPropertiesScreen() {
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'My Properties' }} />
      <SignInGate icon="business-outline" message="Sign in to see the properties you own.">
        <PropertiesList />
      </SignInGate>
    </View>
  );
}
