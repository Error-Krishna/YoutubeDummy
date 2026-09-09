/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        softBg: '#f5f3f0',
        softCard: '#ffffff',
        softPrimary: '#6c5b7b',
        softSecondary: '#c06c84',
        softAccent: '#f8b195',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}