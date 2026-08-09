import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B2B",
        "ink-light": "#16263B",
        paper: "#F7F5F0",
        "paper-dim": "#EDEAE2",
        sage: "#6FCF97",
        amber: "#E8A33D",
        coral: "#E85D4E",
        slate: "#5C6B7A",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        perforation:
          "radial-gradient(circle, #0F1B2B 1.5px, transparent 1.5px)",
      },
    },
  },
  plugins: [],
};
export default config;
