/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'], // Replace 'Roboto' with your font name
      },
      colors: {
        "spotify-green": "#1ED760",
        "spotify-black": "#121212"
      }
    },
  },
  plugins: [],
}

