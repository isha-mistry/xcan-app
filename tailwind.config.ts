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
          primary: "#0A142A",
          secondary: "#0D1527",
          tertiary: "#0D1A34",
          accent: "#171D51",
          text: {
            primary: "#ffffff",
            secondary: "#a0a0a0",
            tertiary: "#707070",
          },
        },
        // Updated blue shades for dark theme
        "blue-shade-100": "#123099", // Primary blue
        "blue-shade-200": "#171D51", // Secondary blue
        "blue-shade-300": "#02052E", // Dark blue
        "blue-shade-400": "#050B1A", // Very dark blue
        "blue-shade-500": "#0D1A34", // Medium blue
        "blue-shade-600": "#0D1527", // Light blue
        "blue-shade-700": "#0A142A", // Lightest blue
        "blue-shade-800": "#02052E", // Dark blue for borders
        "black-shade-100": "#7C7C7C",
        "black-shade-200": "#DEDEDE",
        "black-shade-300": "#F6F6F6",
        "black-shade-400": "#CCCCCC",
        "black-shade-500": "#4F4F4F",
        "black-shade-600": "#F5F5F5",
        "black-shade-700": "#D9D9D9",
        "black-shade-800": "#EDEDED",
        "black-shade-900": "#B9B9B9",
        "black-shade-1000": "#3E3D3D",
        "green-shade-100": "#00CE78",
        "green-shade-200": "#25d366",
        "gradient-start": "#4ade80", // green-400
        "gradient-end": "#06b6d4", // cyan-500
      },
      fontFamily: {
        robotoMono: ["var(--font-roboto-mono)"],
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
      },
      animation: {
        fadeIn: "fadeIn 1s ease-out",
        "spin-subtle": "spin-subtle 3s ease-in-out infinite",
        "slide-down": "slideDown 0.5s ease-out",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
