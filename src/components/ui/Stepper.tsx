import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

/** Increment/decrement control (guests, rooms, quantity). */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-base text-ink">{label}</Text>
      <View className="flex-row items-center gap-4">
        <Pressable hitSlop={8} disabled={value <= min} onPress={() => onChange(value - 1)} className={value <= min ? 'opacity-30' : ''}>
          <Ionicons name="remove-circle-outline" size={28} color="#00a165" />
        </Pressable>
        <Text className="w-6 text-center text-base font-semibold text-ink">{value}</Text>
        <Pressable hitSlop={8} disabled={value >= max} onPress={() => onChange(value + 1)} className={value >= max ? 'opacity-30' : ''}>
          <Ionicons name="add-circle-outline" size={28} color="#00a165" />
        </Pressable>
      </View>
    </View>
  );
}
