import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { Button, Input } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { sendPasswordReset } from '@/features/auth';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type Input_ = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input_>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values: Input_) => {
    setFormError(null);
    try {
      await sendPasswordReset(values.email);
      setSent(true);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not send reset email.');
    }
  };

  return (
    <Screen className="justify-center px-6">
      <Text className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">Reset password</Text>
      <Text className="mb-6 text-neutral-500">
        Enter your email and we&apos;ll send you a link to reset your password.
      </Text>

      {sent ? (
        <View className="gap-4">
          <View className="rounded-xl bg-green-50 px-4 py-3 dark:bg-green-950">
            <Text className="text-sm text-success">
              If an account exists for that email, a reset link is on its way.
            </Text>
          </View>
          <Button label="Back to sign in" variant="outline" onPress={() => router.back()} fullWidth />
        </View>
      ) : (
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
          <Button label="Send reset link" loading={isSubmitting} onPress={handleSubmit(onSubmit)} fullWidth />
        </View>
      )}
    </Screen>
  );
}
