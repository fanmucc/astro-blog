---
title: "useImperativeHandle"
description: "useImperativeHandle - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-20
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useImperativeHandle"
---

# useImperativeHandle

`useImperativeHandle` 是 React 中的一个 Hook，它能让你自定义由 ref 暴露出来的句柄。

```js
useImperativeHandle(ref, createHandle, [deps]);
```

- 向父组件暴露一个自定义的 ref 句柄
- 暴露你自己的命令式方法
- 依赖项，与`useEffect`一样，当依赖项进行更新时，则重新创建 `createHandle` 方法

** tip:info 从 React 19 开始， ref 可作为 prop 使用 。在 React 18 及更早版本中，需要通过 forwardRef 来获取 ref 。**

```js
import { useImperativeHandle, useRef } from "react";

// 将子组件 input ref 进行暴露
function MyInput({ ref }) {
	return <input ref={ref} />;
}

// 暴露自定义命令方法
function MyInputA({ ref }) {
	const inputRef = useRef(null);
	useImperativeHandle(
		ref,
		() => {
			return {
				// ... 你的方法 ...
				focus() {
					inputRef.current.focus();
				},
				scrollIntoView() {
					inputRef.current.scrollIntoView();
				},
			};
		},
		[]
	);

	return <input ref={inputRef} />;
}

const redDemo = useRef(null);
const refA = useRef(null);
return (
	<div>
		<button
			onClick={() => {
				console.log(ref?.current);
			}}
		>
			获取子组件 ref
		</button>
		<MyInput ref={redDemo} />
		<MyInputA ref={refA} />
	</div>
);
// ...
```
