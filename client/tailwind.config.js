/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        suntrip: {
          navy: '#0c1a2e',
          'navy-light': '#142640',
          surface: '#1a3050',
          card: '#1e3a5f',
          'card-hover': '#254770',
          'card-elevated': '#2a4d78',
          border: '#3d5f85',
          ocean: '#38bdf8',
          'ocean-dark': '#0ea5e9',
          'ocean-deep': '#0284c7',
          yellow: '#facc15',
          'yellow-dark': '#eab308',
          'yellow-light': '#fde047',
          white: '#f1f5f9',
          muted: '#94a3b8',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.2)',
        'card-soft': '0 8px 32px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255,255,255,0.04) inset',
        glow: '0 0 32px rgba(56, 189, 248, 0.15)',
        yellow: '0 4px 16px rgba(250, 204, 21, 0.2)',
      },
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #7dd3fc 100%)',
        'gradient-action': 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #facc15 100%)',
        'gradient-yellow': 'linear-gradient(135deg, #eab308 0%, #facc15 50%, #fde047 100%)',
        'gradient-page': 'linear-gradient(180deg, #142640 0%, #0c1a2e 40%, #0a1525 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
