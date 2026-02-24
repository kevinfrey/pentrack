import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        ink: {
          50: "#f0f4f8",
          900: "#1a2744",
          950: "#0f172a",
        },
        gold: {
          400: "#f0b429",
          500: "#d4a017",
        },
        parchment: {
          50: "#faf8f4",
          100: "#f4f0e8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
