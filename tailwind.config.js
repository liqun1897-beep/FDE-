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
        fde: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcff',
          300: '#9ec4ff',
          400: '#6ca2ff',
          500: '#437cff',
          600: '#235bf7',
          700: '#1744e3',
          800: '#1737b8',
          900: '#193291',
          950: '#111f58',
        }
      }
    },
  },
  plugins: [],
}
