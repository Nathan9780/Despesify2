// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#359EAB",
          light: "#4FB5C2",
          dark: "#2A7D87",
        },
        secondary: {
          DEFAULT: "#1B4F72",
          light: "#2980B9",
        },
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
