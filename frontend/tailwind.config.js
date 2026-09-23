/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C6F135', // Lime Green accent
          light: '#D4FF3F',
          dark: '#B0D92B',
          foreground: '#111112'
        },
        sidebar: '#111112',
        surface: {
          DEFAULT: '#ffffff',
          tint: '#E4F5A8' // Lighter tint of lime accent for cards
        },
        background: '#F7F7FB',
        text: {
          main: '#16161A',
          secondary: '#8A8A94',
          inverse: '#ffffff'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
