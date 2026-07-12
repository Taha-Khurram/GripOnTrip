import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { DeepPanel, PressableScale } from '@/components/ui';

type IconName = keyof typeof Ionicons.glyphMap;

interface Featured {
  key: string;
  /** Category name shown as the headline / collapsed label. */
  title: string;
  /** Short verb-first CTA suffix, e.g. "Explore Premium". */
  cta: string;
  description: string;
  icon: IconName;
  route: string;
  /** Lifestyle photo; falls back to the navy gradient panel if it fails to load. */
  image: string;
}

// Curated hero panels mirroring the website's featured-category strip. Routes
// reuse the same targets as `CATEGORIES` so taps land on the real listing pages.
const FEATURED: Featured[] = [
  {
    key: 'hotels',
    title: 'Premium Hotels',
    cta: 'Explore Premium',
    description: 'Handpicked luxury stays with direct owner rates — no middleman.',
    icon: 'business',
    route: '/hotels',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=70',
  },
  {
    key: 'rentals',
    title: 'Vacation Rentals',
    cta: 'Browse Rentals',
    description: 'Villas, apartments and unique homes for every kind of trip.',
    icon: 'home',
    route: '/(tabs)/rentals',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=70',
  },
  {
    key: 'tours',
    title: 'Guided Tours',
    cta: 'Discover Tours',
    description: 'Expert-led experiences and curated day trips across the region.',
    icon: 'compass',
    route: '/(tabs)/tours',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=70',
  },
  {
    key: 'umrah',
    title: 'Umrah Packages',
    cta: 'View Packages',
    description: 'Shariah-compliant retreats with visa, flights and hotel services.',
    icon: 'moon',
    route: '/(tabs)/umrah',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=70',
  },
];

/**
 * Featured categories rendered as a mobile accordion: one expanded photo "hero"
 * panel plus collapsed navy strips. Tapping a strip springs it open (animating
 * the height via reanimated `LinearTransition`) and collapses the rest — the
 * mobile translation of the website's expandable featured-category row.
 */
export function FeaturedCategories() {
  const [expanded, setExpanded] = useState(0);

  return (
    <View className="gap-3 px-5">
      {FEATURED.map((item, i) => (
        <Animated.View
          key={item.key}
          layout={LinearTransition.duration(280)}
          className="overflow-hidden rounded-[28px]"
        >
          {i === expanded ? (
            <ExpandedPanel item={item} />
          ) : (
            <CollapsedStrip item={item} onPress={() => setExpanded(i)} />
          )}
        </Animated.View>
      ))}
    </View>
  );
}

/** The open "hero" panel — full-bleed photo, frosted badge, headline + CTA. */
function ExpandedPanel({ item }: { item: Featured }) {
  return (
    <Animated.View entering={FadeIn.duration(240)} className="h-72 w-full">
      {/* Navy gradient base — also the fallback if the photo fails to load */}
      <DeepPanel className="absolute inset-0" />
      <Image
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={250}
      />

      {/* Simulated dark gradient overlay (stacked bottom-weighted navy bands) */}
      <View pointerEvents="none" className="absolute inset-0 bg-brand-900/20" />
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-3/4 bg-brand-900/30" />
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-900/55" />

      <View className="flex-1 justify-end gap-3 p-5">
        {/* Frosted-glass icon badge */}
        <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15">
          <Ionicons name={item.icon} size={24} color="#fff" />
        </View>

        <View className="gap-1">
          <Text className="font-display-x text-[25px] leading-7 text-white">{item.title}</Text>
          <Text className="text-[13px] leading-5 text-white/80" numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* Dark pill CTA with trailing gold arrow (wrapped in a row so it hugs its content) */}
        <View className="flex-row">
          <Link href={item.route as never} asChild>
            <PressableScale accessibilityRole="button" activeScale={0.95}>
              <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-brand-900 px-4 py-2.5">
                <Text className="text-[13px] font-body-semibold text-white">{item.cta}</Text>
                <Ionicons name="arrow-forward" size={15} color="#f5a623" />
              </View>
            </PressableScale>
          </Link>
        </View>
      </View>
    </Animated.View>
  );
}

/** A collapsed strip — navy bar with a frosted badge, label and open affordance. */
function CollapsedStrip({ item, onPress }: { item: Featured; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="button" activeScale={0.98} onPress={onPress}>
      <DeepPanel className="h-[74px] flex-row items-center gap-3.5 px-4">
        <View className="h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/12">
          <Ionicons name={item.icon} size={20} color="#fff" />
        </View>
        <Text className="flex-1 font-display-semibold text-[16px] tracking-wide text-white">
          {item.title}
        </Text>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-white/12">
          <Ionicons name="chevron-down" size={16} color="#f5a623" />
        </View>
      </DeepPanel>
    </PressableScale>
  );
}
