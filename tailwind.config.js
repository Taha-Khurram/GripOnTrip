/** @type {import('tailwindcss').Config} */
// NativeWind v4 uses Tailwind CSS v3 under the hood.
// Brand palette is derived from the Grip On Trip splash color (#208AEF).
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary brand blue (Grip On Trip)
        brand: {
          50: '#eaf4fe',
          100: '#d0e6fd',
          200: '#a1cdfb',
          300: '#6fb1f7',
          400: '#4299f2',
          500: '#208aef', // primary
          600: '#1670c9',
          700: '#1259a1',
          800: '#0f477e',
          900: '#0d3a66',
        },
        // Secondary accent (warm — travel/adventure)
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          300: '#fdba74',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
        rounded: ['var(--font-rounded)'],
        serif: ['var(--font-serif)'],
      },
    },
  },
  plugins: [],
};
