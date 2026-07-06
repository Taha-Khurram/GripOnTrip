import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';

import { Animated, Button, Card, Input, enterUp } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { SignInGate } from '@/components/layout/SignInGate';
import { useProfile, useUpdateProfile } from '@/features/profile';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  fullName: z.string().min(2, 'Please enter your name'),
  phone: z.string().trim().max(20, 'Phone number looks too long').optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

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
        <ActivityIndicator color="#219ebc" />
      </View>
    );
  }

  const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl;
  const email = profile?.email ?? user?.email ?? '';
  const displayName = profile?.fullName ?? profile?.name ?? user?.name ?? '?';
  const role = profile?.role;

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="gap-4 p-5" keyboardShouldPersistTaps="handled">
        {/* Identity header */}
        <Animated.View entering={enterUp(0)} className="items-center gap-2 pt-2">
          <View className="rounded-full p-1">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: '#e8f4fa' }}
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-500">
                <Text className="text-3xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text className="text-lg font-bold text-neutral-900 dark:text-white">{displayName}</Text>
          <Text className="text-sm text-neutral-500">{email}</Text>
          {role ? (
            <View className="mt-1 rounded-full bg-brand-50 px-3 py-1 dark:bg-brand-500/15">
              <Text className="text-xs font-semibold capitalize text-brand-700 dark:text-brand-300">{role}</Text>
            </View>
          ) : null}
        </Animated.View>

        {saved ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-green-50 px-4 py-3 dark:bg-green-950">
            <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
            <Text className="flex-1 text-sm text-success">Profile updated.</Text>
          </View>
        ) : null}
        {error ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text className="flex-1 text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        {/* Editable fields */}
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
              <Text className="px-1 pt-1 text-xs text-neutral-400">
                Email can&apos;t be changed here.
              </Text>
            </View>
          </Card>
        </Animated.View>

        <Button label="Save changes" loading={isPending} onPress={handleSubmit(onSubmit)} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ProfileSettingsScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Profile settings' }} />
      <SignInGate icon="person-circle-outline" message="Sign in to view and edit your profile.">
        <SettingsForm />
      </SignInGate>
    </Screen>
  );
}
