---
title: "useRef"
description: "useRef - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-20
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useRef"
---

# useRef

`useRef` 是一个 React Hook，它能帮助引用一个不需要渲染的值。

- 使用用 ref 引用一个值
- 通过 ref 操作 DOM
- 避免重复创建 ref 的内容

```js
const ref = useRef(initialValue);
```

## 参数

`initialValue`：`ref` 对象的 `current` 属性的初始值。可以是任意类型的值。这个参数在首次渲染后被忽略。

## 返回值

`useRef` 返回一个只有一个属性的对象:

`current`：初始值为传递的 `initialValue`。之后可以将其设置为其他值。如果将 `ref` 对象作为一个 JSX 节点的 ref 属性传递给 React，React 将为它设置 `current` 属性。
在后续的渲染中，useRef 将返回同一个对象。

注意

- 可以修改 `ref.current` 属性。与 `state` 不同，它是可变的。然而，如果它持有一个用于渲染的对象（例如 state 的一部分），那么就不应该修改这个对象。
- 改变 `ref.current` 属性时，React `不会重新渲染组件`。React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象。除了 初始化 外不要在渲染期间写入或者读取 `ref.current`，否则会使组件行为变得不可预测。
- 在严格模式下，React 将会 调用两次组件方法，这是为了 帮助发现意外问题。但这只是开发模式下的行为，不会影响生产模式。每个 ref 对象都将会创建两次，但是其中一个版本将被丢弃。如果使用的是组件纯函数（也应当如此），那么这不会影响其行为。

## 使用方法

### 1. 通过 ref 操作 DOM

```js
// 访问 dom 元素
import { useRef, useEffect } from "react";

function TextInput() {
	const inputRef = useRef(null);

	useEffect(() => {
		inputRef.current.focus(); // 组件挂载时聚焦输入框
	}, []);

	return <input ref={inputRef} type='text' />;
}

// 组件暴露ref
import { useRef } from "react";

function MyInput({ ref }) {
	return <input ref={ref} />;
}

export default function Form() {
	const inputRef = useRef(null);

	function handleClick() {
		inputRef.current.focus();
	}

	return (
		<>
			<MyInput ref={inputRef} />
			<button onClick={handleClick}>聚焦输入框</button>
		</>
	);
}
```

### 2. 使用 ref 引用一个值

```js
import { useRef } from "react";

function Stopwatch() {
	const intervalRef = useRef(0);
	// ...
	function handleStartClick() {
		const intervalId = setInterval(() => {
			// ...
		}, 1000);
		intervalRef.current = intervalId;
	}

	function handleStopClick() {
		const intervalId = intervalRef.current;
		clearInterval(intervalId);
	}
}
```

** tip:warning 不要在渲染期间写入或者读取 ref.current。**

_在 渲染期间 读取或写入 ref 会破坏这些预期行为。_

```js
function MyComponent() {
	// ...
	// 🚩 不要在渲染期间写入 ref
	myRef.current = 123;
	// ...
	// 🚩 不要在渲染期间读取 ref
	return <h1>{myOtherRef.current}</h1>;
}
```

**_可以在 事件处理程序或者 Effect 中读取和写入 ref。_**

```js
function MyComponent() {
	// ...
	useEffect(() => {
		// ✅ 可以在 Effect 中读取和写入 ref
		myRef.current = 123;
	});
	// ...
	function handleClick() {
		// ✅ 可以在事件处理程序中读取和写入 ref
		doSomething(myOtherRef.current);
	}
	// ...
}
```

### 3. 避免重复创建 ref 的内容

React 会保存 ref 初始值，并在后续的渲染中忽略它。

```js
function Video() {
  const playerRef = useRef(new VideoPlayer());
  // ...
```

虽然 `new VideoPlayer()` 的结果只会在首次渲染时使用，但是依然在每次渲染时都在调用这个方法。如果是创建昂贵的对象，这可能是一种浪费。

为了解决这个问题，你可以像这样初始化 `ref`：

```js
function Video() {
  const playerRef = useRef(null);
  if (playerRef.current === null) {
    playerRef.current = new VideoPlayer();
  }
```

通常情况下，在渲染过程中写入或读取 `ref.current` 是不允许的。然而，在这种情况下是可以的，因为结果总是一样的，而且条件只在初始化时执行，所以是完全可预测的。
