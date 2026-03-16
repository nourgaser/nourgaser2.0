// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), mdx(), sitemap()],
  image: {
    responsiveStyles: true,
  },
  site: 'https://nourgaser.com',
});