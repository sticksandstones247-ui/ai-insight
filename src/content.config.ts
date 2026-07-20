import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['ストーリー', '議事録', 'お役立ち']),
    series: z.string().nullish(),
    seriesNumber: z.number().nullish(),
    date: z.coerce.date(),
    updated: z.coerce.date(),
    author: z.enum(['アイ', '中の人T']),
    aiGenerated: z.boolean().default(true),
    description: z.string(),
    thumbnail: z.string().nullish(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
