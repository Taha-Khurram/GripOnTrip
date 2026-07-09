import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Dimensions, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, View } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Full-width, swipeable image carousel with a page indicator — matches the
 * web's hero gallery. Falls back to a branded placeholder when there are no
 * images.
 */
export function Gallery({ images, height = 260 }: { images: string[]; height?: number }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <View style={{ width: '100%', height }} className="items-center justify-center bg-brand-50">
        <Ionicons name="image-outline" size={48} color="#1a7a8c" />
      </View>
    );
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={{ height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, i) => (
          <Image key={`${uri}-${i}`} source={{ uri }} style={{ width, height }} contentFit="cover" transition={200} />
        ))}
      </ScrollView>

      {images.length > 1 ? (
        <View className="absolute bottom-3 w-full flex-row items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <View
              key={i}
              className={[
                'h-1.5 rounded-full',
                i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
              ].join(' ')}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
