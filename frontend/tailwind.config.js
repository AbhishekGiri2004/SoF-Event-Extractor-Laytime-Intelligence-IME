/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ime: {
          navy: '#0b2a4a',
          dark: '#071e35',
          light: '#0f3b68',
          accent: '#2b6cb0',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
