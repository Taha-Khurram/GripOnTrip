import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { Animated, Badge, Button, Card, PressableScale, enterUp } from '@/components/ui';
import { EmptyState } from '@/components/layout/EmptyState';
import { SignInGate } from '@/components/layout/SignInGate';
import { useMyProperties, type MyProperty } from '@/features/profile';
import { formatMoney } from '@/utils/format';

function statusTone(status?: string): 'brand' | 'accent' | 'success' | 'neutral' {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'active') return 'success';
  if (s === 'pending' || s === 'review') return 'accent';
  return 'neutral';
}

function PropertyCard({ property, index }: { property: MyProperty; index: number }) {
  const router = useRouter();
  return (
    <Animated.View entering={enterUp(index)}>
      <Card className="flex-row gap-3 overflow-hidden p-0">
        <PressableScale
          activeScale={0.99}
          className="flex-1 flex-row gap-3"
          onPress={() => router.push(`/hotels/${property.id}` as never)}
        >
          {property.imageUrl ? (
            <Image source={{ uri: property.imageUrl }} style={{ width: 104, height: 104 }} contentFit="cover" />
          ) : (
            <View className="h-[104px] w-[104px] items-center justify-center bg-brand-50 dark:bg-brand-500/15">
              <Ionicons name="business-outline" size={26} color="#1a7a8c" />
            </View>
          )}
          <View className="flex-1 gap-1 py-2.5 pr-3">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>
                {property.name}
              </Text>
              {property.status ? <Badge label={property.status} tone={statusTone(property.status)} /> : null}
            </View>
            {property.city ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={13} color="#9aa7ac" />
                <Text className="text-xs text-muted">{property.city}</Text>
              </View>
            ) : null}
            <View className="mt-0.5 flex-row items-center gap-2">
              <View
                className={[
                  'h-1.5 w-1.5 rounded-full',
                  property.isAvailable ? 'bg-success' : 'bg-neutral-300 dark:bg-neutral-600',
                ].join(' ')}
              />
              <Text className="text-xs text-muted-foreground">
                {property.isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
            <Text className="text-sm font-bold text-brand-600">
              {formatMoney({ amount: property.price, currency: property.currency })}
              <Text className="text-xs font-normal text-muted-foreground"> / night</Text>
            </Text>
          </View>
        </PressableScale>
      </Card>
    </Animated.View>
  );
}

function PropertiesList() {
  const { data, isLoading, isError, isRefetching, refetch } = useMyProperties();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#1a7a8c" />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <EmptyState icon="cloud-offline-outline" title="Couldn't load your properties" message="Something went wrong on our end." />
        <Button label="Retry" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(p) => p.id}
      contentContainerClassName="gap-3 p-5"
      renderItem={({ item, index }) => <PropertyCard property={item} index={index} />}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a7a8c" />}
      ListEmptyComponent={
        <View className="mt-24">
          <EmptyState
            icon="business-outline"
            title="No properties yet"
            message="Hotel & stay listings you own appear here."
          />
        </View>
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
