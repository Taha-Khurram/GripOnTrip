import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Badge, Card } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import { icons8 } from '@/utils/icons8';
import type { Guide } from '../types';

/** Compact guide preview used in the listing. Links to the guide detail. */
export function GuideCard({ guide }: { guide: Guide }) {
  const image = guide.imageUrl;
  const languages = guide.languages.slice(0, 3);

  return (
    <Link href={{ pathname: '/guides/[id]', params: { id: guide.id } }} asChild>
      <Pressable accessibilityRole="button">
        <Card className="gap-3">
          {/* Guide header */}
          <View className="flex-row items-center gap-3">
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                <Image
                  source={{ uri: icons8('map-marker') }}
                  style={{ width: 34, height: 34 }}
                  contentFit="contain"
                />
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text
                  className="flex-1 text-base font-bold text-neutral-900 dark:text-white"
                  numberOfLines={1}
                >
                  {guide.name}
                </Text>
                {guide.isVerified ? <Badge label="Verified" tone="success" /> : null}
              </View>
              <View className="mt-0.5 flex-row items-center gap-3">
                {guide.city ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={13} color="#9ca3af" />
                    <Text className="text-xs text-neutral-500" numberOfLines={1}>
                      {guide.city}
                    </Text>
                  </View>
                ) : null}
                {guide.reviewCount > 0 || guide.rating > 0 ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text className="text-xs text-neutral-500">
                      {formatRating(guide.rating)} ({guide.reviewCount})
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Experience + languages */}
          {guide.experienceYears != null || languages.length > 0 ? (
            <View className="flex-row flex-wrap items-center gap-2">
              {guide.experienceYears != null ? (
                <Badge
                  label={`${guide.experienceYears} yr${guide.experienceYears === 1 ? '' : 's'} exp`}
                  tone="brand"
                />
              ) : null}
              {languages.map((lang) => (
                <Badge key={lang} label={lang} tone="neutral" />
              ))}
            </View>
          ) : null}

          {guide.bio ? (
            <Text
              className="text-sm leading-5 text-neutral-600 dark:text-neutral-400"
              numberOfLines={2}
            >
              {guide.bio}
            </Text>
          ) : null}

          {/* Footer: daily rate */}
          <View className="flex-row items-center justify-between">
            {guide.dailyRate > 0 ? (
              <Text className="text-base font-bold text-brand-600">
                <Text className="text-xs font-normal text-neutral-400">from </Text>
                {formatMoney(guide.price)}
                <Text className="text-xs font-normal text-neutral-400"> /day</Text>
              </Text>
            ) : (
              <View />
            )}
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-brand-600">View profile</Text>
              <Ionicons name="chevron-forward" size={14} color="#208aef" />
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
