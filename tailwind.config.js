/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        kpmg: {
          primary: '#00205F',
          'primary-container': '#00338D',
          background: '#FCF9F8',
          'surface-container': '#F0EDEC',
          'surface-container-high': '#EBE7E7',
          'surface-container-low': '#F6F3F2',
          'surface-container-lowest': '#FFFFFF',
          outline: '#747683',
          'outline-variant': '#C4C6D4',
          'on-surface': '#1C1B1B',
          'on-surface-variant': '#444652',
          secondary: '#006397',
          tertiary: '#45004F',
          'accent-faster': '#00B8A9',
          'accent-deeper': '#F39C12',
          'accent-positive': '#0F6E56',
          'accent-negative': '#C84B5A',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(196, 198, 212, 0.3)',
        'card-hover': '0 4px 16px rgba(0, 32, 95, 0.10)',
        'drawer': '-4px 0 24px rgba(0, 0, 0, 0.08)',
        'elevated': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-highlight': 'pulseHighlight 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseHighlight: {
          '0%': { backgroundColor: 'rgba(0, 184, 169, 0.15)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}