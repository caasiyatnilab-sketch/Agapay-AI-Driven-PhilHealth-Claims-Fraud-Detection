/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        phBlue: "#0038A8",
        phRed: "#CE1126",
        phYellow: "#FCD116"
      }
    },
  },
  plugins: [],
}
