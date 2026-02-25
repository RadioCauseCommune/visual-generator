/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cause-red': '#D20A33',
        'cause-black': '#0f0f0f',
        'cause-cream': '#FFFAE5',
        'cause-green': '#A3FF00',
      },
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
      },
      boxShadow: {
        'neo': '3px 3px 0px 0px #0f0f0f',
        'neo-lg': '6px 6px 0px 0px #0f0f0f',
        'neo-xl': '10px 10px 0px 0px #0f0f0f',
      }
    },
  },
  plugins: [],
}
