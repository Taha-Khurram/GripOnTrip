# Grip On Trip — Production Readiness Roadmap

A phased plan to take the app from its current shell state to a shippable,
user-ready product, with a detailed plan for **Firebase authentication**
(email/password + Google Sign-In).

- **App:** Expo SDK 57 / React Native 0.86 / Expo Router / NativeWind
- **State:** React Query (server) + Zustand (client)
- **Distribution:** EAS development build now; EAS production build for release
- **Last updated:** 2026-07-04

---

## 1. Current state (baseline)

| Area | Status |
|------|--------|
| Navigation shell (tabs + stack) | ✅ Built (`src/app/_layout.tsx`, `(tabs)/_layout.tsx`) |
| Home screen | ✅ Built (hero, search entry, AI planner callout, category grid) |
| Auth screens (sign-in / sign-up) | 🟡 Forms + zod validation done, submit is a `TODO` stub |
| Auth store (`auth.store.ts`) | 🟡 Skeleton; `hydrate` never loads the user; no real login |
| API client (`api/client.ts`) | ✅ Axios + Bearer-token interceptor; no 401/refresh handling |
| Verticals (rentals/tours/umrah/guides/shop) | 🔴 `ComingSoon` placeholders |
| Hotels | 🟡 Feature module + detail route exist; **no list screen**, tapping "Hotels" 404s |
| Search / Trip Planner | 🟡 Route files exist, need real implementation |
| Bookings / payments | 🔴 Not started (endpoints defined only) |
| Testing / error tracking / analytics | 🔴 Not started |
| Store release setup | 🟡 `eas.json` profiles exist; no assets/metadata/submission |

**Legend:** ✅ done · 🟡 partial · 🔴 not started

---

## 2. Key architecture decisions (resolve before building auth)

### 2.1 Firebase's role
The app already targets a REST backend (`api.gripontrip.com`, see `src/config/env.ts`
and `src/api/endpoints.ts`). Recommended model:

> **Firebase is the identity provider only.** It handles sign-up, sign-in, Google
> OAuth, password reset, and email verification, and issues a **Firebase ID token**.
> The app sends that ID token as `Authorization: Bearer <token>` to the Grip On Trip
> API, which verifies it with the **Firebase Admin SDK** and returns app data.

This fits the existing axios interceptor with almost no change — we swap "our token"
for "Firebase ID token" and refresh it via Firebase.

**Decision needed:** Confirm the backend team will verify Firebase ID tokens
(Admin SDK). If the backend must issue its own JWT, add a `/auth/firebase-exchange`
endpoint that trades a Firebase ID token for an app session token.

### 2.2 Which Firebase SDK
| Option | Google Sign-In UX | Works in Expo Go | Needs dev build | Recommendation |
|--------|-------------------|------------------|-----------------|----------------|
| **Firebase JS SDK** + `@react-native-google-signin` | Native account picker | ❌ | ✅ | ✅ **Recommended** |
| Firebase JS SDK + `expo-auth-session` (Google) | Web popup/redirect | ✅ | ❌ | Fallback if avoiding native libs |
| `@react-native-firebase/*` (full native) | Native | ❌ | ✅ | Only if you need native Firebase (Analytics, Messaging via RNFB) |

We already use a **development build**, so the recommended stack is:
- `firebase` (JS SDK) → email/password + session
- `@react-native-google-signin/google-signin` → native Google sign-in, then
  `signInWithCredential` into Firebase

---

## 3. Phased roadmap

### Phase 0 — Project & environment setup
**Goal:** Firebase project exists and the app can read its config safely.

- [ ] Create Firebase project + enable **Authentication** providers: Email/Password, Google.
- [ ] Register **Android** app in Firebase using package `com.gripontrip.app`
      (from `app.json`); add the debug + release **SHA-1/SHA-256** fingerprints
      (needed for Google Sign-In). Get these from EAS credentials.
- [ ] (Later) Register **iOS** app with bundle id `com.gripontrip.app`.
- [ ] Add Firebase config to env: `EXPO_PUBLIC_FIREBASE_API_KEY`,
      `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._APP_ID`, `..._MESSAGING_SENDER_ID`,
      plus `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` for Google Sign-In.
- [ ] Extend `src/config/env.ts` with a typed `firebase` block reading the above.
- [ ] Update `.env.example` with the new keys (no secrets committed).
- [ ] Add the same vars to EAS: `eas env:create` / build profile `env` in `eas.json`.

