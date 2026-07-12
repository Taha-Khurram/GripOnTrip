import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { FeaturedCategories } from '@/components/FeaturedCategories';
import { TripPlannerPromo } from '@/components/TripPlannerPromo';
import { WhyGripOnTrip } from '@/components/WhyGripOnTrip';
import { Animated, DeepPanel, enterUp, OceanHero, PressableScale, SunCTA } from '@/components/ui';
import { APP_NAME, APP_TAGLINE, CATEGORIES, type CategoryMeta } from '@/constants/config';

// App brand mark (same asset the auth header + profile use).
const logo = require('../../../assets/images/icon.png');

// Compact labels for the EXPERIENCE selector pills (the full CATEGORIES labels
// are too long for a scrollable segmented row). `key` matches the search screen's
// FilterKey so a selection deep-links straight into a pre-filtered search.
const SHORT_LABEL: Record<string, string> = {
  hotels: 'Hotels',
  rentals: 'Rentals',
  tours: 'Tours',
  umrah: 'Umrah',
  guides: 'Guides',
  shop: 'Shop',
};

type ExperienceKey = 'all' | CategoryMeta['key'];

const EXPERIENCES: { key: ExperienceKey; label: string; icon: string; route: string | null }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline', route: null },
  ...CATEGORIES.map((c) => ({
    key: c.key,
    label: SHORT_LABEL[c.key] ?? c.label,
    icon: c.icon,
    route: c.route,
  })),
];

