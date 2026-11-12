/** @type {import('tailwindcss').Config} */
<<<<<<< HEAD
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
=======
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
>>>>>>> e6a0d4ebed784b424f72aeb700fc2f8f200c94f1
  ],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
        brand: {
          purple: "#241747",
          purpleRich: "#6236C9",
          orange: "#F58220",
          orangeHover: "#E07214",
          lavender: "#F5F3FA",
          navy: "#211A40",
          grey: "#77738B",
          border: "#E7E1F0",
        },
        lpu: {
          primary: "#6236C9",
          primaryHover: "#5528B8",
          dark: "#241747",
          deep: "#1A1035",
          orange: "#F58220",
          orangeHover: "#E07214",
          lightBg: "#F5F3FA",
          cardBg: "#FFFFFF",
          border: "#E7E1F0",
          textMain: "#211A40",
          textMuted: "#77738B",
          surfaceDark: "#1E133D",
          sidebarHover: "#2E1C59",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(36, 23, 71, 0.06)",
        card: "0 10px 30px -4px rgba(36, 23, 71, 0.08)",
        purple: "0 10px 25px -3px rgba(98, 54, 201, 0.25)",
        orange: "0 10px 25px -3px rgba(245, 130, 32, 0.28)",
        subtle: "0 2px 8px rgba(36, 23, 71, 0.04)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
=======
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          brand: '#1b4332',
          brandLight: '#e9f7ee',
          brandHover: '#2d6a4f',
        },
>>>>>>> e6a0d4ebed784b424f72aeb700fc2f8f200c94f1
      },
    },
  },
  plugins: [],
};