**Acceptance:** `env.firebase` is typed and populated in a dev build.

---

### Phase 1 — Authentication (Firebase) ⭐ priority

#### 1.1 Dependencies & native config
- [ ] `npx expo install firebase @react-native-google-signin/google-signin`
- [ ] Add the Google Sign-In config plugin to `app.json` plugins array.
- [ ] Rebuild the dev client (native module added → new EAS dev build required).

#### 1.2 Firebase client singleton
- [ ] Create `src/lib/firebase.ts`: initialize the Firebase app + `getAuth()` with
      **React Native persistence** (`initializeAuth` + `getReactNativePersistence`
      backed by AsyncStorage) so sessions survive app restarts.

#### 1.3 Auth service layer
- [ ] Create `src/features/auth/api.ts` (mirrors `features/hotels/api.ts` shape):
  - `signUpWithEmail(name, email, password)` → `createUserWithEmailAndPassword`,
    set `displayName`, send verification email.
  - `signInWithEmail(email, password)` → `signInWithEmailAndPassword`.
  - `signInWithGoogle()` → native Google flow → `GoogleAuthProvider.credential` →
    `signInWithCredential`.
  - `sendPasswordReset(email)`, `signOutUser()`, `getIdToken(forceRefresh?)`.
- [ ] Map Firebase error codes (`auth/invalid-credential`, `auth/email-already-in-use`,
      `auth/network-request-failed`, …) to friendly messages.

#### 1.4 Auth store & session wiring
- [ ] Rework `src/store/auth.store.ts`:
  - Replace manual token storage with a Firebase `onAuthStateChanged` listener that
    sets `user` / `isAuthenticated` / `isHydrating`.
  - Map `FirebaseUser` → existing `AuthUser` shape (`id`, `name`, `email`, `avatarUrl`).
- [ ] Update `src/api/client.ts` interceptor to attach a **fresh Firebase ID token**
      (`getIdToken()`), and on `401` force-refresh once, else sign out.
- [ ] Keep `StorageKeys` for non-Firebase prefs; Firebase manages its own token store.

#### 1.5 Screens (manual email/password)
- [ ] `src/app/(auth)/sign-up.tsx`: wire `onSubmit` to `signUpWithEmail`, show
      loading/errors, then route into `(tabs)`.
- [ ] `src/app/(auth)/sign-in.tsx`: wire `onSubmit` to `signInWithEmail`.
- [ ] Add **"Forgot password?"** link → new `src/app/(auth)/forgot-password.tsx`.
- [ ] Surface API errors inline (reuse `Input` `error` + a form-level banner).

#### 1.6 Google Sign-In
- [ ] Add a "Continue with Google" button (shared component
      `src/features/auth/components/SocialAuthButtons.tsx`) to both screens.
- [ ] Call `GoogleSignin.configure({ webClientId })` at startup.
- [ ] Handle cancel / no-network / account-picker errors gracefully.

#### 1.7 Route protection (auth gating)
- [ ] In `src/app/_layout.tsx` (or a new `useProtectedRoute` hook), redirect:
  unauthenticated users hitting protected areas → `(auth)/sign-in`; authenticated
  users on auth screens → `(tabs)`. Wait for `isHydrating === false` before deciding
  (splash stays up until then — already handled).
- [ ] **Decision:** which parts require login? Suggested: browsing is public;
      **booking, profile, favorites** require auth (gate at action time).

#### 1.8 Profile & sign-out
- [ ] Add a **Profile** entry (new tab or header button) showing name/email/avatar,
      email-verified status, and **Sign out** (`signOutUser` + `GoogleSignin.signOut`).

**Acceptance criteria for Phase 1:**
- New user can register with email/password and receives a verification email.
- Returning user signs in; session persists across app restarts.
- Google Sign-In works via native picker and lands authenticated.
- Password reset email sends and works.
- Protected actions redirect to sign-in when logged out.
- API calls carry a valid Firebase ID token; expired tokens auto-refresh.

---

### Phase 2 — App foundations & UX baseline
- [ ] Reusable **loading / empty / error** states (extend `components/ui`).
- [ ] Global error boundary + toast/snackbar for API errors.
- [ ] Network-aware banners (offline detection).
- [ ] Settings screen (theme is auto; add notifications, language, legal links).
- [ ] Finalize brand tokens & typography pass across screens.

