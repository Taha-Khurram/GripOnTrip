import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Animated, enterUp, OceanHero, PressableScale, SunCTA } from '@/components/ui';
import { APP_NAME, APP_TAGLINE, CATEGORIES, type CategoryMeta } from '@/constants/config';

// App brand mark (same asset the auth header + profile use).
const logo = require('../../../assets/images/icon.png');

// Verticals that use the warm sun gradient (matching the AI Trip Planner CTA);
// the rest use the ocean gradient.
const SUN_KEYS = new Set(['rentals', 'umrah', 'shop']);

/** Full-width featured card: tag + big title + subtitle + CTA pill on a brand gradient. */
function CategoryCard({ cat, index }: { cat: CategoryMeta; index: number }) {
  const sun = SUN_KEYS.has(cat.key);
  const Gradient = sun ? SunCTA : OceanHero;
  const tagColor = sun ? '#ffe9cf' : '#cfe6ea';
  return (
    <Animated.View entering={enterUp(index)}>
      <Link href={cat.route as never} asChild>
        <PressableScale>
          <Gradient className="min-h-[220px] justify-between gap-6 rounded-[28px] p-6 shadow-soft">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color={tagColor} />
              <Text className="text-[13px] font-medium" style={{ color: tagColor }}>
                Explore
              </Text>
            </View>

            <View className="gap-4">
              <View className="gap-2">
                <Text className="font-display-x text-[30px] leading-9 text-white">{cat.label}</Text>
                <Text className="text-[15px] leading-5 text-white/90">{cat.description}</Text>
              </View>

              <View className="flex-row items-center gap-1.5 self-start rounded-full bg-white/15 px-4 py-2">
                <Text className="text-[14px] font-medium text-white">Browse</Text>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </View>
            </View>
          </Gradient>
        </PressableScale>
      </Link>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submitSearch = () => {
    const q = query.trim();
    router.push(q ? { pathname: '/search', params: { q } } : '/search');
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="pb-12"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <Animated.View entering={enterUp(0)}>
        <OceanHero className="rounded-b-[36px] px-5 pb-12 pt-6">
          <View className="flex-row items-center gap-2.5">
            <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
            <Text className="font-display text-base text-white">{APP_NAME}</Text>
          </View>

          <Text className="mt-6 font-display-x text-[32px] leading-[38px] text-white">
            {APP_TAGLINE}
          </Text>
          <Text className="mt-3 font-display text-lg text-white">Where do you want to go?</Text>

          <View
            style={{ zIndex: 1, backgroundColor: '#ffffff' }}
            className="mt-3 flex-row items-center gap-3 rounded-full px-5 py-3 shadow-soft"
          >
            <Pressable onPress={submitSearch} hitSlop={8}>
              <Ionicons name="search" size={20} color="#4a5c62" />
            </Pressable>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              placeholder="Search hotels, tours, rentals…"
              placeholderTextColor="#4a5c62"
              returnKeyType="search"
              style={{ paddingVertical: 0 }}
              className="flex-1 text-[15px] font-medium text-ink"
            />
            <Pressable onPress={submitSearch} hitSlop={8}>
              <Ionicons name="arrow-forward-circle" size={24} color="#1a7a8c" />
            </Pressable>
          </View>
        </OceanHero>
      </Animated.View>

      {/* AI Trip Planner callout — overlapping the hero */}
      <Animated.View entering={enterUp(1)} className="mx-5 -mt-7">
        <Link href="/trip-planner" asChild>
          <PressableScale>
            <SunCTA className="flex-row items-center gap-3 rounded-3xl p-4 shadow-glow">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/25">
                <Ionicons name="sparkles" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-display text-base text-white">AI Trip Planner</Text>
                <Text className="text-[13px] text-white/90">
                  Build a personalized itinerary in seconds.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </SunCTA>
          </PressableScale>
        </Link>
      </Animated.View>

      {/* Explore — uniform category grid (all verticals from CATEGORIES) */}
      <Animated.Text entering={enterUp(2)} className="px-5 pb-3 pt-7 font-display text-xl text-ink">
        Explore
      </Animated.Text>

      <View className="gap-4 px-5">
        {CATEGORIES.map((cat, i) => (
          <CategoryCard key={cat.key} cat={cat} index={3 + i} />
        ))}
      </View>
    </ScrollView>
  );
}
