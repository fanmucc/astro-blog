import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-blog-domain.com',

  // 重定向配置 - 这是 Astro 的内置重定向功能
  redirects: {
    // 根路径重定向到 /home
    '/': {
      status: 302, // 临时重定向
      destination: '/home'
    },

    // 外部重定向
    '/github': 'https://github.com/fanmu',
  },

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

  // 服务器配置
  server: {
    port: 3000,
    host: true, // 允许外部访问
  },

  // 构建配置
  build: {
    // 生成静态文件时的配置
    assets: '_astro',
  },

  // 输出配置
  output: 'static', // 或者 'server' 如果你需要 SSR

  // 如果需要中间件支持，可以添加这个（在较新版本的 Astro 中已默认启用）
  // middleware: true, // 这在新版本中已不需要
});