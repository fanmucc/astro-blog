#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建readline接口
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// 设置终端为原始模式
process.stdin.setRawMode?.(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

// 提示输入函数
function askQuestion(question) {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
}

// 交互式选择函数
function interactiveSelect(items, title) {
	return new Promise((resolve) => {
		let selectedIndex = 0;

		// 隐藏光标
		process.stdout.write("\x1B[?25l");

		function renderMenu() {
			// 清屏并移动到顶部
			console.clear();
			console.log(`🚀 Astro博客 - 创建子菜单脚本`);
			console.log("====================================");
			console.log(`\n${title}:`);
			console.log("(使用 ↑↓ 键选择，回车确认，Ctrl+C 退出)\n");

			items.forEach((item, index) => {
				if (index === selectedIndex) {
					// 高亮显示选中项
					console.log(`  → \x1b[36m${item}\x1b[0m`);
				} else {
					console.log(`    ${item}`);
				}
			});
		}

		function onKeyPress(key) {
			switch (key) {
				case "\u001b[A": // 上箭头
					selectedIndex =
						selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
					renderMenu();
					break;
				case "\u001b[B": // 下箭头
					selectedIndex =
						selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
					renderMenu();
					break;
				case "\r": // 回车
				case "\n":
					// 显示光标
					process.stdout.write("\x1B[?25h");
					process.stdin.removeListener("data", onKeyPress);
					resolve(selectedIndex);
					break;
				case "\u0003": // Ctrl+C
					console.log("\n\n👋 已取消操作");
					process.exit(0);
					break;
			}
		}

		// 初始渲染
		renderMenu();

		// 监听键盘输入
		process.stdin.on("data", onKeyPress);
	});
}

// 读取配置文件
function readConfig() {
	const configPath = path.join(__dirname, "../src/content/config/site.json");
	try {
		const configContent = fs.readFileSync(configPath, "utf8");
		return JSON.parse(configContent);
	} catch (error) {
		console.error("❌ 读取配置文件失败:", error.message);
		console.log("请确保 src/content/config/site.json 文件存在且格式正确");
		process.exit(1);
	}
}

// 获取主菜单文件夹列表
function getMainMenuFolders() {
	const pagesDir = path.join(__dirname, "../src/content/pages");
	if (!fs.existsSync(pagesDir)) {
		return [];
	}

	return fs
		.readdirSync(pagesDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);
}

// 获取子文件夹列表
function getSubFolders(mainMenuValue) {
	const mainMenuDir = path.join(
		__dirname,
		"../src/content/pages",
		mainMenuValue
	);
	if (!fs.existsSync(mainMenuDir)) {
		return [];
	}

	return fs
		.readdirSync(mainMenuDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);
}

// 生成文章默认内容
function generateArticleContent(title, mainMenuValue, subFolder = null) {
	const currentDate = new Date().toISOString().split("T")[0];
	const tags = [mainMenuValue.charAt(0).toUpperCase() + mainMenuValue.slice(1)];

	if (subFolder) {
		tags.push(subFolder);
	}

	return `---
title: "${title}"
description: "${title} - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: ${currentDate}
author: "Fanmu"
tags: ${JSON.stringify(tags)}
showInMenu: true
menuLabel: "${title}"
---

# ${title}

欢迎阅读 ${title} 的详细介绍。

## 概述

这里是 ${title} 的主要内容。

## 主要特性

- 特性1：详细描述
- 特性2：详细描述
- 特性3：详细描述

## 实践示例

\`\`\`javascript
// 示例代码
console.log('Hello, ${title}!');
\`\`\`

## 总结

${title} 为开发提供了强大的功能和便利性。

---

通过本文，你应该对 ${title} 有了全面的了解。
`;
}

// 生成index.md内容
function generateIndexContent(title, mainMenuValue) {
	const currentDate = new Date().toISOString().split("T")[0];

	return `---
title: "${title}"
description: "${title} - 入门指南和核心概念"
order: 1
draft: false
published: true
createdAt: ${currentDate}
author: "Fanmu"
tags: ["${
		mainMenuValue.charAt(0).toUpperCase() + mainMenuValue.slice(1)
	}", "入门"]
showInMenu: true
menuLabel: "${title}"
showMdMenu: false
---

# ${title}

欢迎来到 ${title} 学习部分！

## 🛠 主要内容

在这个部分，你将学习到：

- 基础概念和原理
- 实践操作指南
- 最佳实践和技巧

## 🚀 开始学习

点击左侧子菜单，深入学习每个主题！

## 📖 学习建议

建议按照以下顺序进行学习：

1. 先了解基础概念
2. 通过实例练习
3. 掌握进阶技巧
4. 应用到实际项目

---

祝你学习愉快！
`;
}

// 创建文章文件
function createArticle(mainMenuValue, fileName, subFolder = null) {
	const pagesDir = path.join(__dirname, "../src/content/pages");
	let targetDir = path.join(pagesDir, mainMenuValue);

	if (subFolder) {
		targetDir = path.join(targetDir, subFolder);
	}

	// 确保目录存在
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
		console.log(`✅ 创建目录: ${targetDir}`);
	}

	// 创建文章文件
	const filePath = path.join(targetDir, `${fileName}.md`);
	if (fs.existsSync(filePath)) {
		console.log(`⚠️ 文件已存在: ${filePath}`);
		return false;
	}

	const content = generateArticleContent(fileName, mainMenuValue, subFolder);
	fs.writeFileSync(filePath, content, "utf8");
	console.log(`✅ 创建文章: ${filePath}`);
	return true;
}

