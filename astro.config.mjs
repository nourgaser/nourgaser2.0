// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    mdx(),
    sitemap({
      // /blog, /projects, and /skills are noindex redirect stubs (see
      // src/pages/blog/index.astro etc.), not indexable content — keeping
      // them out of the sitemap avoids Search Console flagging submitted
      // URLs that are marked noindex or redirected elsewhere.
      filter: (page) =>
        !['blog', 'projects', 'skills'].some((slug) =>
          page === `https://nourgaser.com/${slug}/` || page === `https://nourgaser.com/${slug}`
        ),
    }),
  ],
  image: {
    responsiveStyles: true,
  },
  site: 'https://nourgaser.com',
});