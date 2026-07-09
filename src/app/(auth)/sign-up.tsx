import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Animated, Button, Card, Input, enterUp } from '@/components/ui';
import { AuthHeader, SocialAuthButtons, signUpWithEmail, signUpSchema, type SignUpInput } from '@/features/auth';

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
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader title="Create your account" subtitle="Join Grip On Trip to book, save, and manage your travels." />

        <Animated.View entering={enterUp(1)} className="-mt-8 px-5">
          <Card className="gap-4 p-5">
            {formError ? (
              <View className="flex-row items-center gap-2 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text className="flex-1 text-sm text-danger">{formError}</Text>
              </View>
            ) : null}
            {notice ? (
              <View className="flex-row items-center gap-2 rounded-xl bg-green-50 px-4 py-3 dark:bg-green-950">
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                <Text className="flex-1 text-sm text-success">{notice}</Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full name"
                  placeholder="Jane Traveler"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />
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
                  placeholder="At least 8 characters"
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
                  placeholder="Re-enter your password"
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
          </Card>
        </Animated.View>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-muted">Already have an account?</Text>
          <Link href="/(auth)/sign-in" className="font-semibold text-brand-600">
            Sign in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
