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
        // Wairo — traditional Japanese colour palette
        sumi: {
          50: '#f0ece2',
          100: '#e0d8ca',
          200: '#c8bda8',
          300: '#a89a82',
          400: '#7a6e5c',
          500: '#544a3c',
          600: '#3d362b',
          700: '#2a251e',
          800: '#1e1b17',
          900: '#16161a',
          950: '#0e0e10',
        },
        fuji: '#b4a7d6',        // wisteria — primary
        hanada: '#68a4c4',      // pale indigo — secondary
        wakatake: '#6b9e7e',    // bamboo — success
        yamabuki: '#d4a843',    // golden — warning
        shu: '#c85a44',         // vermillion — error
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif JP"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        washi: '0 1px 4px rgba(22, 22, 26, 0.12), 0 0 0 1px rgba(22, 22, 26, 0.06)',
        ink: '0 4px 16px rgba(22, 22, 26, 0.25)',
        ambient: '0 8px 32px rgba(22, 22, 26, 0.18)',
      },
      animation: {
        breathe: 'breathe 6s ease-in-out infinite',
        'gentle-float': 'gentleFloat 8s ease-in-out infinite',
        'ink-rise': 'inkRise 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        ripple: 'ripple 1.2s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        inkRise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
