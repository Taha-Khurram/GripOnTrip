import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

/** Row of stars. Read-only unless `onChange` is provided. */
export function StarRating({
  value,
  onChange,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => {
        const name = value >= star ? 'star' : value >= star - 0.5 ? 'star-half' : 'star-outline';
        const icon = <Ionicons name={name} size={size} color="#f59e0b" />;
        return onChange ? (
          <Pressable key={star} hitSlop={4} onPress={() => onChange(star)} className="px-0.5">
            {icon}
          </Pressable>
        ) : (
          <View key={star} className="px-0.5">
            {icon}
          </View>
        );
      })}
    </View>
  );
}
