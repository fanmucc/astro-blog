import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

/**
 * Remark 插件：计算阅读时间
 * 自动计算 Markdown 内容的阅读时间并添加到 frontmatter
 */
export function remarkReadingTime() {
	return function (tree, { data }) {
		const textOnPage = toString(tree);
		const readingTime = getReadingTime(textOnPage);

		// 添加阅读时间到数据中
		data.astro.frontmatter.readingTime = Math.ceil(readingTime.minutes);
		data.astro.frontmatter.readingTimeText = readingTime.text;
		data.astro.frontmatter.wordCount = readingTime.words;
	};
}

/**
 * 手动计算阅读时间（用于客户端）
 */
export function calculateReadingTime(text, wordsPerMinute = 200) {
	// 移除 Markdown 语法
	const cleanText = text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 链接
		.replace(/[#*`~_]/g, "") // 标记符号
		.replace(/```[\s\S]*?```/g, "") // 代码块
		.replace(/`[^`]+`/g, "") // 行内代码
		.trim();

	// 计算中文字符和英文单词
	const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length;
	const englishWords = cleanText
		.replace(/[\u4e00-\u9fff]/g, "") // 移除中文字符
		.split(/\s+/)
		.filter((word) => word.length > 0).length;

	// 中文按字符计算，英文按单词计算
	// 中文阅读速度约为 300-500 字/分钟，英文约为 200-250 词/分钟
	const totalMinutes = chineseChars / 400 + englishWords / wordsPerMinute;

	return {
		minutes: Math.max(1, Math.ceil(totalMinutes)),
		words: chineseChars + englishWords,
		text: `${Math.max(1, Math.ceil(totalMinutes))} 分钟阅读`,
	};
}
