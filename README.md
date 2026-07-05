# Grip On Trip — Mobile App

The official mobile app for [gripontrip.com](https://www.gripontrip.com) — a travel
marketplace for hotels & stays, vacation rentals, guided tours, Umrah packages,
verified local guides, and a travel gear marketplace, with an AI Trip Planner.

Built with **Expo (React Native) + TypeScript + Expo Router + NativeWind (Tailwind)**.

---

## Tech Stack

| Concern            | Choice                                     |
| ------------------ | ------------------------------------------ |
| Framework          | Expo SDK 57 / React Native 0.86 / React 19 |
| Language           | TypeScript (strict)                        |
| Navigation         | Expo Router (file-based, typed routes)     |
| Styling            | NativeWind v4 (Tailwind CSS)               |
| Server state       | TanStack React Query                       |
| Client state       | Zustand                                    |
| Networking         | Axios (`src/api/client.ts`)                |
| Forms & validation | React Hook Form + Zod                      |
| Secure storage     | expo-secure-store / AsyncStorage           |
| Icons              | `@expo/vector-icons` (Ionicons)            |
| Linting/formatting | ESLint (expo config) + Prettier            |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env      # then edit values

# 3. Start the dev server
npm start                 # press i (iOS), a (Android), or w (web)
```

> iOS builds require macOS. On Windows, use an Android emulator/device or the web
> target, or the Expo Go app on a physical device.

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

## Project Structure

```
src/
├── app/                    # Expo Router routes — files here are screens/URLs
│   ├── _layout.tsx         # Root layout: providers (React Query, gestures, theme) + auth hydration
│   ├── (tabs)/             # Bottom-tab group, mirrors the website nav
│   │   ├── _layout.tsx     #   Tab bar config
│   │   ├── index.tsx       #   Home
│   │   └── tours / rentals / umrah / shop / guides
│   ├── (auth)/             # Auth flow (sign-in / sign-up), presented as a modal
│   ├── hotels/[id].tsx     # Hotel detail (dynamic route) — fully wired example
│   ├── tours/[id].tsx      # Tour detail (stub)
│   ├── trip-planner.tsx    # AI Trip Planner (stub)
│   ├── search.tsx          # Search (stub)
│   └── +not-found.tsx
│
├── api/                    # Networking layer
│   ├── client.ts           #   Axios instance + auth + error normalization
│   └── endpoints.ts        #   All API paths in one place
│
├── components/
│   ├── ui/                 # Design-system primitives: Button, Card, Input, Badge
│   └── layout/             # Screen, ComingSoon, and other layout helpers
│
├── features/               # Feature modules (one folder per marketplace vertical)
│   ├── hotels/             #   Reference implementation — copy this shape:
│   │   ├── types.ts        #     domain models
│   │   ├── api.ts          #     endpoint calls
│   │   ├── hooks.ts        #     React Query hooks
│   │   ├── components/     #     feature UI (HotelCard)
│   │   └── index.ts        #     public exports
│   └── auth / tours / rentals / umrah / guides / shop / booking / profile / trip-planner
│
├── store/                  # Zustand stores (auth.store.ts)
├── lib/                    # Cross-cutting infra: query-client, storage
├── config/                 # Typed env access (env.ts)
├── constants/              # App config, categories, theme tokens
├── hooks/                  # Shared hooks
├── types/                  # Shared domain types
└── utils/                  # Pure helpers (formatting, etc.)
```

Path alias `@/*` maps to `src/*` (and `@/assets/*` to `assets/*`).

## Conventions

- **Adding a screen:** create a file under `src/app/`. The path *is* the URL.
  Route types are generated automatically (`typedRoutes` is on).
- **Adding a vertical:** copy `src/features/hotels/` and swap the endpoints/types.
  Keep API calls in `api.ts`, data hooks in `hooks.ts`, and register query keys in
  `src/lib/query-client.ts`.
- **Styling:** use Tailwind classes via `className`. Brand colors are `brand-*`
  (primary blue) and `accent-*` (warm) — see `tailwind.config.js`.
- **Data fetching:** always go through React Query hooks; never call Axios from a
  component directly.
- **Secrets:** never commit `.env`. Only `EXPO_PUBLIC_*` vars reach the client.

## Building & Releasing (EAS)

Build profiles are defined in `eas.json` (`development`, `preview`, `production`).

```bash
npm i -g eas-cli
eas login
eas build --profile development --platform android
eas build --profile production --platform all
eas submit --profile production
```

## Backend

The app uses **two backends**, sharing the same infrastructure as the website:

- **REST API (read-only)** — catalog/content data (hotels, tours, rentals, umrah
  packages, guides, shop products, reviews) is fetched from `EXPO_PUBLIC_API_URL`
  (default `https://www.gripontrip.com/api`). Paths are centralized in
  `src/api/endpoints.ts` and consumed through the Axios client in
  `src/api/client.ts`. This layer is read-only.
- **Supabase (auth + writes)** — authentication and all user writes (bookings,
  reviews) go to Supabase, the same project the web app uses. Configured via
  `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`. The anon key is
  public/client-safe and guarded by row-level security; writes are authorized by
  the signed-in user's session.

> Note: there is no dedicated Umrah endpoint — umrah packages are surfaced as
> `[UMRAH]`-prefixed entries in the tours agencies feed.

Types under `src/features/*/types.ts` are the current working contract — align
them with the real API/table responses as they firm up.
