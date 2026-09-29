/** @type {import('tailwindcss').Config} */
// Note: Tailwind v4 reads its design tokens from the @theme block in
// src/styles/tokens.css. This file is kept only for editor tooling.
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Marcellus', 'Georgia', 'serif'],
        display: ['Marcellus', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
