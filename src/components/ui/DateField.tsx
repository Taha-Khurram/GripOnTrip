import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { addDays, toISODate } from '@/utils/date';
import { formatDate } from '@/utils/format';

/**
 * Labelled date picker — pure JS (no native module, so it works without a
 * dev-build rebuild). Tapping opens a modal list of upcoming dates. Value and
 * onChange use ISO (`YYYY-MM-DD`) dates.
 */
export function DateField({
  label,
  value,
  min,
  onChange,
  days = 180,
}: {
  label: string;
  value: string;
  min?: Date;
  onChange: (iso: string) => void;
  days?: number;
}) {
  const [open, setOpen] = useState(false);
  const minIso = min ? toISODate(min) : toISODate(new Date());
  const options = useMemo(
    () => Array.from({ length: days }, (_, i) => addDays(minIso, i)),
    [minIso, days],
  );

  return (
    <View className="flex-1 gap-1.5">
      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <Ionicons name="calendar-outline" size={16} color="#219ebc" />
        <Text className="text-base text-neutral-900 dark:text-white">{formatDate(value)}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[60%] rounded-t-3xl bg-white dark:bg-neutral-900" onPress={() => {}}>
            <View className="flex-row items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
              <Text className="text-lg font-bold text-neutral-900 dark:text-white">{label}</Text>
              <Pressable hitSlop={8} onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#9ca3af" />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(d) => d}
              initialNumToRender={20}
              renderItem={({ item }) => {
                const active = item === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    className={[
                      'flex-row items-center justify-between px-5 py-3.5 border-b border-neutral-50 dark:border-neutral-800',
                      active ? 'bg-brand-50 dark:bg-brand-900/30' : '',
                    ].join(' ')}
                  >
                    <Text
                      className={[
                        'text-base',
                        active ? 'font-bold text-brand-600' : 'text-neutral-800 dark:text-neutral-200',
                      ].join(' ')}
                    >
                      {formatDate(item)}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={18} color="#219ebc" /> : null}
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
