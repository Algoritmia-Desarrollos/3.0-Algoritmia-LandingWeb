import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://algoritmiadesarrollos.com.ar',
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [
    tailwind(),
    sitemap(),
    react(),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    domains: [],
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
