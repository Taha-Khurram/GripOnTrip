# Grip On Trip — Mobile App (agent guide)

Mobile app for the [gripontrip.com](https://www.gripontrip.com) travel marketplace.
Expo (React Native) + TypeScript + Expo Router + NativeWind. See `README.md` for the
full overview; this file is the quick contract for making changes correctly.

## Version note

Expo SDK **57** / React Native **0.86** / React **19**. APIs change between SDKs —
check the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before using an
unfamiliar Expo module.

## Golden rules

- **Routing is file-based.** Files in `src/app/` are screens; the path is the URL.
  Groups: `(tabs)` = bottom tabs (mirrors site nav), `(auth)` = auth modal.
  Dynamic routes use `[id].tsx`. `typedRoutes` is on, so route strings are typed.
- **Styling is NativeWind/Tailwind** via `className`. Use brand tokens (`brand-*`,
  `accent-*`) from `tailwind.config.js`. Avoid `StyleSheet` for new UI.
- **Server state → React Query; client state → Zustand.** Never call Axios (or
  Supabase) directly from a component — add/reuse a hook in `src/features/<vertical>/hooks.ts`.
- **Two backends:** read-only REST (`src/api/`) for catalog data; **Supabase**
  (`src/lib/supabase.ts`) for auth + per-user data. Auth state lives in
  `src/store/auth.store.ts` (mirrors the Supabase session).
- **Feature modules** live in `src/features/<vertical>/` with the shape
  `types.ts` / `api.ts` / `hooks.ts` / `components/` / `index.ts`. `hotels/` is the
  reference — copy it when building a new vertical (tours, rentals, umrah, guides, shop).
  The account area is `src/features/profile/` (profile, rental bookings, owned listings).
- **API paths** go in `src/api/endpoints.ts`; **query keys** in `src/lib/query-client.ts`.
- **Imports** use the `@/` alias (→ `src/`), not deep relative paths.
- **Env**: only `EXPO_PUBLIC_*` vars reach the client; read them through
  `src/config/env.ts`, which is env-driven and fails loudly if a required var is
  missing (values live in `.env` / `eas.json`, mirrored in `.env.example`). Never
  hardcode config/secrets or commit `.env`.

## Before you finish

Run and make sure these pass:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

Hotels & Stays and the account area (`features/profile`, auth, wishlist) are fully
wired. The other verticals have detail screens but are lighter — build them out to
hotel-level depth against the real API.
