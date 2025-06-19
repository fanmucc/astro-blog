---
title: "useEffect"
description: "useEffect - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-19
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useEffect"
---

# useEffect

`useEffect` 是 React 中最重要的 `Hook` 之一， 用于处理副作用

## 基础用法

```js
import { useEffect } from "react";

useEffect(() => {
	// 副作用代码
}, [依赖数组]);
```

## 主要用法

- API 调用
- 订阅事件
- 手动修改 DOM
- 定时器
- 清理资源

## 三种调用模式

### 1. 每次渲染都执行

不设置依赖项数组，则每次渲染都会调用

```js
// 不设置依赖项数组，则每次渲染都会调用
useEffect(() => {
	console.log("组件渲染了");
});
```

### 2. 挂载时只运行一次

```js
useEffect(() => {
	console.log("组件渲染, 只处理一次");
	// 在这里可以调用一些初始化 Api 请求 或 初始化的一些代码
}, []);
```

### 3. 依赖项更新时调用

```js
const count = useState(0);

useEffect(() => {
	console.log("初始化运行一次，count参数修改时触发");
}, [count]);
```

## 清除函数

用于清除副作用，防止内存泄露

```js
useEffect(() => {
	const timer = setInterval(() => {
		console.log("定时器执行");
	}, 1000);

	// 返回清理函数
	// 当离开组件时，执行清理删除，删除定时器
	return () => {
		clearInterval(timer);
	};
}, []);
```

当不进行清理可能导致的问题

1. 内存占用不断增长
2. 浏览器标签页变卡顿
3. 多个相同副作用同时运行导致冲突
4. 组件卸载后仍在执行逻辑
5. 状态更新到已销毁的组件（React 会警告）
6. 页面响应慢, 可能导致浏览器崩溃

## 实际例子

```js
function UserProfile({ userId }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchUser() {
			setLoading(true);
			try {
				const response = await fetch(`/api/users/${userId}`);
				const userData = await response.json();
				setUser(userData);
			} catch (error) {
				console.error("获取用户失败:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchUser();
	}, [userId]); // userId 变化时重新获取

	if (loading) return <div>加载中...</div>;
	return <div>{user?.name}</div>;
}
```

## 注意事项

- 依赖数组很重要 - 如果 `useEffect` 内部使用了组件的 `state` 或 `props`，必须将它们添加到依赖数组中，否则可能会产生 bug。
- 避免无限循环 - 不要在依赖数组中放入每次渲染都会变化的值（如对象或函数）。
  这样 `useEffect` 就能帮你在合适的时机执行副作用代码，让组件行为更可控。
