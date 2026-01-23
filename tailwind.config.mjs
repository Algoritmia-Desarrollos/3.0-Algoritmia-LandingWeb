/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        body: 'var(--bg-body)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        inverse: 'var(--text-inverse)',
        surface: 'var(--bg-surface)',
        dark: 'var(--bg-dark)',
        border: 'var(--border-light)',
      },
      fontFamily: {
        sans: ['Inter Variable', 'sans-serif'],
      },
      borderRadius: {
        'full': 'var(--radius-full)',
        'md': 'var(--radius-md)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      transitionProperty: {
        'smooth': 'var(--transition-smooth)',
      }
    },
  },
  plugins: [],
}
