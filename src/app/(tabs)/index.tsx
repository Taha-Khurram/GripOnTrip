import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { APP_NAME, APP_TAGLINE, CATEGORIES } from '@/constants/config';
import { CATEGORY_ICON, icons8 } from '@/utils/icons8';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-black" contentContainerClassName="pb-8">
      {/* Hero */}
      <View className="bg-brand-500 px-5 pb-8 pt-6">
        <Text className="text-sm font-medium text-brand-50">{APP_NAME}</Text>
        <Text className="mt-1 text-2xl font-bold text-white">{APP_TAGLINE}</Text>

        <Pressable
          onPress={() => router.push('/search')}
          className="mt-5 flex-row items-center gap-2 rounded-xl bg-white px-4 py-3"
        >
          <Ionicons name="search" size={18} color="#9ca3af" />
          <Text className="text-neutral-400">Where do you want to go?</Text>
        </Pressable>
      </View>

      {/* AI Trip Planner callout */}
      <Link href="/trip-planner" asChild>
        <Pressable className="mx-5 -mt-5">
          <Card className="flex-row items-center gap-3 bg-accent-500">
            <Ionicons name="sparkles" size={24} color="#fff" />
            <View className="flex-1">
              <Text className="text-base font-bold text-white">AI Trip Planner</Text>
              <Text className="text-sm text-accent-50">Build a personalized itinerary in seconds.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </Card>
        </Pressable>
      </Link>

      {/* Categories */}
      <Text className="px-5 pb-3 pt-6 text-lg font-bold text-neutral-900 dark:text-white">
        Explore
      </Text>
      <View className="flex-row flex-wrap gap-3 px-5">
        {CATEGORIES.map((cat) => {
          const icon = CATEGORY_ICON[cat.key];
          return (
            <Link key={cat.key} href={cat.route as never} asChild>
              <Pressable className="w-[47%]">
                <Card className="gap-2">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                    {icon ? (
                      <Image
                        source={{ uri: icons8(icon.name, icon.style) }}
                        style={{ width: 34, height: 34 }}
                        contentFit="contain"
                        transition={200}
                      />
                    ) : (
                      <Ionicons name={cat.icon as never} size={22} color="#208aef" />
                    )}
                  </View>
                  <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                    {cat.label}
                  </Text>
                  <Text className="text-xs text-neutral-500" numberOfLines={2}>
                    {cat.description}
                  </Text>
                </Card>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
}
