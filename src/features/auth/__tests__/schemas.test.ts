/// <reference types="jest" />
import { signInSchema, signUpSchema } from '../schemas';

const validSignUp = {
  name: 'Jane Traveler',
  email: 'jane@example.com',
  password: 'Passw0rd',
  confirmPassword: 'Passw0rd',
};

describe('signInSchema', () => {
  // ---- positive ----
  it('accepts a valid email + password', () => {
    const r = signInSchema.safeParse({ email: 'jane@example.com', password: 'Passw0rd' });
    expect(r.success).toBe(true);
  });

  // ---- negative ----
  it('rejects a malformed email', () => {
    const r = signInSchema.safeParse({ email: 'not-an-email', password: 'Passw0rd' });
    expect(r.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const r = signInSchema.safeParse({ email: 'jane@example.com', password: '' });
    expect(r.success).toBe(false);
  });

  // ---- security ----
  it('normalizes email to trimmed lowercase (no duplicate-case accounts)', () => {
    const r = signInSchema.safeParse({ email: '  Jane@EXAMPLE.com  ', password: 'Passw0rd' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('jane@example.com');
  });

  it('rejects an oversized email (>254 chars) to block input-size abuse', () => {
    const huge = `${'a'.repeat(250)}@x.com`; // > 254 chars
    const r = signInSchema.safeParse({ email: huge, password: 'Passw0rd' });
    expect(r.success).toBe(false);
  });

  it('rejects an oversized password (>72 chars)', () => {
    const r = signInSchema.safeParse({ email: 'jane@example.com', password: 'a'.repeat(73) });
    expect(r.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  // ---- positive ----
  it('accepts a valid sign-up', () => {
    const r = signUpSchema.safeParse(validSignUp);
    expect(r.success).toBe(true);
  });

  // ---- negative ----
  it('rejects a password shorter than 8 chars', () => {
    const r = signUpSchema.safeParse({ ...validSignUp, password: 'Ab1', confirmPassword: 'Ab1' });
    expect(r.success).toBe(false);
  });

  it('rejects a password with no number', () => {
    const r = signUpSchema.safeParse({
      ...validSignUp,
      password: 'password',
      confirmPassword: 'password',
    });
    expect(r.success).toBe(false);
  });

  it('rejects a password with no letter', () => {
    const r = signUpSchema.safeParse({
      ...validSignUp,
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(r.success).toBe(false);
  });

  it('rejects mismatched password confirmation', () => {
    const r = signUpSchema.safeParse({ ...validSignUp, confirmPassword: 'Different1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });

  it('rejects a name shorter than 2 chars', () => {
    const r = signUpSchema.safeParse({ ...validSignUp, name: 'J' });
    expect(r.success).toBe(false);
  });

  // ---- security ----
  it('trims the name and rejects names beyond 80 chars', () => {
    const ok = signUpSchema.safeParse({ ...validSignUp, name: '  Jane Traveler  ' });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.name).toBe('Jane Traveler');

    const tooLong = signUpSchema.safeParse({ ...validSignUp, name: 'a'.repeat(81) });
    expect(tooLong.success).toBe(false);
  });

  it('treats an injection-style name as literal data (length permitting)', () => {
    // We never interpret the name — it is stored as-is (RLS + parameterized
    // writes handle safety). This only asserts it is not specially rejected.
    const r = signUpSchema.safeParse({ ...validSignUp, name: "Robert'); DROP TABLE users;--" });
    expect(r.success).toBe(true);
  });

  it('rejects an oversized password (>72 chars, bcrypt truncation guard)', () => {
    const pw = `A1${'a'.repeat(72)}`; // 74 chars
    const r = signUpSchema.safeParse({ ...validSignUp, password: pw, confirmPassword: pw });
    expect(r.success).toBe(false);
  });
});
