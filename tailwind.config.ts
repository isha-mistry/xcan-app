import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "0.2xs": "370px",
        "0.5xs": "400px",
        "0.7xs": "420px",
        "2.5xl": "2100px",
        "1.5xl": "1350px",
        "1.7xl": "1450px",
        "1.5lg": "1200px",
        "1.7lg": "1250px",
        "1.3lg": "1100px",
        xm: "550px",
        xs: "470px",
        "1.2xs": "500px",
        "2md": "950px",
        "2sm": "670px",
        "2.3sm": "700px",
        "1.5md": "830px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

        "op-logo":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.6)), url('../assets/images/daos/op.png')",
        "arb-logo":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.6)), url('../assets/images/daos/arb.png')",

        "op-profile":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8)), url('../assets/images/daos/op.png')",
        "arb-profile":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8)), url('../assets/images/daos/arb.png')",
      },
      colors: {
        // Dark theme colors
        dark: {
          primary: "var(--background)",
          secondary: "var(--surface)",
          tertiary: "var(--surface-accent)",
          accent: "var(--primary)",
          text: {
            primary: "var(--text-primary)",
            secondary: "var(--text-secondary)",
            tertiary: "var(--text-muted)",
          },
        },
        // Harmonized blue shades based on homepage theme
        "blue-shade-100": "#3b82f6", // Primary blue (blue-500)
        "blue-shade-200": "#171D51", // Deep blue
        "blue-shade-300": "#02052E", // Darker blue
        "blue-shade-400": "#60a5fa", // Light blue accent (blue-400)
        "blue-shade-500": "#0D1A34", // Surface blue
        "blue-shade-600": "#0D1527", // Light surface blue
        "blue-shade-700": "var(--background)", // Match background
        "blue-shade-800": "#02052E", // Border blue
        
        // Muted black/grey shades for dark theme consistency
        "black-shade-100": "rgba(255, 255, 255, 0.5)",
        "black-shade-200": "rgba(255, 255, 255, 0.7)",
        "black-shade-300": "rgba(255, 255, 255, 0.9)",
        "black-shade-400": "rgba(255, 255, 255, 0.4)",
        "black-shade-500": "rgba(255, 255, 255, 0.3)",
        "black-shade-600": "rgba(255, 255, 255, 0.05)",
        "black-shade-700": "rgba(255, 255, 255, 0.15)",
        "black-shade-800": "rgba(255, 255, 255, 0.03)",
        "black-shade-900": "rgba(255, 255, 255, 0.2)",
        "black-shade-1000": "rgba(255, 255, 255, 0.25)",

        "green-shade-100": "#00CE78",
        "green-shade-200": "#25d366",
        "gradient-start": "#4ade80", // green-400
        "gradient-end": "#06b6d4", // cyan-500

      },
      fontFamily: {
        robotoMono: ["var(--font-roboto-mono)"],
        unbounded: ["var(--font-unbounded)"],
        quanty: ["var(--font-quanty)"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-subtle": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.1)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 1s ease-out",
        "spin-subtle": "spin-subtle 3s ease-in-out infinite",
        "slide-down": "slideDown 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
