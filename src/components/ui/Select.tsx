import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
}

/**
 * Labelled dropdown select — pure JS (no native module, works without a
 * dev-build rebuild). Tapping opens a bottom-sheet modal list of options.
 * Mirrors {@link DateField}'s modal pattern so the whole app feels consistent.
 */
export function Select<T extends string | number = string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  icon,
}: {
  label?: string;
  value: T | null | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  /** Optional leading icon shown inside the trigger. */
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="w-full gap-1.5">
      {label ? (
        <Text className="text-xs font-body-semibold uppercase tracking-wide text-muted">{label}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-2 rounded-2xl border border-hairline bg-surface px-4 py-3.5"
      >
        {icon ? <Ionicons name={icon} size={16} color="#1a7a8c" /> : null}
        <Text
          className={['flex-1 text-base', selected ? 'text-ink' : 'text-muted-foreground'].join(' ')}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9aa7ac" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%] rounded-t-3xl bg-surface" onPress={() => {}}>
            <View className="flex-row items-center justify-between border-b border-hairline px-5 py-4">
              <Text className="text-lg font-display text-ink">{label ?? 'Select'}</Text>
              <Pressable hitSlop={8} onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#9aa7ac" />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(o) => String(o.value)}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={[
                      'flex-row items-center justify-between border-b border-neutral-50 px-5 py-3.5 dark:border-neutral-800',
                      active ? 'bg-brand-50 dark:bg-brand-900/30' : '',
                    ].join(' ')}
                  >
                    <Text
                      className={[
                        'flex-1 pr-3 text-base',
                        active ? 'font-bold text-brand-600' : 'text-ink',
                      ].join(' ')}
                    >
                      {item.label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={18} color="#1a7a8c" /> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
