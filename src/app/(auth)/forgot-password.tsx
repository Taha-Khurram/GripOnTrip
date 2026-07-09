import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';

import { Animated, Button, Card, Input, enterUp } from '@/components/ui';
import { AuthHeader, sendPasswordReset } from '@/features/auth';

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
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader
          title="Reset password"
          subtitle="Enter your email and we'll send you a link to set a new password."
        />

        <Animated.View entering={enterUp(1)} className="-mt-8 px-5">
          <Card className="gap-4 p-5">
            {sent ? (
              <View className="items-center gap-4 py-2">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
                  <Ionicons name="mail-open-outline" size={30} color="#16a34a" />
                </View>
                <Text className="text-center text-sm leading-5 text-muted">
                  If an account exists for that email, a reset link is on its way. Check your inbox.
                </Text>
                <Button label="Back to sign in" variant="outline" onPress={() => router.back()} fullWidth />
              </View>
            ) : (
              <>
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
                <Button label="Send reset link" loading={isSubmitting} onPress={handleSubmit(onSubmit)} fullWidth />
              </>
            )}
          </Card>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
