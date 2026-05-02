/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9d4edd',
          light: '#c77dff',
          dark: '#7b2d8b',
        },
        surface: {
          DEFAULT: '#1a1a2e',
          card: '#16213e',
          input: '#0f3460',
          hover: '#2a2a4a',
          border: '#2d2d4e',
        },
        bg: '#0d0d1a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
