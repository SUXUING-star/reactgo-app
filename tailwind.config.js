/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'preview-popup': 'preview-popup 0.2s ease-out forwards',
        'bell-ring': 'bell 1s ease-in-out infinite',
        'like': 'like 0.3s ease-in-out',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite'
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'preview-popup': {
          '0%': {
            opacity: 0,
            transform: 'scale(0.95) translate(2px, 2px)'
          },
          '100%': {
            opacity: 1,
            transform: 'scale(1) translate(2px, 2px)'
          }
        },
        bell: {
          '0%, 100%': {
            transform: 'rotate(0deg)'
          },
          '25%': {
            transform: 'rotate(-20deg)'
          },
          '75%': {
            transform: 'rotate(20deg)'
          }
        },
        like: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' }
        },
        
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}