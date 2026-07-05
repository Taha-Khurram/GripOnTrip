# guides feature

Verified local guides, implemented against the same API the web guides page uses.

- `types.ts`   — `Guide` domain model + `GuideSearchParams` / `GuideSort`
- `api.ts`     — `fetchGuides` / `fetchGuide`, normalizing the raw `guides` record
- `hooks.ts`   — `useGuides` / `useGuide` (React Query)
- `components/GuideCard.tsx` — listing card
- `index.ts`   — public exports

## API

Same endpoint the website calls (envelope `{ success, data }`, no pagination):

```
GET /api/guides?status=active&include_profiles=true[&city=<city>]
```

`include_profiles=true` joins the guide's account `profiles` row, which supplies the
avatar (`avatar_url`) used when the guide has no `image_url`. There is **no**
`/api/guides/{id}` detail endpoint (it 404s), so — exactly like the web — `fetchGuide`
reads the list and selects by id.

Screens: `app/(tabs)/guides.tsx` (list: search + city filter + sort) and
`app/guides/[id].tsx` (profile + day-based hire enquiry). Booking is a local stub
(`features/bookings` — the public API is read-only), matching the tours/rentals flow.
