import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { IMAGE_REQUEST_HEADERS } from '@/api/media';
import { Animated, DeepPanel, enterUp, PressableScale } from '@/components/ui';
import { formatCompactMoney } from '@/utils/format';
import type { Tour } from '../types';

/** "Starting from" amount for an operator — its rate, else its cheapest package. */
function startingAmount(tour: Tour): number {
  if (tour.price.amount > 0) return tour.price.amount;
  const amounts = tour.packages.map((p) => p.amount).filter((a) => a > 0);
  return amounts.length > 0 ? Math.min(...amounts) : 0;
}

/** Operator logo with a small teal "verified" check badge (matches the web card). */
function OperatorLogo({ tour }: { tour: Tour }) {
  const [failed, setFailed] = useState(false);
  const uri = failed ? undefined : tour.images[0]?.url;

  return (
    <View className="h-14 w-14">
      {uri ? (
        <Image
          source={{ uri, headers: IMAGE_REQUEST_HEADERS }}
          style={{ width: 56, height: 56, borderRadius: 16 }}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Ionicons name="bus" size={24} color="#f5a623" />
        </View>
      )}
      <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full border-2 border-brand-900 bg-teal-500">
        <Ionicons name="checkmark" size={11} color="#fff" />
      </View>
    </View>
  );
}

/** A single spotlighted operator card inside the panel. */
function SpotlightRow({ tour }: { tour: Tour }) {
  const amount = startingAmount(tour);
  const packageCount = tour.packages.length;
  const place =
    tour.operatingCities[0] ?? tour.location?.city ?? tour.location?.address ?? undefined;

  return (
    <Link href={`/tours/${tour.id}`} asChild>
      <PressableScale accessibilityRole="button" activeScale={0.97}>
        <View className="gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
          {/* Identity row — logo, name, premium badge, location */}
          <View className="flex-row items-center gap-3">
            <OperatorLogo tour={tour} />

            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-2">
                <Text
                  className="flex-1 font-display-semibold text-[16px] text-white"
                  numberOfLines={1}
                >
                  {tour.title}
                </Text>
                <View className="flex-row items-center gap-1 rounded-full bg-accent-500/20 px-2 py-1">
                  <Ionicons name="star" size={10} color="#f5a623" />
                  <Text className="text-[10px] font-body-semibold uppercase tracking-wide text-accent-400">
                    Premium
                  </Text>
                </View>
              </View>

              {place || packageCount > 0 ? (
                <View className="flex-row items-center gap-2">
                  {place ? (
                    <View className="flex-shrink flex-row items-center gap-1">
                      <Ionicons name="location" size={12} color="#a9c2dd" />
                      <Text className="flex-shrink text-[12px] text-white/70" numberOfLines={1}>
                        {place}
                      </Text>
                    </View>
                  ) : null}
                  {place && packageCount > 0 ? (
                    <View className="h-3 w-px bg-white/20" />
                  ) : null}
                  {packageCount > 0 ? (
                    <Text className="text-[12px] text-white/70">
                      {packageCount} package{packageCount === 1 ? '' : 's'}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>

          {/* Price + CTA row — separated by a hairline so nothing collides */}
          <View className="flex-row items-center justify-between border-t border-white/10 pt-3">
            {amount > 0 ? (
              <View className="flex-row items-baseline gap-1.5">
                <Text className="text-[10px] font-body-semibold uppercase tracking-[1px] text-white/50">
                  From
                </Text>
                <Text className="font-display-x text-[20px] text-accent-500">
                  {formatCompactMoney({ amount, currency: tour.price.currency })}
                </Text>
              </View>
            ) : (
              <Text className="text-[13px] font-body-medium text-white/70">View operator</Text>
            )}
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2">
              <Text className="text-[12px] font-body-semibold text-white">View</Text>
              <Ionicons name="arrow-forward" size={14} color="#f5a623" />
            </View>
          </View>
        </View>
      </PressableScale>
    </Link>
  );
}

/**
 * "Premium Spotlight" — a dark navy panel highlighting verified elite operators
 * (those flagged `[PREMIUM]`). Mirrors the web tours page's spotlight strip and
 * reuses the home screen's `DeepPanel` + accent-gold visual language. Renders
 * nothing when there are no premium operators.
 */
export function PremiumSpotlight({ tours, index = 0 }: { tours: Tour[]; index?: number }) {
  const premium = tours.filter((t) => (t.flag ?? '').toUpperCase().includes('PREMIUM'));
  if (premium.length === 0) return null;

  return (
    <Animated.View entering={enterUp(index)} className="mx-5 mt-6">
      <DeepPanel className="gap-4 rounded-[28px] p-5 shadow-soft">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accent-500 shadow-glow">
            <Ionicons name="star" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="font-display-semibold text-[13px] uppercase tracking-[1.5px] text-white">
              Premium Spotlight
            </Text>
            <Text className="text-[12px] text-accent-400">Verified elite operators</Text>
          </View>
          <View className="rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1">
            <Text className="text-[11px] font-body-semibold text-accent-400">
              {premium.length} Featured
            </Text>
          </View>
        </View>

        {/* Operator rows */}
        <View className="gap-3">
          {premium.map((tour) => (
            <SpotlightRow key={tour.id} tour={tour} />
          ))}
        </View>
      </DeepPanel>
    </Animated.View>
  );
}
