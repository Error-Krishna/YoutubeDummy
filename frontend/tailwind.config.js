/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0B0E11',
          raised: '#14181D',
          hover: '#1C2128',
          border: '#262B33',
        },
        ink: {
          DEFAULT: '#F5F0E8',
          dim: '#A8ADB5',
          faint: '#6B7078',
        },
        mint: {
          DEFAULT: '#7FE3C0',
          dim: '#5FC7A6',
          soft: '#132420',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          dim: '#E85A3B',
          soft: '#2A1712',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '1728px',
      },
    },
  },
  plugins: [],
}
