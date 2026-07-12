import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { DeepPanel, PressableScale } from '@/components/ui';

/** Minimal email sanity check — enough to gate the local success state. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Ready to Write Your Story?" newsletter sign-up — the closing section, mirroring
 * the website's subscribe block in the app's navy `DeepPanel` language (the same
 * treatment as {@link TripPlannerPromo}): a badge pill, centered display title and
 * subtitle, a frosted email field and a gold CTA.
 *
 * Local-only for now: it validates the address and flips to an inline success
 * state (no newsletter backend is wired yet).
 */
export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError(true);
      return;
    }
    setError(false);
    setDone(true);
  };

  return (
    <DeepPanel className="gap-6 rounded-[28px] p-6 shadow-soft">
      {/* Header */}
      <View className="items-center gap-3">
        <View className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
          <Ionicons name="mail-open-outline" size={13} color="#f5a623" />
          <Text className="text-[11px] font-body-semibold uppercase tracking-[1.5px] text-accent-400">
            Travel Club
          </Text>
        </View>
        <Text className="text-center font-display-x text-[26px] leading-8 text-white">
          Ready to Write Your Story?
        </Text>
        <Text className="text-center text-[14px] leading-6 text-white/80">
          Join 50,000+ travelers who receive our curated deals and travel insights weekly.
        </Text>
      </View>

      {/* Form / success */}
      {done ? (
        <View className="flex-row items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-4">
          <Ionicons name="checkmark-circle" size={20} color="#00fa9a" />
          <Text className="text-[14px] font-body-semibold text-white">
            You&apos;re in! Check your inbox soon.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {/* Email field */}
          <View
            className={[
              'flex-row items-center gap-2.5 rounded-full border bg-white/10 px-4 py-3.5',
              error ? 'border-danger' : 'border-white/15',
            ].join(' ')}
          >
            <Ionicons name="mail-outline" size={18} color="#a9c2dd" />
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError(false);
              }}
              onSubmitEditing={submit}
              placeholder="Enter your email address"
              placeholderTextColor="#8ba0bd"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              className="flex-1 py-0 text-[15px] font-body-medium text-white"
            />
          </View>

          {error ? (
            <Text className="pl-4 text-[12px] text-danger">
              Please enter a valid email address.
            </Text>
          ) : null}

          {/* CTA */}
          <PressableScale accessibilityRole="button" activeScale={0.97} onPress={submit}>
            <View className="flex-row items-center justify-center gap-2 rounded-full bg-accent-500 py-4 shadow-glow">
              <Text className="text-[13px] font-body-semibold uppercase tracking-[1px] text-ink">
                Join the Club
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#0a1a2f" />
            </View>
          </PressableScale>
        </View>
      )}
    </DeepPanel>
  );
}
