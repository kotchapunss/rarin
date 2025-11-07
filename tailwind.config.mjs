
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f9f5f3",
          100: "#f3ebe6",
          200: "#e7d7cd",
          300: "#d4b5a0",
          400: "#c19a7e",
          500: "#B8846B",  /* main brand color */
          600: "#a0735a",
          700: "#8a5f4a",
          800: "#6d4c3b",
          900: "#5a3f31"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(184, 132, 107, .08)"
      },
      borderRadius: {
        xl2: "1rem"
      }
    }
  },
  plugins: []
}
