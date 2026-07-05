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
}

// Press feedback comes from PressableScale (scale + dim); no `active:` pseudo
// variants here, which would otherwise trigger NativeWind's View→Pressable
// upgrade and drop the reanimated animated style.
const containerVariants: Record<Variant, string> = {
  primary: 'bg-brand-500',
  secondary: 'bg-accent-500',
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

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center rounded-xl',
        sizes[size],
        containerVariants[variant],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#219ebc' : '#fff'} />
      ) : (
        <Text className={['font-semibold', labelSizes[size], labelVariants[variant]].join(' ')}>
          {label}
        </Text>
      )}
    </PressableScale>
  );
}
