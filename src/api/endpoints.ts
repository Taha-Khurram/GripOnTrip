/**
 * Single source of truth for API paths. Keep route strings out of feature code
 * so they are easy to audit and change.
 */
export const endpoints = {
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    signOut: '/auth/sign-out',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  hotels: {
    list: '/hotels',
    detail: (id: string) => `/hotels/${id}`,
    rooms: (id: string) => `/hotels/${id}/rooms`,
  },
  reviews: {
    // Reviews are read via REST (`?hotel_id=` / `?product_id=`) but written
    // directly to the Supabase `reviews` table (see features/reviews).
    list: '/reviews',
  },
  rentals: {
    list: '/rentals',
    detail: (id: string) => `/rentals/${id}`,
  },
  tours: {
    // On gripontrip.com, "tours" are travel agencies (operators) and each carries
    // its own `agency_packages`. Same endpoint the web tours page uses.
    list: '/agencies',
    detail: (id: string) => `/agencies/${id}`,
  },
  umrah: {
    // Umrah has no dedicated endpoint. The web `/umrah` page reads the SAME
    // approved-agencies feed as tours and keeps only the packages whose
    // `package_name` is prefixed with "[UMRAH]" (verified against the live
    // `/api/agencies?status=Approved&include_packages=true`). Booking enquiries
    // POST to the agency that owns the package.
    agencies: '/agencies',
    booking: (agencyId: string) => `/agencies/${agencyId}/bookings`,
  },
  guides: {
    list: '/guides',
    detail: (id: string) => `/guides/${id}`,
  },
  shop: {
    // The web "Marketplace" (travel gear + local products) reads from `GET
    // /products`. There is no GET-by-id endpoint (it 405s); the web resolves a
    // single product from the list, so {@link fetchProduct} does the same.
    products: '/products',
  },
  bookings: {
    list: '/bookings',
    create: '/bookings',
    detail: (id: string) => `/bookings/${id}`,
  },
  tripPlanner: {
    // The web "AI Tour Planner" (/plan-tour) posts to `POST /api/plan-trip` with
    // `{ destination, duration: "N Days", travelers, budget, interests }` and reads
    // `{ itinerary: [{ day, title, timeline: [{ time, activity }] }] }`. When the AI
    // backend errors the website degrades to a locally-built outline; the app mirrors
    // that in `features/trip-planner/api.ts`. (There is no `/trip-planner/generate`.)
    generate: '/plan-trip',
  },
  ai: {
    // The "GOT AI Assistant" chat. Same endpoint the website's floating chat
    // widget calls: `POST /api/ai/chat` with `{ messages: [{ role, content }] }`
    // → `{ role, content, searchAction }`.
    chat: '/ai/chat',
  },
} as const;
