import { getCollection } from "astro:content";

export async function GET({ request }) {
	const url = new URL(request.url);
	const path = url.searchParams.get("path");

	if (!path) {
		return new Response(JSON.stringify({ error: "缺少路径参数" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		// 获取所有发布的页面
		const pages = await getCollection("pages", ({ data }) => {
			return data.published && !data.draft;
		});

		// 构建slug路径
		let targetSlug;
		if (path === "/") {
			targetSlug = "home/index";
		} else {
			// 移除开头的斜杠并添加index如果是目录路径
			const cleanPath = path.replace(/^\//, "").replace(/\/$/, "");
			const pathParts = cleanPath.split("/");

			// 尝试找到对应的页面
			targetSlug = cleanPath + "/index";

			// 如果没找到index页面，尝试直接匹配
			let targetPage = pages.find((page) => page.slug === targetSlug);
			if (!targetPage) {
				targetSlug = cleanPath;
				targetPage = pages.find((page) => page.slug === targetSlug);
			}

			if (!targetPage) {
				return new Response(JSON.stringify({ error: "页面不存在" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// 查找页面
		const page = pages.find((page) => page.slug === targetSlug);

		if (!page) {
			return new Response(JSON.stringify({ error: "页面不存在" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// 渲染页面内容
		const { Content } = await page.render();

		// 由于我们在服务器端，需要将Content组件转换为HTML字符串
		// 这里我们返回页面的元数据，让前端处理渲染
		const response = {
			title: page.data.title,
			description: page.data.description,
			author: page.data.author,
			createdAt: page.data.createdAt,
			updatedAt: page.data.updatedDate,
			readingTime: page.data.readingTime,
			wordCount: page.data.wordCount,
			tags: page.data.tags,
			// 注意：这里我们不能直接返回渲染的内容，需要其他方式处理
			// 可以考虑使用服务器端渲染或者预渲染静态页面
			slug: page.slug,
			path: path,
		};

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("获取页面出错:", error);
		return new Response(JSON.stringify({ error: "服务器错误" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
