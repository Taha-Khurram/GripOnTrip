/** @type {import('tailwindcss').Config} */
// NativeWind v4 uses Tailwind CSS v3 under the hood.
//
// Brand palette (Grip On Trip travel scheme):
//   sky blue #8ecae6 · blue-green #219ebc · deep space blue #023047
//   amber flame #ffb703 · princeton orange #fb8500
//
// The design tokens the app actually consumes are `brand-*` (cool ramp:
// sky → blue-green → deep space) and `accent-*` (warm ramp: amber → orange).
// The raw named families are also exposed for one-off use.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary cool ramp — sky blue → blue-green (500) → deep space blue.
        brand: {
          50: '#e8f4fa',
          100: '#d2eaf5',
          200: '#bbdff0',
          300: '#8ecae6', // sky blue
          400: '#51aed9',
          500: '#219ebc', // blue-green — primary
          600: '#1a7d95',
          700: '#145d70',
          800: '#023047', // deep space blue
          900: '#011c2a',
        },
        // Warm ramp — amber flame → princeton orange (500).
        accent: {
          50: '#fff1cd',
          100: '#ffe39b',
          200: '#ffd569',
          300: '#ffb663',
          400: '#ff9e2f',
          500: '#fb8500', // princeton orange — primary accent
          600: '#c86b00',
          700: '#965000',
          800: '#643500',
          900: '#321b00',
        },
        success: '#16a34a',
        warning: '#ffb703', // amber flame
        danger: '#dc2626',

        // Raw named palette families (full ramps as provided).
        skyblue: {
          DEFAULT: '#8ecae6',
          100: '#0d2e3d',
          200: '#1b5c7a',
          300: '#288ab7',
          400: '#51aed9',
          500: '#8ecae6',
          600: '#a5d5eb',
          700: '#bbdff0',
          800: '#d2eaf5',
          900: '#e8f4fa',
        },
        bluegreen: {
          DEFAULT: '#219ebc',
          100: '#071f25',
          200: '#0d3e4b',
          300: '#145d70',
          400: '#1a7d95',
          500: '#219ebc',
          600: '#39bcdc',
          700: '#6bcce5',
          800: '#9cddee',
          900: '#ceeef6',
        },
        deepspace: {
          DEFAULT: '#023047',
          100: '#00090e',
          200: '#01131c',
          300: '#011c2a',
          400: '#012638',
          500: '#023047',
          600: '#04699b',
          700: '#06a3f1',
          800: '#54c3fb',
          900: '#a9e1fd',
        },
        amberflame: {
          DEFAULT: '#ffb703',
          100: '#342500',
          200: '#684b00',
          300: '#9c7000',
          400: '#d09500',
          500: '#ffb703',
          600: '#ffc637',
          700: '#ffd569',
          800: '#ffe39b',
          900: '#fff1cd',
        },
        princeton: {
          DEFAULT: '#fb8500',
          100: '#321b00',
          200: '#643500',
          300: '#965000',
          400: '#c86b00',
          500: '#fb8500',
          600: '#ff9e2f',
          700: '#ffb663',
          800: '#ffce97',
          900: '#ffe7cb',
        },
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
