import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Consistent centered empty/placeholder block: soft brand icon medallion, title,
 * supporting copy, and an optional call-to-action. Shared across the account
 * screens so every "nothing here yet" state looks the same.
 */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-8">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-500/15">
        <Ionicons name={icon} size={34} color="#1a7a8c" />
      </View>
      <Text className="text-center text-lg font-display text-ink">{title}</Text>
      {message ? (
        <Text className="text-center text-sm leading-5 text-muted">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="pt-2">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
