# profile feature

Follow the same module convention as `features/hotels`:

- `types.ts`   — domain models for this vertical
- `api.ts`     — endpoint calls (use `apiGet`/`apiPost` from `@/api/client`)
- `hooks.ts`   — React Query hooks (use keys from `@/lib/query-client`)
- `components/` — feature-specific UI
- `index.ts`   — public exports of the module
