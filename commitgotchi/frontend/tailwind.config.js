/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cute pastel palette
        pink: {
          50: '#FFF5F7',
          100: '#FFE8ED',
          200: '#FFD1DC',
          300: '#FFB6C1',
          400: '#FF9EAD',
          500: '#FF8599',
        },
        purple: {
          50: '#F5E6FF',
          100: '#EDD4FF',
          200: '#E0BBE4',
          300: '#D4A5D9',
          400: '#C78FCE',
          500: '#B879C3',
        },
        blue: {
          50: '#E6F4FF',
          100: '#CCE9FF',
          200: '#B4D4FF',
          300: '#9FC4FF',
          400: '#8AB4FF',
          500: '#75A4FF',
        },
        mint: {
          50: '#E8FFF0',
          100: '#D1FFE1',
          200: '#C1F2D0',
          300: '#A8E6BF',
          400: '#8FDAAE',
          500: '#76CE9D',
        },
        yellow: {
          50: '#FFFEF0',
          100: '#FFFCE0',
          200: '#FFF9C4',
          300: '#FFF4A3',
          400: '#FFEF82',
          500: '#FFE961',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Nunito', 'sans-serif'],
      },
      boxShadow: {
        'cute-pink': '0 4px 15px rgba(255, 182, 193, 0.4), 0 2px 8px rgba(224, 187, 228, 0.3)',
        'cute-purple': '0 4px 15px rgba(224, 187, 228, 0.4), 0 2px 8px rgba(180, 212, 255, 0.3)',
        'cute-blue': '0 4px 15px rgba(180, 212, 255, 0.4), 0 2px 8px rgba(193, 242, 208, 0.3)',
        'cute-glow': '0 0 30px rgba(255, 182, 193, 0.4), 0 0 60px rgba(224, 187, 228, 0.2)',
        'glass': 'inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 32px rgba(255, 182, 193, 0.2)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'heart-beat': 'heartBeat 1.5s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(255, 182, 193, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 182, 193, 0.7), 0 0 60px rgba(224, 187, 228, 0.4)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.05)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2) rotate(180deg)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
