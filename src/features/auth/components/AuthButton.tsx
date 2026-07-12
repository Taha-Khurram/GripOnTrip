import { ActivityIndicator, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui';

/**
 * Auth CTA button. The visual chrome (background / border) lives on an inner
 * `View`, NOT on the animated `PressableScale` — NativeWind's className→style
 * interop is unreliable on the reanimated pressable and otherwise drops the
 * background, rendering the button invisible. Uses a constant `shadow-*` class
 * (never toggled) so it doesn't trip the native shadow-parsing crash.
 */
export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}) {
  const isDisabled = disabled || loading;
  const primary = variant === 'primary';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
    >
      <View
        className={[
          'flex-row items-center justify-center rounded-2xl py-4',
          primary ? 'bg-brand-500 shadow-glow-ocean' : 'border border-brand-500 bg-transparent',
          isDisabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        {loading ? (
          <ActivityIndicator color={primary ? '#fff' : '#1e3a5f'} />
        ) : (
          <Text
            className={['text-base font-body-semibold', primary ? 'text-white' : 'text-brand-500'].join(
              ' ',
            )}
          >
            {label}
          </Text>
        )}
      </View>
    </PressableScale>
  );
}
