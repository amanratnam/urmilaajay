import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#12100E",
        "bg-elevated": "#1A1815",
        fg: "#F2EDE4",
        "fg-muted": "#8A8278",
        accent: "#C9A878",
        border: "#2A2622",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter Tight", "Inter", "sans-serif"],
      },
      transitionTimingFunction: {
        memorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        "600": "600ms",
        "900": "900ms",
      },
    },
  },
  plugins: [],
};

export default config;
