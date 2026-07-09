# Grip On Trip — Production Readiness Roadmap

A phased plan to take the app from its current, largely-built state to a
shippable, store-ready product. Authentication and the core browsing experience
are done; the remaining work is booking **writes**, payments, engagement, and
release hardening.

- **App:** Expo SDK 57 / React Native 0.86 / Expo Router / NativeWind
- **State:** React Query (server) + Zustand (client)
- **Backends:** read-only REST API (catalog) + **Supabase** (auth + per-user data)
- **Distribution:** EAS development build now; EAS production build for release
- **Last updated:** 2026-07-10

> **Note:** an earlier draft of this roadmap planned auth on **Firebase**. The app
> ships on **Supabase** instead (same project as the website, row-level security).
> All auth references below reflect the Supabase implementation.

---

## 1. Current state (baseline)

| Area | Status |
|------|--------|
| Navigation shell (tabs + stack) | ✅ Built (`src/app/_layout.tsx`, `(tabs)/_layout.tsx`) |
| Home screen | ✅ Hero, search entry, AI planner callout, category grid |
| Design system — "Ocean & Sun" | ✅ Light theme, brand/accent tokens, gradient heroes, Outfit/Figtree type, shared `ListHero` |
| Auth screens (sign-in / sign-up / forgot-password) | ✅ Forms + zod validation, wired to Supabase |
| Google OAuth | ✅ Supabase provider + `app://auth-callback` deep link (needs dev build) |
| Auth store (`auth.store.ts`) | ✅ Mirrors the Supabase session; hydrates on launch |
| API client (`api/client.ts`) | ✅ Axios + Bearer-token interceptor |
| Verticals (hotels/rentals/tours/umrah/guides/shop) | ✅ List + detail screens against the real API |
| Hotels | ✅ List + detail + booking screens (reference vertical) |
| Search | ✅ Cross-vertical search screen |
| AI Trip Planner | ✅ Preferences form → generated itinerary (`features/trip-planner`) |
| Wishlist | ✅ Per-user, persisted on-device |
| Account & hosting | ✅ Profile, settings, my bookings, my rental bookings, my properties, manage rentals |
| Booking / rental / guide **reads** | ✅ Supabase (`fetchMyBookings`, etc.) |
| Booking / rental / guide **writes** | 🔴 Local stubs (`create*Booking` return `{ id: 'local' }`) |
| Payments | 🔴 Not started |
| Push notifications | 🔴 Not started |
| Testing / error tracking / analytics | 🔴 Not started |
| Store release setup | 🟡 `eas.json` profiles exist; no store assets/metadata/submission |

**Legend:** ✅ done · 🟡 partial · 🔴 not started

---

## 2. Architecture (as built)

The app talks to **two backends that mirror the website**:

- **REST API (read-only)** — catalog/content for every vertical, from
  `EXPO_PUBLIC_API_URL`. Paths in `src/api/endpoints.ts`, via the Axios client in
  `src/api/client.ts`.
- **Supabase** — auth (email/password + Google OAuth) and per-user data (profile,
  bookings, owned listings) under row-level security, same project as the web.
  Client in `src/lib/supabase.ts`; session mirrored into `src/store/auth.store.ts`.

Data always flows **component → React Query hook → `api.ts` → backend**. Each
vertical is a self-contained feature module (`types` · `api` · `hooks` ·
`components` · `index`); `features/hotels` is the reference shape.

**Auth model:** Supabase issues the session; the Axios interceptor attaches the
access token as `Authorization: Bearer <token>` for REST calls that need it.
Browsing is public; **booking, profile, and wishlist actions are gated** behind
sign-in (see `components/layout/SignInGate.tsx`).

---

## 3. Phased roadmap

### Phase 1 — Booking & review writes ⭐ priority
Turn the stubbed write flows into real Supabase inserts.

- [ ] Implement `createHotelBooking` / `createRentalBooking` / `createAgencyBooking` /
      `createGuideBooking` in `src/features/bookings/api.ts` (insert into the
      matching Supabase tables under the signed-in user).
- [ ] Return the created record id and invalidate the relevant React Query keys so
      "My bookings" / "My rental bookings" refresh immediately.
