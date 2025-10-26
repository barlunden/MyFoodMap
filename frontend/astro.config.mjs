// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcssPostcss from '@tailwindcss/postcss';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  server: {
    port: 4321,
    host: true
  },
  // Static build for Netlify deployment
  output: 'static',
  vite: {
    css: {
      postcss: {
        plugins: [
          tailwindcssPostcss,
        ],
      },
    },
  },
});
