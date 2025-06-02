/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4A9DF6',
          DEFAULT: '#1264A3',
          dark: '#0b5394',
        },
        secondary: {
          light: '#F6F6F6',
          DEFAULT: '#E0E0E0',
          dark: '#BDBDBD',
        },
        success: '#2BAC76',
        warning: '#ECB22E',
        danger: '#E01E5A',
        dark: {
          light: '#616061',
          DEFAULT: '#1D1C1D',
          darker: '#0B0A0B',
        },
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 