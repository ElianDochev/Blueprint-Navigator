import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a2147",
        mist: "#d9f0ee",
        accent: "#0F828C",
        slate: "#78B9B5",
        brand: {
          50: "#e8f8f6",
          100: "#d2f0ec",
          200: "#b3e2dc",
          300: "#78B9B5",
          400: "#4ba6a2",
          500: "#0F828C",
          600: "#0b6f78",
          700: "#065084",
          800: "#0a2f63",
          900: "#320A6B",
          950: "#19043a"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
