import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { Animated, Card, Input, OceanHero, enterUp } from '@/components/ui';
import { SignInGate } from '@/components/layout/SignInGate';
import { APP_NAME } from '@/constants/config';
import { useProfile, useUpdateProfile } from '@/features/profile';
import { useAuthStore } from '@/store/auth.store';

// App brand mark — same asset the home hero + auth header use.
const logo = require('../../assets/images/icon.png');

const schema = z.object({
  fullName: z.string().min(2, 'Please enter your name'),
  phone: z.string().trim().max(20, 'Phone number looks too long').optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

/** Curved ocean hero carrying the user's identity — mirrors the home header. */
function ProfileHero({
  avatarUrl,
  displayName,
  email,
  role,
}: {
  avatarUrl?: string;
  displayName: string;
  email: string;
  role?: string;
}) {
  return (
    <Animated.View entering={enterUp(0)}>
      <OceanHero className="rounded-b-[36px] px-5 pb-8 pt-6">
        <View className="flex-row items-center gap-2.5">
          <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
          <Text className="font-display text-base text-white">{APP_NAME}</Text>
        </View>

        <View className="mt-6 items-center gap-2">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.6)',
              }}
            />
          ) : (
            <View className="h-24 w-24 items-center justify-center rounded-full border-[3px] border-white/50 bg-white/20">
              <Text className="text-3xl font-display-x text-white">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="mt-1 font-display-x text-2xl text-white">{displayName}</Text>
          {email ? <Text className="text-sm text-white">{email}</Text> : null}
          {role ? (
            <View className="mt-1 rounded-full bg-white/15 px-3 py-1">
              <Text className="text-xs font-semibold capitalize text-white">{role}</Text>
            </View>
          ) : null}
        </View>
      </OceanHero>
    </Animated.View>
  );
}

function SettingsForm() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', phone: '' },
  });

  useEffect(() => {
    reset({
      fullName: profile?.fullName ?? profile?.name ?? user?.name ?? '',
      phone: profile?.phone ?? user?.phone ?? '',
    });
  }, [profile, user, reset]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSaved(false);
    try {
      await mutateAsync({ fullName: values.fullName.trim(), phone: values.phone?.trim() || '' });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your changes.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#00a165" />
      </View>
    );
  }

  const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl;
  const email = profile?.email ?? user?.email ?? '';
  const displayName = profile?.fullName ?? profile?.name ?? user?.name ?? '?';
  const role = profile?.role;

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero avatarUrl={avatarUrl} displayName={displayName} email={email} role={role} />

        <View className="gap-4 px-5 pt-6">
          {saved ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-green-50 px-4 py-3">
              <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              <Text className="flex-1 text-sm text-success">Profile updated.</Text>
            </View>
          ) : null}
          {error ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text className="flex-1 text-sm text-danger">{error}</Text>
            </View>
          ) : null}

          <Text className="font-display text-xl text-ink">Personal information</Text>

          <Animated.View entering={enterUp(1)}>
            <Card className="gap-4 p-5">
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.fullName?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Phone"
                    placeholder="+92 300 1234567"
                    keyboardType="phone-pad"
                    value={value ?? ''}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.phone?.message}
                  />
                )}
              />
              <View>
                <Input label="Email" value={email} editable={false} className="opacity-60" />
                <Text className="px-1 pt-1 text-xs text-muted-foreground">
                  Email can&apos;t be changed here.
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* Save CTA — solid brand-blue via a `bg-*` className (pure classes, no
              inline style), centered label. Same reliable pattern as the booking CTAs. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save changes"
            accessibilityState={{ disabled: isPending, busy: isPending }}
            disabled={isPending}
            onPress={handleSubmit(onSubmit)}
            className={[
              'w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4',
              isPending ? 'opacity-50' : '',
            ].join(' ')}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                <Text className="font-body-semibold text-base text-white">Save changes</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ProfileSettingsScreen() {
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Profile settings' }} />
      <SignInGate icon="person-circle-outline" message="Sign in to view and edit your profile.">
        <SettingsForm />
      </SignInGate>
    </View>
  );
}
