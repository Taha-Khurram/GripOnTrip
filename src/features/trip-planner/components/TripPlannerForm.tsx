import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { DateField, Input, Stepper } from '@/components/ui';
import { addDays, nightsBetween, toISODate } from '@/utils/date';
import {
  BUDGET_OPTIONS,
  INTEREST_OPTIONS,
  PACE_OPTIONS,
  type TripBudget,
  type TripPace,
  type TripPreferences,
} from '../types';

/** Imperative handle so the screen's sticky footer button can trigger submit. */
export interface TripPlannerFormHandle {
  submit: () => void;
}

/**
 * Collects trip preferences and hands a validated {@link TripPreferences} to the
 * screen. Mirrors the fields on the web planner: destination, dates, party size,
 * budget, pace, interests and free-form notes. The submit button lives in the
 * screen's sticky footer and calls {@link TripPlannerFormHandle.submit} via ref.
 */
export const TripPlannerForm = forwardRef<
  TripPlannerFormHandle,
  { onSubmit: (prefs: TripPreferences) => void }
>(function TripPlannerForm({ onSubmit }, ref) {
  const today = toISODate(new Date());
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 3));
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState<TripBudget>('moderate');
  const [pace, setPace] = useState<TripPace>('balanced');
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  const days = nightsBetween(startDate, endDate) + 1;
  const destinationValid = destination.trim().length > 1;
  const datesValid = days > 0;
  const canSubmit = destinationValid && datesValid;

  const toggleInterest = (tag: string) =>
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({
      destination: destination.trim(),
      startDate,
      endDate,
      travelers,
      budget,
      pace,
      interests,
      notes: notes.trim() || undefined,
    });
  };

  useImperativeHandle(ref, () => ({ submit }));

  return (
    <View className="gap-4">
      {/* Trip basics */}
      <Section icon="map-outline" title="Trip basics">
        <Input
          label="Where are you going?"
          placeholder="e.g. Skardu, Istanbul, Makkah"
          value={destination}
          onChangeText={setDestination}
          autoCapitalize="words"
          error={touched && !destinationValid ? 'Please enter a destination.' : undefined}
        />

        <View className="gap-2">
          <View className="flex-row gap-3">
            <DateField
              label="Start date"
              value={startDate}
              min={new Date()}
              onChange={(iso) => {
                setStartDate(iso);
                // Keep end on/after start (same-day trips are allowed).
                if (new Date(iso) > new Date(endDate)) setEndDate(iso);
              }}
            />
            <DateField
              label="End date"
              value={endDate}
              min={new Date(startDate)}
              onChange={setEndDate}
            />
          </View>
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-accent-50 px-3 py-1">
            <Ionicons name="time-outline" size={13} color="#db7a13" />
            <Text className="text-xs font-semibold text-accent-700">
              {days} day{days === 1 ? '' : 's'} trip
            </Text>
          </View>
        </View>

        <View className="rounded-2xl bg-surface-sunk/60 px-4">
          <Stepper label="Travelers" value={travelers} onChange={setTravelers} min={1} max={20} />
        </View>
      </Section>

      {/* Style */}
      <Section icon="options-outline" title="Your travel style">
        <SegmentedField label="Budget" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
        <SegmentedField label="Trip pace" options={PACE_OPTIONS} value={pace} onChange={setPace} />
      </Section>

      {/* Interests */}
      <Section icon="heart-outline" title="Interests" optional>
        <View className="flex-row flex-wrap gap-2">
          {INTEREST_OPTIONS.map((tag) => {
            const active = interests.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleInterest(tag)}
                className={[
                  'rounded-full border px-4 py-2.5',
                  active
                    ? 'border-accent-500 bg-accent-500'
                    : 'border-hairline bg-white',
                ].join(' ')}
              >
                <Text
                  className={[
                    'text-sm',
                    active ? 'font-semibold text-white' : 'font-medium text-muted',
                  ].join(' ')}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Notes */}
      <Section icon="chatbubble-ellipses-outline" title="Anything else?" optional>
        <TextInput
          placeholder="Traveling with kids, prefer halal food, want a rest day…"
          placeholderTextColor="#9aa7ac"
          multiline
          value={notes}
          onChangeText={setNotes}
          className="min-h-24 rounded-2xl border border-hairline bg-white px-4 py-3.5 text-base leading-6 text-ink"
        />
      </Section>
    </View>
  );
});

/** Card section with an icon-badge header — the modern grouping used across the form. */
function Section({
  icon,
  title,
  optional,
  children,
}: {
  icon: string;
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-4 rounded-3xl border border-hairline bg-white p-5 shadow-card">
      <View className="flex-row items-center gap-2.5">
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent-50">
          <Ionicons name={icon as never} size={17} color="#db7a13" />
        </View>
        <Text className="flex-1 font-display text-base text-ink">{title}</Text>
        {optional ? (
          <Text className="text-xs font-medium text-muted-foreground">Optional</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** Row of icon + label options; exactly one is selected at a time. */
function SegmentedField<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; icon: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="gap-2.5">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <View className="flex-row gap-2.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={[
                'flex-1 items-center gap-1.5 rounded-2xl border py-3.5',
                active
                  ? 'border-accent-500 bg-accent-50'
                  : 'border-hairline bg-white',
              ].join(' ')}
            >
              <Ionicons
                name={opt.icon as never}
                size={22}
                color={active ? '#db7a13' : '#9aa7ac'}
              />
              <Text
                className={[
                  'text-xs',
                  active ? 'font-semibold text-accent-700' : 'font-medium text-muted',
                ].join(' ')}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
