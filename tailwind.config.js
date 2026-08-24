/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        cream: {
          50: '#fdfaf7',
          100: '#f9f3ec',
          200: '#f2e8d9',
          300: '#e8d5bc',
        },
        rose: {
          blush: '#f4b8c8',
          soft: '#f9d0d9',
          medium: '#e8839a',
          deep: '#c45573',
          darker: '#9b3556',
        },
        gold: {
          light: '#f5e6c8',
          medium: '#d4a853',
          rich: '#b8860b',
        },
        charcoal: {
          soft: '#6b5b52',
          medium: '#4a3f38',
          dark: '#2d2520',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(180, 120, 100, 0.08)',
        'warm': '0 8px 40px rgba(180, 120, 100, 0.15)',
        'product': '0 12px 48px rgba(180, 100, 80, 0.12)',
      }
    },
  },
  plugins: [],
};
