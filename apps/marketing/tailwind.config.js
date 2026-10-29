/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08070d",
        surface: "#100b17",
        elevated: "#160d20",
        brand: {
          violet: "#c22ef3",
          magenta: "#f33199",
          pinkNeon: "#ed48cb",
          lavender: "#de74f6",
        },
        text: {
          primary: "#f7f2ff",
          secondary: "#eee3f7",
          muted: "#baacc7",
          subtle: "#887591",
        },
      },
      fontFamily: {
        sans: ["Manrope", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

