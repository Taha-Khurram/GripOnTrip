/// <reference types="jest" />
import { friendlyAuthError, normalizeEmail, parseAuthRedirect } from '../utils';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Jane@EXAMPLE.com ')).toBe('jane@example.com');
  });
  it('leaves an already-normal email unchanged', () => {
    expect(normalizeEmail('jane@example.com')).toBe('jane@example.com');
  });
});

describe('friendlyAuthError', () => {
  it('returns a generic message for empty input', () => {
    expect(friendlyAuthError()).toMatch(/something went wrong/i);
    expect(friendlyAuthError('')).toMatch(/something went wrong/i);
  });
  it('maps invalid credentials', () => {
    expect(friendlyAuthError('Invalid login credentials')).toBe('Incorrect email or password.');
  });
  it('maps unconfirmed email', () => {
    expect(friendlyAuthError('Email not confirmed')).toMatch(/confirm your email/i);
  });
  it('maps an already-registered email', () => {
    expect(friendlyAuthError('User already registered')).toMatch(/already exists/i);
  });
  it('maps rate-limit / security throttle', () => {
    expect(
      friendlyAuthError('For security purposes, you can only request this after 39 seconds'),
    ).toMatch(/too many attempts/i);
  });
  it('maps network failures', () => {
    expect(friendlyAuthError('Network request failed')).toMatch(/network error/i);
  });
  it('passes through an unknown message unchanged', () => {
    expect(friendlyAuthError('Some novel backend error')).toBe('Some novel backend error');
  });
});

describe('parseAuthRedirect', () => {
  const scheme = 'app';

  // ---- positive ----
  it('extracts a PKCE code from the query', () => {
    const r = parseAuthRedirect('app://auth-callback?code=abc123', scheme);
    expect(r).toEqual({ kind: 'code', code: 'abc123' });
  });

  it('extracts implicit-flow tokens from the fragment', () => {
    const r = parseAuthRedirect(
      'app://auth-callback#access_token=at-1&refresh_token=rt-1',
      scheme,
    );
    expect(r).toEqual({ kind: 'tokens', accessToken: 'at-1', refreshToken: 'rt-1' });
  });

  it('returns none when there is nothing actionable', () => {
    expect(parseAuthRedirect('app://auth-callback', scheme)).toEqual({ kind: 'none' });
  });

  // ---- negative ----
  it('surfaces a provider error from the query', () => {
    const r = parseAuthRedirect(
      'app://auth-callback?error=access_denied&error_description=User%20denied',
      scheme,
    );
    expect(r).toEqual({ kind: 'error', message: 'User denied' });
  });

  it('surfaces a provider error from the fragment', () => {
    const r = parseAuthRedirect('app://auth-callback#error=server_error', scheme);
    expect(r).toEqual({ kind: 'error', message: 'server_error' });
  });

  it('returns an error for a malformed URL', () => {
    const r = parseAuthRedirect('not a url', scheme);
    expect(r.kind).toBe('error');
  });

  // ---- security ----
  it('rejects a redirect to a foreign scheme even if it carries a code', () => {
    const r = parseAuthRedirect('https://evil.example.com/auth?code=stolen', scheme);
    expect(r).toEqual({
      kind: 'error',
      message: 'Google sign-in returned an unexpected redirect.',
    });
  });

  it('does not extract a code when the scheme is wrong (no code exchange on foreign host)', () => {
    const r = parseAuthRedirect('evil://auth-callback?code=stolen', scheme);
    expect(r.kind).toBe('error');
  });

  it('accepts any scheme when none is enforced (parsing-only mode)', () => {
    const r = parseAuthRedirect('app://auth-callback?code=abc');
    expect(r).toEqual({ kind: 'code', code: 'abc' });
  });
});
