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
 * Deep-navy brand hero — the signature dark section. A cool navy panel lifted
 * by a subtle gold bloom (top-right) and a deeper navy pool (bottom-left), with
 * a faint teal halo for depth. Use behind white hero text.
 * (Export name kept for compatibility across the app.)
 */
export function OceanHero({ className = '', children, ...rest }: GradientProps) {
  return (
    <View className={['overflow-hidden bg-brand-800', className].join(' ')} {...rest}>
      <View pointerEvents="none" className={`${FILL} bg-brand-800`} />
      <View pointerEvents="none" className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent-500/20" />
      <View pointerEvents="none" className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-teal-500/15" />
      <View pointerEvents="none" className="absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-brand-900/70" />
      {children}
    </View>
  );
}

/**
 * Warm gold CTA panel — a sun-gold surface with a lighter highlight and a deeper
 * base for a subtle gradient feel. Used for accent CTAs (AI Trip Planner, promos).
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

/** Deep-navy panel for featured tiles / dark cards on the light canvas. */
export function DeepPanel({ className = '', children, ...rest }: GradientProps) {
  return (
    <View className={['overflow-hidden bg-brand-900', className].join(' ')} {...rest}>
      <View pointerEvents="none" className={`${FILL} bg-brand-900`} />
      <View pointerEvents="none" className="absolute -right-10 -top-12 h-52 w-52 rounded-full bg-brand-700/60" />
      <View pointerEvents="none" className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-accent-500/12" />
      {children}
    </View>
  );
}

/** Soft teal-tinted band used as a photo placeholder on cards without images. */
export function ImageBand({ className = '', children, ...rest }: GradientProps) {
  return (
    <View className={['overflow-hidden bg-teal-400', className].join(' ')} {...rest}>
      <View pointerEvents="none" className={`${FILL} bg-teal-400`} />
      <View pointerEvents="none" className="absolute -left-8 -top-10 h-40 w-40 rounded-full bg-teal-300/70" />
      <View pointerEvents="none" className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-brand-600/40" />
      {children}
    </View>
  );
}
