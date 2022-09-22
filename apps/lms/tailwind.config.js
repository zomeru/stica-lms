/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003262',
        primaryLight: '#004c95',
        secondary: '#FDB515',
        blackText: '#222222',
        cGray: {
          100: '#F3F3F3',
          200: '#D2D2D2',
          300: '#838383',
        },
      },
    },
  },
  plugins: [],
};
