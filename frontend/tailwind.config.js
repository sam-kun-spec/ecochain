import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#e9f7ef",
          100: "#c9edd8",
          200: "#9fe0bc",
          300: "#6fd19c",
          400: "#3bbf7b",
          500: "#1a7a4a",
          600: "#15663d",
          700: "#115232",
          800: "#0e4229",
          900: "#0b3320"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 12px 32px rgba(16,24,40,.08)"
      }
    },
  },
  plugins: [forms],
};

