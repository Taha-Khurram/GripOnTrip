/** @type {import('tailwindcss').Config} */
// NativeWind v4 uses Tailwind CSS v3 under the hood.
//
// Design system: "Ocean & Sun" (see docs/Design.md)
//   primary ocean teal     #1a7a8c   (brand-500)
//   primary deep teal      #0c3b4a   (brand-800)
//   sun warm orange        #f39024   (accent-500)
//   background sandy cream #f5efe4   (bg-background)
//   foreground deep navy   #0c2b36   (text-ink / text-foreground)
//
// The app consumes the `brand-*` (ocean ramp) and `accent-*` (sun ramp)
// tokens, plus the semantic aliases (`background`, `ink`, `sun`, `primary`…)
// for one-off, intention-revealing usage. The app is light-only.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary cool ramp — ocean teal (500) → deep teal (800).
        brand: {
          50: '#eef6f8',
          100: '#d5e9ed',
          200: '#b0d5dc',
          300: '#7fbcc7',
          400: '#47a0af',
          500: '#1a7a8c', // ocean teal — primary
          600: '#156473',
          700: '#114f5b',
          800: '#0c3b4a', // deep teal
          900: '#082a35',
        },
        // Warm ramp — sun orange (500).
        accent: {
          50: '#fef2e2',
          100: '#fce0bd',
          200: '#f9c98a',
          300: '#f6b160',
          400: '#f59f3f',
          500: '#f39024', // sun — primary accent
          600: '#db7a13',
          700: '#b5620f',
          800: '#8f4c0d',
          900: '#6b3809',
        },

        // Semantic aliases (intention-revealing; map onto the ramps above).
        primary: '#1a7a8c',
        'primary-deep': '#0c3b4a',
        sun: '#f39024',
        background: '#f5efe4', // sandy cream — app canvas
        surface: '#ffffff', // cards / sheets
        'surface-sunk': '#efe7d6', // recessed wells on cream
        foreground: '#0c2b36', // deep navy ink — primary text
        ink: '#0c2b36',
        muted: '#5f7178', // secondary text on cream/white
        'muted-foreground': '#7c8a90',
        hairline: '#e6dcc8', // border on cream
        'hairline-strong': '#d9ccb2',

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
        soft: '0px 10px 30px rgba(12, 59, 74, 0.12)',
        card: '0px 4px 16px rgba(12, 59, 74, 0.07)',
        // Warm colored glow for the sun CTA.
        glow: '0px 12px 32px rgba(243, 144, 36, 0.4)',
        'glow-ocean': '0px 12px 32px rgba(26, 122, 140, 0.35)',
      },
    },
  },
  plugins: [],
};
