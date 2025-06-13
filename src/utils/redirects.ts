// src/utils/redirects.ts - 更新后的重定向工具函数
import { getCollection } from "astro:content";

interface RedirectRule {
  from: string;
  to: string;
  type: 'permanent' | 'temporary';
  status: 301 | 302;
  description?: string;
}

interface ExternalRedirect {
  from: string;
  to: string;
  description?: string;
}

interface RedirectConfig {
  rules: RedirectRule[];
  external: ExternalRedirect[];
  fallback: {
    enabled: boolean;
    target: string;
    description?: string;
  };
}

// 默认重定向配置
const defaultRedirectConfig: RedirectConfig = {
  rules: [
    {
      from: "/",
      to: "/home",
      type: "temporary",
      status: 302,
      description: "根路径重定向到首页"
    },
  ],
  external: [],
  fallback: {
    enabled: true,
    target: "/home",
    description: "404 重定向到首页"
  }
};

/**
 * 获取重定向配置
 */
export async function getRedirectConfig(): Promise<RedirectConfig> {
  try {
    // 尝试从配置文件加载
    const configCollection = await getCollection('config');
    const siteConfig = configCollection.find(entry => entry.id === 'site');

    if (siteConfig?.data?.redirects) {
      return {
        rules: siteConfig.data.redirects.rules as RedirectRule[] || [],
        external: siteConfig.data.redirects.external as ExternalRedirect[] || [],
        fallback: siteConfig.data.redirects.fallback as RedirectConfig['fallback'] || defaultRedirectConfig.fallback
      };
    }
  } catch (error) {
    console.log("使用默认重定向配置:", error);
  }

  return defaultRedirectConfig;
}

/**
 * 检查路径是否需要重定向
 */
export function shouldRedirect(pathname: string, config: RedirectConfig): RedirectRule | ExternalRedirect | null {
  // 检查内部重定向
  const internalRedirect = config.rules.find(rule => rule.from === pathname);
  if (internalRedirect) {
    return internalRedirect;
  }

  // 检查外部重定向
  const externalRedirect = config.external.find(rule => rule.from === pathname);
  if (externalRedirect) {
    return externalRedirect;
  }

  return null;
}

/**
 * 获取重定向目标
 */
export function getRedirectTarget(pathname: string, config: RedirectConfig): string | null {
  const redirect = shouldRedirect(pathname, config);
  return redirect ? redirect.to : null;
}

/**
 * 检查是否为外部重定向
 */
export function isExternalRedirect(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 客户端重定向函数
 */
export function clientRedirect(to: string, replace: boolean = false): void {
  if (typeof window !== 'undefined') {
    if (isExternalRedirect(to)) {
      // 外部链接在新窗口打开
      window.open(to, '_blank', 'noopener,noreferrer');
    } else {
      // 内部重定向
      if (replace) {
        window.location.replace(to);
      } else {
        window.location.href = to;
      }
    }
  }
}

/**
 * 构建 Astro 重定向配置对象
 */
export function buildAstroRedirects(config: RedirectConfig): Record<string, any> {
  const astroRedirects: Record<string, any> = {};

  // 添加内部重定向
  config.rules.forEach(rule => {
    astroRedirects[rule.from] = {
      status: rule.status,
      destination: rule.to
    };
  });

  // 添加外部重定向
  config.external.forEach(rule => {
    astroRedirects[rule.from] = rule.to;
  });

  return astroRedirects;
}

/**
 * 路径标准化
 */
export function normalizePath(path: string): string {
  // 移除末尾斜杠（除了根路径）
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 确保以斜杠开头
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  return path;
}

/**
 * 生成重定向日志
 */
export function logRedirect(from: string, to: string, status?: number): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] REDIRECT ${status || 302}: ${from} -> ${to}`);
}