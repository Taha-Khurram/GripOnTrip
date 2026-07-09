import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

// NOTE: These "gradients" are composed from a solid base plus soft translucent
// orbs rather than a true CSS/linear gradient. This deliberately avoids a native
// dependency (expo-linear-gradient), whose ViewManager isn't present in the
// installed dev-client build — so these render on any existing build with no
// native rebuild. The orbs read as a soft light bloom / dark pool for depth.

interface GradientProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}

const FILL = 'absolute left-0 right-0 top-0 bottom-0';

/**
 * `bg-ocean-hero` equivalent — ocean-teal panel with a light bloom (top-right)
 * and a dark pool (bottom-left). Use behind hero text.
 */
export function OceanHero({ className = '', children, ...rest }: GradientProps) {
  return (
    <View className={['overflow-hidden bg-brand-700', className].join(' ')} {...rest}>
      <View pointerEvents="none" className={`${FILL} bg-brand-700`} />
      <View pointerEvents="none" className="absolute -right-12 -top-16 h-60 w-60 rounded-full bg-brand-400/50" />
      <View pointerEvents="none" className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-brand-300/40" />
      <View pointerEvents="none" className="absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-brand-900/55" />
      {children}
    </View>
  );
}

/**
 * `bg-sun-cta` equivalent — warm sun-orange panel with a lighter highlight and
 * a deeper base for a subtle gradient feel. Used for the AI Trip Planner CTA.
 */
export function SunCTA({ className = '', children, ...rest }: GradientProps) {
  return (
    <View className={['overflow-hidden bg-accent-500', className].join(' ')} {...rest}>
      <View pointerEvents="none" className={`${FILL} bg-accent-500`} />
      <View pointerEvents="none" className="absolute -left-10 -top-12 h-44 w-44 rounded-full bg-accent-300/60" />
      <View pointerEvents="none" className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-accent-700/40" />
      {children}
    </View>
  );
}

/** Deep-teal panel for featured tiles / dark cards on cream. */
export function DeepPanel({ className = '', children, ...rest }: GradientProps) {
  return (
    <View className={['overflow-hidden bg-brand-800', className].join(' ')} {...rest}>
      <View pointerEvents="none" className={`${FILL} bg-brand-800`} />
      <View pointerEvents="none" className="absolute -right-10 -top-12 h-52 w-52 rounded-full bg-brand-600/55" />
      <View pointerEvents="none" className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-brand-900/50" />
      {children}
    </View>
  );
}

/** Soft ocean-tinted band used as a photo placeholder on cards without images. */
export function ImageBand({ className = '', children, ...rest }: GradientProps) {
  return (
    <View className={['overflow-hidden bg-brand-400', className].join(' ')} {...rest}>
      <View pointerEvents="none" className={`${FILL} bg-brand-400`} />
      <View pointerEvents="none" className="absolute -left-8 -top-10 h-40 w-40 rounded-full bg-brand-300/70" />
      <View pointerEvents="none" className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-brand-600/45" />
      {children}
    </View>
  );
}
