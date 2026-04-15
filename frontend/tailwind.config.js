/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0',
          300: '#6EE7B7', 400: '#34D399', 500: '#10B981',
          600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B',
        },
        accent: {
          50:  '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
          300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in':  'slideIn 0.25s ease-out',
        'fade-in':   'fadeIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        slideIn:  { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn:   { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
    },
  },
  plugins: [],
}