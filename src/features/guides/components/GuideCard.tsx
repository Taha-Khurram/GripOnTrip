import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Animated, Card, enterUp, ImageBand, PressableScale } from '@/components/ui';
import { formatMoney, formatRating } from '@/utils/format';
import type { Guide } from '../types';

/** Small brand-tinted spec pill (experience, languages). */
function SpecChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1">
      <Ionicons name={icon} size={12} color="#156473" />
      <Text className="text-xs font-medium text-brand-700">{label}</Text>
    </View>
  );
}

/** Compact guide preview used in the listing. Links to the guide detail. */
export function GuideCard({ guide, index = 0 }: { guide: Guide; index?: number }) {
  const image = guide.imageUrl;
  const languages = guide.languages.slice(0, 3);

  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={{ pathname: '/guides/[id]', params: { id: guide.id } }} asChild>
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
                  <Ionicons name="person-outline" size={40} color="rgba(255,255,255,0.85)" />
                </ImageBand>
              )}

              {guide.isVerified ? (
                <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full bg-accent-500 px-3 py-1 shadow-glow">
                  <Ionicons name="checkmark-circle" size={13} color="#fff" />
                  <Text className="text-xs font-body-semibold text-white">Verified</Text>
                </View>
              ) : null}

              {/* Floating rating pill */}
              {guide.rating > 0 ? (
                <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-card">
                  <Ionicons name="star" size={12} color="#f39024" />
                  <Text className="text-xs font-bold text-ink">{formatRating(guide.rating)}</Text>
                </View>
              ) : null}
            </View>

            <View className="gap-2.5 p-4">
              <View className="gap-1">
                <Text className="text-[17px] font-display-semibold text-ink" numberOfLines={1}>
                  {guide.name}
                </Text>
                {guide.city ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={14} color="#9aa7ac" />
                    <Text className="text-sm text-muted" numberOfLines={1}>
                      {guide.city}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Spec chips */}
              {guide.experienceYears != null || languages.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {guide.experienceYears != null ? (
                    <SpecChip
                      icon="ribbon-outline"
                      label={`${guide.experienceYears} yr${guide.experienceYears === 1 ? '' : 's'} exp`}
                    />
                  ) : null}
                  {languages.map((lang) => (
                    <SpecChip key={lang} icon="language-outline" label={lang} />
                  ))}
                </View>
              ) : null}

              {/* Price row */}
              <View className="mt-0.5 flex-row items-end justify-between">
                {guide.dailyRate > 0 ? (
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="text-xs text-muted-foreground">from</Text>
                    <Text className="text-xl font-display-x text-brand-600">
                      {formatMoney(guide.price)}
                    </Text>
                    <Text className="text-xs text-muted-foreground">/ day</Text>
                  </View>
                ) : (
                  <View />
                )}
                <Ionicons name="chevron-forward" size={20} color="#1a7a8c" />
              </View>
            </View>
          </Card>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}
