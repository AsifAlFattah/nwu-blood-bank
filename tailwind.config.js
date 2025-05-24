/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all .js, .jsx, .ts, .tsx files in your src folder
    "./public/index.html",      // Scans your main public HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}