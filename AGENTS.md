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
- **Server state → React Query; client state → Zustand.** Never call Axios directly
  from a component — add/reuse a hook in `src/features/<vertical>/hooks.ts`.
- **Feature modules** live in `src/features/<vertical>/` with the shape
  `types.ts` / `api.ts` / `hooks.ts` / `components/` / `index.ts`. `hotels/` is the
  reference — copy it when building a new vertical (tours, rentals, umrah, guides, shop).
- **API paths** go in `src/api/endpoints.ts`; **query keys** in `src/lib/query-client.ts`.
- **Imports** use the `@/` alias (→ `src/`), not deep relative paths.
- **Env**: only `EXPO_PUBLIC_*` vars reach the client; read them through
  `src/config/env.ts`. Never hardcode secrets or commit `.env`.

## Before you finish

Run and make sure these pass:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

Verticals other than `hotels` are intentional stubs (`ComingSoon` placeholder +
a `README.md` describing the module pattern) — build them out against the real API.
