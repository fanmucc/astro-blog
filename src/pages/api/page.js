// 修复后的 src/pages/api/page.js

import { getCollection } from "astro:content";
import { buildMenuTree, findMenuItemByPath } from "../../utils/menu.ts";

export async function GET({ request }) {
	const url = new URL(request.url);
	const path = url.searchParams.get("path");

	console.log("API: 收到原始路径:", path);

	// 解码 URL 中的中文字符
	const decodedPath = path ? decodeURIComponent(path) : null;
	console.log("API: 解码后路径:", decodedPath);

	if (!decodedPath) {
		return new Response(
			JSON.stringify({
				error: "缺少路径参数",
				receivedPath: path,
				decodedPath: decodedPath,
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	try {
		console.log("API: 开始构建菜单树...");

		// 获取菜单树
		const menuTree = await buildMenuTree();
		console.log("API: 菜单树构建完成");

		// 根据解码后的路径查找对应的菜单项
		let menuItem = findMenuItemByPath(menuTree, decodedPath);
		console.log(
			"API: 查找到的菜单项:",
			menuItem
				? {
						label: menuItem.label,
						path: menuItem.path,
						pageSlug: menuItem.pageSlug,
						hasIndex: menuItem.hasIndex,
				  }
				: null
		);

		// 如果没找到，尝试直接通过文件路径查找
		if (!menuItem) {
			console.log("API: 通过菜单路径未找到，尝试直接文件查找...");

			// 从路径中提取信息：/react/开始学习/environment-setup
			const pathParts = decodedPath.split("/").filter((p) => p);
			console.log("API: 路径分段:", pathParts);

			if (pathParts.length >= 3) {
				const [mainMenu, subMenu, pageName] = pathParts;
				console.log(
					"API: 解析出 - 主菜单:",
					mainMenu,
					"子菜单:",
					subMenu,
					"页面名:",
					pageName
				);

				// 获取所有页面，尝试根据文件结构匹配
				const pages = await getCollection("pages", ({ data }) => {
					return data.published && !data.draft;
				});

				console.log("API: 开始遍历页面寻找匹配...");
				console.log(
					"API: 所有页面 slugs:",
					pages.map((p) => p.slug)
				);

				// 查找匹配的页面
				let targetPage = null;

				for (const page of pages) {
					const pagePathParts = page.slug.split("/");
					console.log("API: 检查页面:", {
						slug: page.slug,
						pathParts: pagePathParts,
						title: page.data.title,
						pageName: page.data.pageName,
					});

					// 检查是否是目标页面
					// 文件结构：react/开始学习/环境搭建.md
					// 请求路径：/react/开始学习/environment-setup
					if (
						pagePathParts.length === 3 &&
						pagePathParts[0] === mainMenu &&
						pagePathParts[1] === subMenu
					) {
						const pageFileName = pagePathParts[2]; // "环境搭建"
						const configuredPageName = page.data.pageName; // "environment-setup"

						console.log(
							"API: 比较 - 请求的页面名:",
							pageName,
							"文件名:",
							pageFileName,
							"配置的pageName:",
							configuredPageName
						);

						// 匹配 pageName 或文件名
						if (configuredPageName === pageName || pageFileName === pageName) {
							targetPage = page;
							console.log("API: 找到匹配页面:", page.slug);
							break;
						}
					}
				}

				if (targetPage) {
					console.log("API: 通过直接查找找到页面:", targetPage.slug);

					const response = {
						title: targetPage.data.title,
						description: targetPage.data.description,
						author: targetPage.data.author,
						createdAt: targetPage.data.createdAt,
						updatedAt: targetPage.data.updatedAt,
						readingTime: targetPage.data.readingTime,
						wordCount: targetPage.data.wordCount,
						tags: targetPage.data.tags || [],
						body: targetPage.body,
						slug: targetPage.slug,
						pageName: targetPage.data.pageName,
						path: decodedPath,
						foundBy: "direct-file-search",
					};

					return new Response(JSON.stringify(response), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}
			} else if (pathParts.length === 2) {
				// 处理二级路径，如 /react/开始学习 (查找 index)
				const [mainMenu, subMenu] = pathParts;
				console.log("API: 查找二级路径的 index:", mainMenu, subMenu);

				const pages = await getCollection("pages", ({ data }) => {
					return data.published && !data.draft;
				});

				// 查找对应的 index 页面：react/开始学习/index.md
				const indexPage = pages.find((page) => {
					const parts = page.slug.split("/");
					return (
						parts.length === 3 &&
						parts[0] === mainMenu &&
						parts[1] === subMenu &&
						parts[2] === "index"
					);
				});

				if (indexPage) {
					console.log("API: 找到 index 页面:", indexPage.slug);

					const response = {
						title: indexPage.data.title,
						description: indexPage.data.description,
						author: indexPage.data.author,
						createdAt: indexPage.data.createdAt,
						updatedAt: indexPage.data.updatedAt,
						readingTime: indexPage.data.readingTime,
						wordCount: indexPage.data.wordCount,
						tags: indexPage.data.tags || [],
						body: indexPage.body,
						slug: indexPage.slug,
						path: decodedPath,
						foundBy: "index-page-search",
					};

					return new Response(JSON.stringify(response), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			// 调试信息：列出所有可用路径
			const allPaths = [];
			function collectPaths(items) {
				for (const item of items) {
					allPaths.push(item.path);
					if (item.children && item.children.length > 0) {
						collectPaths(item.children);
					}
				}
			}
			collectPaths(menuTree);

			console.log("API: 所有可用菜单路径:", allPaths);

			return new Response(
				JSON.stringify({
					error: "页面不存在",
					requestedPath: decodedPath,
					originalPath: path,
					availableMenuPaths: allPaths,
					pathParts: decodedPath.split("/").filter((p) => p),
				}),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// 通过菜单项找到了，使用菜单项的信息查找页面
		let targetSlug = null;

		if (menuItem.pageSlug) {
			targetSlug = menuItem.pageSlug;
			console.log("API: 使用菜单项的 pageSlug:", targetSlug);
		} else if (menuItem.indexContent) {
			targetSlug = menuItem.indexContent.slug;
			console.log("API: 使用 indexContent 的 slug:", targetSlug);
		} else {
			console.log("API: 菜单项没有关联的页面内容");
			return new Response(
				JSON.stringify({
					error: "页面内容不存在",
					menuItem: {
						label: menuItem.label,
						path: menuItem.path,
						hasIndex: menuItem.hasIndex,
					},
				}),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		console.log("API: 准备查找页面文件，slug:", targetSlug);

		// 获取所有页面
		const pages = await getCollection("pages", ({ data }) => {
			return data.published && !data.draft;
		});

		// 根据 slug 查找页面
		const targetPage = pages.find((page) => page.slug === targetSlug);

		if (!targetPage) {
			console.log("API: 未找到页面文件，目标 slug:", targetSlug);
			return new Response(
				JSON.stringify({
					error: "页面文件不存在",
					targetSlug: targetSlug,
					availableSlugs: pages.map((p) => p.slug),
				}),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		console.log("API: 成功找到页面:", {
			slug: targetPage.slug,
			title: targetPage.data.title,
			pageName: targetPage.data.pageName,
		});

		// 构建响应数据
		const response = {
			title: targetPage.data.title,
			description: targetPage.data.description,
			author: targetPage.data.author,
			createdAt: targetPage.data.createdAt,
			updatedAt: targetPage.data.updatedAt,
			readingTime: targetPage.data.readingTime,
			wordCount: targetPage.data.wordCount,
			tags: targetPage.data.tags || [],
			body: targetPage.body,
			slug: targetPage.slug,
			pageName: targetPage.data.pageName,
			path: decodedPath,
			foundBy: "menu-tree-search",
		};

		console.log("API: 返回页面数据，body 长度:", response.body?.length || 0);

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("API: 服务器错误:", error);
		console.error("API: 错误堆栈:", error.stack);
		return new Response(
			JSON.stringify({
				error: "服务器错误: " + error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
