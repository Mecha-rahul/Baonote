/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--rgb-canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--rgb-surface) / <alpha-value>)',
          hover: 'rgb(var(--rgb-surface-hover) / <alpha-value>)',
        },
        border: 'rgb(var(--rgb-border) / <alpha-value>)',
        text: {
          DEFAULT: 'rgb(var(--rgb-text) / <alpha-value>)',
          muted: 'rgb(var(--rgb-muted) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--rgb-accent) / <alpha-value>)',
          soft: 'rgb(var(--rgb-accent) / var(--accent-soft-alpha))',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 2px 8px 0 rgb(0 0 0 / 0.16)',
        pop: '0 4px 16px 0 rgb(0 0 0 / 0.22)',
      },
    },
  },
  plugins: [],
}
