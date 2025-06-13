import { getCollection } from "astro:content";

export async function GET({ request }) {
	const url = new URL(request.url);
	const query = url.searchParams.get("q");

	if (!query || query.trim().length === 0) {
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		// 获取所有发布的页面
		const pages = await getCollection("pages", ({ data }) => {
			return data.published && !data.draft && data.showInMenu;
		});

		// 搜索逻辑
		const searchTerms = query
			.toLowerCase()
			.split(/\s+/)
			.filter((term) => term.length > 0);

		const searchResults = pages.filter((page) => {
			const searchContent = [
				page.data.title,
				page.data.description || "",
				page.data.tags.join(" "),
				page.data.author,
				page.slug.replace(/\//g, " "),
			]
				.join(" ")
				.toLowerCase();

			// 检查是否包含所有搜索词
			return searchTerms.every((term) => searchContent.includes(term));
		});

		// 按相关性排序（简单的评分系统）
		const scoredResults = searchResults.map((page) => {
			let score = 0;
			const title = page.data.title.toLowerCase();
			const description = (page.data.description || "").toLowerCase();

			searchTerms.forEach((term) => {
				// 标题匹配得分更高
				if (title.includes(term)) {
					score += title === term ? 10 : 5;
				}
				// 描述匹配
				if (description.includes(term)) {
					score += 2;
				}
				// 标签匹配
				if (page.data.tags.some((tag) => tag.toLowerCase().includes(term))) {
					score += 3;
				}
			});

			return { page, score };
		});

		// 按分数排序，取前20个结果
		const sortedResults = scoredResults
			.sort((a, b) => b.score - a.score)
			.slice(0, 20)
			.map(({ page }) => {
				// 构建页面路径
				const pathParts = page.slug.split("/");
				let path;

				if (pathParts.length === 2 && pathParts[1] === "index") {
					// 主菜单的index页面
					path = `/${pathParts[0]}`;
				} else if (pathParts.length === 3 && pathParts[2] === "index") {
					// 子菜单的index页面
					path = `/${pathParts[0]}/${pathParts[1]}`;
				} else {
					// 普通页面
					path = `/${page.slug}`;
				}

				return {
					title: page.data.title,
					description: page.data.description,
					author: page.data.author,
					createdAt: page.data.createdAt,
					tags: page.data.tags,
					path: path,
					slug: page.slug,
				};
			});

		return new Response(JSON.stringify(sortedResults), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("搜索出错:", error);
		return new Response(JSON.stringify({ error: "搜索失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
