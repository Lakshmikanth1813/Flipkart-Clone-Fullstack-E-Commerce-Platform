/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2874f0',
          yellow: '#ff9f00',
          orange: '#fb641b',
          green: '#388e3c',
          lightBlue: '#f0f5ff',
          bg: '#f1f3f6',
          darkBlue: '#172337',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        header: '0 2px 4px 0 rgba(0,0,0,.08)',
        card: '0 1px 5px 0 rgba(0,0,0,.11)',
        details: '0 2px 8px 0 rgba(0,0,0,.06)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
