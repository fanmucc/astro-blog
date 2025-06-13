import { defineCollection, z } from 'astro:content';

// 页面内容集合 - 统一的页面结构
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // 新增：页面路径名称（用于 URL，如果不提供则使用文件名）
    pageName: z.string().optional(),
    // 排序字段，数字越小越靠前
    order: z.number().default(999),
    // 草稿状态
    draft: z.boolean().default(false),
    // 发布状态
    published: z.boolean().default(true),
    // 创建时间
    createdAt: z.coerce.date(),
    // 更新时间
    updatedAt: z.coerce.date().optional(),
    // 作者
    author: z.string().default('Fanmu'),
    // 标签
    tags: z.array(z.string()).default([]),
    // 是否显示在菜单中（对于index.md，通常不显示）
    showInMenu: z.boolean().default(true),
    // 菜单显示名称（如果不提供，使用title）
    menuLabel: z.string().optional(),
    // 图标（可选）
    icon: z.string().optional(),
    // SEO相关
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    // 阅读时间（会自动计算）
    readingTime: z.number().optional(),
    // 字数统计（会自动计算）
    wordCount: z.number().optional(),
  }),
});

// 网站配置集合
const config = defineCollection({
  type: 'data',
  schema: z.object({
    site: z.object({
      title: z.string(),
      description: z.string(),
      url: z.string().url(),
      author: z.string(),
      lang: z.string().default('zh-CN'),
    }).optional(),
    // 主菜单配置
    mainMenu: z.array(z.object({
      label: z.string(),
      value: z.string(),
      icon: z.string().optional(),
      order: z.number().default(999),
    })).optional(),
    social: z.array(z.object({
      name: z.string(),
      href: z.string(),
      icon: z.string(),
    })).optional(),
    features: z.object({
      search: z.boolean().default(true),
      comments: z.boolean().default(false),
      analytics: z.boolean().default(false),
      rss: z.boolean().default(true),
    }).optional(),
    // 重定向配置
    redirects: z.object({
      description: z.string().optional(),
      rules: z.array(z.object({
        from: z.string(),
        to: z.string(),
        type: z.enum(['permanent', 'temporary']).default('temporary'),
        status: z.number().default(302),
        description: z.string().optional(),
      })).default([]),
      external: z.array(z.object({
        from: z.string(),
        to: z.string(),
        description: z.string().optional(),
      })).default([]),
      fallback: z.object({
        enabled: z.boolean().default(true),
        target: z.string().default('/home'),
        description: z.string().optional(),
      }).optional(),
    }).optional(),
  }),
});

// 作者信息集合
const authors = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    social: z.object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      weibo: z.string().optional(),
    }).optional(),
  }),
});

export const collections = {
  pages,
  config,
  authors,
};