---
title: "useLayoutEffect与useInsertionEffect"
description: "useLayoutEffe与useInsertionEffect - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-20
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useLayoutEffect与useInsertionEffect"
---

# useLayoutEffect 与 useInsertionEffect

** tip:warning useInsertionEffect 是为 CSS-in-JS 库的作者特意打造的。除非你正在使用 CSS-in-JS 库并且需要注入样式，否则你应该使用 useEffect 或者 useLayoutEffect。**

`useLayoutEffect` 和 `useInsertionEffect` 都是 React Hooks，但它们在执行时机和用途上有重要区别

- `useLayoutEffect`: 在 DOM 更新完成后，但在浏览器绘制之前同步执行。
- `useInsertionEffect`: 在所有 DOM 变更之前执行，比 useLayoutEffect 更早。

## `useLayoutEffect`

在 DOM 更新完成后，但在浏览器绘制之前同步执行。

主要用途：

1. 需要读取 DOM 布局信息并同步更新的场景
2. 避免视觉闪烁的操作
3. 测量元素尺寸、位置等

```js
// 简单实现一个展开收起的效果
import { useLayoutEffect, useRef, useState } from "react";

function UseLayoutEffect() {
	const ref = useRef < HTMLDivElement > null;
	const [open, setOpen] = useState(false);
	const [height, setHeight] = useState(100);
	useLayoutEffect(() => {
		if (ref.current) {
			setHeight(ref?.current?.offsetHeight);
			ref.current.style.height = `${height + 20}px`;
			ref.current.style.overflow = "hidden";
			ref.current.style.transition = "height 0.3s ease-in-out";
		}
	}, []);
	return (
		<div className='hook-basic-usage'>
			<h2>useLayoutEffect 基础用法</h2>
			<p>useLayoutEffect Hook 组件正在开发中...</p>
			<section className='usage-section'>
				<h3>1. 基础用法 获取 DOM 元素</h3>
				<div
					className={`demo-container`}
					style={{ boxSizing: "border-box" }}
					onClick={() => {
						if (open) {
							ref.current && (ref.current.style.height = `${20 + 20}px`);
							ref.current && (ref.current.style.overflow = "hidden");
							ref.current &&
								(ref.current.style.transition = "height 0.3s ease-in-out");
						} else {
							ref.current && (ref.current.style.height = `${height + 20}px`);
							ref.current && (ref.current.style.overflow = "hidden");
							ref.current &&
								(ref.current.style.transition = "height 0.3s ease-in-out");
						}
						setOpen(!open);
					}}
				>
					<p ref={ref}>
						useLayoutEffect 组件正在开发中...useLayoutEffect 组件正在开发中...
						useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中... useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中... useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中... useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中... useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中... useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中... useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中... useLayoutEffect
						组件正在开发中...useLayoutEffect 组件正在开发中...useLayoutEffect
						组件正在开发中...
					</p>
				</div>
			</section>
		</div>
	);
}

export default UseLayoutEffect;
```

## `useInsertionEffect`

在所有 DOM 变更之前执行，比 `useLayoutEffect` 更早

主要用途：

1. CSS-in-JS 库注入样式
2. 需要在 DOM 变更前执行的操作
3. 通常不建议在应用代码中使用

```js
import { useInsertionEffect } from "react";

function useCSS(css) {
	useInsertionEffect(() => {
		// 在 DOM 变更前注入 CSS
		const style = document.createElement("style");
		style.textContent = css;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, [css]);
}
```

## 执行顺序

1. `useInsertionEffect` - DOM 变更前
2. `useLayoutEffect` - DOM 变更后，浏览器绘制前
3. `useEffect` - 浏览器绘制后

使用建议

- `useLayoutEffect`：当你需要测量 <code data-theme="info">DOM</code> 或避免视觉闪烁时使用
- `useInsertionEffect`：主要为 <code data-theme="info">CSS-in-JS</code> 库设计，普通应用开发很少需要
- 大多数情况下使用 `useEffect` 就足够了

`useInsertionEffect` 是 React 18 新增的 Hook，主要解决 <code data-theme="info">CSS-in-JS</code> 库的样式注入时机问题，在日常开发中使用频率较低。
