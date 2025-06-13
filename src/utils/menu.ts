import { getCollection, type CollectionEntry } from 'astro:content';
import path from 'path';

export type PageEntry = CollectionEntry<'pages'>;
export type ConfigEntry = CollectionEntry<'config'>;

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
  const configCollection = await getCollection('config');
  const siteConfig = configCollection.find((entry: ConfigEntry) => entry.id === 'site');

  if (!siteConfig?.data.mainMenu) {
    // 默认主菜单配置
    return [
      { label: '首页', value: 'home', icon: 'home', order: 1 },
      { label: 'React', value: 'react', icon: 'react', order: 2 },
      { label: 'Vue', value: 'vue', icon: 'vue', order: 3 },
      { label: 'Next.js', value: 'next', icon: 'next', order: 4 },
    ];
  }

  return siteConfig.data.mainMenu.sort((a: MainMenuConfig, b: MainMenuConfig) => a.order - b.order);
}

/**
 * 获取所有发布的页面
 */
export async function getAllPublishedPages(): Promise<PageEntry[]> {
  const pages = await getCollection('pages', ({ data }: { data: PageEntry['data'] }) => {
    return data.published && !data.draft;
  });

  return pages.sort((a: PageEntry, b: PageEntry) => a.data.order - b.data.order);
}

/**
 * 根据路径获取页面内容
 */
export async function getPageByPath(pagePath: string): Promise<PageEntry | null> {
  const pages = await getAllPublishedPages();
  return pages.find(page => page.slug === pagePath) || null;
}

/**
 * 构建菜单树结构
 */
export async function buildMenuTree(): Promise<MenuItem[]> {
  const mainMenuConfig = await getMainMenuConfig();
  const allPages = await getAllPublishedPages();

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

    // 检查是否有index页面
    const indexPage = menuPages.find(page => {
      const pathParts = page.slug.split('/');
      return pathParts.length === 2 && pathParts[1] === 'index';
    });

    if (indexPage) {
      menuItem.hasIndex = true;
      menuItem.indexContent = indexPage;
    }

    // 构建子菜单
    const subMenus = new Map<string, MenuItem>();

    menuPages.forEach(page => {
      const pathParts = page.slug.split('/');

      if (pathParts.length === 2 && pathParts[1] === 'index') {
        // 跳过index页面，已经处理过了
        return;
      }

      if (pathParts.length === 2) {
        // 二级页面（直接子页面）
        const subMenuItem: MenuItem = {
          label: page.data.menuLabel || page.data.title,
          value: pathParts[1],
          path: `/${page.slug}`,
          order: page.data.order,
          children: [],
          hasIndex: false,
        };

        if (page.data.showInMenu) {
          subMenus.set(pathParts[1], subMenuItem);
        }
      } else if (pathParts.length === 3) {
        // 三级页面（子菜单的子页面）
        const parentKey = pathParts[1];
        const isIndex = pathParts[2] === 'index';

        if (!subMenus.has(parentKey)) {
          // 创建父级菜单项
          const parentMenuItem: MenuItem = {
            label: parentKey.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            value: parentKey,
            path: `/${pathParts[0]}/${parentKey}`,
            order: 999, // 默认排序
            children: [],
            hasIndex: false,
          };
          subMenus.set(parentKey, parentMenuItem);
        }

        const parentItem = subMenus.get(parentKey)!;

        if (isIndex) {
          // 这是父级的index页面
          parentItem.hasIndex = true;
          parentItem.indexContent = page;
          parentItem.label = page.data.menuLabel || page.data.title;
          parentItem.order = page.data.order;
        } else {
          // 这是子页面
          if (page.data.showInMenu) {
            const childItem: MenuItem = {
              label: page.data.menuLabel || page.data.title,
              value: pathParts[2],
              path: `/${page.slug}`,
              order: page.data.order,
              children: [],
              hasIndex: false,
            };
            parentItem.children!.push(childItem);
          }
        }
      }
    });

    // 将子菜单添加到主菜单项
    menuItem.children = Array.from(subMenus.values())
      .sort((a: MenuItem, b: MenuItem) => a.order - b.order)
      .map((item: MenuItem) => ({
        ...item,
        children: item.children?.sort((a: MenuItem, b: MenuItem) => a.order - b.order) || []
      }));

    menuTree.push(menuItem);
  }

  return menuTree.sort((a, b) => a.order - b.order);
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
 * 获取当前路径的面包屑导航
 */
export function getBreadcrumbs(menuTree: MenuItem[], currentPath: string): MenuItem[] {
  const breadcrumbs: MenuItem[] = [];

  function findPath(items: MenuItem[], path: string, currentBreadcrumbs: MenuItem[]): boolean {
    for (const item of items) {
      const newBreadcrumbs = [...currentBreadcrumbs, item];

      if (item.path === path) {
        breadcrumbs.push(...newBreadcrumbs);
        return true;
      }

      if (item.children && item.children.length > 0) {
        if (findPath(item.children, path, newBreadcrumbs)) {
          return true;
        }
      }
    }
    return false;
  }

  findPath(menuTree, currentPath, []);
  return breadcrumbs;
}

/**
 * 获取菜单的展开状态
 */
export function getExpandedMenus(menuTree: MenuItem[], currentPath: string): Set<string> {
  const expandedMenus = new Set<string>();

  function markExpanded(items: MenuItem[], path: string): boolean {
    for (const item of items) {
      if (item.path === path) {
        return true;
      }

      if (item.children && item.children.length > 0) {
        if (markExpanded(item.children, path)) {
          expandedMenus.add(item.value);
          return true;
        }
      }
    }
    return false;
  }

  markExpanded(menuTree, currentPath);
  return expandedMenus;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, locale: string = 'zh-CN'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 生成页面 slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 检查路径是否激活
 */
export function isPathActive(currentPath: string, menuPath: string): boolean {
  if (currentPath === menuPath) return true;

  // 检查是否是子路径
  const normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
  const normalizedMenu = menuPath.replace(/\/$/, '') || '/';

  return normalizedCurrent.startsWith(normalizedMenu + '/');
}

/**
 * 获取相邻页面（上一页/下一页）
 */
export function getAdjacentPages(menuTree: MenuItem[], currentPath: string): {
  prev: MenuItem | null;
  next: MenuItem | null;
} {
  const flatPages: MenuItem[] = [];

  function flattenMenu(items: MenuItem[]) {
    for (const item of items) {
      if (item.hasIndex || !item.children?.length) {
        flatPages.push(item);
      }
      if (item.children && item.children.length > 0) {
        flattenMenu(item.children);
      }
    }
  }

  flattenMenu(menuTree);

  const currentIndex = flatPages.findIndex(page => page.path === currentPath);

  return {
    prev: currentIndex > 0 ? flatPages[currentIndex - 1] : null,
    next: currentIndex < flatPages.length - 1 ? flatPages[currentIndex + 1] : null,
  };
}