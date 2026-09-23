import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#141019",
        stone: "#EFEDE6",
        "stone-dim": "#E2DFD5",
        indigo: {
          DEFAULT: "#2B3A67",
          dark: "#1D2847",
        },
        gold: {
          DEFAULT: "#C08A28",
          light: "#E0B25C",
        },
        teal: {
          DEFAULT: "#1E6F5C",
          light: "#2C9178",
        },
        clay: "#A64B2A",
        line: "#D8D4C8",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
