/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        primary: '#F97316',
        'primary-dark': '#EA580C',
        secondary: '#FEF3C7',
        accent: '#DC2626',
        success: '#16A34A',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #FFE4E6 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-once': 'bounceOnce 0.5s ease',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceOnce: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
