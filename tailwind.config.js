/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#d9e0f0',
          200: '#b3c1e0',
          300: '#8da2d1',
          400: '#6683c1',
          500: '#1a2744',
          600: '#152038',
          700: '#101a2c',
          800: '#0b1320',
          900: '#050914',
        },
        amber: {
          50: '#fff8e6',
          100: '#feeab3',
          200: '#fddc80',
          300: '#fcce4d',
          400: '#fbc01a',
          500: '#e0a800',
          600: '#b38600',
          700: '#806000',
          800: '#4d3a00',
          900: '#1a1300',
        }
      }
    },
  },
  plugins: [],
}
