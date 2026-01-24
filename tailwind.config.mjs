/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"primary": "#1d1d1f", // Apple-like dark gray/black
				"background-light": "#ffffff",
				"background-dark": "#000000",
				"surface": "#f5f5f7", // Apple-like light gray surface
			},
			fontFamily: {
				"display": ["Inter Variable", "sans-serif"],
				"sans": ["Inter Variable", "sans-serif"],
			},
			borderRadius: { 
				"none": "0", 
				"sm": "0.125rem", 
				"DEFAULT": "0.25rem", 
				"md": "0.375rem", 
				"lg": "0.5rem", 
				"xl": "0.75rem", 
				"2xl": "1.25rem", 
				"3xl": "2rem", 
				"full": "9999px" 
			},
			boxShadow: {
				'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
				'apple-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
			},
			animation: {
				'scroll-fast': 'scroll 6s linear infinite',
				'scroll': 'scroll 20s linear infinite',
				'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
			},
			keyframes: {
				scroll: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' },
				},
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				}
			}
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/container-queries'),
	],
}