// 创建文件夹和index.md
function createFolder(mainMenuValue, folderName) {
	const pagesDir = path.join(__dirname, "../src/content/pages");
	const targetDir = path.join(pagesDir, mainMenuValue, folderName);

	// 创建文件夹
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
		console.log(`✅ 创建文件夹: ${targetDir}`);
	} else {
		console.log(`⚠️ 文件夹已存在: ${targetDir}`);
	}

	// 创建index.md
	const indexPath = path.join(targetDir, "index.md");
	if (!fs.existsSync(indexPath)) {
		const content = generateIndexContent(folderName, mainMenuValue);
		fs.writeFileSync(indexPath, content, "utf8");
		console.log(`✅ 创建索引文件: ${indexPath}`);
	} else {
		console.log(`⚠️ index.md已存在: ${indexPath}`);
	}
}

// 主函数
async function main() {
	console.log("🚀 Astro博客 - 创建子菜单脚本");
	console.log("====================================");

	try {
		// 读取配置并检查主菜单
		const config = readConfig();

		if (!config.mainMenu || config.mainMenu.length === 0) {
			console.log("❌ 没有找到主菜单配置");
			console.log("请先运行主菜单创建脚本创建主菜单");
			process.exit(1);
		}

		// 选择主菜单
		const mainMenuLabels = config.mainMenu.map(
			(menu) => `${menu.label} (${menu.value})`
		);
		const mainMenuIndex = await interactiveSelect(
			mainMenuLabels,
			"请选择主菜单"
		);

		const selectedMainMenu = config.mainMenu[mainMenuIndex];
		console.log(`\n✅ 已选择主菜单: ${selectedMainMenu.label}\n`);

		// 检查主菜单文件夹是否存在
		const mainMenuDir = path.join(
			__dirname,
			"../src/content/pages",
			selectedMainMenu.value
		);
		if (!fs.existsSync(mainMenuDir)) {
			console.log(`❌ 主菜单文件夹不存在: ${mainMenuDir}`);
			console.log("请确保主菜单已正确创建");
			process.exit(1);
		}

		// 显示操作选项
		const operations = [
			"📝 创建文章 (直接在主菜单下)",
			"📁 创建文件夹 (用于分组)",
			"📄 创建子文章 (在已有文件夹下)",
		];

		const operationIndex = await interactiveSelect(operations, "请选择操作");

		// 恢复正常模式用于文本输入
		process.stdin.setRawMode?.(false);

		switch (operationIndex) {
			case 0: // 创建文章
				{
					console.log("\n📝 创建文章模式");
					const articleName = await askQuestion("请输入文章名称: ");
					if (!articleName) {
						console.log("❌ 文章名称不能为空");
						process.exit(1);
					}

					if (createArticle(selectedMainMenu.value, articleName)) {
						console.log("🎉 文章创建成功！");
					}
				}
				break;

			case 1: // 创建文件夹
				{
					console.log("\n📁 创建文件夹模式");
					const folderName = await askQuestion("请输入文件夹名称: ");
					if (!folderName) {
						console.log("❌ 文件夹名称不能为空");
						process.exit(1);
					}

					createFolder(selectedMainMenu.value, folderName);
					console.log("🎉 文件夹和索引文件创建成功！");
				}
				break;

			case 2: // 创建子文章
				{
					const subFolders = getSubFolders(selectedMainMenu.value);
					if (subFolders.length === 0) {
						console.log("❌ 没有找到子文件夹");
						console.log("请先创建文件夹或直接创建文章");
						process.exit(1);
					}

					// 重新进入raw模式进行文件夹选择
					process.stdin.setRawMode?.(true);

					const folderIndex = await interactiveSelect(
						subFolders,
						"请选择文件夹"
					);
					const selectedFolder = subFolders[folderIndex];

					// 恢复正常模式
					process.stdin.setRawMode?.(false);

					console.log(`\n✅ 已选择文件夹: ${selectedFolder}`);
					console.log("\n📄 创建子文章模式");

					const articleName = await askQuestion("请输入文章名称: ");
					if (!articleName) {
						console.log("❌ 文章名称不能为空");
						process.exit(1);
					}

					if (
						createArticle(selectedMainMenu.value, articleName, selectedFolder)
					) {
						console.log("🎉 子文章创建成功！");
					}
				}
				break;
		}

		console.log("\n📂 文件结构:");
		console.log(`src/content/pages/${selectedMainMenu.value}/`);
	} catch (error) {
		console.error("❌ 脚本执行失败:", error.message);
		process.exit(1);
	} finally {
		// 确保恢复终端状态
		process.stdin.setRawMode?.(false);
		process.stdout.write("\x1B[?25h"); // 显示光标
		rl.close();
	}
}

// 运行脚本
main().catch(console.error);
