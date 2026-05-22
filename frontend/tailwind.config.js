/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        ink: '#0A0A0F',
        surface: '#13131A',
        card: '#1C1C28',
        border: '#2A2A3C',
        accent: '#7C3AED',
        'accent-light': '#A78BFA',
        gold: '#F59E0B',
        emerald: '#10B981',
        rose: '#F43F5E',
        muted: '#6B7280'
      }
    }
  },
  plugins: []
};
