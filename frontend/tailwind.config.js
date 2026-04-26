/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sv: {
          navy: '#080C1F',
          azure: '#2962FF',
          cyan: '#00F0FF',
          violet: '#7B2CBF',
          gold: '#FFB800',
          orange: '#FF9100',
          // legacy aliases kept for any remaining references
          purple: '#7B2CBF',
          'purple-dark': '#5a1f8a',
          blue: '#2962FF',
          'gold-dark': '#e6a600',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        pill: '50px',
      },
      keyframes: {
        scanline: {
          '0%, 100%': { top: '0%', opacity: '1' },
          '50%': { top: '100%', opacity: '0.6' },
        },
        ambientPulse: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.15' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        travelLight: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '300% 0%' },
        },
      },
      animation: {
        scanline: 'scanline 2s ease-in-out infinite',
        'ambient-pulse': 'ambientPulse 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s linear infinite',
        'travel-light': 'travelLight 3s linear infinite',
      },
      boxShadow: {
        'azure-glow': '0 0 20px rgba(41, 98, 255, 0.5)',
        'cyan-glow': '0 0 20px rgba(0, 240, 255, 0.5)',
        'gold-glow': '0 0 20px rgba(255, 184, 0, 0.5)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
