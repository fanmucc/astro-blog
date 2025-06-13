// 完整的 src/utils/menu.ts 文件
import { getCollection, type CollectionEntry } from 'astro:content';

export type PageEntry = CollectionEntry<'pages'>;

// 菜单项接口 - 添加 pageSlug 字段
export interface MenuItem {
  label: string;
  value: string;
  path: string;
  icon?: string;
  order: number;
  children?: MenuItem[];
  hasIndex: boolean;
  indexContent?: PageEntry;
  pageSlug?: string; // 新增：原始文件 slug，用于查找文件
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
 * 获取主菜单配置
 */
export async function buildMenuTree(): Promise<MenuItem[]> {
  const mainMenuConfig = await getMainMenuConfig();
  const allPages = await getAllPublishedPages();

  console.log("构建菜单树 - 总页面数:", allPages.length);
  console.log("构建菜单树 - 所有页面:", allPages.map(p => ({
    slug: p.slug,
    title: p.data.title,
    pageName: p.data.pageName
  })));

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

    // 检查是否有主菜单的 index 页面 (如 react/index.md)
    const indexPage = menuPages.find(page => {
      const pathParts = page.slug.split('/');
      return pathParts.length === 2 && pathParts[1] === 'index';
    });

    if (indexPage) {
      menuItem.hasIndex = true;
      menuItem.indexContent = indexPage;
      menuItem.pageSlug = indexPage.slug;
      console.log(`主菜单 ${mainConfig.value} 有 index 页面:`, indexPage.slug);
    }

    // 构建子菜单 - 根据你的文件结构调整
    const subMenus = new Map<string, MenuItem>();

    menuPages.forEach(page => {
      const pathParts = page.slug.split('/');
      console.log(`处理页面: ${page.slug}, 路径分段:`, pathParts, `pageName: ${page.data.pageName}`);

      // 跳过主菜单的 index 页面
      if (pathParts.length === 2 && pathParts[1] === 'index') {
        return;
      }

      if (pathParts.length === 3) {
        // 这是三级结构：react/开始学习/index.md 或 react/开始学习/环境搭建.md
        const subMenuKey = pathParts[1]; // "开始学习"
        const fileName = pathParts[2]; // "index" 或 "环境搭建"
        const isIndex = fileName === 'index';

        console.log(`处理三级页面: subMenuKey=${subMenuKey}, fileName=${fileName}, isIndex=${isIndex}`);

        // 如果这个子菜单还不存在，创建它
        if (!subMenus.has(subMenuKey)) {
          const subMenuItem: MenuItem = {
            label: subMenuKey, // 临时使用目录名，如果有 index 会被覆盖
            value: subMenuKey,
            path: `/${pathParts[0]}/${subMenuKey}`,
            order: 999, // 默认排序，如果有 index 会被覆盖
            children: [],
            hasIndex: false,
          };
          subMenus.set(subMenuKey, subMenuItem);

          console.log(`创建子菜单分组:`, {
            label: subMenuItem.label,
            path: subMenuItem.path,
            value: subMenuItem.value
          });
        }

        const subMenuItem = subMenus.get(subMenuKey)!;

        if (isIndex) {
          // 这是子菜单的 index 页面 (如 react/开始学习/index.md)
          subMenuItem.hasIndex = true;
          subMenuItem.indexContent = page;
          subMenuItem.label = page.data.menuLabel || page.data.title;
          subMenuItem.order = page.data.order;
          subMenuItem.pageSlug = page.slug;

          console.log(`更新子菜单分组为 index:`, {
            label: subMenuItem.label,
            path: subMenuItem.path,
            pageSlug: subMenuItem.pageSlug
          });
        } else {
          // 这是子菜单下的具体页面 (如 react/开始学习/环境搭建.md)
          if (page.data.showInMenu) {
            const pageName = page.data.pageName || fileName;
            const childItem: MenuItem = {
              label: page.data.menuLabel || page.data.title,
              value: pageName,
              path: `/${pathParts[0]}/${subMenuKey}/${pageName}`,
              order: page.data.order,
              children: [],
              hasIndex: false,
              pageSlug: page.slug, // 保存原始 slug: "react/开始学习/环境搭建"
            };

            subMenuItem.children!.push(childItem);

            console.log(`创建子页面:`, {
              label: childItem.label,
              path: childItem.path, // /react/开始学习/environment-setup
              pageSlug: childItem.pageSlug, // react/开始学习/环境搭建
              pageName: pageName,
              originalFileName: fileName
            });
          }
        }
      }
    });

    // 将子菜单添加到主菜单项，并排序
    menuItem.children = Array.from(subMenus.values())
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        ...item,
        children: item.children?.sort((a, b) => a.order - b.order) || []
      }));

    console.log(`主菜单 ${mainConfig.value} 的最终子菜单:`, menuItem.children.map(child => ({
      label: child.label,
      path: child.path,
      pageSlug: child.pageSlug,
      hasIndex: child.hasIndex,
      hasChildren: child.children && child.children.length > 0,
      children: child.children?.map(grandChild => ({
        label: grandChild.label,
        path: grandChild.path,
        pageSlug: grandChild.pageSlug
      }))
    })));

    menuTree.push(menuItem);
  }

  return menuTree.sort((a, b) => a.order - b.order);
}