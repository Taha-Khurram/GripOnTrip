import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Animated, Card, enterUp, PressableScale } from '@/components/ui';
import { APP_NAME, APP_TAGLINE, CATEGORIES } from '@/constants/config';
import { CATEGORY_ICON, icons8 } from '@/utils/icons8';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-black"
      contentContainerClassName="pb-10"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <Animated.View
        entering={enterUp(0)}
        className="rounded-b-[28px] bg-brand-500 px-5 pb-9 pt-6 shadow-lg shadow-brand-500/20"
      >
        <Text className="text-sm font-medium tracking-wide text-brand-50">{APP_NAME}</Text>
        <Text className="mt-1.5 text-3xl font-bold leading-tight text-white">{APP_TAGLINE}</Text>

        <PressableScale
          onPress={() => router.push('/search')}
          activeScale={0.98}
          className="mt-6 flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm shadow-black/10"
        >
          <Ionicons name="search" size={18} color="#219ebc" />
          <Text className="text-[15px] text-neutral-400">Where do you want to go?</Text>
        </PressableScale>
      </Animated.View>

      {/* AI Trip Planner callout */}
      <Animated.View entering={enterUp(1)} className="mx-5 -mt-5">
        <Link href="/trip-planner" asChild>
          <PressableScale>
            <Card className="flex-row items-center gap-3 border-0 bg-accent-500 shadow-md shadow-accent-500/25">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                <Ionicons name="sparkles" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white">AI Trip Planner</Text>
                <Text className="text-[13px] text-accent-50">
                  Build a personalized itinerary in seconds.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </Card>
          </PressableScale>
        </Link>
      </Animated.View>

      {/* Categories */}
      <Animated.Text
        entering={enterUp(2)}
        className="px-5 pb-3 pt-7 text-xl font-bold text-neutral-900 dark:text-white"
      >
        Explore
      </Animated.Text>
      <View className="flex-row flex-wrap gap-3 px-5">
        {CATEGORIES.map((cat, i) => {
          const icon = CATEGORY_ICON[cat.key];
          return (
            <Animated.View key={cat.key} entering={enterUp(3 + i)} className="w-[47%]">
              <Link href={cat.route as never} asChild>
                <PressableScale>
                  <Card className="gap-2.5">
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/15">
                      {icon ? (
                        <Image
                          source={{ uri: icons8(icon.name, icon.style) }}
                          style={{ width: 34, height: 34 }}
                          contentFit="contain"
                          transition={200}
                        />
                      ) : (
                        <Ionicons name={cat.icon as never} size={22} color="#219ebc" />
                      )}
                    </View>
                    <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                      {cat.label}
                    </Text>
                    <Text className="text-xs leading-4 text-neutral-500" numberOfLines={2}>
                      {cat.description}
                    </Text>
                  </Card>
                </PressableScale>
              </Link>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}
