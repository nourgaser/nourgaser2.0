import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    description: z.string().optional(),
    note: z.string().optional(),
    tags: z.array(z.string()),
    category: z.enum([
      'professional-platforms',
      'mapping-gis-3d',
      'web-platforms',
      'games',
      'experiments',
    ]).default('experiments'),
    clientType: z.enum(['internal', 'client', 'academic', 'personal']).optional(),
    status: z.enum(['complete', 'wip', 'abandoned', 'demo']).default('complete'),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    links: z.object({
      live: z.string().url().optional(),
      source: z.string().url().optional(),
      design: z.string().url().optional(),
    }).optional(),
    media: z.array(z.object({
      path: z.string(),
      alt: z.string().optional(),
      isVideo: z.boolean().default(false),
    })).default([]),
    coverImage: z.string().optional(),
  }),
});

export const collections = { projects };
