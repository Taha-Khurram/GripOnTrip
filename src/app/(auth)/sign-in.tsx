import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Animated, Button, Card, Input, enterUp } from '@/components/ui';
import { AuthHeader, SocialAuthButtons, signInWithEmail, signInSchema, type SignInInput } from '@/features/auth';

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
      className="flex-1 bg-neutral-50 dark:bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader title="Welcome back" subtitle="Sign in to book stays, manage trips, and keep your wishlist." />

        <Animated.View entering={enterUp(1)} className="-mt-8 px-5">
          <Card className="gap-4 p-5">
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

            <Link href="/(auth)/forgot-password" className="self-end text-sm font-semibold text-brand-600">
              Forgot password?
            </Link>

            <Button label="Sign In" loading={isSubmitting} onPress={handleSubmit(onSubmit)} fullWidth />

            <SocialAuthButtons onError={setFormError} />
          </Card>
        </Animated.View>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-neutral-500">New to Grip On Trip?</Text>
          <Link href="/(auth)/sign-up" className="font-semibold text-brand-600">
            Create an account
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
