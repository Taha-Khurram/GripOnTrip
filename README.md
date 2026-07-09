<div align="center">

<img src="assets/images/icon.png" width="96" height="96" alt="Grip On Trip logo" />

# Grip On Trip — Mobile App

**Direct prices. Zero commission.**

The official mobile app for [gripontrip.com](https://www.gripontrip.com) — a travel marketplace for
hotels & stays, vacation rentals, guided tours, Umrah packages, verified local guides, and a travel-gear
marketplace, with an AI Trip Planner and in-app assistant.

<p>
  <img alt="Expo SDK" src="https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.86-20232a?logo=react&logoColor=61dafb" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="NativeWind" src="https://img.shields.io/badge/NativeWind-v4-38bdf8?logo=tailwindcss&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-auth-3ecf8e?logo=supabase&logoColor=white" />
  <img alt="React Query" src="https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=reactquery&logoColor=white" />
  <img alt="Platforms" src="https://img.shields.io/badge/platforms-iOS_%7C_Android-lightgrey" />
</p>

</div>

---

## ✨ Highlights

- 🏨 **Six marketplace verticals** — Hotels & Stays, Vacation Rentals, Guided Tours, Umrah Packages,
  Verified Guides, and a travel-gear Marketplace, mirroring the website navigation.
- 👤 **Full traveler account** — profile settings, wishlist, hotel bookings, rental bookings, and
  host tools (owned properties + rental-listing management).
- 🔐 **Real authentication** — email/password **and** Google OAuth via Supabase, with row-level-security
  scoped data (the same backend the website uses).
- ❤️ **Wishlist** — save any stay, rental, or tour with a tap; persisted per user on-device.
- 🤖 **AI Trip Planner & assistant** — the same `GOT AI` experience as the web, in your pocket.
- 🎨 **"Ocean & Sun" design system** — a cohesive light theme (NativeWind + brand/accent tokens),
  Outfit/Figtree display type, soft gradient heroes (`OceanHero`/`SunCTA`) shared across every listing
  screen, and spring-based motion throughout. See [`docs/Design.md`](docs/Design.md).
- 🧱 **Scalable architecture** — typed, file-based routing and self-contained feature modules that are
  trivial to extend.

## 📱 App map

| Area | Screens |
| --- | --- |
| **Discover** (bottom tabs) | Home · Tours · Rentals · Umrah · Shop · Guides |
| **Detail & booking** | Hotel detail + booking · Rental detail · Tour · Umrah · Guide · Product |
| **Account** | Profile hub · Profile settings · Wishlist · My bookings · My rental bookings |
| **Hosting** | My properties · Manage rental properties |
| **Auth** | Sign in · Sign up · Forgot password (Google OAuth + email) |
| **Tools** | Search · AI Trip Planner · AI assistant |

<!-- Add screenshots here once captured, e.g.:
<p align="center">
  <img src="docs/screens/home.png" width="220" />
  <img src="docs/screens/profile.png" width="220" />
  <img src="docs/screens/hotel.png" width="220" />
</p>
-->

## 🧱 Tech stack

| Concern            | Choice                                        |
| ------------------ | --------------------------------------------- |
| Framework          | Expo SDK 57 · React Native 0.86 · React 19    |
| Language           | TypeScript (strict)                           |
| Navigation         | Expo Router (file-based, typed routes)        |
| Styling            | NativeWind v4 (Tailwind CSS) + "Ocean & Sun" tokens |
| Typography         | Outfit (display) + Figtree (body) via `@expo-google-fonts` |
| Server state       | TanStack React Query                          |
| Client state       | Zustand                                       |
| Auth & user data   | Supabase (`@supabase/supabase-js`)            |
| Networking         | Axios (`src/api/client.ts`)                   |
| Forms & validation | React Hook Form + Zod                         |
| Animation          | Reanimated (spring press + entrance)          |
| Secure storage     | expo-secure-store / AsyncStorage              |
| Icons              | `@expo/vector-icons` (Ionicons)               |
| Tooling            | ESLint (expo config) + Prettier               |

## 🏗️ Architecture

The app talks to **two backends that mirror the website**:

- **REST API (read-only)** — catalog/content (hotels, rentals, tours, umrah, guides, shop, reviews)
  from `EXPO_PUBLIC_API_URL`. Paths live in [`src/api/endpoints.ts`](src/api/endpoints.ts) and flow
  through the Axios client in [`src/api/client.ts`](src/api/client.ts).
- **Supabase (auth + user data)** — sign-in and per-user data (profile, bookings, owned listings)
  via row-level security, using the same project as the web. Client in
  [`src/lib/supabase.ts`](src/lib/supabase.ts).

Data always flows **component → React Query hook → `api.ts` → backend** — components never call Axios or
Supabase directly. Each vertical is a self-contained **feature module**:

```
src/features/<vertical>/
├── types.ts        # domain models
├── api.ts          # endpoint / Supabase calls + mappers
├── hooks.ts        # React Query hooks
├── components/     # feature UI
└── index.ts        # public exports
```

`hotels/` is the reference implementation — copy its shape to build a new vertical.

## 🚀 Getting started

**Prerequisites:** Node 18+, a package manager, and the [Expo](https://expo.dev) toolchain. iOS builds
require macOS; on Windows use an Android device/emulator or a cloud build (see below).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env      # values are prefilled; the Supabase anon key is public/client-safe

# 3. Start the dev server
npm start                 # then press a (Android), i (iOS), or w (web)
```

> Because the app uses native modules and custom-scheme OAuth, **Google sign-in requires a
> [development build](#-building--releasing-eas)** rather than Expo Go.

### Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm start`         | Start the Expo dev server       |
| `npm run android`   | Run on Android emulator/device  |
| `npm run ios`       | Run on iOS simulator (macOS)    |
| `npm run web`       | Run in the browser              |
| `npm run lint`      | Lint with ESLint                |
| `npm run format`    | Format with Prettier            |
| `npm run typecheck` | Type-check with `tsc --noEmit`  |

## 🔑 Environment variables

Only `EXPO_PUBLIC_*` vars are exposed to the client. Define them in `.env` (copy from `.env.example`).
Nothing is hardcoded in source — [`src/config/env.ts`](src/config/env.ts) reads every value from the
environment and **fails loudly** if a required one is missing.

| Variable                        | Required | Description                                              |
| ------------------------------- | :------: | -------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`           |    ✅    | Base URL of the read-only REST API                       |
| `EXPO_PUBLIC_WEB_URL`           |    ✅    | Public website (deep links / web fallbacks)              |
| `EXPO_PUBLIC_SUPABASE_URL`      |    ✅    | Supabase project URL (auth + user data)                  |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` |    ✅    | Supabase anon key — **public/client-safe**, RLS-guarded  |
| `EXPO_PUBLIC_ENV`               |    —     | `development` \| `preview` \| `production`               |

> The Supabase anon key is designed to ship in client bundles and is protected by row-level security,
> not by secrecy. Never place server secrets (service-role keys, DB creds) in `EXPO_PUBLIC_*` vars.

## 🔐 Authentication

Email/password works out of the box. **Google OAuth** needs one-time dashboard setup:

1. **Google Cloud** → create OAuth credentials → add redirect
   `https://<your-project>.supabase.co/auth/v1/callback`.
2. **Supabase → Authentication → Providers → Google** → enable + paste Client ID/Secret.
3. **Supabase → Authentication → URL Configuration → Redirect URLs** → add `app://auth-callback`.
4. Run it in a **development build** (the `app://` deep link doesn't work in Expo Go).

## 📂 Project structure

```
src/
├── app/                    # Expo Router routes — files here ARE screens/URLs
│   ├── _layout.tsx         #   Root layout: providers + auth hydration
│   ├── (tabs)/             #   Bottom-tab group (mirrors website nav)
│   ├── (auth)/             #   Sign in / up / reset (branded hero)
│   ├── hotels/ · rentals/ · tours/ · umrah/ · guides/ · shop/   # detail + booking
│   ├── profile.tsx         #   Account hub
│   ├── profile-settings · wishlist · my-bookings · my-rental-bookings
│   └── my-properties · manage-rental-properties
├── api/                    # Axios client + centralized endpoints
├── components/
│   ├── ui/                 #   Design-system primitives (Button, Card, Input, Badge, Gradient, motion…)
│   ├── layout/             #   Screen, ListHero, EmptyState, SignInGate, ComingSoon
│   └── WishlistButton.tsx
├── features/               # One folder per domain (hotels, rentals, tours, umrah,
│   │                       #   guides, shop, auth, bookings, reviews, profile, assistant)
│   └── <vertical>/         #   types · api · hooks · components · index
├── store/                  # Zustand stores (auth, theme, wishlist)
├── lib/                    # supabase client, query-client, storage
├── config/                 # Typed env access
├── constants/ · hooks/ · types/ · utils/
```

Path alias `@/*` → `src/*` (and `@/assets/*` → `assets/*`).

## 🏭 Building & releasing (EAS)

Profiles are defined in [`eas.json`](eas.json). Env vars for **bundled** builds (preview/production)
live there too, since those builds compile the JS in the cloud without your local `.env`.

```bash
npm i -g eas-cli
eas login

# Development client (loads JS from your Metro server; needed for Google OAuth)
eas build --profile development --platform android

# Installable release APK (sideload to test)
eas build --profile preview --platform android

# Store-ready production build (.aab for Play Store / .ipa for App Store)
eas build --profile production --platform all
eas submit  --profile production --platform android
```

After a dev build installs, run `npx expo start --dev-client -c` and open it on your device.

## ✅ Quality gates

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (expo config)
```

Both must pass before a change is considered done.

## 🗺️ Roadmap

**Recently shipped:** the unified **"Ocean & Sun" design system** with a shared listing hero across
every vertical, and the **AI Trip Planner** (preferences → generated itinerary).

- [ ] Booking & review **writes** to Supabase (reads are wired; submission is stubbed)
- [ ] Payments integration (provider TBD)
- [ ] Push notifications for booking status changes
- [ ] Bring Tours / Umrah / Guides / Shop to full hotel-level depth (filters, detail parity)
- [ ] Server-backed wishlist sync across devices
- [ ] Screenshot gallery + store listing assets

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full phased plan and [`docs/DEV_BUILD_GUIDE.md`](docs/DEV_BUILD_GUIDE.md)
for building on a device.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions (feature-module pattern, routing, styling) and
the pre-flight checklist. In short: keep API calls in `api.ts`, data in React Query hooks, and styling
in Tailwind `className`s — and make sure `typecheck` + `lint` pass.

## 📄 License

© Grip On Trip. All rights reserved. This is proprietary software for the gripontrip.com platform and is
not licensed for redistribution.

<div align="center">
<sub>Built with Expo · React Native · Supabase</sub>
</div>
