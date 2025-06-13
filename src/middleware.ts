// src/middleware.js - Astro 中间件用于处理重定向

import { defineMiddleware } from "astro:middleware";

// 重定向配置
const redirectConfig = {
  // 根路径重定向到首页
  "/": "/home",

  // 可以添加更多重定向规则
  // "/blog": "/react",
  // "/docs": "/react/开始学习",
  // "/tutorial": "/react/开始学习/environment-setup",
};

// 临时重定向配置（302）
const temporaryRedirects = new Set([
  "/",
  // 在这里添加需要临时重定向的路径
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect } = context;
  const pathname = url.pathname;

  console.log("中间件: 检查路径重定向:", pathname);

  // 检查是否需要重定向
  if (redirectConfig[pathname as keyof typeof redirectConfig]) {
    const targetPath = redirectConfig[pathname as keyof typeof redirectConfig];
    console.log(`中间件: 重定向 ${pathname} -> ${targetPath}`);

    // 判断是永久重定向还是临时重定向
    const isTemporary = temporaryRedirects.has(pathname);
    const statusCode = isTemporary ? 302 : 301;

    return redirect(targetPath, statusCode);
  }

  // 特殊处理：如果访问的是无效路径，重定向到首页
  if (pathname !== "/" && !pathname.startsWith("/api/") && !pathname.startsWith("/_")) {
    // 检查路径是否存在对应的页面
    try {
      // 这里可以添加更复杂的路径检查逻辑
      // 暂时让请求正常进行，如果页面不存在会在后续处理中显示404
    } catch (error) {
      console.log("中间件: 路径不存在，重定向到首页:", pathname);
      return redirect("/home", 302);
    }
  }

  // 继续正常处理请求
  return next();
});