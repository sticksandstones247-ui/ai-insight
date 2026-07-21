import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ai-kigyochu.com',
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
