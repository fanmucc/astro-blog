import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-blog-domain.com',

  // 启用中间件
  experimental: {
    middleware: true,
  },

  // 重定向配置 - 这是 Astro 的内置重定向功能
  redirects: {
    // 根路径重定向到 /home
    '/': {
      status: 302, // 临时重定向
      destination: '/home'
    },

    // 可以添加更多重定向规则
    '/blog': '/react',
    '/docs': '/react/开始学习',
    '/guide': '/react/开始学习/environment-setup',

    // 旧路径重定向到新路径
    '/old-path': '/new-path',

    // 支持动态重定向
    '/user/[id]': '/profile/[id]',

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
});