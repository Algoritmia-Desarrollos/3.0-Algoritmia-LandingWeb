// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  })
});