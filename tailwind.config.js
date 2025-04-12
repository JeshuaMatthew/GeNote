module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Kalnia : "Kalnia"
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
