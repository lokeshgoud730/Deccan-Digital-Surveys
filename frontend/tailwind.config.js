/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2563eb', // vivid blue
          DEFAULT: '#0f4c81', // Deccan survey blue
          dark: '#1e3a8a', // deep navy
        },
        survey: {
          gold: '#f59e0b', // survey yellow/gold
          darkBg: '#121212',
          cardDark: '#1e1e1e',
          textDark: '#e5e7eb',
        }
      },
    },
  },
  plugins: [],
}
