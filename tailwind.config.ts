import type { Config } from "tailwindcss";

const config = {
  darkMode: false,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        amber: "#F9A825",
        cream: "#FFF8E7",
        sage: "#E8F5E9",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  corePlugins: {
    backdropBlur: true,
  },
  plugins: [],
} as unknown as Config;

export default config;
