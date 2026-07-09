import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

/** Surface container: soft rounded corners, hairline border, ambient shadow. */
export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <View
      className={[
        'rounded-3xl border border-hairline bg-surface p-4 shadow-card',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </View>
  );
}