### Phase 3 — Build out verticals (replace `ComingSoon`)
Use `src/features/hotels` as the template (`types.ts`/`api.ts`/`hooks.ts`/`components/`).
- [ ] **Hotels first (reference):** build the **list screen** (`src/app/hotels/index.tsx`),
      wire the "Hotels & Stays" card to it, connect list + detail to the API.
- [ ] Rentals, Tours, Umrah, Guides, Shop — replicate the pattern per vertical.
- [ ] Shared list UI: cards, filters, sort, pagination/infinite scroll, pull-to-refresh.
- [ ] Register query keys in `src/lib/query-client.ts` and paths in `endpoints.ts`
      (already stubbed).

### Phase 4 — Search, Trip Planner, Booking & Payments
- [ ] Implement real **Search** (`src/app/search.tsx`) across verticals with results.
- [ ] Implement **AI Trip Planner** (`src/app/trip-planner.tsx`) against
      `endpoints.tripPlanner.generate`.
- [ ] **Booking flow**: availability → details → confirm → booking record
      (`endpoints.bookings.*`), gated behind auth.
- [ ] **Payments** integration (Stripe/PayPal/local gateway — decision needed).
- [ ] "My Bookings" screen.

### Phase 5 — Engagement
- [ ] Push notifications (`expo-notifications`) — booking updates, promos.
- [ ] Deep linking / universal links (scheme `gripontrip` already set).
- [ ] Favorites / wishlist (auth-gated).
- [ ] Ratings & reviews.

### Phase 6 — Quality & hardening
- [ ] Testing: unit (Jest) for utils/hooks, component tests (React Native Testing
      Library), critical-path E2E (Maestro).
- [ ] Error tracking: Sentry (`@sentry/react-native`).
- [ ] Analytics: Firebase Analytics or a chosen provider.
- [ ] Accessibility pass (labels, contrast, dynamic type, touch targets).
- [ ] Performance: image caching (`expo-image` already in), list virtualization,
      bundle/startup profiling, React Compiler already enabled.
- [ ] Keep `npm run typecheck` + `npm run lint` green in CI.

### Phase 7 — Release
- [ ] App icons/splash finalized (assets present) for both platforms.
- [ ] Store metadata: descriptions, screenshots, keywords.
- [ ] **Privacy policy + data-safety** forms (required for Google/Firebase auth data).
- [ ] iOS: Apple Developer account, provisioning; enable Sign in with Apple if using
      third-party login (App Store requirement when offering Google sign-in).
- [ ] Production builds: `eas build --profile production --platform android|ios`.
- [ ] Submission: `eas submit`.
- [ ] OTA updates: `expo-updates` for JS-only patches post-release.
- [ ] CI/CD: build/lint/typecheck/test on PR; EAS build on tag.

---

## 4. Cross-cutting checklist
- [ ] All secrets via `EXPO_PUBLIC_*` + EAS env; nothing committed.
- [ ] Consistent loading/error/empty states everywhere.
- [ ] Dark mode verified on every new screen (theme is `automatic`).
- [ ] Every network call goes through a React Query hook in a feature module (per `AGENTS.md`).
- [ ] Imports use the `@/` alias.

---

## 5. Suggested sequencing & rough estimate
| Phase | Focus | Rough effort |
|-------|-------|--------------|
| 0 | Firebase setup | 0.5 day |
| 1 | **Auth (email + Google)** | 3–5 days |
| 2 | UX foundations | 2–3 days |
| 3 | Verticals (hotels → rest) | 1–2 weeks |
| 4 | Search / planner / booking / payments | 1–2 weeks |
| 5 | Engagement | 3–5 days |
| 6 | Quality & hardening | ongoing / 1 week |
| 7 | Release | 3–5 days |

*Estimates assume one developer and an available backend; parallelize where possible.*

---

## 6. Open decisions (need answers to proceed)
1. Will the backend **verify Firebase ID tokens** (Admin SDK), or must we exchange
   for an app JWT? (Affects `api/client.ts` + a possible `/auth/firebase-exchange`.)
2. What is **gated behind login** vs public browsing?
3. **Payment provider**?
4. **iOS timeline** (affects Apple Sign-In requirement alongside Google).
5. Analytics provider (Firebase Analytics vs other)?

---

## 7. Immediate next actions
1. Answer the Firebase-token decision (§2.1) and create the Firebase project (Phase 0).
2. Implement Phase 1.1–1.5 (email/password) end-to-end first.
3. Add Google Sign-In (1.6) once email/password works.
4. Build the Hotels list screen (Phase 3) so the app has a real, browsable vertical.