/** All-caps, letter-spaced field label used inside the booking card. */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {children}
    </Text>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [experience, setExperience] = useState<ExperienceKey>('all');

  const selected = EXPERIENCES.find((e) => e.key === experience) ?? EXPERIENCES[0];

  const submitSearch = () => {
    const q = query.trim();
    // Specific experience + a query → filtered unified search.
    // Specific experience + no query → browse that vertical directly.
    // "All" → global search (empty query lands on the search screen's prompt).
    if (experience !== 'all') {
      if (q) {
        router.push({ pathname: '/search', params: { q, category: experience } });
      } else if (selected.route) {
        router.push(selected.route as never);
      }
      return;
    }
    router.push(q ? { pathname: '/search', params: { q } } : '/search');
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="pb-12"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero — deep navy */}
      <Animated.View entering={enterUp(0)}>
        <OceanHero className="rounded-b-[36px] px-5 pb-16 pt-6">
          <View className="flex-row items-center gap-2.5">
            <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
            <Text className="font-display text-base text-white">{APP_NAME}</Text>
          </View>

          <Text className="mt-7 font-display-x text-[34px] leading-[40px] text-white">
            The Best{'\n'}
            <Text className="text-accent-500">Travel Marketplace</Text>
          </Text>
          {/* Gold underline accent under the highlighted keyword */}
          <View className="mt-2 h-1 w-16 rounded-full bg-accent-500" />

          <Text className="mt-3 text-[15px] leading-5 text-white/85">{APP_TAGLINE}</Text>
        </OceanHero>
      </Animated.View>

      {/* Floating booking card — a premium, self-contained search widget */}
      <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
        <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
          {/* Header — gives the card context + reinforces the brand */}
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
              <Ionicons name="compass" size={22} color="#00a165" />
            </View>
            <View className="flex-1">
              <Text className="font-display-semibold text-[17px] leading-5 text-ink">
                Where to next?
              </Text>
              <Text className="text-[12px] text-muted">
                Search {CATEGORIES.length} travel experiences
              </Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1">
              <Ionicons name="pricetag" size={11} color="#b8710c" />
              <Text className="text-[11px] font-body-semibold text-accent-700">0% fees</Text>
            </View>
          </View>

          {/* EXPERIENCE — selectable category segment */}
          <View className="gap-2.5">
            <FieldLabel>Experience</FieldLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pr-4"
            >
              {EXPERIENCES.map((exp) => {
                const active = experience === exp.key;
                return (
                  <PressableScale
                    key={exp.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    activeScale={0.94}
                    onPress={() => setExperience(exp.key)}
                  >
                    <View
                      className={[
                        'flex-row items-center gap-1.5 rounded-full px-4 py-2.5',
                        active ? 'bg-brand-800' : 'border border-hairline bg-surface-sunk',
                      ].join(' ')}
                    >
                      <Ionicons
                        name={exp.icon as never}
                        size={15}
                        color={active ? '#f5a623' : '#00a165'}
                      />
                      <Text
                        className={[
                          'text-[13px] font-body-semibold',
                          active ? 'text-white' : 'text-ink',
                        ].join(' ')}
                      >
                        {exp.label}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>

          {/* WHERE — destination field reads as a real search input */}
          <View className="gap-2.5">
            <FieldLabel>Where</FieldLabel>
            <View className="flex-row items-center gap-3">
              <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface-sunk px-4 py-3.5">
                <Ionicons name="location-outline" size={19} color="#00a165" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={submitSearch}
                  placeholder={
                    experience === 'all'
                      ? 'Search anywhere…'
                      : `Search ${selected.label.toLowerCase()}…`
                  }
                  placeholderTextColor="#7c8a99"
                  returnKeyType="search"
                  className="flex-1 py-0 text-[16px] font-body-medium text-ink"
                />
                {query ? (
                  <PressableScale onPress={() => setQuery('')} activeScale={0.85} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#7c8a99" />
                  </PressableScale>
                ) : null}
              </View>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Search"
                onPress={submitSearch}
                activeScale={0.92}
              >
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 shadow-glow">
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </PressableScale>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Ecosystem strip — dark navy pill of partner products with info badges */}
      <Animated.View entering={enterUp(2)} className="mt-6">
        <Text className="px-5 pb-2 text-[11px] font-body-semibold uppercase tracking-[1.5px] text-muted-foreground">
          The Grip On Trip Ecosystem
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-5"
        >
          {CATEGORIES.map((cat) => (
            <Link key={cat.key} href={cat.route as never} asChild>
              <PressableScale activeScale={0.96}>
                <DeepPanel className="w-[150px] gap-3 rounded-3xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <Ionicons name={cat.icon as never} size={20} color="#f5a623" />
                    </View>
                    {/* Small teal info badge */}
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-teal-500">
                      <Ionicons name="information" size={13} color="#fff" />
                    </View>
                  </View>
                  <Text className="font-display-semibold text-[15px] leading-5 text-white" numberOfLines={2}>
                    {cat.label}
                  </Text>
                </DeepPanel>
              </PressableScale>
            </Link>
          ))}
        </ScrollView>
      </Animated.View>

      {/* AI Trip Planner callout */}
      <Animated.View entering={enterUp(3)} className="mx-5 mt-6">
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

      {/* "Keep 100%" promo — zero-commission value prop */}
      <Animated.View entering={enterUp(4)} className="mx-5 mt-4">
        <Link href="/list-property" asChild>
          <PressableScale>
            <DeepPanel className="flex-row items-center gap-4 rounded-[28px] p-5 shadow-soft">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-500/15">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-500">
                  <Ionicons name="airplane" size={24} color="#0a1a2f" />
                </View>
              </View>
              <View className="flex-1 gap-2">
                <View>
                  <Text className="font-display-x text-[19px] leading-6 text-white">
                    Keep <Text className="text-accent-500">100%</Text> of every booking
                  </Text>
                  <View className="mt-1 h-1 w-12 rounded-full bg-accent-500" />
                </View>
                <Text className="text-[13px] leading-5 text-white/80">
                  List your property — direct prices, zero commission.
                </Text>
                <View className="mt-1 flex-row items-center gap-1.5 self-start rounded-full bg-white px-4 py-2">
                  <Text className="text-[13px] font-body-semibold text-ink">List your property</Text>
                  <Ionicons name="arrow-forward" size={14} color="#0a1a2f" />
                </View>
              </View>
            </DeepPanel>
          </PressableScale>
        </Link>
      </Animated.View>

      {/* Featured categories — expandable accordion (photo hero + collapsed strips) */}
      <Animated.View entering={enterUp(5)}>
        <View className="px-5 pb-3 pt-8">
          <Text className="font-display text-xl text-ink">Featured Categories</Text>
          <Text className="mt-0.5 text-[13px] text-muted">Tap to expand each experience.</Text>
        </View>
        <FeaturedCategories />
      </Animated.View>

      {/* AI Trip Planner showcase — "Design Your Perfect Journey" */}
      <Animated.View entering={enterUp(6)} className="mx-5 mt-8">
        <TripPlannerPromo />
      </Animated.View>

      {/* Why Grip On Trip — "Built for Modern Travelers" value props */}
      <Animated.View entering={enterUp(7)} className="pt-10">
        <WhyGripOnTrip />
      </Animated.View>
    </ScrollView>
  );
}
