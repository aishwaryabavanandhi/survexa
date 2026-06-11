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
          50:  '#f6f4ff',
          100: '#eee5ff',
          200: '#ddd4ff',
          300: '#c4b3ff',
          400: '#a98dff',
          500: '#8b68ff',
          600: '#794cff',
          700: '#6633ff',
          800: '#5424df',
          900: '#441cba',
        },
      },
      fontFamily: {
        sans: ['Quicksand', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Quicksand', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
