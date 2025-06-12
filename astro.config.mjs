import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-blog-domain.com',
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [
      tailwindcss(), // 使用 Tailwind CSS v4 的 Vite 插件
    ],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      langs: ['javascript', 'typescript', 'html', 'css', 'astro', 'bash', 'json'],
      wrap: true,
    },
  },
});