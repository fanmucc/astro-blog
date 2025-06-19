# 📚 Astro 技术博客

一个基于 Astro 构建的现代化技术博客，支持多语言内容管理、响应式设计和高性能主题切换动画。

## ✨ 特性

- 🚀 **高性能**: 基于 Astro 静态站点生成，极速加载
- 📱 **响应式设计**: 完美适配桌面、平板和移动端
- 🌙 **主题切换**: 支持明暗主题，带有流畅的扇形切换动画
- 📖 **内容管理**: 基于文件系统的内容管理，支持 Markdown
- 🔍 **搜索功能**: 内置全文搜索
- 📚 **多级菜单**: 智能的侧边栏导航系统
- ⚡ **客户端路由**: 无刷新页面切换
- 🎨 **现代 UI**: 使用 Tailwind CSS 构建的现代界面

## 🏗️ 项目结构

```
astro-blog/
├── public/                     # 静态资源目录
│   ├── favicon.svg             # 网站图标
│   ├── vercel.json            # Vercel 部署配置
│   └── _redirects             # 重定向规则
├── scripts/                    # 构建脚本
│   ├── create-main-menu.js    # 主菜单生成脚本
│   └── create-submenu.js      # 子菜单生成脚本
├── src/
│   ├── components/            # 组件目录
│   │   ├── Header.astro       # 头部导航组件
│   │   ├── Icon.astro         # 图标组件
│   │   └── Sidebar.astro      # 侧边栏组件
│   ├── content/               # 内容目录
│   │   ├── authors/           # 作者信息
│   │   │   └── index.json     # 作者数据
│   │   ├── config/            # 配置文件
│   │   │   └── site.json      # 站点配置
│   │   ├── config.ts          # 内容集合配置
│   │   └── pages/             # 页面内容
│   │       ├── home/          # 首页内容
│   │       ├── react/         # React 相关文章
│   │       ├── rust/          # Rust 相关文章
│   │       └── vue/           # Vue 相关文章
│   ├── layouts/               # 布局模板
│   │   └── Layout.astro       # 主布局模板
│   ├── pages/                 # 路由页面
│   │   ├── [...path].astro    # 动态路由处理
│   │   ├── index.astro        # 首页
│   │   └── api/               # API 端点
│   │       └── search.js      # 搜索 API
│   ├── styles/                # 样式文件
│   │   ├── global.css         # 全局样式和主题变量
│   │   └── markdown.css       # Markdown 内容样式
│   └── utils/                 # 工具函数
│       ├── menu.ts            # 菜单构建工具
│       ├── redirects.ts       # 重定向处理
│       └── remarkReadingTime.js # 阅读时间计算
├── astro.config.mjs           # Astro 配置文件
├── package.json               # 项目依赖和脚本
├── pnpm-lock.yaml            # 依赖锁定文件
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 项目说明文档
```

## 📁 核心文件说明

### 🧩 组件 (`src/components/`)

#### `Header.astro`

- **功能**: 网站顶部导航栏
- **特性**:
  - Logo 和站点标题
  - 主题切换按钮（支持高性能动画）
  - 移动端汉堡菜单
  - GitHub 外部链接
  - 搜索框（可配置显示/隐藏）
- **移动端**: 自适应布局，汉堡菜单控制侧边栏

#### `Sidebar.astro`

- **功能**: 侧边栏导航菜单
- **特性**:
  - 主菜单和子菜单渲染
  - 当前页面高亮
  - 可展开/收起的子菜单
  - 客户端路由支持
- **移动端**: 滑入/滑出动画，遮罩层交互

#### `Icon.astro`

- **功能**: 统一的图标组件
- **用途**: 提供一致的图标显示

### 🎨 样式 (`src/styles/`)

#### `global.css`

- **功能**: 全局样式系统
- **包含**:
  - CSS 变量主题系统（明暗模式）
  - 响应式断点定义
  - 组件基础样式
  - 移动端适配
  - 主题切换动画
  - 性能优化样式

#### `markdown.css`

- **功能**: Markdown 内容样式
- **特性**:
  - 文章标题样式（H1-H6）
  - 代码块和内联代码（支持主题色）
  - 表格、列表、引用块
  - 主题化提示框（tip、success、warning、error）
  - 图片和链接样式
  - 移动端优化

### 🏠 布局 (`src/layouts/`)

#### `Layout.astro`

- **功能**: 主布局模板
- **特性**:
  - 页面结构定义
  - 头部和侧边栏组件集成
  - 客户端路由管理
  - 面包屑导航
  - 页面加载状态
  - 返回顶部按钮

### 📄 页面 (`src/pages/`)

#### `index.astro`

- **功能**: 网站首页
- **特性**: 欢迎内容、快速导航

#### `[...path].astro`

- **功能**: 动态路由处理器
- **特性**:
  - 处理所有内容页面路由
  - 自动生成面包屑
  - 文章目录（TOC）生成
  - SEO 元数据
  - 阅读时间计算

#### `api/search.js`

- **功能**: 搜索 API 端点
- **特性**: 全文搜索功能

### 🛠️ 工具 (`src/utils/`)

#### `menu.ts`

- **功能**: 菜单构建系统
- **特性**:
  - 从文件系统自动生成菜单
  - 支持多级菜单结构
  - 排序和分组逻辑
  - TypeScript 类型定义

#### `redirects.ts`

