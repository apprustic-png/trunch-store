/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d5da',
          500: '#e11d48',
          600: '#be123c',
          900: '#4c0519',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        noir: {
          900: '#0f0f11',
          800: '#18181b',
          700: '#27272a',
        }
      },
    },
  },
  plugins: [],
};
