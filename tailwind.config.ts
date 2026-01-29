import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1E3A8A', // Brand Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#1E3A8A',
          light: '#3B82F6',
          dark: '#1e40af',
        },
        secondary: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#65A30D', // Brand Green
          600: '#4d7c0f',
          700: '#3f6212',
          800: '#365314',
          900: '#1a2e05',
          DEFAULT: '#65A30D',
        },
        cream: '#FAF8F3',
        beige: {
          DEFAULT: '#EDE8D0',
          light: '#F5F2E8',
          dark: '#D4CDB5',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          soft: '#2D2D2D',
          card: '#12131A',
        },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FAF8F3",
            foreground: "#1A1A1A",
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#1E3A8A',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              DEFAULT: '#1E3A8A',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#65A30D',
              foreground: '#FFFFFF',
            },
            focus: '#1E3A8A',
          },
        },
      },
    }),
  ],
};

export default config;
