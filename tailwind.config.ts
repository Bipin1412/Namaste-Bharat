import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#020617",
          panel: "#0f172a",
          accent: "#10b981",
          muted: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
