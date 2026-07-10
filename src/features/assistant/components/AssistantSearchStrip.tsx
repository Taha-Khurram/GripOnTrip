import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useGuides } from '@/features/guides/hooks';
import { useHotels } from '@/features/hotels/hooks';
import type { Guide } from '@/features/guides/types';
import type { Hotel } from '@/features/hotels/types';
import { formatMoney, formatRating } from '@/utils/format';
import type { SearchAction } from '../types';

/**
 * Horizontal strip of matching listings, rendered under an assistant reply that
 * carried a `searchAction`. Mirrors the web widget: it fetches hotels or guides
 * for the city and shows tappable cards. `onNavigate` closes the chat before we
 * route to the detail screen (otherwise the modal would cover it).
 */
export function AssistantSearchStrip({
  action,
  onNavigate,
}: {
  action: SearchAction;
  onNavigate: () => void;
}) {
  if (action.type === 'hotels') return <HotelStrip city={action.city} onNavigate={onNavigate} />;
  return <GuideStrip city={action.city} onNavigate={onNavigate} />;
}

function Loading({ city }: { city: string }) {
  return (
    <View className="flex-row items-center gap-2 py-4">
      <ActivityIndicator size="small" color="#f39024" />
      <Text className="text-[11px] font-light text-muted">Finding matches in {city}…</Text>
    </View>
  );
}

function Empty({ kind, city }: { kind: string; city: string }) {
  return (
    <Text className="py-2 text-[11px] font-light italic text-muted">
      No active {kind} listed in {city} at the moment.
    </Text>
  );
}

function HotelStrip({ city, onNavigate }: { city: string; onNavigate: () => void }) {
  const router = useRouter();
  const { data, isLoading } = useHotels({ city });
  const hotels = data?.data ?? [];

  if (isLoading) return <Loading city={city} />;
  if (hotels.length === 0) return <Empty kind="hotels" city={city} />;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
      <View className="flex-row gap-3 pr-2">
        {hotels.map((hotel) => (
          <HotelStripCard
            key={hotel.id}
            hotel={hotel}
            onPress={() => {
              onNavigate();
              router.push(`/hotels/${hotel.id}`);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function HotelStripCard({ hotel, onPress }: { hotel: Hotel; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="w-[170px] overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card"
    >
      <Image
        source={{ uri: hotel.images[0]?.url }}
        style={{ width: '100%', height: 100 }}
        contentFit="cover"
        transition={200}
      />
      <View className="gap-1 p-2.5">
        <Text className="text-[13px] font-semibold text-ink" numberOfLines={1}>
          {hotel.title}
        </Text>
        {hotel.location?.city ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={11} color="#7c8a90" />
            <Text className="text-[11px] text-muted" numberOfLines={1}>
              {hotel.location.city}
            </Text>
          </View>
        ) : null}
        <Text className="text-[13px] font-bold text-accent-600">
          {formatMoney(hotel.price)}
          <Text className="text-[10px] font-normal text-muted"> /night</Text>
        </Text>
      </View>
    </Pressable>
  );
}

function GuideStrip({ city, onNavigate }: { city: string; onNavigate: () => void }) {
  const router = useRouter();
  const { data, isLoading } = useGuides({ city });
  const guides = data?.data ?? [];

  if (isLoading) return <Loading city={city} />;
  if (guides.length === 0) return <Empty kind="guides" city={city} />;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
      <View className="flex-row gap-3 pr-2">
        {guides.map((guide) => (
          <GuideStripCard
            key={guide.id}
            guide={guide}
            onPress={() => {
              onNavigate();
              router.push({ pathname: '/guides/[id]', params: { id: guide.id } });
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function GuideStripCard({ guide, onPress }: { guide: Guide; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="w-[170px] items-center gap-2 rounded-2xl border border-hairline bg-surface p-3 shadow-card"
    >
      {guide.imageUrl ? (
        <Image
          source={{ uri: guide.imageUrl }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <Ionicons name="person" size={26} color="#f39024" />
        </View>
      )}
      <Text className="text-center text-[13px] font-semibold text-ink" numberOfLines={1}>
        {guide.name}
      </Text>
      {guide.city ? (
        <Text className="text-[11px] text-muted" numberOfLines={1}>
          {guide.city}
        </Text>
      ) : null}
      {guide.rating > 0 ? (
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={11} color="#f39024" />
          <Text className="text-[11px] text-muted">{formatRating(guide.rating)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
