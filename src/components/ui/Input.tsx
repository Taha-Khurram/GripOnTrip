import { forwardRef, useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className = '', onFocus, onBlur, style, multiline, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-danger'
    : focused
      ? 'border-brand-500'
      : 'border-hairline';

  return (
    <View className="w-full gap-1.5">
      {label ? (
        <Text className="text-sm font-body-medium text-ink">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#9aa7ac"
        multiline={multiline}
        // Vertically center the placeholder + text (same fix as the hero search
        // fields): Android adds extra font padding that otherwise pushes the
        // text high inside the padded box. Multiline stays top-aligned.
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[{ includeFontPadding: false }, style]}
        className={[
          'rounded-2xl border bg-surface px-4 py-3.5 text-base text-ink',
          borderClass,
          className,
        ].join(' ')}
        {...rest}
      />
      {error ? <Text className="text-xs text-danger">{error}</Text> : null}
    </View>
  );
});
