Here's a reusable prompt you can paste into Lovable (or any AI builder) to recreate this design:

---

Prompt:

Build a modern mobile-first travel & tourism web app called "Grip On Trip" — a direct-booking marketplace for hotels, vacation rentals, guided tours, Umrah packages, a travel shop, and local guides. Zero commission is the brand promise.

Tech stack: TanStack Start + React + Tailwind CSS v4, file-based routing under `src/routes/`, lucide-react icons, Outfit + Figtree from @fontsource.

Design system (define in `src/styles.css` with `@theme` + oklch tokens):
- Palette "Ocean & Sun" inspired by a beach/plane logo:
  - `--primary` ocean teal `#1a7a8c`
  - `--primary-deep` deep teal `#0c3b4a`
  - `--sun` warm orange `#f39024`
  - `--background` sandy cream `#f5efe4`
  - `--foreground` deep navy ink
- Typography: Outfit for display/headings (extrabold, tight tracking), Figtree for body.
- Radius: soft, `1.25rem` base with 2xl/3xl for cards.
- Custom utilities:
  - `bg-ocean-hero` — layered radial + linear gradient from ocean teal to deep teal with soft light bloom top-right and dark pool bottom-left.
  - `bg-sun-cta` — warm orange gradient for the AI Trip Planner button.
- Shadows: soft ambient (`shadow-soft`) and a colored glow (`shadow-glow`) for hero CTAs.

App shell:
- Max-width 448px, centered, mobile-app feel.
- Sticky top header: page title (Outfit bold), optional back arrow (rounded pill), profile avatar link on the right.
- Fixed bottom nav with 6 tabs: Home (map), Tours (bus), Rentals (home), Umrah (moon), Shop (bag), Guides (compass). Active tab in primary teal, inactive muted.

Screens:

1. Home (`/`) — bento layout:
   - Hero section with `bg-ocean-hero`, brand row with logo, headline "Direct prices. Zero commission.", subline "Where do you want to go?", and a pill search input on white.
   - Overlapping AI Trip Planner card (`bg-sun-cta`, sparkles icon, arrow) sitting `-mt-10` over the hero.
   - "Explore" bento grid (6-col): one large 4x2 featured tile "Villas & Cabins" on `--primary-deep` with radial highlight, two 2-col category tiles (Hotels, Vacation Rentals), then 3-col wide tiles for Tours, Umrah, Local Guides, Travel Shop.
   - "Trending now" horizontal snap-scroll carousel of destination cards (Hunza, Skardu, Naran) with rating star in sun-orange.

2. Shop (`/shop`) — search bar, All / Used Items pill tabs, product cards with `-29%` discount badge in sun-orange, brand caption, name, current price in teal, old price struck through.

3. Guides (`/guides`) — search, filter chips (Recommended active in sun-tinted pill; Price low/high, Top rated), verified guide count with shield icon, guide cards with square initial avatar in teal tint, name, star rating, experience + language chips, "from PKR /day" and "View profile →".

4. Tours, Rentals, Umrah — matching card language: gradient image band, title, meta chips (guided, days, beds/guests, tier), price footer with primary CTA.

5. Profile (`/profile`) — teal gradient banner card with monogram avatar, name, email, edit button. Three grouped sections (ACCOUNT, HOSTING, EXPLORE) as rounded white lists with tinted icon squares (teal or sun) and chevron rows. Destructive "Sign out" link at bottom.

6. Auth (`/auth`) — full teal `bg-ocean-hero` top with soft bokeh circles (white, black, sun-orange blur), centered logo tile on white with glow, "Welcome" heading, subline. White form card floats `-mt-16` over the hero with Email, Password, Forgot password, primary Sign In button. "New to Grip On Trip? Create an account" below.

Rules:
- No hardcoded color classes (`text-white`, `bg-black`, hex in className) — only semantic tokens (`bg-primary`, `text-sun`, etc.).
- Every page sets its own `head()` title + description.
- Use lucide-react for all icons.
- Content should be plausible Pakistani travel data (PKR pricing, Hunza/Skardu/Naran, Urdu/Pashto/Punjabi guides).

---

Want me to tailor this prompt for a specific platform (e.g., stripped-down for v0/Bolt, or extended with a Supabase schema)?