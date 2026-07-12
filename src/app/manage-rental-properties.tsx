import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { Animated, Badge, Button, Card, PressableScale, enterUp } from '@/components/ui';
import { EmptyState } from '@/components/layout/EmptyState';
import { SignInGate } from '@/components/layout/SignInGate';
import {
  useDeleteRentalProperty,
  useMyRentalProperties,
  type MyRentalProperty,
} from '@/features/profile';
import { formatMoney } from '@/utils/format';

function statusTone(status?: string): 'brand' | 'accent' | 'success' | 'neutral' {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'active' || s === 'available') return 'success';
  if (s === 'pending' || s === 'review') return 'accent';
  return 'neutral';
}

function RentalPropertyCard({ property, index }: { property: MyRentalProperty; index: number }) {
  const router = useRouter();
  const { mutate: remove, isPending } = useDeleteRentalProperty();

  const confirmDelete = () => {
    Alert.alert(
      'Delete listing?',
      `"${property.title}" will be permanently removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove(property.id) },
      ],
    );
  };

  const specs = [
    property.bedrooms != null ? `${property.bedrooms} bed` : null,
    property.bathrooms != null ? `${property.bathrooms} bath` : null,
    property.maxGuests != null ? `${property.maxGuests} guests` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Animated.View entering={enterUp(index)}>
      <Card className="overflow-hidden p-0">
        <PressableScale
          activeScale={0.99}
          className="flex-row gap-3"
          onPress={() => router.push(`/rentals/${property.id}` as never)}
        >
          {property.imageUrl ? (
            <Image source={{ uri: property.imageUrl }} style={{ width: 104, height: 104 }} contentFit="cover" />
          ) : (
            <View className="h-[104px] w-[104px] items-center justify-center bg-brand-50 dark:bg-brand-500/15">
              <Ionicons name="home-outline" size={26} color="#00a165" />
            </View>
          )}
          <View className="flex-1 gap-1 py-2.5 pr-3">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>
                {property.title}
              </Text>
              {property.status ? <Badge label={property.status} tone={statusTone(property.status)} /> : null}
            </View>
            {property.city ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={13} color="#9aa7ac" />
                <Text className="text-xs text-muted">{property.city}</Text>
              </View>
            ) : null}
            {specs ? <Text className="text-xs text-muted">{specs}</Text> : null}
            <Text className="text-sm font-bold text-brand-600">
              {formatMoney({ amount: property.pricePerMonth, currency: property.currency })}
              <Text className="text-xs font-normal text-muted-foreground"> / month</Text>
            </Text>
          </View>
        </PressableScale>
        <View className="flex-row justify-end border-t border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
            disabled={isPending}
            onPress={confirmDelete}
            className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 active:bg-red-50 dark:active:bg-red-950"
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
            )}
            <Text className="text-sm font-semibold text-danger">Delete</Text>
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}

function RentalPropertiesList() {
  const { data, isLoading, isError, isRefetching, refetch } = useMyRentalProperties();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#00a165" />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <EmptyState icon="cloud-offline-outline" title="Couldn't load your rental properties" message="Something went wrong on our end." />
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(p) => p.id}
      contentContainerClassName="gap-3 p-5"
      renderItem={({ item, index }) => <RentalPropertyCard property={item} index={index} />}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00a165" />}
      ListEmptyComponent={
        <View className="mt-24">
          <EmptyState
            icon="home-outline"
            title="No rental listings yet"
            message="Vacation rentals you list appear here for you to manage."
          />
        </View>
      }
    />
  );
}

export default function ManageRentalPropertiesScreen() {
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Manage Rental Properties' }} />
      <SignInGate icon="home-outline" message="Sign in to manage your rental listings.">
        <RentalPropertiesList />
      </SignInGate>
    </View>
  );
}
