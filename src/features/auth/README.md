# auth feature

Sign-in / sign-up / password-reset + "Continue with Google", backed by Supabase
(same project as the website). Browsing stays public; auth powers the account
area and any future action-gating (`useRequireAuth`, currently OFF).

## Module layout

- `schemas.ts` — zod form schemas (email normalization + password rules).
- `utils.ts` — **pure** helpers (`normalizeEmail`, `friendlyAuthError`,
  `parseAuthRedirect`), no native/Supabase imports so they're unit-testable.
- `api.ts` — Supabase calls: email sign-in/up, reset, `signInWithGoogle`.
- `components/` — `AuthHeader`, `AuthButton`, `SocialAuthButtons`.
- `index.ts` — public exports.

## Google sign-in flow (system-browser OAuth, PKCE)

1. `signInWithGoogle()` asks Supabase for the provider URL with
   `redirectTo = app://auth-callback` and `skipBrowserRedirect: true`.
2. The URL opens in the system auth browser (`WebBrowser.openAuthSessionAsync`).
3. On return, `parseAuthRedirect` reads the result URL. **It only trusts a
   redirect back to our own `app://` scheme** — a foreign host is rejected before
   any token/code is touched.
4. PKCE `?code=…` → `exchangeCodeForSession` (secure path). Legacy implicit
   `#access_token=…` is a guarded fallback.
5. The auth-store `onAuthStateChange` listener flips `isAuthenticated`, and the
   root layout's `Stack.Protected` swaps the `(auth)` group for `(tabs)` — no
   manual navigation needed.

A user dismissing the browser returns `'cancelled'` (not an error), so the UI
stays silent instead of flashing a banner.

### Supabase / Google Cloud config (one-time, dashboard)

Required for the flow to work — code alone is not enough:

1. **Supabase → Authentication → Providers → Google:** enable it, paste the
   Google OAuth **Client ID + Secret** (from Google Cloud Console → Credentials).
2. **Google Cloud → OAuth client → Authorized redirect URIs:** add
   `https://<project-ref>.supabase.co/auth/v1/callback`.
3. **Supabase → Authentication → URL Configuration → Redirect URLs:** add
   `app://auth-callback` (the app's deep-link) so Supabase will redirect back to
   the app. Keep the web URLs already listed there.
4. The app scheme is `app` (see `app.json`) — `Linking.createURL('auth-callback')`
   resolves to `app://auth-callback` in a dev/production build. (Google OAuth
   needs a dev build or standalone app; it won't complete inside plain Expo Go.)

## Tests

Pure logic is covered by jest (`npm test`): schema validation, error mapping,
email normalization, and redirect parsing — see `__tests__/`.

## Manual QA matrix

Run on a dev build (device/emulator) after any auth change.

### Positive

| # | Steps | Expected |
|---|-------|----------|
| P1 | Sign up with a new email + valid password | Account created; if email confirmation is on, "check your email" notice, else lands in tabs |
| P2 | Sign in with correct credentials | Lands in `(tabs)`; session persists across app restart |
| P3 | Tap "Continue with Google", pick an account | Returns to app signed in; name/avatar from Google appear in profile |
| P4 | Forgot password → enter email | "reset link on its way" confirmation |
| P5 | Kill & relaunch app while signed in | Opens straight into tabs (no sign-in flash) |

### Negative

| # | Steps | Expected |
|---|-------|----------|
| N1 | Sign in with wrong password | "Incorrect email or password." |
| N2 | Sign up with an already-registered email | "An account with that email already exists." |
| N3 | Submit invalid email format | Inline "Enter a valid email address" |
| N4 | Sign-up password `< 8` / no letter / no number | Inline strength error; no request sent |
| N5 | Sign-up passwords don't match | Inline "Passwords do not match" |
| N6 | Start Google, then cancel the browser | Returns to screen silently, **no error banner** |
| N7 | Airplane mode, then sign in | "Network error. Check your connection…" |

### Security

| # | Steps | Expected |
|---|-------|----------|
| S1 | Sign up `Jane@X.com`, then sign in `  jane@x.com ` | Same account — email is trimmed + lowercased |
| S2 | Rapidly retry wrong password / resend reset | Supabase throttles → "Too many attempts…" |
| S3 | Paste a 300-char email or 100-char password | Rejected client-side (length caps) before any request |
| S4 | Inspect the OAuth flow | PKCE `?code=` exchanged with a code-verifier; tokens never ride a URL we render |
| S5 | Feed a foreign redirect (`https://evil…?code=`) to `parseAuthRedirect` | Rejected as "unexpected redirect" — no code exchange (unit-tested) |
| S6 | Confirm the anon key is the only key shipped | No service-role key or secret in the bundle (`src/config/env.ts`) |
