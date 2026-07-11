import { Pressable, Text, View } from 'react-native';

/**
 * Brand switch. Pure JS (no native `Switch`) so it themes cleanly with
 * NativeWind and matches the rest of the design system. Optional trailing label.
 */
export function Toggle({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      className={['flex-row items-center gap-3', disabled ? 'opacity-50' : ''].join(' ')}
    >
      <View
        className={[
          'h-7 w-12 justify-center rounded-full px-0.5',
          value ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700',
        ].join(' ')}
      >
        <View
          className={[
            'h-6 w-6 rounded-full bg-white shadow-card',
            value ? 'self-end' : 'self-start',
          ].join(' ')}
        />
      </View>
      {label ? <Text className="flex-1 text-sm text-ink">{label}</Text> : null}
    </Pressable>
  );
}
