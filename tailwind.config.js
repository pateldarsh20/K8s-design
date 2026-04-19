/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0a0a0a',
          dot: '#ff3333',
        },
        neon: {
          cyan: '#00ffff',
          blue: '#0066ff',
          purple: '#9933ff',
          teal: '#00cc99',
          orange: '#ff9900',
          green: '#00ff66',
        }
      },
      animation: {
        'flowing-dash': 'flowing-dash 1s linear infinite',
      },
      keyframes: {
        'flowing-dash': {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}