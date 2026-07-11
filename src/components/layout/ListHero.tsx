import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Animated, enterUp, OceanHero, PressableScale, SunCTA } from '@/components/ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ListHeroProps {
  /** Ocean-teal (default) or warm sun gradient — mirrors the home category cards. */
  variant?: 'ocean' | 'sun';
  /** Small eyebrow icon shown above the title. */
  icon: IconName;
  /** Short eyebrow label, e.g. "Explore". */
  eyebrow: string;
  title: string;
  subtitle: string;
  query: string;
  onChangeQuery: (value: string) => void;
  placeholder: string;
  /** Autofocus the search field on mount (used by the search screen). */
  autoFocus?: boolean;
  /**
   * When set, renders a back button and adds top padding — for standalone stack
   * screens (e.g. Hotels) that hide the native header. Tab screens omit it.
   */
  onBack?: () => void;
}

/**
 * Branded gradient hero for the vertical listing screens — the same visual
 * language as the home hero (`src/app/(tabs)/index.tsx`): a rounded-bottom
 * gradient panel with an eyebrow, big display title, subtitle and a white pill
 * search field. `variant` follows the home mapping (rentals / umrah / shop use
 * the warm sun gradient; the rest use ocean).
 */
export function ListHero({
  variant = 'ocean',
  icon,
  eyebrow,
  title,
  subtitle,
  query,
  onChangeQuery,
  placeholder,
  autoFocus,
  onBack,
}: ListHeroProps) {
  const sun = variant === 'sun';
  const Gradient = sun ? SunCTA : OceanHero;
  const tagColor = sun ? '#ffe9cf' : '#cfe6ea';

  return (
    <Animated.View entering={enterUp(0)}>
      <Gradient
        className={['rounded-b-[36px] px-5 pb-8', onBack ? 'pt-14' : 'pt-6'].join(' ')}
      >
        {onBack ? (
          <PressableScale
            onPress={onBack}
            activeScale={0.9}
            className="mb-5 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </PressableScale>
        ) : null}

        <View className="flex-row items-center gap-2">
          <Ionicons name={icon} size={16} color={tagColor} />
          <Text className="text-[13px] font-medium" style={{ color: tagColor }}>
            {eyebrow}
          </Text>
        </View>

        <Text className="mt-5 font-display-x text-[30px] leading-9 text-white">{title}</Text>
        <Text className="mt-2 text-[15px] leading-5 text-white/90">{subtitle}</Text>

        <View
          style={{ zIndex: 1, backgroundColor: '#ffffff' }}
          className="mt-4 flex-row items-center gap-3 rounded-full px-5 py-3 shadow-soft"
        >
          <Ionicons name="search" size={20} color="#4a5c62" />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={placeholder}
            placeholderTextColor="#4a5c62"
            returnKeyType="search"
            autoFocus={autoFocus}
            style={{ paddingVertical: 0 }}
            className="flex-1 text-[15px] font-medium text-ink"
          />
          {query ? (
            <Pressable onPress={() => onChangeQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#4a5c62" />
            </Pressable>
          ) : null}
        </View>
      </Gradient>
    </Animated.View>
  );
}
