// 优化后的 src/utils/menu.ts 文件
import { getCollection, type CollectionEntry } from 'astro:content';

export type PageEntry = CollectionEntry<'pages'>;

// 菜单项接口
export interface MenuItem {
  label: string;
  value: string;
  path: string;
  icon?: string;
  order: number;
  children?: MenuItem[];
  hasIndex: boolean;
  indexContent?: PageEntry;
  pageSlug?: string;
}

// 主菜单配置接口
export interface MainMenuConfig {
  label: string;
  value: string;
  icon?: string;
  order: number;
}

/**
 * 获取主菜单配置
 */
export async function getMainMenuConfig(): Promise<MainMenuConfig[]> {
  try {
    const configCollection = await getCollection('config');
    const siteConfig = configCollection.find(entry => entry.id === 'site');

    if (siteConfig?.data.mainMenu) {
      return siteConfig.data.mainMenu.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.log("无法加载配置文件，使用默认主菜单配置");
  }

  // 默认主菜单配置
  return [
    { label: '首页', value: 'home', icon: 'home', order: 1 },
    { label: 'React', value: 'react', icon: 'react', order: 2 },
    { label: 'Vue', value: 'vue', icon: 'vue', order: 3 },
    { label: 'Next.js', value: 'next', icon: 'next', order: 4 },
  ];
}

/**
 * 获取所有发布的页面
 */
export async function getAllPublishedPages(): Promise<PageEntry[]> {
  const pages = await getCollection('pages', ({ data }) => {
    return data.published && !data.draft;
  });

  return pages.sort((a, b) => a.data.order - b.data.order);
}

/**
 * 根据路径获取页面内容
 */
export async function getPageByPath(pagePath: string): Promise<PageEntry | null> {
  const pages = await getAllPublishedPages();
  return pages.find(page => page.slug === pagePath) || null;
}

/**
 * 根据路径查找菜单项
 */
export function findMenuItemByPath(menuTree: MenuItem[], targetPath: string): MenuItem | null {
  function searchMenu(items: MenuItem[]): MenuItem | null {
    for (const item of items) {
      if (item.path === targetPath) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = searchMenu(item.children);
        if (found) return found;
      }
    }
    return null;
  }
  return searchMenu(menuTree);
}

/**
 * 构建完整的菜单树
 */
export async function buildMenuTree(): Promise<MenuItem[]> {
  const mainMenuConfig = await getMainMenuConfig();
  const allPages = await getAllPublishedPages();

  console.log("构建菜单树 - 总页面数:", allPages.length);

  const menuTree: MenuItem[] = [];

  for (const mainConfig of mainMenuConfig) {
    const menuItem: MenuItem = {
      label: mainConfig.label,
      value: mainConfig.value,
      path: `/${mainConfig.value}`,
      icon: mainConfig.icon,
      order: mainConfig.order,
      children: [],
      hasIndex: false,
    };

    // 查找该主菜单对应的所有页面
    const menuPages = allPages.filter(page => {
      const pathParts = page.slug.split('/');
      return pathParts[0] === mainConfig.value;
    });

    console.log(`主菜单 ${mainConfig.value} 的页面:`, menuPages.map(p => p.slug));

    // 检查是否有主菜单的 index 页面 (如 home/index.md)
    const mainIndexPage = menuPages.find(page => {
      const pathParts = page.slug.split('/');
      return pathParts.length === 2 && pathParts[1] === 'index';
    });

    if (mainIndexPage) {
      menuItem.hasIndex = true;
      menuItem.indexContent = mainIndexPage;
      menuItem.pageSlug = mainIndexPage.slug;
      console.log(`主菜单 ${mainConfig.value} 有 index 页面:`, mainIndexPage.slug);
    }

    // 构建子菜单结构
    const subMenus = new Map<string, MenuItem>();

    menuPages.forEach(page => {
      const pathParts = page.slug.split('/');

      // 跳过主菜单的 index 页面
      if (pathParts.length === 2 && pathParts[1] === 'index') {
        return;
      }

      if (pathParts.length === 2) {
        // 二级结构处理：react/demo.md - 直接的一级目录文件
        const fileName = pathParts[1]; // "demo"

        if (page.data.showInMenu) {
          const pageName = page.data.pageName || fileName;
          const directItem: MenuItem = {
            label: page.data.menuLabel || page.data.title,
            value: pageName,
            path: `/${pathParts[0]}/${pageName}`,
            order: page.data.order,
            children: [],
            hasIndex: false,
            pageSlug: page.slug,
          };

          // 直接添加到主菜单的子菜单中
          if (!subMenus.has(pageName)) {
            subMenus.set(pageName, directItem);
          }
        }
      } else if (pathParts.length === 3) {
        // 三级结构处理：react/开始学习/index.md 或 react/开始学习/环境搭建.md
        const subMenuKey = pathParts[1]; // "开始学习"
        const fileName = pathParts[2]; // "index" 或 "环境搭建"
        const isIndex = fileName === 'index';

        // 创建或获取子菜单分组
        if (!subMenus.has(subMenuKey)) {
          const subMenuItem: MenuItem = {
            label: subMenuKey,
            value: subMenuKey,
            path: `/${pathParts[0]}/${subMenuKey}`,
            order: 999, // 默认值，会在找到 index 页面时更新
            children: [],
            hasIndex: false,
          };
          subMenus.set(subMenuKey, subMenuItem);
        }

        const subMenuItem = subMenus.get(subMenuKey)!;

        if (isIndex) {
          // 子菜单的 index 页面
          subMenuItem.hasIndex = true;
          subMenuItem.indexContent = page;
          subMenuItem.label = page.data.menuLabel || page.data.title;
          subMenuItem.order = page.data.order; // 使用 index.md 的 order
          subMenuItem.pageSlug = page.slug;
        } else {
          // 子菜单下的具体页面
          if (page.data.showInMenu) {
            const pageName = page.data.pageName || fileName;
            const childItem: MenuItem = {
              label: page.data.menuLabel || page.data.title,
              value: pageName,
              path: `/${pathParts[0]}/${subMenuKey}/${pageName}`,
              order: page.data.order,
              children: [],
              hasIndex: false,
              pageSlug: page.slug,
            };

            subMenuItem.children!.push(childItem);
          }
        }
      }
    });

    // 排序并添加子菜单
    menuItem.children = Array.from(subMenus.values())
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        ...item,
        children: item.children?.sort((a, b) => a.order - b.order) || []
      }));

    menuTree.push(menuItem);
  }

  return menuTree.sort((a, b) => a.order - b.order);
}