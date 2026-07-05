import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { SocialAuthButtons, signUpWithEmail, signUpSchema, type SignUpInput } from '@/features/auth';

export default function SignUpScreen() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignUpInput) => {
    setFormError(null);
    setNotice(null);
    try {
      const { session } = await signUpWithEmail(values.name, values.email, values.password);
      // If email confirmation is on, there's no session yet — tell the user to verify.
      if (session) {
        router.replace('/(tabs)');
      } else {
        setNotice('Account created. Check your email to confirm, then sign in.');
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Sign up failed.');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="px-6 py-8 gap-4" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white">Create your account</Text>

        {formError ? (
          <View className="rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
            <Text className="text-sm text-danger">{formError}</Text>
          </View>
        ) : null}
        {notice ? (
          <View className="rounded-xl bg-green-50 px-4 py-3 dark:bg-green-950">
            <Text className="text-sm text-success">{notice}</Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Full name" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
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
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm password"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Button label="Create account" loading={isSubmitting} onPress={handleSubmit(onSubmit)} fullWidth />

        <SocialAuthButtons onError={setFormError} />

        <View className="flex-row justify-center gap-1">
          <Text className="text-neutral-500">Already have an account?</Text>
          <Link href="/(auth)/sign-in" className="font-semibold text-brand-600">
            Sign in
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}
