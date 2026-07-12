/** @type {import('tailwindcss').Config} */
// NativeWind v4 uses Tailwind CSS v3 under the hood.
//
// Design system: "Navy & Gold" — the Grip On Trip brand.
//   primary deep navy       #0a1a2f   (brand-800 — hero / dark sections)
//   primary mid navy        #1e3a5f   (brand-500 — buttons / primary UI)
//   accent warm gold        #f5a623   (accent-500 — CTAs, highlights, active tab)
//   secondary ocean teal    #1a7a8c   (teal-500 — small info icons / badges)
//   background cool off-white #eef2f7 (bg-background — light functional canvas)
//   foreground deep navy    #0a1a2f   (text-ink / text-foreground)
//
// The app consumes the `brand-*` (navy ramp) and `accent-*` (gold ramp) tokens,
// the `teal-*` secondary ramp, plus the semantic aliases (`background`, `ink`,
// `sun`, `primary`, `secondary`…) for one-off, intention-revealing usage.
// Premium dark hero visuals contrasted with clean white cards; gold used
// sparingly to draw the eye to key actions and value props. Light-only.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary cool ramp — mid navy (500) → deep navy-black (800).
        brand: {
          50: '#e8edf3',
          100: '#ccd8e6',
          200: '#a3b8d0',
          300: '#6d8cb0',
          400: '#3f5f8a',
          500: '#1e3a5f', // mid navy — primary UI
          600: '#173050',
          700: '#10243d', // hero panels
          800: '#0a1a2f', // deep navy-black — hero base
          900: '#06101f',
        },
        // Warm ramp — sun gold (500).
        accent: {
          50: '#fef4e2',
          100: '#fde4b8',
          200: '#fbd08a',
          300: '#f9bd5c',
          400: '#f7ae3d',
          500: '#f5a623', // gold — primary accent / CTA
          600: '#e08d0e',
          700: '#b8710c',
          800: '#90580c',
          900: '#6b410a',
        },
        // Secondary ramp — Medium Spring Green, for small info icons and badges.
        // Bright at 500 for pops on dark panels; deeper shades stay legible on light.
        teal: {
          50: '#e9fff7',
          100: '#c6ffe9',
          200: '#8dffd4',
          300: '#4dfcbb',
          400: '#14f2a4',
          500: '#00fa9a', // Medium Spring Green — secondary accent
          600: '#00cc7e',
          700: '#00a165',
          800: '#037a4e',
          900: '#06583b',
        },

        // Semantic aliases (intention-revealing; map onto the ramps above).
        primary: '#1e3a5f', // mid navy
        'primary-deep': '#0a1a2f', // deep navy-black
        secondary: '#00fa9a', // Medium Spring Green
        sun: '#f5a623', // gold accent
        background: '#eef2f7', // cool off-white — app canvas
        surface: '#ffffff', // cards / sheets
        'surface-sunk': '#e7edf4', // recessed wells on the canvas
        foreground: '#0a1a2f', // deep navy ink — primary text
        ink: '#0a1a2f',
        muted: '#54606f', // secondary text on light
        'muted-foreground': '#7c8a99',
        hairline: '#dbe3ec', // border on light
        'hairline-strong': '#c5d1de',

        success: '#1f9d55',
        warning: '#f0a020',
        danger: '#dc2626',
      },
      fontFamily: {
        // Body — Figtree. Default text family.
        sans: ['Figtree_400Regular'],
        body: ['Figtree_400Regular'],
        'body-medium': ['Figtree_500Medium'],
        'body-semibold': ['Figtree_600SemiBold'],
        // Display — Outfit. Headings / brand voice.
        display: ['Outfit_700Bold'],
        'display-semibold': ['Outfit_600SemiBold'],
        'display-x': ['Outfit_800ExtraBold'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // Soft ambient depth for cards and floating panels.
        soft: '0px 10px 30px rgba(10, 26, 47, 0.14)',
        card: '0px 4px 16px rgba(10, 26, 47, 0.08)',
        // Warm colored glow for the gold CTA.
        glow: '0px 12px 32px rgba(245, 166, 35, 0.4)',
        'glow-ocean': '0px 12px 32px rgba(30, 58, 95, 0.35)',
      },
    },
  },
  plugins: [],
};