- [ ] Availability/validation before submit (dates, guests, min stay).
- [ ] **Review writes:** submit ratings/comments from `features/reviews` to Supabase;
      keep reads as-is.
- [ ] Optimistic UI + error/rollback via a form-level banner.

**Acceptance:** a signed-in user completes a hotel booking end-to-end and sees it
appear in "My bookings"; the same works for rentals, agencies, and guides.

### Phase 2 — Payments
- [ ] Choose a provider (Stripe / local gateway — **decision needed**).
- [ ] Payment step in the booking flow; persist `payment_status` on the booking.
- [ ] Handle success / failure / pending states and receipts.

### Phase 3 — Vertical depth parity
All verticals have list + detail; bring the lighter ones up to hotel-level depth.

- [ ] Filters & sort parity across Tours / Umrah / Guides / Shop / Rentals
      (rentals now has search; extend to structured filters).
- [ ] Pagination / infinite scroll where the API supports it.
- [ ] Detail-screen parity (galleries, amenities/inclusions, reviews section).

### Phase 4 — Engagement
- [ ] Push notifications (`expo-notifications`) — booking status changes, promos.
- [ ] Deep linking / universal links polish (scheme `gripontrip` already set).
- [ ] Server-backed **wishlist sync** across devices (currently on-device only).

### Phase 5 — Quality & hardening
- [ ] Testing: unit (Jest) for utils/hooks, component tests (RN Testing Library),
      critical-path E2E (Maestro).
- [ ] Error tracking: Sentry (`@sentry/react-native`).
- [ ] Analytics: chosen provider (**decision needed**).
- [ ] Accessibility pass (labels, contrast, dynamic type, touch targets).
- [ ] Performance: image caching (`expo-image` in use), list virtualization,
      startup/bundle profiling (React Compiler already enabled).
- [ ] Keep `npm run typecheck` + `npm run lint` green in CI.

### Phase 6 — Release
- [ ] App icons/splash finalized for both platforms (assets present).
- [ ] Store metadata: descriptions, **screenshots**, keywords.
- [ ] Privacy policy + data-safety forms (required for Google auth data).
- [ ] iOS: Apple Developer account, provisioning; add **Sign in with Apple**
      (App Store requirement when offering Google sign-in).
- [ ] Production builds: `eas build --profile production --platform android|ios`.
- [ ] Submission: `eas submit`.
- [ ] OTA updates: `expo-updates` for JS-only patches post-release.
- [ ] CI/CD: build/lint/typecheck/test on PR; EAS build on tag.

---

## 4. Cross-cutting checklist
- [ ] All secrets via `EXPO_PUBLIC_*` + EAS env; nothing committed.
- [ ] Consistent loading / error / empty states everywhere.
- [ ] Every network call goes through a React Query hook in a feature module (per `AGENTS.md`).
- [ ] Imports use the `@/` alias.
- [ ] UI stays on the light "Ocean & Sun" theme (no stray `dark:` utilities — the
      app forces `colorScheme.set('light')`).

---

## 5. Suggested sequencing & rough estimate
| Phase | Focus | Rough effort |
|-------|-------|--------------|
| 1 | **Booking & review writes** | 3–5 days |
| 2 | Payments | 3–5 days |
| 3 | Vertical depth parity | 1–2 weeks |
| 4 | Engagement | 3–5 days |
| 5 | Quality & hardening | ongoing / 1 week |
| 6 | Release | 3–5 days |

*Estimates assume one developer and an available backend; parallelize where possible.*

---

## 6. Open decisions (need answers to proceed)
1. **Payment provider** (Stripe vs local gateway)?
2. **iOS timeline** (affects Apple Sign-In requirement alongside Google)?
3. **Analytics** provider?
4. Which booking tables/columns are the writes expected to populate (confirm the
   Supabase schema matches `features/bookings/types.ts`)?

---

## 7. Immediate next actions
1. Implement the four `create*Booking` writes against Supabase (Phase 1) and wire
   query invalidation so "My bookings" updates live.
2. Add review submission (Phase 1) end-to-end.
3. Pick a payment provider and stub the payment step (Phase 2).
