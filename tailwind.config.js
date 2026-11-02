/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#040711',
        surface: {
          50: '#0f172a',
          100: '#0b1120',
          200: '#070b14',
          300: '#03050a',
        },
        cyber: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          neon: '#00f0ff',
          violet: '#8b5cf6',
          purple: '#c084fc',
          emerald: '#10b981',
          crimson: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-crimson': '0 0 25px -5px rgba(244, 63, 94, 0.4)',
        'glow-neon': '0 0 35px -5px rgba(0, 240, 255, 0.5)',
      },
      animation: {
        'spin-slow': 'spin 18s linear infinite',
        'spin-reverse': 'spin-reverse 24s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
