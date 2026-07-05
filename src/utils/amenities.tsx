import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

/** Best-effort mapping of amenity labels to icons (matches web amenity chips). */
export function amenityIcon(label: string): keyof typeof Ionicons.glyphMap {
  const l = label.toLowerCase();
  if (l.includes('wifi') || l.includes('wi-fi')) return 'wifi-outline';
  if (l.includes('pool')) return 'water-outline';
  if (l.includes('gym') || l.includes('fitness')) return 'barbell-outline';
  if (l.includes('park')) return 'car-outline';
  if (l.includes('breakfast') || l.includes('restaurant') || l.includes('food')) return 'restaurant-outline';
  if (l.includes('tv') || l.includes('television')) return 'tv-outline';
  if (l.includes('ac') || l.includes('air condition') || l.includes('heater') || l.includes('heating'))
    return 'thermometer-outline';
  if (l.includes('bath') || l.includes('shower')) return 'water-outline';
  if (l.includes('balcony') || l.includes('view') || l.includes('patio')) return 'sunny-outline';
  if (l.includes('pet')) return 'paw-outline';
  if (l.includes('kitchen')) return 'flame-outline';
  if (l.includes('bar') || l.includes('drink')) return 'wine-outline';
  if (l.includes('spa')) return 'flower-outline';
  return 'checkmark-circle-outline';
}

/** A responsive two-column grid of amenities with icons. */
export function AmenityGrid({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;
  return (
    <View className="flex-row flex-wrap">
      {amenities.map((a) => (
        <View key={a} className="w-1/2 flex-row items-center gap-2 py-1.5">
          <Ionicons name={amenityIcon(a)} size={18} color="#208aef" />
          <Text className="flex-1 text-sm text-neutral-700 dark:text-neutral-300" numberOfLines={1}>
            {a}
          </Text>
        </View>
      ))}
    </View>
  );
}
