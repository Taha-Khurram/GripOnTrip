import { Text, View } from 'react-native';

type Tone = 'brand' | 'accent' | 'success' | 'neutral';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50',
  accent: 'bg-accent-50',
  success: 'bg-green-50',
  neutral: 'bg-neutral-100',
};

const toneText: Record<Tone, string> = {
  brand: 'text-brand-700',
  accent: 'text-accent-700',
  success: 'text-success',
  neutral: 'text-neutral-700',
};

export function Badge({ label, tone = 'brand' }: { label: string; tone?: Tone }) {
  return (
    <View className={['self-start rounded-full px-2.5 py-1', tones[tone]].join(' ')}>
      <Text className={['text-xs font-semibold', toneText[tone]].join(' ')}>{label}</Text>
    </View>
  );
}
