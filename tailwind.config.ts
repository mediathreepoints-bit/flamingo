import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // accent officiel du brief : #F04438
        flame: {
          50: '#FEF3F2',
          100: '#FEE4E2',
          200: '#FECDCA',
          300: '#FDA29B',
          400: '#FF6B5E',
          500: '#F04438',
          600: '#D93A2F',
          700: '#B42318',
          800: '#912018',
          900: '#76271A',
        },
        ink: {
          DEFAULT: '#1D1D1F',
          950: '#1D1D1F',
          900: '#161617',
          800: '#272729',
          700: '#333336',
          600: '#424245',
          500: '#55555A',
        },
        steel: {
          100: '#F4F6F9',
          200: '#E5E9F0',
          300: '#C7CEDA',
          400: '#939CAB',
          500: '#6E7787',
          600: '#555E6D',
          700: '#3D4552',
          800: '#2C323D',
          900: '#1C2128',
        },
        signal: '#38BDF8',
        paper: '#F5F5F7',
        bone: '#D2D2D7',
        ok: '#22C55E',
        warn: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['Anton', 'Archivo Variable', 'Noto Sans Arabic Variable', 'system-ui', 'sans-serif'],
        archive: ['Archivo Variable', 'Archivo', 'system-ui', 'sans-serif'],
        body: ['Manrope Variable', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
        hand: ['Caveat Variable', 'Caveat', 'cursive'],
        arabic: ['Noto Sans Arabic Variable', 'Noto Sans Arabic', 'sans-serif'],
      },
      letterSpacing: { mega: '0.14em' },
      boxShadow: {
        card: '0 12px 40px -12px rgba(0,0,0,0.65)',
        red: '0 12px 40px -10px rgba(240,68,56,0.45)',
        lift: '0 24px 70px -18px rgba(0,0,0,0.7)',
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 2.6s linear infinite',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
    },
  },
  plugins: [],
};

export default config;
