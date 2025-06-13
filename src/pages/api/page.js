// 修改 src/pages/api/page.js
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
		const pages = await getCollection("pages", ({ data }) => {
			return data.published && !data.draft;
		});

		let targetSlug;
		if (path === "/") {
			targetSlug = "home/index";
		} else {
			const cleanPath = path.replace(/^\//, "").replace(/\/$/, "");

			// 尝试多种可能的路径
			const possibleSlugs = [
				cleanPath + "/index",
				cleanPath,
				cleanPath.replace(/\/$/, "") + "/index",
			];

			let targetPage = null;
			for (const slug of possibleSlugs) {
				targetPage = pages.find((page) => page.slug === slug);
				if (targetPage) {
					targetSlug = slug;
					break;
				}
			}

			if (!targetPage) {
				return new Response(JSON.stringify({ error: "页面不存在" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		const page = pages.find((page) => page.slug === targetSlug);
		if (!page) {
			return new Response(JSON.stringify({ error: "页面不存在" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// 渲染页面内容为 HTML
		const { Content, headings } = await page.render();

		// 由于 Astro 组件无法直接转为字符串，我们返回原始内容
		const response = {
			title: page.data.title,
			description: page.data.description,
			author: page.data.author,
			createdAt: page.data.createdAt,
			updatedAt: page.data.updatedDate,
			readingTime: page.data.readingTime,
			wordCount: page.data.wordCount,
			tags: page.data.tags,
			body: page.body, // 返回 Markdown 原始内容
			slug: page.slug,
			path: path,
		};

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("获取页面出错:", error);
		return new Response(
			JSON.stringify({ error: "服务器错误: " + error.message }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
