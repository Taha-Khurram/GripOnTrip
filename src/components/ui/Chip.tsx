import { Text } from 'react-native';

import { PressableScale } from './motion';

interface ChipProps {
  label: string;
  active?: boolean;
  /** Warm (sun-tinted) active state instead of the default ocean tint. */
  tone?: 'ocean' | 'sun';
  onPress?: () => void;
}

/** Filter / segmented pill used across the catalog + guide screens. */
export function Chip({ label, active = false, tone = 'ocean', onPress }: ChipProps) {
  const activeBg = tone === 'sun' ? 'bg-accent-500' : 'bg-brand-500';
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={[
        'rounded-full border px-4 py-2',
        active ? `${activeBg} border-transparent` : 'border-hairline bg-surface',
      ].join(' ')}
    >
      <Text
        className={[
          'text-[13px] font-body-semibold',
          active ? 'text-white' : 'text-muted',
        ].join(' ')}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
