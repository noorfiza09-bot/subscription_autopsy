import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Light "workspace" palette (Notion-style)
        main: "#0F0F0F",
        muted: "#5D6B7B",
        slate: "#5D6B7B",
        soft: "#F6F9FC",
        tint: "#EAF3FC",
        brand: "#0075DE",
        "brand-dark": "#005BAB",
        // Status colours
        sage: "#1A9E5C",
        amber: "#D98A1A",
        coral: "#E0453A",
        // Hero
        night: "#080A19",
      },
      fontFamily: {
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        hero: ["Suisse Intl", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
