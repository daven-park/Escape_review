import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f4f8ff',
          100: '#e8f1ff',
          200: '#c5dbff',
          300: '#95bbff',
          400: '#5c91ff',
          500: '#2f6dff',
          600: '#1f57e6',
          700: '#1b45b4',
          800: '#193c8d',
          900: '#1b356f',
        },
        coral: {
          100: '#ffe9e2',
          300: '#ffb8a4',
          500: '#ff7654',
          700: '#d84e2d',
        },
        ink: {
          50: '#f8f9fb',
          100: '#eff2f7',
          300: '#b5bfd2',
          500: '#6b7590',
          700: '#2f364a',
          900: '#171c2b',
        },
      },
      boxShadow: {
        soft: '0 12px 28px rgba(23, 28, 43, 0.08)',
      },
      backgroundImage: {
        'grid-soft':
          'linear-gradient(to right, rgba(47,54,74,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(47,54,74,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-soft': '28px 28px',
      },
    },
  },
  plugins: [],
};

export default config;
