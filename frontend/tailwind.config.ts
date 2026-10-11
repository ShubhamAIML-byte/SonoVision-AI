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
        navy: {
          950: "#060913",
          900: "#0B132B",
          850: "#111C3A",
          800: "#1C2541",
          700: "#2B3A67",
        },
        cyan: {
          300: "#7BF1A8",
          400: "#5BC0BE",
          500: "#3AAFA9",
          600: "#2B8A85",
        },
        medical: {
          accent: "#00F0FF",
          glow: "rgba(0, 240, 255, 0.15)",
          benign: "#10B981",    // Green
          malignant: "#EF4444", // Red
          normal: "#3B82F6",    // Blue
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 2.5s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateY(0%)", opacity: "0.2" },
          "50%": { transform: "translateY(100%)", opacity: "0.8" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
