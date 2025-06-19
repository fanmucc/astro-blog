---
title: "useState"
description: "useState - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-18
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useState"
---

# `useState` 是一个 `React Hook`，它允许你向组件添加一个 状态变量。

[官方文档](https://zh-hans.react.dev/reference/react/useState#adding-state-to-a-component)

- 为组件添加状态
- 根据先前的 state 更新 state
- 更新状态中的对象和数组
- 避免重复创建初始状态
- 使用 key 重置状态
- 存储前一次渲染的信息

## `useState(initialState)`

在组件的顶层调用 `useState` 来声明一个 状态变量。

```js
import { useState } from 'react';

function MyComponent() {
  const [age, setAge] = useState(28);
  const [name, setName] = useState('Taylor');
  const [todos, setTodos] = useState(() => createTodos());
```

## 参数

- `initialState`：你希望 `state` 初始化的值。它可以是任何类型的值，但对于函数有特殊的行为。在初始渲染后，此参数将被忽略。
- 如果传递函数作为 `initialState`，则它将被视为 初始化函数。它应该是纯函数，不应该接受任何参数，并且应该返回一个任何类型的值。当初始化组件时，React 将调用你的初始化函数，并将其返回值存储为初始状态。请参见下面的示例。

## 返回值

`set` 函数没有返回值。

- `useState` 返回一个由两个值组成的数组：
  - 当前的 `state`。在首次渲染时，它将与你传递的 initialState 相匹配。
  - `set` 函数，它可以让你将 state 更新为不同的值并触发重新渲染。

### 注意事项

- `set` 函数 仅更新 下一次 渲染的状态变量。如果在调用 `set` 函数后读取状态变量，则 仍会得到在调用之前显示在屏幕上的旧值。

- 如果你提供的新值与当前 `state` 相同（由 Object.is 比较确定），`React` 将 跳过重新渲染该组件及其子组件。这是一种优化。虽然在某些情况下 `React` 仍然需要在跳过子组件之前调用你的组件，但这不应影响你的代码。

- `React` 会 批量处理状态更新。它会在所有 事件处理函数运行 并调用其 `set` 函数后更新屏幕。这可以防止在单个事件期间多次重新渲染。在某些罕见情况下，你需要强制 `React` 更早地更新屏幕，例如访问 DOM，你可以使用 `flushSync`。

- `set` 函数具有稳定的标识，所以你经常会看到 `Effect` 的依赖数组中会省略它，即使包含它也不会导致 `Effect` 重新触发。如果 `linter` 允许你省略依赖项并且没有报错，那么你就可以安全地省略它。了解移除 `Effect` 依赖项的更多信息。

- 在渲染期间，只允许在当前渲染组件内部调用 `set` 函数。`React` 将丢弃其输出并立即尝试使用新状态重新渲染。这种方式很少需要，但你可以使用它来存储 先前渲染中的信息。请参见下面的示例。

- 在严格模式中，`React` 将 两次调用你的更新函数，以帮助你找到 意外的不纯性。这只是开发时的行为，不影响生产。如果你的更新函数是纯函数（本该是这样），就不应影响该行为。其中一次调用的结果将被忽略。

## 使用

### 1. 根据先前的 `state` 更新 `state`

```js
import { useState } from "react";
const [count, setCount] = useState(0);

// 初始化一个 state 初始值为 0 ，修改方法为 setCount, 值为 count
const changeCount = () => {
	// 修改成指定的值
	setCount(10);
	// 使用之前的state进行更新
	setCount(count + 1);
};
```

`bug`点

```js
function handleClick() {
	setCount(count + 1); // setCount(0 + 1)
	setCount(count + 1); // setCount(0 + 1)
	setCount(count + 1); // setCount(0 + 1)
}
```

然而，点击一次后，count 将只会变为 1 而不是 3！这是因为调用 `set` 函数 不会更新 已经运行代码中的 `count` 状态变量。因此，每个 `setCount(count + 1)` 调用变成了 `setCount(1)`。

为了解决这个问题，你可以向 `setCount` 传递一个 更新函数，而不是下一个状态：

```js
function handleClick() {
	setCount((a) => a + 1); // setCount(0 => 1)
	setCount((a) => a + 1); // setCount(1 => 2)
	setCount((a) => a + 1); // setCount(2 => 3)
}
```

这里，`a => a + 1` 是更新函数。它获取 待定状态 并从中计算 下一个状态。

React 将更新函数放入 队列 中。然后，在下一次渲染期间，它将按照相同的顺序调用它们：

- `a` => <code data-theme="info">a + 1</code> 将接收 0 作为待定状态，并返回 1 作为下一个状态。
- `a` => <code data-theme="info">a + 1</code> 将接收 1 作为待定状态，并返回 2 作为下一个状态。
- `a` => <code data-theme="info">a + 1</code> 将接收 2 作为待定状态，并返回 3 作为下一个状态。

现在没有其他排队的更新，因此 React 最终将存储 3 作为当前状态。

按照惯例，通常将待定状态参数命名为状态变量名称的第一个字母，如 age 为 a。然而，你也可以把它命名为 prevAge 或者其他你觉得更清楚的名称。

**warning: useState 更新会在 React fiber diff 中讲解为什么会出现 bug**

### 2. 更新状态中的对象和数组

```js
const [form, setForm] = useState({
	firstName: "Barbara",
	lastName: "Hepworth",
	email: "bhepworth@sculpture.com",
});

// 设置新对象，先默认复制结构数据，然后修改真正需要的内容
setForm({
	...form,
	email: "demo.com",
});

// 修改数据
const [list, setList] = useState([1, 2, 3, 4, 5]);
// 这里可以直接使用 数组的增删改查方式进行修改，与上面修改对象一样，重新生成内容，完整赋值
```

### 3. 避免重复创建初始化状态

React 只在初次渲染时保存初始状态，后续渲染时将其忽略。

```js
function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos());
  // ...
```

尽管 `createInitialTodos()` 的结果仅用于初始渲染，但你仍然在每次渲染时调用此函数。如果它创建大数组或执行昂贵的计算，这可能会浪费资源。

为了解决这个问题，你可以将它 作为初始化函数传递给 `useState：`

```js
function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos);
  // ...
```

请注意，你传递的是 `createInitialTodos` 函数本身，而不是 `createInitialTodos()` 调用该函数的结果。如果将函数传递给 `useState`，`React` 仅在初始化期间调用它。

```js
import { useState } from "react";

function createInitialTodos() {
	const initialTodos = [];
	for (let i = 0; i < 50; i++) {
		initialTodos.push({
			id: i,
			text: "Item " + (i + 1),
		});
	}
	return initialTodos;
}

export default function TodoList() {
	const [todos, setTodos] = useState(createInitialTodos);
	const [todos, setTodos] = useState(createInitialTodos());
	const [text, setText] = useState("");

	return (
		<>
			<input value={text} onChange={(e) => setText(e.target.value)} />
			<button
				onClick={() => {
					setText("");
					setTodos([
						{
							id: todos.length,
							text: text,
						},
						...todos,
					]);
				}}
			>
				Add
			</button>
			<ul>
				{todos.map((item) => (
					<li key={item.id}>{item.text}</li>
				))}
			</ul>
		</>
	);
}
```

在设置 `todos` 时，分别使用传递函数本身和结果值，再渲染上渲染效果其实是没有任何差别的，区别在于 没有 `传递初始化函数`，因此 `createInitialTodos` 函数会在每次渲染时运行

### 4. 使用 `key` 重置状态

使用 `key` 重置状态
在 渲染列表 时，你经常会遇到 `key` 属性。然而，它还有另外一个用途。

你可以 通过向组件传递不同的 `key` 来重置组件的状态。在这个例子中，重置按钮改变 `version` 状态变量，我们将它作为一个 `key` 传递给 `Form` 组件。当 `key` 改变时，`React` 会从头开始重新创建 `Form` 组件（以及它的所有子组件），所以它的状态被重置了。

```js
import { useState } from "react";

export default function App() {
	const [version, setVersion] = useState(0);

	function handleReset() {
		setVersion(version + 1);
	}

	return (
		<>
			<button onClick={handleReset}>Reset</button>
			<Form key={version} />
		</>
	);
}

function Form() {
	const [name, setName] = useState("Taylor");

	return (
		<>
			<input value={name} onChange={(e) => setName(e.target.value)} />
			<p>Hello, {name}.</p>
		</>
	);
}
```

### 5. 存储前一次渲染的信息

```js
import { useState } from 'react';
import CountLabel from './CountLabel.js';
export default function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <CountLabel count={count} />
    </>
  );
}

// conutlabel.js
import { useState } from 'react';
export default function CountLabel({ count }) {
  const [prevCount, setPrevCount] = useState(count);
  const [trend, setTrend] = useState(null);
  if (prevCount !== count) {
    setPrevCount(count);
    setTrend(count > prevCount ? 'increasing' : 'decreasing');
  }
  return (
    <>
      <h1>{count}</h1>
      {trend && <p>The count is {trend}</p>}
    </>
  );
}
```

这里使用了 `useState`只会在组件初始化时使用一次，只有的重新渲染不会重新初始化`state`

1. 当进行加减操作时，父组件`count`进行修改，并当做参数传递给子组件
2. 子组件初始化时设置了`count`为 0，这里变不会进行重新复制，所以`count`一直为 0
3. 进入条件判断，这里会重新对 子组件 `count`进行赋值，但是再赋值之前先进行了判断，这里就能够达到存储上一次值的效果。因为对比发生在前面，赋值在后，从而达到存储前一个值的效果
