# Contributing

Thanks for working on the Grip On Trip mobile app. This guide is the short contract for making changes
that fit the codebase. For the full overview see [README.md](README.md); for the agent-facing quick
rules see [AGENTS.md](AGENTS.md).

## Golden rules

- **Routing is file-based.** Files in `src/app/` are screens; the path is the URL. `(tabs)` is the
  bottom-tab group, `(auth)` is the auth flow. Dynamic routes use `[id].tsx`. `typedRoutes` is on, so
  route strings are type-checked.
- **Styling is NativeWind/Tailwind** via `className`. Use brand tokens (`brand-*`, `accent-*`) from
  [`tailwind.config.js`](tailwind.config.js). Style both light and dark. Avoid `StyleSheet` for new UI.
- **Data flows one way:** component → React Query hook → `api.ts` → backend. Never call Axios or
  Supabase directly from a component.
- **Server state → React Query; client state → Zustand.** Register query keys in
  [`src/lib/query-client.ts`](src/lib/query-client.ts).
- **Feature modules** live in `src/features/<vertical>/` as `types.ts` / `api.ts` / `hooks.ts` /
  `components/` / `index.ts`. `hotels/` is the reference — copy it for a new vertical.
- **Endpoints** go in [`src/api/endpoints.ts`](src/api/endpoints.ts); nothing else should hardcode paths.
- **Imports** use the `@/` alias (→ `src/`), not deep relative paths.
- **Env:** only `EXPO_PUBLIC_*` vars reach the client; read them through
  [`src/config/env.ts`](src/config/env.ts). Never hardcode config or commit `.env`.

## Adding a screen

Create a file under `src/app/`. The path *is* the URL, and route types are generated automatically.
Register the screen's options in the nearest `_layout.tsx` if it needs a custom header/title.

## Adding a vertical

Copy `src/features/hotels/`, swap the endpoints/types, and register its query keys. Keep API calls in
`api.ts`, data hooks in `hooks.ts`, and feature UI under `components/`.

## Commit & PR conventions

- Use clear, present-tense commit messages (Conventional Commits welcome: `feat:`, `fix:`, `refactor:`,
  `docs:`, `chore:`).
- Keep PRs focused; describe the change and how you verified it. Fill in the PR template.
- Never commit secrets or `.env`.

## Before you finish

Run and make sure these pass:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```
