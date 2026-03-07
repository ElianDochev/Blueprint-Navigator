import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10212f",
        mist: "#eef3f7",
        accent: "#0466c8",
        slate: "#4f6d7a"
      }
    }
  },
  plugins: []
} satisfies Config;
