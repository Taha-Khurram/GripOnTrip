import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  /** Which safe-area edges to pad. Defaults to top + horizontal. */
  edges?: Edge[];
  className?: string;
}

/** Consistent screen wrapper: safe-area aware, sandy-cream canvas. */
export function Screen({ children, edges = ['top', 'left', 'right'], className = '' }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      <View className={['flex-1', className].join(' ')}>{children}</View>
    </SafeAreaView>
  );
}
