import { cssInterop } from 'nativewind';
import { forwardRef } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// NativeWind only interops React Native's core components out of the box.
// Reanimated-wrapped components aren't registered, so `className` on them is
// silently dropped. Register the ones we style so className→style still works
// (and merges under any animated `style` we pass explicitly).
cssInterop(AnimatedPressable, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });

/** Spring config tuned for snappy, subtle press feedback. */
const PRESS_SPRING = { mass: 0.4, damping: 12, stiffness: 260 } as const;

interface PressableScaleProps extends PressableProps {
  /** How far to scale down on press (0–1). Defaults to 0.97. */
  activeScale?: number;
  /** Dim slightly on press for extra depth. Defaults to true. */
  dim?: boolean;
}

/**
 * Pressable that springs down + subtly dims while held — the standard tap
 * affordance across the app. Forwards refs so it drops into `<Link asChild>`.
 */
export const PressableScale = forwardRef<View, PressableScaleProps>(function PressableScale(
  { activeScale = 0.97, dim = true, onPressIn, onPressOut, style, children, ...rest },
  ref,
) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - pressed.value * (1 - activeScale), PRESS_SPRING) }],
    opacity: dim ? withTiming(1 - pressed.value * 0.12, { duration: 120 }) : 1,
  }));

  return (
    <AnimatedPressable
      ref={ref}
      onPressIn={(e) => {
        pressed.value = 1;
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = 0;
        onPressOut?.(e);
      }}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
});

/** Stagger step (ms) between consecutive list items entering. */
export const STAGGER = 55;

/**
 * Standard entrance transition: fade + slide up with a spring. Pass `index`
 * for a staggered cascade down a list. Use as `entering={enterUp(index)}`.
 * The stagger is clamped so items mounted later (on scroll) don't inherit a
 * huge delay and appear to hang blank.
 */
export function enterUp(index = 0) {
  return FadeInDown.springify()
    .damping(16)
    .mass(0.7)
    .delay(Math.min(index, 8) * STAGGER);
}

export { Animated };
