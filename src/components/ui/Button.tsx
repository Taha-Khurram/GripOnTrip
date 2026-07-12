import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, type PressableProps } from 'react-native';

import { PressableScale } from './motion';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  /** Optional leading icon (Ionicons name); rendered left of the label, centered together. */
  icon?: keyof typeof Ionicons.glyphMap;
}

// Press feedback comes from PressableScale (scale + dim); no `active:` pseudo
// variants here, which would otherwise trigger NativeWind's View→Pressable
// upgrade and drop the reanimated animated style.
const containerVariants: Record<Variant, string> = {
  primary: 'bg-brand-500 shadow-glow-ocean',
  secondary: 'bg-accent-500 shadow-glow',
  outline: 'border border-brand-500 bg-transparent',
  ghost: 'bg-transparent',
};

const labelVariants: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-brand-500',
  ghost: 'text-brand-500',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

const labelSizes: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const iconSizes: Record<Size, number> = { sm: 16, md: 18, lg: 20 };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const tint = variant === 'outline' || variant === 'ghost' ? '#1e3a5f' : '#fff';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center gap-2 rounded-2xl',
        sizes[size],
        containerVariants[variant],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={tint} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={iconSizes[size]} color={tint} /> : null}
          <Text className={['font-body-semibold', labelSizes[size], labelVariants[variant]].join(' ')}>
            {label}
          </Text>
        </>
      )}
    </PressableScale>
  );
}
