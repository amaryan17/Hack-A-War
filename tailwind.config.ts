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
        background: "#080C14",
        "card-bg": "#0D1520",
        "card-hover": "#111D2E",
        borderline: "#1A2D45",
        "accent-cyan": "#00E5FF",
        "accent-green": "#39FF14",
        "accent-amber": "#FFB800",
        danger: "#FF4444",
        "text-primary": "#E8F4FD",
        "text-secondary": "#6B8CAE",
        "text-muted": "#3A5470",
      },
      fontFamily: {
        display: ["var(--font-space-mono)"],
        body: ["var(--font-ibm-plex)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
      backgroundImage: {
        "hero-grid": "linear-gradient(to right, #1A2D451a 1px, transparent 1px), linear-gradient(to bottom, #1A2D451a 1px, transparent 1px)",
        "scanline": "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.2) 3px, rgba(0, 0, 0, 0.2) 4px)",
      },
      animation: {
        "draw-line": "drawLine 1s ease-out forwards",
        "travel-dot": "travelDot 2s linear infinite",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        drawLine: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        travelDot: {
          "0%": { left: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
