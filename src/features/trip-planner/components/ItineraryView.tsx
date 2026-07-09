import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Animated, enterUp } from '@/components/ui';
import { formatDate } from '@/utils/format';
import type { ItineraryActivity, ItineraryDay, TripItinerary } from '../types';

/** Pick a leading icon for an activity from its (loose) category text. */
function activityIcon(category?: string): keyof typeof CATEGORY_ICONS | 'ellipse' {
  if (!category) return 'ellipse';
  const key = category.toLowerCase();
  const match = (Object.keys(CATEGORY_ICONS) as (keyof typeof CATEGORY_ICONS)[]).find((k) =>
    key.includes(k),
  );
  return match ?? 'ellipse';
}

const CATEGORY_ICONS = {
  food: 'restaurant-outline',
  eat: 'restaurant-outline',
  dining: 'restaurant-outline',
  sight: 'camera-outline',
  tour: 'camera-outline',
  museum: 'business-outline',
  history: 'business-outline',
  nature: 'leaf-outline',
  hike: 'trail-sign-outline',
  adventure: 'trail-sign-outline',
  beach: 'sunny-outline',
  shop: 'bag-outline',
  night: 'moon-outline',
  hotel: 'bed-outline',
  stay: 'bed-outline',
  transport: 'car-outline',
  travel: 'airplane-outline',
  religious: 'moon-outline',
} as const;

export function ItineraryView({ itinerary }: { itinerary: TripItinerary }) {
  const hasDays = itinerary.days.length > 0;

  return (
    <View className="gap-5">
      <Animated.View
        entering={enterUp(0)}
        className="gap-2 rounded-3xl border border-accent-100 bg-accent-50 p-5"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="sparkles" size={16} color="#db7a13" />
          <Text className="text-xs font-semibold uppercase tracking-wide text-accent-700">
            Your AI itinerary
          </Text>
        </View>
        <Text className="font-display-x text-[26px] leading-8 text-ink">
          {itinerary.title}
        </Text>
        {itinerary.summary ? (
          <Text className="text-sm leading-6 text-muted">{itinerary.summary}</Text>
        ) : null}
      </Animated.View>

      {hasDays ? (
        itinerary.days.map((day, index) => (
          <DayCard key={day.day} day={day} index={index + 1} />
        ))
      ) : (
        <Animated.View entering={enterUp(1)}>
          <Markdown content={itinerary.markdown} />
        </Animated.View>
      )}
    </View>
  );
}

function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  return (
    <Animated.View
      entering={enterUp(index)}
      className="overflow-hidden rounded-3xl border border-hairline bg-white shadow-card"
    >
      {/* Day header */}
      <View className="flex-row items-center gap-3 bg-brand-500 px-4 py-3.5">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
          <Text className="font-display-x text-lg text-white">{day.day}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-display text-[15px] text-white">
            {day.title ?? `Day ${day.day}`}
          </Text>
          {day.date ? (
            <Text className="text-xs text-white/80">{formatDate(day.date)}</Text>
          ) : null}
        </View>
      </View>

      {/* Activities */}
      <View className="gap-0 px-4 py-1">
        {day.activities.length > 0 ? (
          day.activities.map((activity, i) => (
            <ActivityRow
              key={i}
              activity={activity}
              last={i === day.activities.length - 1}
            />
          ))
        ) : (
          <Text className="py-4 text-sm text-muted-foreground">No activities planned.</Text>
        )}
      </View>
    </Animated.View>
  );
}

function ActivityRow({ activity, last }: { activity: ItineraryActivity; last: boolean }) {
  return (
    <View className="flex-row gap-3 py-3">
      {/* Timeline rail */}
      <View className="items-center">
        <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
          <Ionicons name={activityIcon(activity.category) as never} size={16} color="#1a7a8c" />
        </View>
        {!last ? <View className="mt-1 w-px flex-1 bg-neutral-200 dark:bg-neutral-700" /> : null}
      </View>

      <View className="flex-1 pb-1">
        {activity.time ? (
          <Text className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {activity.time}
          </Text>
        ) : null}
        <Text className="text-[15px] font-semibold text-ink">
          {activity.title}
        </Text>
        {activity.description ? (
          <Text className="mt-0.5 text-sm leading-6 text-muted">{activity.description}</Text>
        ) : null}
        {activity.cost ? (
          <Text className="mt-1 text-xs text-muted-foreground">Est. {activity.cost}</Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Tiny markdown renderer for the fallback path (when the model returns prose
 * instead of structured days). Handles `**bold**`, `-`/`•` bullets and `1.`
 * numbered lists — the subset the planner actually emits — themed for the light
 * itinerary surface.
 */
function Markdown({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <View className="gap-1 rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {lines.map((raw, index) => {
        const line = raw.trim();
        if (!line) return <View key={index} className="h-2" />;

        const bullet = line.match(/^[-*•]\s+(.*)$/);
        if (bullet) {
          return (
            <View key={index} className="flex-row gap-2 pl-1">
              <Text className="text-[15px] leading-6 text-brand-500">•</Text>
              <Text className="flex-1 text-[15px] leading-6 text-ink">
                {renderInline(bullet[1])}
              </Text>
            </View>
          );
        }

        const numbered = line.match(/^(\d+)\.\s+(.*)$/);
        if (numbered) {
          return (
            <View key={index} className="flex-row gap-2 pl-1">
              <Text className="text-[15px] font-semibold leading-6 text-brand-500">
                {numbered[1]}.
              </Text>
              <Text className="flex-1 text-[15px] leading-6 text-ink">
                {renderInline(numbered[2])}
              </Text>
            </View>
          );
        }

        // A `**Heading**`-only line reads as a section header.
        const heading = line.match(/^\*\*(.+)\*\*:?$/);
        if (heading) {
          return (
            <Text
              key={index}
              className="pt-2 text-base font-bold text-ink"
            >
              {heading[1]}
            </Text>
          );
        }

        return (
          <Text
            key={index}
            className="text-[15px] leading-6 text-ink"
          >
            {renderInline(line)}
          </Text>
        );
      })}
    </View>
  );
}

/** Split a line on `**bold**` markers into styled <Text> spans. */
function renderInline(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <Text key={i} className="font-bold text-ink">
          {bold[1]}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}
