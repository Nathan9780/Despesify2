// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        secondary: {
          DEFAULT: "#1B4F72",
          light: "#2980B9",
        },
        blue: {
          100: "var(--color-primary-ultra-light)",
          500: "var(--color-primary-light)",
          600: "var(--color-primary)",
          700: "var(--color-primary-dark)",
        },
        background: "var(--color-background)",
        surface: "var(--color-surface)",
      },
      fontFamily: {
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
        title: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