- **功能**: 重定向处理
- **特性**: URL 重定向和规范化

#### `remarkReadingTime.js`

- **功能**: 阅读时间计算
- **特性**: 基于内容长度估算阅读时间

### 📝 内容 (`src/content/`)

#### `config.ts`

- **功能**: 内容集合配置
- **定义**: 页面和作者的数据模式

#### `config/site.json`

- **功能**: 站点全局配置
- **包含**: 站点标题、描述、菜单配置等

#### `pages/`

- **功能**: 文章内容目录
- **结构**: 按技术分类组织的 Markdown 文件

### ⚙️ 配置文件

#### `astro.config.mjs`

- **功能**: Astro 主配置
- **包含**: 插件配置、构建设置、集成配置

#### `package.json`

- **功能**: 项目依赖和脚本定义
- **脚本**:
  - `dev`: 开发服务器
  - `build`: 生产构建
  - `preview`: 预览构建结果

#### `tsconfig.json`

- **功能**: TypeScript 配置
- **特性**: 类型检查和编译选项

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm

### 安装和运行

```bash
# 克隆项目
git clone <repository-url>
cd astro-blog

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

### 开发服务器

启动后访问 `http://localhost:4321`

## 📝 内容管理

### 添加新文章

1. 在 `src/content/pages/` 下创建对应分类目录
2. 添加 Markdown 文件
3. 在文件头部添加 frontmatter：

```yaml
---
title: "文章标题"
description: "文章描述"
showInMenu: true
sort: 1
---
```

### 菜单配置

菜单根据文件系统结构自动生成：

- 文件夹 = 主菜单项
- `index.md` = 默认页面
- 其他 `.md` 文件 = 子菜单项

## 🎨 Markdown 扩展功能

### 主题化提示框

系统支持自动转换的主题化提示框，让文档更直观易读：

#### 使用方法

```markdown
**tip:** 这是一个重要的提示信息
**success:** 操作已成功完成
**warning:** 请注意这个重要提醒
**error:** 操作失败，请检查输入
```

#### 支持的主题类型

| 类型 | 关键词 | 图标 | 主题色 | 说明 |
|------|--------|------|--------|------|
| **信息提示** | `tip:`、`tips:`、`提示：` | 💡 | 蓝色 | 一般性提示和建议 |
| **成功状态** | `success:`、`ok:`、`成功：` | ✅ | 绿色 | 成功操作或正确信息 |
| **警告注意** | `warning:`、`warn:`、`警告：`、`注意：` | ⚠️ | 橙色 | 需要特别注意的内容 |
| **错误危险** | `error:`、`danger:`、`错误：`、`失败：` | ❌ | 红色 | 错误信息或危险操作 |

#### 特性

- ✅ **自动识别**: 写入后自动转换为主题化 blockquote
- ✅ **多语言支持**: 支持中英文关键词
- ✅ **暗色模式**: 自动适配明暗主题
- ✅ **响应式设计**: 移动端完美适配

#### 效果展示

- **信息提示**: 蓝色边框 + 💡 图标
- **成功状态**: 绿色边框 + ✅ 图标  
- **警告注意**: 橙色边框 + ⚠️ 图标
- **错误危险**: 红色边框 + ❌ 图标

### 代码主题色

内联代码支持主题色显示：

```markdown
`普通代码` (默认主题色)
<code data-theme="success">成功代码</code>
<code data-theme="warning">警告代码</code>
<code data-theme="error">错误代码</code>
<code data-theme="info">信息代码</code>
```

或使用符号前缀自动识别：

```markdown
`✓ 成功代码`
`✗ 错误代码`
`⚠ 警告代码`
`ℹ 信息代码`
```

## 🎨 主题系统

### 主题变量

主题系统基于 CSS 变量，支持：

- 自动明暗模式检测
- 本地存储主题偏好
- 流畅的主题切换动画

### 自定义主题

在 `src/styles/global.css` 中修改 CSS 变量：

```css
:root {
	--color-primary: 251 146 60; /* 主色调 */
	--g-bg: #ffffff; /* 背景色 */
	--g-text-primary: #171717; /* 主文字色 */
	/* ... 更多变量 */
}
```

## 📱 响应式设计

### 断点定义

- **移动端**: `max-width: 768px`
- **小屏**: `max-width: 480px`
- **平板**: `769px - 1024px`
- **桌面**: `min-width: 1280px`

### 移动端特性

- 汉堡菜单导航
- 滑动侧边栏
- 触摸优化
- 性能优化动画

## 🔧 自定义配置

### 站点配置

编辑 `src/content/config/site.json`：

```json
{
	"title": "站点标题",
	"description": "站点描述",
	"menuConfig": {
		"showMainMenu": true,
		"showSubMenu": true
	}
}
```

### 组件配置

在布局中配置组件显示：

```astro
<Header
  showSearch={true}
  showThemeToggle={true}
/>
<Sidebar
  menuTree={menuTree}
  currentPath={currentPath}
/>
```

## 🚀 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 自动检测为 Astro 项目
3. 使用默认构建设置部署

### 其他平台

- **Netlify**: 支持自动部署
- **GitHub Pages**: 需要配置 GitHub Actions
- **传统主机**: 构建后上传 `dist/` 目录

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🆘 支持

如有问题，请创建 Issue 或联系项目维护者。

---

🌟 **如果这个项目对你有帮助，请给个 Star！**
