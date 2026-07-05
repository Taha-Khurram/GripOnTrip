import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

/** Surface container: rounded corners, hairline border, soft shadow, dark-mode aware. */
export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <View
      className={[
        'rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm shadow-black/5',
        'dark:border-neutral-800 dark:bg-neutral-900',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </View>
  );
}
