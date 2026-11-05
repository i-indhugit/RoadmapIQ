/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xxs': '320px',
        'xs': '375px',
      },
      colors: {
        navy: {
          950: '#060a12',
          900: '#0a0f1d',
          850: '#0e1628',
          800: '#141e34',
          750: '#1a2742',
          700: '#223254',
          600: '#334870',
        },
        brand: {
          cyan: '#00f0ff',
          blue: '#3b82f6',
          indigo: '#6366f1',
          teal: '#14b8a6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(0, 240, 255, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}

