import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#04060a",
          900: "#070b12",
          800: "#0c121c",
          700: "#121a28",
          600: "#1a2434",
        },
        aria: {
          cyan: "#3ee6e0",
          blue: "#4ea1ff",
          violet: "#8a6bff",
          amber: "#ffb454",
          rose: "#ff5c7c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(62,230,224,0.35)",
        "glow-lg": "0 0 60px rgba(62,230,224,0.25)",
      },
      backgroundImage: {
        "grid-radial":
          "radial-gradient(circle at 50% 0%, rgba(62,230,224,0.12), transparent 60%)",
      },
      keyframes: {
        pulseglow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        pulseglow: "pulseglow 3s ease-in-out infinite",
        scanline: "scanline 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
