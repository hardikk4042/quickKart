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
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F6C90E',   // Primary brand yellow
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        dark: {
          50:  '#F8F8F8',
          100: '#E8E8E8',
          200: '#C8C8C8',
          300: '#A8A8A8',
          400: '#888888',
          500: '#666666',
          600: '#444444',
          700: '#2D2D2D',
          800: '#1F1F1F',
          900: '#0F0F0F',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':  '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
        'nav':   '0 2px 20px rgba(0,0,0,0.08)',
        'brand': '0 4px 20px rgba(246,201,14,0.35)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.15s ease-out',
        'bounce-sm':  'bounceSm 0.4s ease-in-out',
        'pulse-brand':'pulseBrand 2s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },           to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        bounceSm: {
          '0%, 100%': { transform: 'scale(1)' },
          '40%':      { transform: 'scale(1.12)' },
          '60%':      { transform: 'scale(0.95)' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(246,201,14,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(246,201,14,0)' },
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #F6C90E 0%, #FBBF24 100%)',
        'gradient-dark':  'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
        'gradient-hero':  'linear-gradient(135deg, #0F0F0F 0%, #1F1F1F 50%, #1A3A1A 100%)',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
