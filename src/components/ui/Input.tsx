import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className = '', ...rest },
  ref,
) {
  return (
    <View className="w-full gap-1.5">
      {label ? (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#9ca3af"
        className={[
          'rounded-xl border bg-white px-4 py-3 text-base text-neutral-900',
          'dark:bg-neutral-900 dark:text-white',
          error ? 'border-danger' : 'border-neutral-200 dark:border-neutral-700',
          className,
        ].join(' ')}
        {...rest}
      />
      {error ? <Text className="text-xs text-danger">{error}</Text> : null}
    </View>
  );
});
