import { forwardRef, useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className = '', onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-danger'
    : focused
      ? 'border-brand-500'
      : 'border-neutral-200 dark:border-neutral-700';

  return (
    <View className="w-full gap-1.5">
      {label ? (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#9ca3af"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={[
          'rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 transition-colors',
          'dark:bg-neutral-900 dark:text-white',
          borderClass,
          className,
        ].join(' ')}
        {...rest}
      />
      {error ? <Text className="text-xs text-danger">{error}</Text> : null}
    </View>
  );
});
