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

// 提示输入函数
function askQuestion(question) {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
}

// 获取当前最大的order值
function getMaxOrder(config) {
	if (!config.mainMenu || config.mainMenu.length === 0) {
		return 0;
	}
	return Math.max(...config.mainMenu.map((menu) => menu.order || 0));
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

// 写入配置文件
function writeConfig(config) {
	const configPath = path.join(__dirname, "../src/content/config/site.json");
	try {
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
		return true;
	} catch (error) {
		console.error("❌ 写入配置文件失败:", error.message);
		return false;
	}
}

// 创建主菜单文件夹和index.md
function createMenuFolder(value) {
	const pagesDir = path.join(__dirname, "../src/content/pages");
	const menuDir = path.join(pagesDir, value);

	// 创建pages目录（如果不存在）
	if (!fs.existsSync(pagesDir)) {
		fs.mkdirSync(pagesDir, { recursive: true });
	}

	// 创建主菜单文件夹
	if (!fs.existsSync(menuDir)) {
		fs.mkdirSync(menuDir, { recursive: true });
		console.log(`✅ 创建文件夹: ${menuDir}`);
	} else {
		console.log(`⚠️ 文件夹已存在: ${menuDir}`);
	}

	// 创建index.md文件
	const indexPath = path.join(menuDir, "index.md");
	if (!fs.existsSync(indexPath)) {
		const currentDate = new Date().toISOString().split("T")[0];
		const indexContent = `---
title: "${value.charAt(0).toUpperCase() + value.slice(1)} 开发指南"
description: "全面学习 ${
			value.charAt(0).toUpperCase() + value.slice(1)
		}，从基础概念到高级特性"
order: 1
draft: false
published: true
createdAt: ${currentDate}
author: "Fanmu"
tags: ["${
			value.charAt(0).toUpperCase() + value.slice(1)
		}", "前端", "JavaScript"]
showInMenu: false
menuLabel: "${value.charAt(0).toUpperCase() + value.slice(1)} 概览"
---

# ${value.charAt(0).toUpperCase() + value.slice(1)} 开发完整指南

${value.charAt(0).toUpperCase() + value.slice(1)} 是一个现代化的前端技术栈。

## 🎯 学习路径

本系列教程按照以下路径组织：

### 开始学习

- 环境搭建和工具链
- 创建第一个项目
- 理解基础概念

### 核心概念

- 组件和语法
- 状态管理
- 事件处理
- 数据绑定

### 进阶特性

- 高级组件
- 性能优化
- 最佳实践
- 项目部署

## 📚 特色内容

- **实战导向**：每个概念都配有实际代码示例
- **渐进式学习**：从简单到复杂，循序渐进
- **最佳实践**：分享开发中的经验和技巧

开始你的 ${value.charAt(0).toUpperCase() + value.slice(1)} 学习之旅吧！
`;

		fs.writeFileSync(indexPath, indexContent, "utf8");
		console.log(`✅ 创建index文件: ${indexPath}`);
	} else {
		console.log(`⚠️ index.md文件已存在: ${indexPath}`);
	}
}

// 主函数
async function main() {
	console.log("🚀 Astro博客 - 创建主菜单脚本");
	console.log("====================================");

	// 读取当前配置
	const config = readConfig();
	console.log(`📋 当前已有 ${config.mainMenu?.length || 0} 个主菜单`);

	if (config.mainMenu && config.mainMenu.length > 0) {
		console.log("现有主菜单:");
		config.mainMenu.forEach((menu, index) => {
			console.log(`  ${index + 1}. ${menu.label} (${menu.value})`);
		});
		console.log("");
	}

	try {
		// 获取用户输入
		const label = await askQuestion("请输入主菜单标签 (label): ");
		if (!label) {
			console.log("❌ 标签不能为空");
			process.exit(1);
		}

		const value = await askQuestion("请输入主菜单值 (value): ");
		if (!value) {
			console.log("❌ 值不能为空");
			process.exit(1);
		}

		// 验证value格式（建议使用小写字母和连字符）
		if (!/^[a-z0-9-]+$/.test(value)) {
			console.log("⚠️ 建议value使用小写字母、数字和连字符组合");
		}

		// 检查是否已存在
		if (
			config.mainMenu &&
			config.mainMenu.some((menu) => menu.value === value)
		) {
			console.log(`❌ 主菜单值 "${value}" 已存在`);
			process.exit(1);
		}

		if (
			config.mainMenu &&
			config.mainMenu.some((menu) => menu.label === label)
		) {
			console.log(`❌ 主菜单标签 "${label}" 已存在`);
			process.exit(1);
		}

		// 创建新的主菜单项
		const newMenuItem = {
			label: label,
			value: value,
			icon: value, // 默认使用value作为图标名
			order: getMaxOrder(config) + 1,
		};

		// 更新配置
		if (!config.mainMenu) {
			config.mainMenu = [];
		}
		config.mainMenu.push(newMenuItem);

		// 写入配置文件
		if (writeConfig(config)) {
			console.log("✅ 主菜单配置更新成功");

			// 创建对应的文件夹和index.md
			createMenuFolder(value);

			console.log("");
			console.log("🎉 主菜单创建完成！");
			console.log(`   标签: ${label}`);
			console.log(`   值: ${value}`);
			console.log(`   顺序: ${newMenuItem.order}`);
			console.log(`   文件夹: src/content/pages/${value}/`);
			console.log(`   索引文件: src/content/pages/${value}/index.md`);
		} else {
			console.log("❌ 配置文件更新失败");
			process.exit(1);
		}
	} catch (error) {
		console.error("❌ 脚本执行失败:", error.message);
		process.exit(1);
	} finally {
		rl.close();
	}
}

// 运行脚本
main().catch(console.error);
