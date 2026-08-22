/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050508',
        'bg-secondary': '#0a0a0f',
        'bg-surface': '#0d0d14',
        'bg-elevated': '#111118',
        'border-dim': '#1a1a2e',
        'border-red': 'rgba(255,0,64,0.2)',
        'accent-red': '#ff0040',
        'accent-red-dim': '#cc0033',
        'accent-green': '#00ff88',
        'accent-yellow': '#ffaa00',
        'accent-blue': '#00aaff',
        'text-primary': '#e8e8f0',
        'text-secondary': '#7a7a9a',
        'text-dim': '#3a3a5a',
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        'ui': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'flow': 'flow 3s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255,0,64,0.3), 0 0 10px rgba(255,0,64,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(255,0,64,0.6), 0 0 40px rgba(255,0,64,0.2)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flow: {
          '0%, 100%': { opacity: '0.3', transform: 'translateX(0)' },
          '50%': { opacity: '1', transform: 'translateX(4px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideIn: {
          from: { transform: 'translateX(-10px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        glow: {
          from: { textShadow: '0 0 5px rgba(255,0,64,0.5)' },
          to: { textShadow: '0 0 20px rgba(255,0,64,0.8), 0 0 40px rgba(255,0,64,0.3)' },
        },
      },
    },
  },
  plugins: [],
}
