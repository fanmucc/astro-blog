---
title: "useTransition"
description: "useTransition - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-23
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useTransition"
---

# useTransition 和 `startTransition`

`useTransition` 是一个让你可以在后台渲染部分 UI 的 React Hook

## useTransition Hook

`useTransition` 是一个 React Hook，返回一个数组，包含：

- `isPending`：布尔值，表示是否有待处理的 transition
- `startTransition`：函数，用于标记状态更新为 transition

```js
const [isPending, startTransition] = useTransition();
```

示例

```js
import { useTransition, useState } from "react";

function SearchBox() {
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);

	const handleSearch = (value) => {
		setQuery(value); // 紧急更新，立即响应用户输入

		startTransition(() => {
			// 非紧急更新，可以被中断
			setResults(searchData(value));
		});
	};

	return (
		<div>
			<input
				value={query}
				onChange={(e) => handleSearch(e.target.value)}
				placeholder='搜索...'
			/>
			{isPending && <div>搜索中...</div>}
			<SearchResults results={results} />
		</div>
	);
}
```

## startTransition

`startTransition` 是一个独立的函数，可以直接从 React 导入使用，不需要 Hook：

```js
import { startTransition } from "react";

function handleClick() {
	startTransition(() => {
		// 标记这些更新为非紧急
		setTab("posts");
		setData(newData);
	});
}
```

## 主要区别

### 返回值不同

1. `useTransition` 返回 `isPending` 状态，可以显示加载指示器独立的 `startTransition` 不提供 `pending` 状态

使用场景：

- 需要显示加载状态时使用 `useTransition`
- 只需要延迟更新，不需要 `pending` 状态时使用 `startTransition`

2. 组件内外使用：

- `useTransition` 只能在组件内使用
- `startTransition` 可以在事件处理器、effects 或组件外使用

## 核心作用（相同部分）

两者的核心作用都是将状态更新标记为非紧急，让 React 可以：

- 中断这些更新为更紧急的更新让路
- 保持界面响应性
- 避免阻塞用户交互

简单来说，`useTransition` = `startTransition + isPending` 状态。选择哪个取决于你是否需要显示加载状态。

## 可中断性

传统的同步渲染（不可中断）

在 React 18 之前，一旦开始渲染就必须完成整个过程：

```js
// 传统方式 - 不可中断
function App() {
	const [count, setCount] = useState(0);
	const [list, setList] = useState([]);

	const handleClick = () => {
		setCount(count + 1); // 必须等这个完成
		setList(generateHugeList()); // 然后处理这个耗时操作
		// 在整个渲染完成前，界面会卡住
	};
}
```

可中断更新的工作原理

使用 `startTransition` 后，React 可以暂停低优先级更新：

```js
function App() {
	const [isPending, startTransition] = useTransition();
	const [count, setCount] = useState(0);
	const [list, setList] = useState([]);

	const handleClick = () => {
		// 高优先级 - 立即执行
		setCount(count + 1);

		// 低优先级 - 可被中断
		startTransition(() => {
			setList(generateHugeList()); // 耗时操作
		});
	};
}
```

### 中断的具体场景

用户交互中断低优先级更新

```js
function SearchApp() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);

	const handleSearch = (value) => {
		setQuery(value); // 高优先级：立即更新输入框

		startTransition(() => {
			// 低优先级：搜索结果渲染
			setResults(searchInHugeDataset(value)); // 假设这很耗时
		});
	};

	return (
		<div>
			<input value={query} onChange={(e) => handleSearch(e.target.value)} />
			{/* 用户继续输入时，之前的搜索渲染会被中断 */}
			<SearchResults results={results} />
		</div>
	);
}
```

中断过程：

1. 用户输入 "a" → 开始渲染搜索结果
2. 用户快速输入 "ab" → 中断之前的渲染，优先处理新输入
3. 用户继续输入 "abc" → 再次中断，处理最新输入
4. 用户停止输入 → 完成最终的搜索结果渲染

** tip:warning 中断 ≠ 重复请求 中断主要影响的是渲染过程，而不是副作用（如 API 请求）对于如果触发了接口，依旧要结合防抖这些来优化 **

```js
import { useTransition, useState, useEffect, useRef } from "react";

function SearchApp() {
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const abortControllerRef = useRef(null);

	useEffect(() => {
		if (!query) return;

		// 取消上一个请求
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// 防抖处理
		const timeoutId = setTimeout(() => {
			startTransition(() => {
				// 创建新的 AbortController
				abortControllerRef.current = new AbortController();

				fetchSearchResults(query, abortControllerRef.current.signal)
					.then((data) => {
						setResults(data);
					})
					.catch((error) => {
						if (error.name !== "AbortError") {
							console.error("搜索失败:", error);
						}
					});
			});
		}, 300); // 300ms 防抖

		return () => {
			clearTimeout(timeoutId);
		};
	}, [query]);

	const handleInputChange = (e) => {
		setQuery(e.target.value);
	};

	return (
		<div>
			<input value={query} onChange={handleInputChange} placeholder='搜索...' />
			{isPending && <div>搜索中...</div>}
			<SearchResults results={results} />
		</div>
	);
}
```

自定义 Hook

```js
function useSearchWithTransition(searchFn, delay = 300) {
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const abortControllerRef = useRef(null);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		// 取消上一个请求
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const timeoutId = setTimeout(() => {
			startTransition(async () => {
				try {
					abortControllerRef.current = new AbortController();
					const data = await searchFn(query, abortControllerRef.current.signal);
					setResults(data);
				} catch (error) {
					if (error.name !== "AbortError") {
						console.error("搜索失败:", error);
						setResults([]);
					}
				}
			});
		}, delay);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [query, searchFn, delay]);

	// 组件卸载时取消请求
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	return { query, setQuery, results, isPending };
}

// 使用
function SearchApp() {
	const { query, setQuery, results, isPending } = useSearchWithTransition(
		async (searchQuery, signal) => {
			const response = await fetch(`/api/search?q=${searchQuery}`, { signal });
			return response.json();
		},
		300
	);

	return (
		<div>
			<input
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder='搜索...'
			/>
			{isPending && <div>搜索中...</div>}
			<SearchResults results={results} />
		</div>
	);
}
```
