import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Card, Input, Select, Toggle } from '@/components/ui';
import type { Gender, Pilgrim } from '../types';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

/** A mock document-upload button — tapping flips a local "attached" flag. */
function UploadButton({
  icon,
  label,
  attached,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  attached: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={[
        'flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5',
        attached ? 'border-emerald-500 bg-emerald-50' : 'border-hairline bg-surface',
      ].join(' ')}
    >
      <Ionicons
        name={attached ? 'checkmark-circle' : icon}
        size={15}
        color={attached ? '#059669' : '#5f7178'}
      />
      <Text
        className={[
          'text-xs font-body-medium',
          attached ? 'text-emerald-700' : 'text-muted',
        ].join(' ')}
        numberOfLines={1}
      >
        {attached ? 'Attached' : label}
      </Text>
    </Pressable>
  );
}

/**
 * "Pilgrim & Passenger Information" card. Controlled: the parent owns the
 * pilgrim array. Each pilgrim captures passport identity plus optional
 * visa-assistance and (mock) document uploads. At least one pilgrim is always
 * kept; extras can be added/removed.
 */
export function PilgrimForm({
  pilgrims,
  onChange,
}: {
  pilgrims: Pilgrim[];
  onChange: (pilgrims: Pilgrim[]) => void;
}) {
  const update = (id: string, patch: Partial<Pilgrim>) =>
    onChange(pilgrims.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const add = () =>
    onChange([
      ...pilgrims,
      {
        id: `pilgrim-${Date.now()}`,
        fullName: '',
        passportNumber: '',
        passportExpiry: '',
        dateOfBirth: '',
        gender: 'Male',
        visaAssistance: false,
      },
    ]);

  const remove = (id: string) => onChange(pilgrims.filter((p) => p.id !== id));

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
            <Ionicons name="people" size={18} color="#156473" />
          </View>
          <Text className="flex-1 text-lg font-display text-ink" numberOfLines={1}>
            Pilgrim &amp; Passenger Info
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add pilgrim"
          onPress={add}
          className="flex-row items-center gap-1 rounded-full bg-brand-500 px-3.5 py-2"
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text className="text-xs font-body-semibold text-white">Add</Text>
        </Pressable>
      </View>

      {pilgrims.map((pilgrim, index) => (
        <View
          key={pilgrim.id}
          className="gap-3 rounded-2xl border border-hairline bg-surface-sunk/40 p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-100">
                <Text className="text-xs font-bold text-brand-700">{index + 1}</Text>
              </View>
              <Text className="text-sm font-body-semibold text-ink">
                Pilgrim #{index + 1} Details
              </Text>
            </View>
            {pilgrims.length > 1 ? (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => remove(pilgrim.id)}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            ) : null}
          </View>

          <Input
            label="Full Name (As per Passport)"
            placeholder="e.g. Muhammad Ahmad"
            value={pilgrim.fullName}
            onChangeText={(v) => update(pilgrim.id, { fullName: v })}
          />
          <Input
            label="Passport Number"
            placeholder="e.g. AB1234567"
            autoCapitalize="characters"
            value={pilgrim.passportNumber}
            onChangeText={(v) => update(pilgrim.id, { passportNumber: v })}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Passport Expiry"
                placeholder="MM/DD/YYYY"
                value={pilgrim.passportExpiry}
                onChangeText={(v) => update(pilgrim.id, { passportExpiry: v })}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Date of Birth"
                placeholder="MM/DD/YYYY"
                value={pilgrim.dateOfBirth}
                onChangeText={(v) => update(pilgrim.id, { dateOfBirth: v })}
              />
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-body-medium text-ink">Gender</Text>
            <Select
              value={pilgrim.gender}
              options={GENDER_OPTIONS}
              onChange={(v) => update(pilgrim.id, { gender: v })}
            />
          </View>

          <View className="h-px bg-hairline" />

          <Toggle
            value={pilgrim.visaAssistance}
            onChange={(v) => update(pilgrim.id, { visaAssistance: v })}
            label="Requires visa processing assistance"
          />

          <View className="flex-row gap-3">
            <UploadButton
              icon="document-attach-outline"
              label="Upload Passport"
              attached={Boolean(pilgrim.passportUploaded)}
              onPress={() => update(pilgrim.id, { passportUploaded: !pilgrim.passportUploaded })}
            />
            <UploadButton
              icon="image-outline"
              label="White BG Photo"
              attached={Boolean(pilgrim.photoUploaded)}
              onPress={() => update(pilgrim.id, { photoUploaded: !pilgrim.photoUploaded })}
            />
          </View>
        </View>
      ))}
    </Card>
  );
}
