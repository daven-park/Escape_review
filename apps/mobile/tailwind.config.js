/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#e9efff',
          500: '#2f5dff',
          600: '#244be0',
          700: '#1f3fbc',
        },
      },
    },
  },
  plugins: [],
};
