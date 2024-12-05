/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      spacing:{
        "aoc-row": "0.5rem",
        "aoc-col": "0.5rem"
      }
    },
  },
  plugins: [],
};