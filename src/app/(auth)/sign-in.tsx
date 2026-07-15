import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Animated, Input, enterUp } from '@/components/ui';
import {
  AuthButton,
  AuthHeader,
  SocialAuthButtons,
  signInWithEmail,
  signInSchema,
  type SignInInput,
} from '@/features/auth';

export default function SignInScreen() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInInput) => {
    setFormError(null);
    try {
      await signInWithEmail(values.email, values.password);
      router.replace('/(tabs)');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Sign in failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader
          eyebrow="Member Login"
          eyebrowIcon="person-circle-outline"
          title="Welcome"
          highlight="Back"
          subtitle="Sign in to book stays, manage trips, and keep your wishlist."
        />

        <Animated.View entering={enterUp(1)} className="mx-5 -mt-12">
          <View className="gap-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-soft">
            {/* Card header */}
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
                <Ionicons name="log-in-outline" size={22} color="#00a165" />
              </View>
              <View className="flex-1">
                <Text className="font-display-semibold text-[17px] leading-5 text-ink">Sign in</Text>
                <Text className="text-[12px] text-muted">Access your trips & wishlist</Text>
              </View>
            </View>

            {formError ? (
              <View className="flex-row items-center gap-2 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text className="flex-1 text-sm text-danger">{formError}</Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Link
              href="/(auth)/forgot-password"
              className="self-end text-sm font-semibold text-brand-600 dark:text-brand-300"
            >
              Forgot password?
            </Link>

            <AuthButton label="Sign In" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />

            <SocialAuthButtons onError={setFormError} />
          </View>
        </Animated.View>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-muted">New to Grip On Trip?</Text>
          <Link href="/(auth)/sign-up" className="font-semibold text-brand-600">
            Create an account
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
