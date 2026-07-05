import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

/** Surface container with rounded corners, subtle shadow and dark-mode support. */
export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <View
      className={[
        'rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </View>
  );
}
