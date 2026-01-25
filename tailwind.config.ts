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
          50: '#f3f1ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bea6ff',
          400: '#9f75ff',
          500: '#6A3BF6',
          600: '#5c21f0',
          700: '#4d10dc',
          800: '#410fb8',
          900: '#370d97',
          DEFAULT: '#6A3BF6',
          light: '#8B5CF6',
          dark: '#5429E0',
        },
        secondary: {
          50: '#e6fff8',
          100: '#b3ffeb',
          200: '#80ffde',
          300: '#4dffd1',
          400: '#1affc4',
          500: '#00D9A5',
          600: '#00b088',
          700: '#00876a',
          800: '#005e4c',
          900: '#00352e',
          DEFAULT: '#00D9A5',
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
              50: '#f3f1ff',
              100: '#ebe5ff',
              200: '#d9ceff',
              300: '#bea6ff',
              400: '#9f75ff',
              500: '#6A3BF6',
              600: '#5c21f0',
              700: '#4d10dc',
              800: '#410fb8',
              900: '#370d97',
              DEFAULT: '#6A3BF6',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#00D9A5',
              foreground: '#1A1A1A',
            },
            focus: '#6A3BF6',
          },
        },
      },
    }),
  ],
};

export default config;
