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
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#65A30D', // Brand Green (Now Primary)
          600: '#4d7c0f',
          700: '#3f6212',
          800: '#365314',
          900: '#1a2e05',
          DEFAULT: '#65A30D',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1E3A8A', // Brand Blue (Now Secondary)
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#1E3A8A',
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
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#fafafa",
            foreground: "#09090b",
            content1: "#ffffff",
            content2: "#f4f4f5",
            content3: "#e4e4e7",
            content4: "#d4d4d8",
            primary: {
              50: '#f7fee7',
              100: '#ecfccb',
              200: '#d9f99d',
              300: '#bef264',
              400: '#a3e635',
              500: '#65A30D',
              600: '#4d7c0f',
              700: '#3f6212',
              800: '#365314',
              900: '#1a2e05',
              DEFAULT: '#65A30D',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#1E3A8A',
              foreground: '#FFFFFF',
            },
            focus: '#65A30D',
          },
        },
        dark: {
          colors: {
            background: "#09090b",
            foreground: "#fafafa",
            content1: "#18181b",
            content2: "#27272a",
            content3: "#3f3f46",
            content4: "#52525b",
            primary: {
              50: '#1a2e05',
              100: '#365314',
              200: '#3f6212',
              300: '#4d7c0f',
              400: '#65A30D',
              500: '#65A30D',
              600: '#a3e635',
              700: '#bef264',
              800: '#d9f99d',
              900: '#ecfccb',
              DEFAULT: '#65A30D',
              foreground: '#000000',
            },
            secondary: {
              DEFAULT: '#3b82f6',
              foreground: '#FFFFFF',
            },
            focus: '#65A30D',
          },
        },
      },
    }),
  ],
};

export default config;
