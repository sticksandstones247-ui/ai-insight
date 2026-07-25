import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORY = z.enum(['議事録', '中の人の話', 'AI図書館', 'AIニュース']);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // 単一文字列（category: 議事録）・配列（category: [議事録, AI図書館]）
    // どちらのフロントマターも受け付け、常に配列へ正規化する。
    category: z
      .union([CATEGORY, z.array(CATEGORY).min(1)])
      .transform((c) => (Array.isArray(c) ? c : [c])),
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
