import { z } from 'zod';

/**
 * Email field for auth forms. Trims + lowercases before validating so the value
 * that reaches Supabase is already normalized (no duplicate-case accounts, no
 * stray whitespace from paste/autofill). Capped at 254 chars — the RFC max — to
 * reject oversized input.
 */
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address')
  .max(254, 'That email address is too long')
  .email('Enter a valid email address');

/**
 * Password field for NEW accounts. Min 8 for baseline strength; max 72 because
 * bcrypt (Supabase's hash) silently truncates beyond 72 bytes, and requiring a
 * letter + number blocks trivially weak passwords. Sign-in uses a laxer rule so
 * we never lock out accounts created before these constraints existed.
 */
const newPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Enter your password').max(72, 'Password is too long'),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name').max(80, 'That name is too long'),
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
