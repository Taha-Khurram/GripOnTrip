import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { SocialAuthButtons, signInWithEmail, signInSchema, type SignInInput } from '@/features/auth';

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
    <Screen className="justify-center px-6">
      <Text className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Welcome back</Text>

      <View className="gap-4">
        {formError ? (
          <View className="rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
            <Text className="text-sm text-danger">{formError}</Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              autoCapitalize="none"
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

        <View className="flex-row justify-center gap-1">
          <Text className="text-neutral-500">New here?</Text>
          <Link href="/(auth)/sign-up" className="font-semibold text-brand-600">
            Create an account
          </Link>
        </View>
      </View>
    </Screen>
  );
}
