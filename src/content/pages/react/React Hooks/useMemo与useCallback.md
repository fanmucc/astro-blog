---
title: "useMemo与useCallback"
description: "useMemo与useCallback - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-19
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useMemo与useCallback"
---

# useMemo 与 useCallback

`useMemo`和`useCallback`都是 React 的优化 Hooks，用于避免不必要的重复计算和重新渲染

## `useMemo`

作用: 缓存计算结果，只有依赖项改变时才重新计算

```js
import { useMemo } from "react";

function ExpensiveComponent({ items, filter }) {
	// 只有当 items 或 filter 改变时才重新计算
	const filteredItems = useMemo(() => {
		return items.filter((item) => item.category === filter);
	}, [items, filter]);

	const expensiveValue = useMemo(() => {
		// 复杂计算
		return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	}, [items]);

	return <div>{/* 渲染逻辑 */}</div>;
}
```

## `useCallback`

作用: 缓存函数本身，只有依赖项改变时才返回新的函数引用.

```js
import { useCallback, useState } from "react";

function Parent({ items }) {
	const [count, setCount] = useState(0);

	// 缓存函数，避免子组件不必要的重新渲染
	const handleClick = useCallback((id) => {
		// 处理点击逻辑
		console.log("Clicked item:", id);
	}, []); // 空依赖数组，函数永远不变

	const handleUpdate = useCallback((newValue) => {
		setCount((prevCount) => prevCount + newValue);
	}, []); // 使用函数式更新，避免依赖 count

	return (
		<div>
			<ChildComponent onClick={handleClick} />
			<button onClick={() => handleUpdate(1)}>Count: {count}</button>
		</div>
	);
}
```

## 共同点

1. 性能优化: 都是为了避免不必要的重复操作
2. 以来数组: 都接受以来数组作为第二个参数
3. 浅比较: 都是用`Object.is`进行依赖性的浅比较

## 区别

- 缓存对象不同
  | useMemo | useCallback |
  | ------ | ------ |
  | 缓存计算结果（值） | 缓存函数本身（引用） |
  |`const result = useMemo(() => compute(), [])`|`[])const fn = useCallback(() => {}, [])`|

- 返回值类型

```js
// useMemo - 返回任意类型的值
const expensiveValue = useMemo(() => {
	return someComplexCalculation(); // 返回计算结果
}, [deps]);

// useCallback - 返回函数
const stableFunction = useCallback(() => {
	doSomething(); // 返回函数本身
}, [deps]);
```

## 使用场景

| useMemo            | useCallback      |
| ------------------ | ---------------- |
| 数据处理           | 事件处理         |
| 复杂计算、统计分析 | 点击、表单提交等 |
| 数据转换、格式化   | 用户交互回调     |
| 图表数据准备       | API 调用函数     |
| 搜索结果处理       | 组件间通信       |

## `useCallback`与`React.memo`

`React.memo` 与 `useMemo` 功能基本一致

- 都是浅比较
- 都是性能优化工具
- 缓存返回值

### `useCallback` 怎么用?

- 表单事件处理

```js
// 1. 表单事件处理
function Form() {
	const [data, setData] = useState({});

	// ✅ 缓存表单提交函数
	const handleSubmit = useCallback((formData) => {
		// 提交逻辑
		api.submit(formData);
	}, []); // 没有依赖外部变量

	return <ExpensiveFormComponent onSubmit={handleSubmit} />;
}
```

- 列表操作

```js
function TodoList() {
	const [todos, setTodos] = useState([]);

	// ✅ 缓存删除函数
	const handleDelete = useCallback((id) => {
		setTodos((prev) => prev.filter((todo) => todo.id !== id));
	}, []); // 使用函数式更新，无需依赖 todos

	return todos.map((todo) => (
		<TodoItem key={todo.id} onDelete={handleDelete} />
	));
}
```

- API 调用

```js
function UserProfile({ userId }) {
	const [user, setUser] = useState(null);

	// ✅ 缓存获取用户函数
	const fetchUser = useCallback(async () => {
		const userData = await api.getUser(userId);
		setUser(userData);
	}, [userId]); // 依赖 userId

	useEffect(() => {
		fetchUser();
	}, [fetchUser]); // fetchUser 作为 effect 依赖

	return <div>{user?.name}</div>;
}
```

- 依赖数组规则

```js
function Example() {
	const [count, setCount] = useState(0);
	const [name, setName] = useState("");

	// ❌ 错误：遗漏依赖
	const badCallback = useCallback(() => {
		console.log(count); // 使用了 count 但没有在依赖中声明
	}, []); // 这会导致闭包陷阱

	// ✅ 正确：包含所有依赖
	const goodCallback = useCallback(() => {
		console.log(count);
	}, [count]); // 声明了 count 依赖

	// ✅ 正确：使用函数式更新避免依赖
	const betterCallback = useCallback(() => {
		setCount((prev) => prev + 1); // 不需要依赖 count
	}, []);
}
```

### `useCallback` 常见错误和解决方案

- 过度使用

```js
// ❌ 没必要：子组件没有用 memo
function Parent() {
	const handleClick = useCallback(() => {}, []); // 浪费
	return <RegularChild onClick={handleClick} />; // 没有 memo
}

// ✅ 正确使用
function Parent() {
	const handleClick = useCallback(() => {}, []);
	return <MemoizedChild onClick={handleClick} />; // 有 memo
}
```

- 依赖项错误

```js
// ❌ 依赖项过多，失去优化效果
const callback = useCallback(() => {
	doSomething();
}, [obj.property]); // obj.property 频繁变化

// ✅ 使用稳定的值作为依赖
const callback = useCallback(() => {
	doSomething();
}, [obj.id]); // obj.id 相对稳定
```

- 错误调用

```js
// ❌ 这样写 memo 会失效
const handleClick = useCallback((name) => {
	console.log(name);
}, []);

<MemoChild onClick={() => handleClick("参数")} />;
//                  ↑
//               每次都是新函数！
```

即使 `handleClick` 被缓存了，但 `() => handleClick("参数")` 这个箭头函数每次渲染都是全新的！

```js
// 每次组件重新渲染时
const render1 = () => {
	const fn = () => handleClick("A"); // 创建新函数
	return <Child onClick={fn} />;
};

const render2 = () => {
	const fn = () => handleClick("A"); // 又创建新函数
	return <Child onClick={fn} />;
};

// fn1 !== fn2，所以 memo 检测到 props 变化
```

实用解决方案

1. 预先创建稳定函数

```js
const handleClickA = useCallback(() => handleClick("A"), []);
const handleClickB = useCallback(() => handleClick("B"), []);

<Child onClick={handleClickA} />
<Child onClick={handleClickB} />
```

2. 使用 data 属性传参

```js
const handleDataClick = useCallback((e) => {
  const param = e.currentTarget.dataset.param;
  handleClick(param);
}, []);

<Child data-param="A" onClick={handleDataClick} />
<Child data-param="B" onClick={handleDataClick} />
```

3. 让子组件内容处理参数

```js
// 子组件知道自己的 ID
const SmartChild = memo(({ id, onAction }) => {
  const handleClick = useCallback(() => {
    onAction(id); // 内部处理参数
  }, [id, onAction]);

  return <button onClick={handleClick}>Click</button>;
});

<SmartChild id="A" onAction={handleClick} />
<SmartChild id="B" onAction={handleClick} />
```

### 关键点

1. `useCallback` 只缓存直接传递的函数
2. JSX 中的内联函数总是新的
3. 要让 `memo` 生效，所有 props 的引用都必须稳定
4. 包括函数、对象、数组等引用类型
