// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: 'compile',
  }),
  vite: {
    // @ts-expect-error — vite version mismatch between @tailwindcss/vite and astro's bundled vite; functionally compatible
    plugins: [tailwindcss()],
  },
});
